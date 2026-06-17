"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const INACTIVE_MS = 15 * 60 * 1000; // 15 minute
const WARNING_MS = 60 * 1000;        // avertizare cu 1 minut înainte
const LS_KEY = "ami_moti_last_activity";

const EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"] as const;

function saveActivity() {
  try { localStorage.setItem(LS_KEY, String(Date.now())); } catch {}
}

function getLastActivity(): number {
  try { return Number(localStorage.getItem(LS_KEY) ?? 0); } catch { return 0; }
}

export function InactivityLogout() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(60);
  const [showWarning, setShowWarning] = useState(false);

  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const clearAllTimers = useCallback(() => {
    if (logoutTimer.current) clearTimeout(logoutTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
    if (countdownInterval.current) clearInterval(countdownInterval.current);
  }, []);

  const doLogout = useCallback(async () => {
    clearAllTimers();
    try { localStorage.removeItem(LS_KEY); } catch {}
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login?reason=inactivity");
  }, [clearAllTimers, router]);

  const reset = useCallback(() => {
    saveActivity();
    clearAllTimers();
    setShowWarning(false);
    setCountdown(60);

    warningTimer.current = setTimeout(() => {
      setShowWarning(true);
      setCountdown(60);
      countdownInterval.current = setInterval(() => {
        setCountdown((prev) => Math.max(0, prev - 1));
      }, 1000);
    }, INACTIVE_MS - WARNING_MS);

    logoutTimer.current = setTimeout(doLogout, INACTIVE_MS);
  }, [clearAllTimers, doLogout]);

  useEffect(() => {
    // Verifică dacă s-au scurs 15 min de la ultima activitate (tab închis și redeschis)
    const elapsed = Date.now() - getLastActivity();
    if (getLastActivity() > 0 && elapsed > INACTIVE_MS) {
      doLogout();
      return;
    }

    // Salvează timestamp la închiderea tab-ului/ferestrei
    const onVisibilityHidden = () => {
      if (document.visibilityState === "hidden") saveActivity();
    };
    document.addEventListener("visibilitychange", onVisibilityHidden);

    EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();

    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, reset));
      document.removeEventListener("visibilitychange", onVisibilityHidden);
      clearAllTimers();
      // Salvează momentul ieșirii pentru verificare la revenire
      saveActivity();
    };
  }, [reset, clearAllTimers, doLogout]);

  if (!showWarning) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center">
        <div className="text-5xl mb-4">⏱️</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Sesiune inactivă</h2>
        <p className="text-gray-600 mb-6 leading-relaxed">
          Vei fi deconectat automat în{" "}
          <span className="font-bold text-red-500 text-lg">{countdown}s</span>{" "}
          din cauza inactivității.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={reset}
            className="bg-blue-500 hover:bg-blue-600 text-white w-full"
            size="lg"
          >
            Rămâi conectat
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400"
            onClick={doLogout}
          >
            Deconectează-mă acum
          </Button>
        </div>
      </div>
    </div>
  );
}
