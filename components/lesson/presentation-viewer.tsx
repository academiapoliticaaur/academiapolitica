"use client";

import { useState, useEffect } from "react";
import { Maximize2, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isStoragePath, resolveStorageUrl } from "@/lib/storage/resolve-url";
import { isGoogleDriveUrl, getGoogleDriveFileId, getGoogleDriveEmbedUrl } from "@/lib/utils/google-drive";

interface PresentationViewerProps {
  presentationUrl: string;
  title?: string;
  worksheetUrl?: string | null;
  allowDownload?: boolean;
}

export function PresentationViewer({ presentationUrl, title, worksheetUrl, allowDownload = false }: PresentationViewerProps) {
  const [fullscreen, setFullscreen] = useState(false);
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(
    isStoragePath(presentationUrl) ? null : presentationUrl
  );
  const [resolvedWorksheetUrl, setResolvedWorksheetUrl] = useState<string | null>(
    worksheetUrl && !isStoragePath(worksheetUrl) ? worksheetUrl : null
  );
  const [loading, setLoading] = useState(isStoragePath(presentationUrl));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isStoragePath(presentationUrl)) return;
    resolveStorageUrl(presentationUrl)
      .then((url) => { setResolvedUrl(url); setLoading(false); })
      .catch(() => { setError("Nu s-a putut încărca prezentarea."); setLoading(false); });
  }, [presentationUrl]);

  useEffect(() => {
    if (!worksheetUrl || !isStoragePath(worksheetUrl)) return;
    resolveStorageUrl(worksheetUrl)
      .then((url) => setResolvedWorksheetUrl(url))
      .catch(() => {});
  }, [worksheetUrl]);

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-10 text-center">
        <Loader2 className="animate-spin mx-auto mb-3 text-blue-500" size={32} />
        <p className="text-sm text-gray-500">Se încarcă prezentarea...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-red-50 p-8 text-center">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!resolvedUrl) return null;

  const isDrive = isGoogleDriveUrl(resolvedUrl);
  const isPdf = !isDrive && resolvedUrl.toLowerCase().includes(".pdf");
  const effectiveWorksheetUrl = resolvedWorksheetUrl ?? (worksheetUrl && !isStoragePath(worksheetUrl) ? worksheetUrl : null);

  // Build embed URL
  let embedUrl = resolvedUrl;
  if (isDrive) {
    const fileId = getGoogleDriveFileId(resolvedUrl);
    embedUrl = fileId ? getGoogleDriveEmbedUrl(fileId, resolvedUrl) : resolvedUrl;
  } else if (isPdf) {
    embedUrl = `${resolvedUrl}#toolbar=${allowDownload ? 1 : 0}&navpanes=0&scrollbar=1&view=FitH`;
  }

  return (
    <div className={`rounded-xl overflow-hidden border bg-white ${fullscreen ? "fixed inset-0 sm:inset-4 z-50 shadow-2xl" : ""}`}>
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 border-b">
        <span className="text-sm font-medium text-gray-700 truncate">
          📋 {title || "Prezentare"}
        </span>
        <div className="flex items-center gap-2">
          {effectiveWorksheetUrl && allowDownload && (
            <Button variant="outline" size="sm" asChild>
              <a href={effectiveWorksheetUrl} download target="_blank" rel="noopener noreferrer" className="gap-1">
                <Download size={14} />
                Descarcă material
              </a>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setFullscreen(!fullscreen)}
            title={fullscreen ? "Ieșire ecran complet" : "Ecran complet"}
          >
            <Maximize2 size={16} />
          </Button>
        </div>
      </div>

      <div className={`relative ${fullscreen ? "h-[calc(100%-48px)]" : "h-[320px] sm:h-[480px] md:h-[600px]"}`}>
        <iframe
          src={embedUrl}
          className="w-full h-full"
          title={title || "Prezentare"}
          allow="autoplay"
          {...(!isDrive && { sandbox: isPdf ? undefined : "allow-scripts allow-same-origin allow-popups" })}
        />
        {isDrive && (
          // Blochează bara de sus a preview-ului Google Drive (incl. butonul nativ
          // "pop-out" spre interfața completă Drive, cu meniu Descărcare activ) —
          // aceeași tehnică ca la VideoEmbed, ținem utilizatorul în platformă
          <div className="absolute top-0 left-0 right-0 h-12 z-10" />
        )}
      </div>

      {fullscreen && (
        <button
          onClick={() => setFullscreen(false)}
          className="absolute top-2 right-2 bg-black/50 text-white rounded-full w-8 h-8 flex items-center justify-center"
        >
          ✕
        </button>
      )}
    </div>
  );
}
