"use client";

import { useEffect, useState } from "react";
import { X, Download, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIosDevice(): boolean {
  // iPadOS 13+ raportează "Macintosh" în userAgent — detectăm prin maxTouchPoints
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

function wasDismissedRecently(): boolean {
  const dismissed = localStorage.getItem("pwa-banner-dismissed");
  return !!dismissed && Date.now() - parseInt(dismissed) < 7 * 24 * 60 * 60 * 1000;
}

export function PwaRegister() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroidBanner, setShowAndroidBanner] = useState(false);
  const [showIosBanner, setShowIosBanner] = useState(false);

  useEffect(() => {
    // Înregistrare service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .catch(() => {/* SW registration failed silently */});
    }

    if (isInStandalone()) return;
    if (wasDismissedRecently()) return;

    // iOS: beforeinstallprompt nu există — afișăm instrucțiuni manuale
    if (isIosDevice()) {
      setShowIosBanner(true);
      return;
    }

    // Android / Chrome: captează evenimentul de instalare automată
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowAndroidBanner(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowAndroidBanner(false);
      setInstallPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowAndroidBanner(false);
    setShowIosBanner(false);
    localStorage.setItem("pwa-banner-dismissed", Date.now().toString());
  };

  // Banner Android / Chrome desktop
  if (showAndroidBanner) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4">
        <div className="max-w-md mx-auto bg-teal-700 text-white rounded-2xl shadow-xl flex items-center gap-3 px-4 py-3">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-sm">Adaugă pe ecranul principal</p>
            <p className="text-xs text-teal-200 mt-0.5">Acces rapid la Academia Politica AUR</p>
          </div>
          <button
            onClick={handleInstall}
            className="shrink-0 flex items-center gap-1.5 bg-white text-teal-700 font-semibold text-xs px-3 py-1.5 rounded-xl hover:bg-teal-50 transition-colors"
          >
            <Download size={13} />
            Instalează
          </button>
          <button
            onClick={handleDismiss}
            className="shrink-0 text-teal-300 hover:text-white transition-colors"
            aria-label="Închide"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    );
  }

  // Banner iOS / iPad — instrucțiuni manuale (Safari Share → Add to Home Screen)
  if (showIosBanner) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4">
        <div className="max-w-md mx-auto bg-teal-700 text-white rounded-2xl shadow-xl px-4 py-3">
          <div className="flex items-start gap-3">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">Instalează pe iPhone / iPad</p>
              <p className="text-xs text-teal-100 mt-1 leading-relaxed">
                Apasă <Share size={12} className="inline mx-0.5 -mt-0.5" /> <strong>Share</strong> din bara Safari,
                apoi <strong>„Adaugă pe ecranul principal"</strong>.
              </p>
            </div>
            <button
              onClick={handleDismiss}
              className="shrink-0 text-teal-300 hover:text-white transition-colors mt-0.5"
              aria-label="Închide"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
