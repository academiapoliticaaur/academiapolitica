"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AmiMotiGuide } from "@/components/common/ami-moti-guide";

interface ClassItem {
  name: string;
  access_code: string;
  school_year: string;
  grade: string | null;
}

export default function ClasaLandingPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [filtered, setFiltered] = useState<ClassItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showList, setShowList] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch class list once
  useEffect(() => {
    fetch("/api/clasa/list")
      .then((r) => r.json())
      .then((data: ClassItem[]) => {
        setClasses(data);
        setFiltered(data);
      })
      .catch(() => {});
  }, []);

  // Filter as user types
  useEffect(() => {
    const q = query.trim().toUpperCase();
    if (!q) {
      setFiltered(classes);
    } else {
      setFiltered(
        classes.filter(
          (c) =>
            c.name.toUpperCase().includes(q) ||
            c.access_code.includes(q)
        )
      );
    }
    setError("");
  }, [query, classes]);

  // Close list on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowList(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function selectClass(cls: ClassItem) {
    setQuery(cls.name);
    setShowList(false);
    navigate(cls.access_code);
  }

  async function navigate(code: string) {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) { setError("Selectează o clasă sau introdu codul."); return; }
    setError("");
    setLoading(true);
    const res = await fetch(`/api/clasa/verify?code=${encodeURIComponent(trimmed)}`);
    if (res.ok) {
      router.push(`/clasa/${trimmed}`);
    } else {
      setError("Clasa nu a fost găsită. Verifică cu profesorul tău.");
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // If query matches exactly one class name, use its code
    const q = query.trim().toUpperCase();
    const exact = classes.find(
      (c) => c.name.toUpperCase() === q || c.access_code === q
    );
    await navigate(exact?.access_code ?? q);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏫</div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
            Intră în clasa ta
          </h1>
          <p className="text-gray-500">Caută clasa după nume sau cod</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative" ref={containerRef}>
              <label htmlFor="class-search" className="block text-sm font-semibold mb-2 text-gray-700">
                Numele sau codul clasei
              </label>

              {/* Input */}
              <div className="relative">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                  id="class-search"
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowList(true); }}
                  onFocus={() => setShowList(true)}
                  placeholder="ex. Clasa a 3-a A sau CLASA3A"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
                  autoComplete="off"
                  autoFocus
                />
              </div>

              {/* Dropdown list */}
              {showList && (
                <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {filtered.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-400 text-center">
                      Nicio clasă găsită.
                    </div>
                  ) : (
                    filtered.map((cls) => (
                      <button
                        key={cls.access_code}
                        type="button"
                        onClick={() => selectClass(cls)}
                        className="w-full flex items-center justify-between px-4 py-3 hover:bg-indigo-50 transition-colors text-left border-b border-gray-50 last:border-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-800">{cls.name}</p>
                          <p className="text-xs text-gray-400">{cls.school_year}{cls.grade ? ` · Clasa ${cls.grade}` : ""}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-lg">
                            {cls.access_code}
                          </span>
                          <ChevronRight size={14} className="text-gray-300" />
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white text-base gap-2"
            >
              <Search size={18} />
              {loading ? "Se caută..." : "Intră în clasă"}
            </Button>
          </form>
        </div>

        <div className="mt-6">
          <AmiMotiGuide
            variant="ami"
            message="Caută clasa după nume sau introdu codul primit de la profesor. Dacă nu îl ai, întreabă-l!"
          />
        </div>
      </div>
    </div>
  );
}
