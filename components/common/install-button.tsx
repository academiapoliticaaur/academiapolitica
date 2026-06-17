"use client";

import { useEffect, useState } from "react";
import { Download, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIosDevice(): boolean {
  return (
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.maxTouchPoints > 1 && /Mac/i.test(navigator.userAgent))
  );
}

function isInStandalone(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function InstallButton() {
  const [platform, setPlatform] = useState<"ios" | "android" | "installed" | null>(null);
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isInStandalone()) {
      setPlatform("installed");
      return;
    }
    if (isIosDevice()) {
      setPlatform("ios");
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setPrompt(e as BeforeInstallPromptEvent);
      setPlatform("android");
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Dacă evenimentul nu vine (browser desktop fără suport), arată iOS-style
    const fallback = setTimeout(() => {
      if (!prompt) setPlatform("ios");
    }, 1500);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(fallback);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAndroidInstall = async () => {
    if (!prompt) return;
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
  };

  if (installed || platform === "installed") {
    return (
      <div className="flex items-center justify-center gap-2 py-4 text-teal-700 font-semibold">
        <span className="text-2xl">✅</span>
        Aplicația este deja instalată!
      </div>
    );
  }

  // Android / Chrome — buton install direct
  if (platform === "android" && prompt) {
    return (
      <button
        onClick={handleAndroidInstall}
        className="w-full flex items-center justify-center gap-2 bg-teal-600 text-white py-3 px-6 rounded-full font-semibold text-base hover:bg-teal-700 transition-colors shadow-md"
      >
        <Download size={18} />
        Instalează acum
      </button>
    );
  }

  // iOS / Safari — instrucțiuni vizuale inline
  if (platform === "ios") {
    return (
      <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 space-y-3">
        <p className="font-semibold text-teal-800 text-center text-sm">
          Urmează acești pași în Safari:
        </p>
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">1</span>
          <span className="text-sm text-gray-700">
            Apasă butonul <span className="inline-flex items-center gap-1 bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs font-medium"><Share size={11} /> Share</span> din bara Safari (jos pe iPhone, sus pe iPad)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">2</span>
          <span className="text-sm text-gray-700">
            Derulează și apasă <strong>„Adaugă pe ecranul principal"</strong>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 bg-teal-600 text-white rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0">3</span>
          <span className="text-sm text-gray-700">
            Apasă <strong>„Adaugă"</strong> — gata!
          </span>
        </div>
        <p className="text-xs text-teal-600 text-center pt-1">
          ⚠️ Funcționează doar din <strong>Safari</strong> — nu din Chrome sau alte browsere pe iOS.
        </p>
      </div>
    );
  }

  // Loading state
  return (
    <div className="h-12 bg-gray-100 rounded-full animate-pulse" />
  );
}
