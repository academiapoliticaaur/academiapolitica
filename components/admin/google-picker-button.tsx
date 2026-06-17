"use client";

import { useState, useCallback } from "react";
import { HardDrive, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PickedFile {
  id: string;
  name: string;
  mimeType: string;
  url: string;
  embedUrl: string;
}

interface Props {
  onFilePicked: (file: PickedFile) => void;
  accept?: "video" | "presentation" | "worksheet" | "any";
  label?: string;
}

const MIME_TYPES: Record<string, string[]> = {
  video: ["video/mp4", "video/quicktime", "application/vnd.google-apps.video"],
  presentation: [
    "application/vnd.google-apps.presentation",
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  worksheet: [
    "application/pdf",
    "application/vnd.google-apps.document",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  any: [],
};

declare global {
  interface Window {
    google?: {
      picker: {
        PickerBuilder: new () => GooglePickerBuilder;
        ViewId: Record<string, string>;
        Action: { PICKED: string; CANCEL: string };
        Feature: { MULTISELECT_ENABLED: string };
      };
    };
    gapi?: {
      load: (lib: string, cb: () => void) => void;
    };
  }
}

interface GooglePickerBuilder {
  addView(view: unknown): GooglePickerBuilder;
  setOAuthToken(token: string): GooglePickerBuilder;
  setDeveloperKey(key: string): GooglePickerBuilder;
  setCallback(cb: (data: GooglePickerResponse) => void): GooglePickerBuilder;
  enableFeature(feature: string): GooglePickerBuilder;
  setTitle(title: string): GooglePickerBuilder;
  build(): { setVisible(v: boolean): void };
}

interface GooglePickerResponse {
  action: string;
  docs?: Array<{
    id: string;
    name: string;
    mimeType: string;
    url: string;
    embedUrl: string;
  }>;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function GooglePickerButton({ onFilePicked, accept = "any", label }: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const openPicker = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // 1. Obține access token de la server
      const tokenRes = await fetch("/api/admin/drive/token");
      const tokenData = await tokenRes.json();
      if (!tokenRes.ok) throw new Error(tokenData.error ?? "Eroare token Drive");
      const accessToken: string = tokenData.accessToken;

      // 2. Încarcă Google Picker API
      await loadScript("https://apis.google.com/js/api.js");
      await loadScript("https://apis.google.com/js/picker.js");

      await new Promise<void>((resolve) => {
        if (window.google?.picker) { resolve(); return; }
        window.gapi?.load("picker", () => resolve());
        setTimeout(resolve, 2000);
      });

      if (!window.google?.picker) throw new Error("Google Picker API nu s-a încărcat.");

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY;
      if (!apiKey) throw new Error("NEXT_PUBLIC_GOOGLE_DRIVE_API_KEY lipsă.");

      // 3. Construiește Picker
      const { PickerBuilder, ViewId, Action } = window.google.picker;

      let view;
      if (accept === "video") {
        view = new (window.google.picker as unknown as { View: new (id: string) => unknown }).View(ViewId.DOCS_VIDEOS ?? "videos");
      } else {
        view = new (window.google.picker as unknown as { View: new (id: string) => unknown }).View(ViewId.DOCS);
      }

      const mimeTypes = MIME_TYPES[accept];
      if (mimeTypes.length > 0 && (view as unknown as { setMimeTypes: (m: string) => void }).setMimeTypes) {
        (view as unknown as { setMimeTypes: (m: string) => void }).setMimeTypes(mimeTypes.join(","));
      }

      const picker = new PickerBuilder()
        .addView(view)
        .setOAuthToken(accessToken)
        .setDeveloperKey(apiKey)
        .setTitle(label ?? "Selectează fișier din Google Drive")
        .setCallback((data: GooglePickerResponse) => {
          if (data.action === Action.PICKED && data.docs?.[0]) {
            const doc = data.docs[0];
            onFilePicked({
              id: doc.id,
              name: doc.name,
              mimeType: doc.mimeType,
              url: `https://drive.google.com/file/d/${doc.id}/view`,
              embedUrl: doc.mimeType === "application/vnd.google-apps.presentation"
                ? `https://docs.google.com/presentation/d/${doc.id}/embed`
                : `https://drive.google.com/file/d/${doc.id}/preview`,
            });
          }
        })
        .build();

      picker.setVisible(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare necunoscută");
    } finally {
      setLoading(false);
    }
  }, [accept, label, onFilePicked]);

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={openPicker}
        disabled={loading}
        className="gap-2 text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
      >
        {loading ? <Loader2 size={14} className="animate-spin" /> : <HardDrive size={14} />}
        {loading ? "Se deschide..." : (label ?? "Selectează din Drive")}
      </Button>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}
