"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X } from "lucide-react";

const STORAGE_KEY = "cookie-consent";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const val = localStorage.getItem(STORAGE_KEY);
      if (!val) setVisible(true);
    } catch {
      // localStorage indisponibil (SSR, incognito strict mode)
    }
  }, []);

  function accept() {
    try { localStorage.setItem(STORAGE_KEY, "accepted"); } catch { /* ignore */ }
    setVisible(false);
  }

  function decline() {
    try { localStorage.setItem(STORAGE_KEY, "declined"); } catch { /* ignore */ }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4">
      <div className="max-w-3xl mx-auto bg-white border border-gray-200 rounded-xl shadow-xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Cookie size={22} className="text-teal-500 shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-sm text-gray-600 flex-1">
          Folosim cookie-uri esențiale pentru funcționarea platformei. Conform{" "}
          <Link href="/confidentialitate" className="text-blue-500 hover:underline">
            Politicii de confidențialitate
          </Link>
          , nu colectăm date de tracking fără consimțământ.
        </p>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <button
            onClick={decline}
            className="flex-1 sm:flex-none text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Refuz
          </button>
          <button
            onClick={accept}
            className="flex-1 sm:flex-none text-sm px-4 py-2 rounded-lg bg-teal-500 text-white hover:bg-teal-600 font-medium transition-colors"
          >
            Accept
          </button>
          <button
            onClick={decline}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Închide"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
