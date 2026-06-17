"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

type Phase = "idle" | "preparing" | "uploading" | "setting-permissions" | "done" | "error";

// Trimitem fișierul în segmente, fiecare bine sub limita Vercel de ~4.5MB per request.
// 3 MiB e și multiplu de 256 KiB — cerința Google Drive pentru segmentele intermediare.
const CHUNK_SIZE = 3 * 1024 * 1024;

interface ChunkResult {
  status?: "complete" | "incomplete";
  id?: string;
  error?: string;
}

interface DriveUploadButtonProps {
  lessonId: string;
  courseId: string;
  moduleId: string;
  field: "presentation_url" | "worksheet_url" | "video_url";
  accept?: string;
  label?: string;
  onUploaded: (url: string) => void;
}

export function DriveUploadButton({
  lessonId, courseId, moduleId, field,
  accept = ".pdf,.pptx,.ppt,.docx",
  label = "Încarcă fișier din computer",
  onUploaded,
}: DriveUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const xhrRef = useRef<XMLHttpRequest | null>(null);
  const cancelledRef = useRef(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const reset = () => {
    setPhase("idle");
    setProgress(0);
    setErrorMsg(null);
    cancelledRef.current = false;
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleFile = async (file: File) => {
    setPhase("preparing");
    setErrorMsg(null);
    setProgress(0);
    cancelledRef.current = false;

    try {
      // 1. Asigură ierarhia de foldere Drive
      const folderRes = await fetch("/api/admin/drive/ensure-folder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId, moduleId, lessonId }),
      });
      const folderData = await folderRes.json() as { lessonFolderId?: string; error?: string };
      if (!folderRes.ok || !folderData.lessonFolderId) {
        throw new Error(folderData.error ?? "Nu s-a putut crea folderul Drive");
      }

      // 2. Inițiază sesiunea de upload resumable la Google Drive (prin server, fără CORS)
      setPhase("uploading");
      const mimeType = file.type || "application/octet-stream";
      const initParams = new URLSearchParams({
        phase: "init",
        fileName: file.name,
        mimeType,
        folderId: folderData.lessonFolderId,
        fileSize: String(file.size),
      });
      const initRes = await fetch(`/api/admin/drive/upload?${initParams.toString()}`, { method: "POST" });
      const initData = await initRes.json() as { uploadUrl?: string; error?: string };
      if (!initRes.ok || !initData.uploadUrl) {
        throw new Error(initData.error ?? "Nu s-a putut iniția sesiunea de upload");
      }

      // 3. Transmite fișierul în segmente — fiecare segment e proxiat de serverul nostru
      //    către sesiunea Google (Content-Range), evitând limita Vercel de ~4.5MB/request.
      const fileId = await uploadInChunks(initData.uploadUrl, file);

      // 4. Setează permisiunea publică și salvează URL în DB
      setPhase("setting-permissions");
      const permRes = await fetch("/api/admin/drive/set-permission", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId, lessonId, field }),
      });
      const permData = await permRes.json() as { url?: string; error?: string };
      if (!permRes.ok || !permData.url) {
        throw new Error(permData.error ?? "Nu s-a putut seta permisiunea fișierului");
      }

      setPhase("done");
      onUploaded(permData.url);

      // Reset după 2s
      setTimeout(reset, 2000);
    } catch (e) {
      setPhase("error");
      setErrorMsg(e instanceof Error ? e.message : "Eroare necunoscută");
    }
  };

  // Trimite fișierul către sesiunea de upload în segmente succesive, fiecare via
  // proxy-ul nostru (POST /api/admin/drive/upload?phase=chunk), care la rândul lui
  // face PUT cu Content-Range către sesiunea Google. Progresul e calculat pe total.
  const uploadInChunks = async (uploadUrl: string, file: File): Promise<string> => {
    const total = file.size;
    let start = 0;

    while (start < total) {
      if (cancelledRef.current) throw new Error("Upload anulat");

      const end = Math.min(start + CHUNK_SIZE, total) - 1;
      const chunk = file.slice(start, end + 1);
      const chunkParams = new URLSearchParams({
        phase: "chunk",
        uploadUrl,
        start: String(start),
        end: String(end),
        total: String(total),
      });

      const result = await uploadChunk(`/api/admin/drive/upload?${chunkParams.toString()}`, chunk, start, total);
      if (result.status === "complete") {
        if (!result.id) throw new Error("Răspuns invalid de la server la finalizarea upload-ului");
        return result.id;
      }

      start = end + 1;
    }

    throw new Error("Upload incomplet — răspuns neașteptat de la server");
  };

  const uploadChunk = (url: string, chunk: Blob, startOffset: number, totalSize: number): Promise<ChunkResult> =>
    new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          setProgress(Math.min(100, Math.round(((startOffset + e.loaded) / totalSize) * 100)));
        }
      };

      xhr.onload = () => {
        xhrRef.current = null;
        let data: ChunkResult = {};
        try { data = JSON.parse(xhr.responseText) as ChunkResult; } catch { /* răspuns gol/invalid */ }

        if (xhr.status === 200 && data.status) {
          resolve(data);
        } else {
          reject(new Error(data.error ?? `Upload eșuat (${xhr.status})`));
        }
      };

      xhr.onerror = () => { xhrRef.current = null; reject(new Error("Eroare rețea la upload")); };
      xhr.onabort = () => { xhrRef.current = null; reject(new Error("Upload anulat")); };

      xhr.open("POST", url);
      xhr.setRequestHeader("Content-Type", "application/octet-stream");
      xhr.send(chunk);
    });

  const handleCancel = () => {
    cancelledRef.current = true;
    xhrRef.current?.abort();
    reset();
  };

  const phaseLabel: Record<Phase, string> = {
    idle: "",
    preparing: "Se pregătește folderul Drive...",
    uploading: `Se încarcă ${progress}%...`,
    "setting-permissions": "Se aplică permisiuni...",
    done: "Fișier încărcat!",
    error: "",
  };

  return (
    <div className="space-y-1.5">
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={phase !== "idle" && phase !== "error"}
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Upload size={14} className="text-gray-500" />
          <span className="text-gray-700">{label}</span>
        </button>

        {(phase === "uploading" || phase === "preparing") && (
          <button
            type="button"
            onClick={handleCancel}
            className="p-1 text-gray-400 hover:text-red-500 transition-colors"
            title="Anulează upload"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {phase === "uploading" && (
        <div className="w-full bg-gray-100 rounded-full h-1.5">
          <div
            className="bg-blue-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {phase !== "idle" && phase !== "error" && (
        <p className={`text-xs ${phase === "done" ? "text-green-600" : "text-gray-500"}`}>
          {phaseLabel[phase]}
        </p>
      )}

      {phase === "error" && errorMsg && (
        <p className="text-xs text-red-500">{errorMsg}</p>
      )}
    </div>
  );
}
