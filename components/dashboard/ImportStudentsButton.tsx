"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, X, Check, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

type ImportedStudent = { display_name: string; student_code: string; pin: string };
type ImportResult = { added: number; errors: string[]; students: ImportedStudent[] };

const CSV_TEMPLATE =
  "Nume Elev,Grupa varsta\nAndrei Mihai,5-8\nMaria Popescu,0-4\nIon Ionescu,5-8";
const TEMPLATE_URL = `data:text/csv;charset=utf-8,%EF%BB%BF${encodeURIComponent(CSV_TEMPLATE)}`;

export function ImportStudentsButton({ classId }: { classId: string }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setResult(null);
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/dashboard/grupuri/${classId}/import-students`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Eroare la import");
      } else {
        setResult(data);
      }
    } catch {
      setError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleClose() {
    setResult(null);
    router.refresh();
  }

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.txt"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
        >
          <Upload size={14} />
          {loading ? "Se importă..." : "Importă CSV"}
        </Button>
        <a
          href={TEMPLATE_URL}
          download="template-elevi.csv"
          className="text-xs text-gray-400 hover:text-indigo-600 flex items-center gap-1 transition-colors"
        >
          <Download size={12} />
          Descarcă template
        </a>
      </div>

      {error && (
        <div className="mt-3 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700 flex-1">{error}</p>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 flex-shrink-0">
            <X size={14} />
          </button>
        </div>
      )}

      {result && (
        <div className="mt-3 bg-teal-50 border border-teal-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Check size={16} className="text-teal-600" />
              <p className="text-sm font-semibold text-teal-700">
                {result.added} {result.added === 1 ? "elev importat" : "elevi importați"} cu succes
              </p>
            </div>
            <button onClick={handleClose} className="text-teal-400 hover:text-teal-600">
              <X size={14} />
            </button>
          </div>

          {result.errors.length > 0 && (
            <div className="mb-3 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2">
              <p className="font-medium mb-1">Rânduri ignorate ({result.errors.length}):</p>
              {result.errors.map((e, i) => (
                <p key={i}>{e}</p>
              ))}
            </div>
          )}

          <p className="text-xs text-teal-600 font-medium mb-2">
            Notați PIN-urile acum — nu vor mai fi afișate!
          </p>
          <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
            {result.students.map((s) => (
              <div
                key={s.student_code}
                className="flex items-center justify-between bg-white rounded-lg px-3 py-1.5 text-sm gap-2"
              >
                <span className="font-medium text-gray-800 truncate">{s.display_name}</span>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <span className="font-mono text-xs text-gray-400">{s.student_code}</span>
                  <span className="font-mono font-bold tracking-widest bg-green-50 text-green-700 border border-green-300 px-2 py-0.5 rounded-lg text-xs">
                    {s.pin}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={handleClose}
            className="mt-3 text-xs font-medium text-teal-700 underline underline-offset-2 hover:text-teal-900"
          >
            Închide și reîncarcă lista
          </button>
        </div>
      )}
    </div>
  );
}
