"use client";

import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { isGoogleDriveUrl, getGoogleDriveFileId, getGoogleDriveEmbedUrl } from "@/lib/utils/google-drive";

interface VideoEmbedProps {
  videoUrl: string;
  title?: string;
}

function getYouTubeId(url: string): string | null {
  const patterns = [
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function VideoEmbed({ videoUrl, title = "Video educațional" }: VideoEmbedProps) {
  const youtubeId = getYouTubeId(videoUrl);
  const isDrive = isGoogleDriveUrl(videoUrl);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [embedBlocked, setEmbedBlocked] = useState(false);

  useEffect(() => {
    if (!youtubeId) return;
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== "https://www.youtube.com") return;
      try {
        const data = JSON.parse(typeof event.data === "string" ? event.data : JSON.stringify(event.data));
        if (data.event === "onError" && (data.info === 101 || data.info === 150)) {
          setEmbedBlocked(true);
        }
      } catch {
        // ignoră mesajele care nu sunt JSON
      }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [youtubeId]);

  // Google Drive video
  if (isDrive) {
    const fileId = getGoogleDriveFileId(videoUrl);
    if (!fileId) {
      return (
        <div className="rounded-xl bg-gray-100 flex items-center justify-center h-48 text-gray-400 text-sm">
          URL Google Drive invalid.
        </div>
      );
    }
    return (
      <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingBottom: "56.25%" }}>
        <iframe
          src={getGoogleDriveEmbedUrl(fileId)}
          title={title}
          className="absolute inset-0 w-full h-full"
          allow="autoplay"
          allowFullScreen
          loading="lazy"
        />
      </div>
    );
  }

  // YouTube
  if (!youtubeId) {
    return (
      <div className="rounded-xl bg-gray-100 flex items-center justify-center h-48 text-gray-400 text-sm">
        URL video invalid. Verifică linkul YouTube sau Google Drive.
      </div>
    );
  }

  if (embedBlocked) {
    return (
      <div
        className="rounded-xl bg-gray-900 flex flex-col items-center justify-center gap-4 text-white text-center p-8"
        style={{ minHeight: "200px" }}
      >
        <span className="text-4xl">🎬</span>
        <div>
          <p className="font-semibold mb-1">Videoclipul nu poate fi redat aici</p>
          <p className="text-sm text-gray-400 mb-4">
            Proprietarul a dezactivat redarea pe site-uri externe.
          </p>
          <a
            href={`https://www.youtube.com/watch?v=${youtubeId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <ExternalLink size={15} />
            Vizionează pe YouTube
          </a>
        </div>
      </div>
    );
  }

  const embedUrl = `https://www.youtube.com/embed/${youtubeId}?rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`;

  return (
    <div className="relative w-full rounded-xl overflow-hidden bg-black" style={{ paddingBottom: "56.25%" }}>
      <iframe
        ref={iframeRef}
        src={embedUrl}
        title={title}
        className="absolute inset-0 w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope"
        allowFullScreen
        loading="lazy"
      />
      {/* Blochează bara de sus YouTube (titlu + logo) */}
      <div className="absolute top-0 left-0 right-0 h-11 z-10" />
      {/* Blochează bara de jos YouTube (copy link, Watch on YouTube etc.) */}
      <div className="absolute bottom-0 left-0 right-0 h-20 z-10" />
    </div>
  );
}
