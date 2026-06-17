"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { verifyChildPin } from "@/lib/actions/child-profile";

interface PinEntryProps {
  profileId: string;
  childName: string;
}

export function PinEntry({ profileId, childName }: PinEntryProps) {
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const refs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const router = useRouter();

  const handleDigit = (idx: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[idx] = val;
    setDigits(next);
    setError("");
    if (val && idx < 3) refs[idx + 1].current?.focus();
    if (next.every((d) => d !== "") && idx === 3) {
      handleSubmit(next.join(""));
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      refs[idx - 1].current?.focus();
    }
  };

  const handleSubmit = async (pin: string) => {
    setLoading(true);
    const ok = await verifyChildPin(profileId, pin);
    if (ok) {
      router.push(`/child/${profileId}`);
      router.refresh();
    } else {
      setError("PIN incorect. Încearcă din nou.");
      setDigits(["", "", "", ""]);
      refs[0].current?.focus();
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 w-full max-w-sm text-center">
      <div className="text-5xl mb-4">🔐</div>
      <h1 className="text-xl font-black mb-1">Profilul lui {childName}</h1>
      <p className="text-gray-500 text-sm mb-8">Introdu PIN-ul de 4 cifre</p>

      <div className="flex justify-center gap-3 mb-6">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={refs[i]}
            type="password"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            disabled={loading}
            className={`w-14 h-14 text-center text-2xl font-black border-2 rounded-xl outline-none transition-colors ${
              error ? "border-red-400 bg-red-50" : "border-gray-200 focus:border-blue-400"
            }`}
            autoFocus={i === 0}
          />
        ))}
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
      {loading && <p className="text-gray-400 text-sm">Se verifică...</p>}
    </div>
  );
}
