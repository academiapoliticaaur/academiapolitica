"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Student {
  id: string;
  display_name: string;
  student_code: string;
  age_group: string;
  has_pin: boolean;
}

interface StudentListProps {
  students: Student[];
  classCode: string;
}

export function StudentList({ students, classCode }: StudentListProps) {
  const router = useRouter();
  const [selected, setSelected] = useState<Student | null>(null);
  const [digits, setDigits] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fixed 4 refs — hooks cannot be called in a loop
  const ref0 = useRef<HTMLInputElement>(null);
  const ref1 = useRef<HTMLInputElement>(null);
  const ref2 = useRef<HTMLInputElement>(null);
  const ref3 = useRef<HTMLInputElement>(null);
  const inputRefs = [ref0, ref1, ref2, ref3];

  const pin = digits.join("");

  const navigate = useCallback((student: Student) => {
    router.push(`/grup/${classCode}/${student.student_code}`);
  }, [router, classCode]);

  const openPin = (student: Student) => {
    // Check if already verified this session
    try {
      const verified = sessionStorage.getItem(`pin_ok_${classCode}_${student.student_code}`);
      if (verified === "1") { navigate(student); return; }
    } catch { /* sessionStorage unavailable */ }
    setSelected(student);
    setDigits(["", "", "", ""]);
    setError("");
  };

  const handleStudentClick = (student: Student) => {
    if (!student.has_pin) { navigate(student); return; }
    openPin(student);
  };

  const handleClose = () => {
    setSelected(null);
    setDigits(["", "", "", ""]);
    setError("");
  };

  const handleDigit = (idx: number, value: string) => {
    const char = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[idx] = char;
    setDigits(next);
    setError("");
    if (char && idx < 3) {
      inputRefs[idx + 1].current?.focus();
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (digits[idx]) {
        const next = [...digits];
        next[idx] = "";
        setDigits(next);
      } else if (idx > 0) {
        inputRefs[idx - 1].current?.focus();
      }
    }
    if (e.key === "Enter" && pin.length === 4) {
      verifyPin(pin);
    }
  };

  const verifyPin = useCallback(async (p: string) => {
    if (!selected || p.length !== 4) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/grup/verify-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ classCode, studentCode: selected.student_code, pin: p }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        try { sessionStorage.setItem(`pin_ok_${classCode}_${selected.student_code}`, "1"); } catch { /* ignore */ }
        navigate(selected);
      } else {
        setError(data.error ?? "PIN incorect. Încearcă din nou!");
        setDigits(["", "", "", ""]);
        setTimeout(() => ref0.current?.focus(), 50);
      }
    } catch {
      setError("Eroare de rețea. Încearcă din nou.");
    } finally {
      setLoading(false);
    }
  }, [selected, classCode, navigate]);

  // Auto-submit when all 4 digits filled
  useEffect(() => {
    if (pin.length === 4 && selected && !loading) {
      verifyPin(pin);
    }
  }, [pin, selected, loading, verifyPin]);

  // Focus first box when modal opens
  useEffect(() => {
    if (selected) {
      const t = setTimeout(() => ref0.current?.focus(), 120);
      return () => clearTimeout(t);
    }
  }, [selected]);

  return (
    <>
      <div className="space-y-2">
        {students.map((s) => (
          <button
            key={s.id}
            onClick={() => handleStudentClick(s)}
            className="w-full flex items-center gap-4 bg-white border-2 border-indigo-100 hover:border-indigo-400 hover:shadow-md rounded-2xl px-5 py-4 transition-all group text-left"
          >
            <span className="text-3xl">{s.age_group === "0-4" ? "🌈" : "🚀"}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 group-hover:text-indigo-700">{s.display_name}</p>
              <p className="text-xs text-gray-400 font-mono">{s.student_code}</p>
            </div>
            {s.has_pin && (
              <Lock size={14} className="text-indigo-300 group-hover:text-indigo-500 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>

      {/* PIN Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-indigo-950/70 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs p-8 text-center">
            <div className="text-5xl mb-3">
              {selected.age_group === "0-4" ? "🌈" : "🚀"}
            </div>
            <h2 className="text-xl font-extrabold text-gray-900 mb-1">
              {selected.display_name.split(" ")[0]}!
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Introdu PIN-ul tău de 4 cifre
            </p>

            {/* Digit boxes */}
            <div className="flex justify-center gap-3 mb-5">
              {[ref0, ref1, ref2, ref3].map((ref, i) => (
                <input
                  key={i}
                  ref={ref}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digits[i]}
                  onChange={(e) => handleDigit(i, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  disabled={loading}
                  className={`w-14 h-16 text-center text-2xl font-bold rounded-2xl border-2 outline-none transition-all
                    ${digits[i]
                      ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                      : "border-gray-200 bg-gray-50 text-gray-300"
                    }
                    focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200
                    disabled:opacity-50`}
                  placeholder="•"
                />
              ))}
            </div>

            {error && (
              <p className="text-sm text-red-500 font-semibold mb-4 animate-pulse">{error}</p>
            )}

            {loading && (
              <div className="flex items-center justify-center gap-2 text-indigo-500 mb-4">
                <Loader2 size={18} className="animate-spin" />
                <span className="text-sm">Se verifică...</span>
              </div>
            )}

            <Button
              onClick={() => verifyPin(pin)}
              disabled={pin.length !== 4 || loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white h-12 text-base rounded-xl mb-4"
            >
              Intră
            </Button>

            <button
              onClick={handleClose}
              className="text-sm text-gray-400 hover:text-gray-600 flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft size={13} />
              Selectează alt elev
            </button>
          </div>
        </div>
      )}
    </>
  );
}
