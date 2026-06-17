"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { Upload, Loader2, CheckCircle, FileText, X, BookOpen, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CourseOption {
  id: string;
  title: string;
  age_group: string;
  audience: string;
}

interface ParsedLesson {
  title: string;
  description?: string;
  main_message?: string;
  content_type?: string;
  has_lesson_quiz?: boolean;
  duration_minutes?: number | null;
}

interface ParsedModule {
  title: string;
  description?: string;
  badge_name?: string;
  learning_objectives?: string[];
  has_module_quiz?: boolean;
  lessons: ParsedLesson[];
}

type Phase =
  | "select-course"   // pas 0 — doar când courseId nu e furnizat
  | "idle"            // pas 1 — selectare fișier
  | "parsing"         // pas 2 — AI analizează
  | "preview"         // pas 3 — previzualizare rezultat
  | "importing"       // pas 4 — import în DB
  | "done"
  | "error";

const AGE_GROUP_OPTIONS = [
  { value: "0-4",  label: "Clasele 0–4" },
  { value: "5-8",  label: "Clasele 5–8" },
];

const AUDIENCE_OPTIONS = [
  { value: "children",  label: "Copii / Elevi" },
  { value: "invatator", label: "Invatatori (cls. 0–4)" },
  { value: "profesor",  label: "Profesori (cls. 5–8)" },
  { value: "all",       label: "Toate publicurile" },
];

export function ImportModuleButton({ courseId: propCourseId }: { courseId?: string }) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Curs selectat/creat intern (folosit când propCourseId nu e furnizat)
  const [resolvedCourseId, setResolvedCourseId] = useState<string | null>(propCourseId ?? null);

  // Selecție curs
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [selectedExistingId, setSelectedExistingId] = useState<string>("");
  const [isNewCourse, setIsNewCourse] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseAge, setNewCourseAge] = useState("0-4");
  const [newCourseAudience, setNewCourseAudience] = useState("children");
  const [courseCreating, setCourseCreating] = useState(false);

  const [phase, setPhase] = useState<Phase>(propCourseId ? "idle" : "select-course");
  const [parsedModule, setParsedModule] = useState<ParsedModule | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Încarcă lista cursuri când se deschide și nu avem courseId
  useEffect(() => {
    if (open && !propCourseId && courses.length === 0) {
      setLoadingCourses(true);
      fetch("/api/admin/courses-list")
        .then((r) => r.json())
        .then((data: { courses?: CourseOption[] }) => {
          setCourses(data.courses ?? []);
          setLoadingCourses(false);
        })
        .catch(() => setLoadingCourses(false));
    }
  }, [open, propCourseId, courses.length]);

  const filteredCourses = useMemo(() => {
    if (!courseSearch.trim()) return courses;
    const q = courseSearch.toLowerCase();
    return courses.filter((c) => c.title.toLowerCase().includes(q));
  }, [courses, courseSearch]);

  const reset = () => {
    setFile(null);
    setParsedModule(null);
    setError(null);
    setCourseSearch("");
    setSelectedExistingId("");
    setIsNewCourse(false);
    setNewCourseTitle("");
    setNewCourseAge("0-4");
    setNewCourseAudience("children");
    if (propCourseId) {
      setResolvedCourseId(propCourseId);
      setPhase("idle");
    } else {
      setResolvedCourseId(null);
      setPhase("select-course");
    }
  };

  const handleOpenChange = (val: boolean) => {
    setOpen(val);
    if (!val) reset();
  };

  // Confirmă selecția cursului (existent sau nou)
  const handleCourseConfirm = async () => {
    setError(null);

    if (!isNewCourse) {
      if (!selectedExistingId) {
        setError("Selectează un curs din lista de mai jos.");
        return;
      }
      setResolvedCourseId(selectedExistingId);
      setPhase("idle");
      return;
    }

    // Creează curs nou
    if (!newCourseTitle.trim()) {
      setError("Introdu titlul cursului.");
      return;
    }
    setCourseCreating(true);
    const res = await fetch("/api/admin/course-create-simple", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newCourseTitle.trim(),
        age_group: newCourseAge,
        audience: newCourseAudience,
      }),
    });
    const data = await res.json() as { courseId?: string; error?: string };
    setCourseCreating(false);

    if (!res.ok || !data.courseId) {
      setError(data.error ?? "Eroare la crearea cursului");
      return;
    }
    setResolvedCourseId(data.courseId);
    setPhase("idle");
  };

  const handleParse = async () => {
    if (!file) return;
    setPhase("parsing");
    setError(null);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/admin/parse-module", { method: "POST", body: fd });
    const data = await res.json() as { module?: ParsedModule; error?: string };

    if (!res.ok) {
      setPhase("error");
      setError(data.error ?? "Eroare la analiză");
      return;
    }

    setParsedModule(data.module ?? null);
    setPhase("preview");
  };

  const handleImport = async () => {
    if (!parsedModule || !resolvedCourseId) return;
    setPhase("importing");

    const res = await fetch("/api/admin/import-module", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: resolvedCourseId, module: parsedModule }),
    });
    const data = await res.json() as { moduleId?: string; error?: string };

    if (!res.ok) {
      setPhase("error");
      setError(data.error ?? "Eroare la import");
      return;
    }

    setPhase("done");
    setTimeout(() => {
      setOpen(false);
      // Dacă suntem pe pagina unui curs, refresh. Dacă nu, navighează la curs.
      if (propCourseId) {
        router.refresh();
      } else if (resolvedCourseId) {
        router.push(`/admin/courses/${resolvedCourseId}`);
      }
    }, 1500);
  };

  const selectedCourseTitle = courses.find((c) => c.id === selectedExistingId)?.title;

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 gap-2"
      >
        <FileText size={14} />
        Import modul din fișier
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => handleOpenChange(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-semibold text-lg">Import modul din fișier</h2>
              <button onClick={() => handleOpenChange(false)} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <div className="p-5">

              {/* ── PAS 0: Selecție curs (doar fără propCourseId) ── */}
              {phase === "select-course" && (
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">
                    Alege cursul în care vrei să adaugi modulul importat:
                  </p>

                  {loadingCourses ? (
                    <div className="flex items-center gap-2 text-gray-400 text-sm py-4">
                      <Loader2 size={16} className="animate-spin" />
                      Se încarcă cursurile...
                    </div>
                  ) : (
                    <>
                      {/* Lista cursuri existente */}
                      {courses.length > 0 && !isNewCourse && (
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-gray-700">Curs existent</label>
                          {/* Căutare */}
                          <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              type="text"
                              value={courseSearch}
                              onChange={(e) => { setCourseSearch(e.target.value); setSelectedExistingId(""); }}
                              placeholder="Caută curs..."
                              className="w-full border rounded-lg pl-8 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                          </div>
                          <div className="border rounded-xl overflow-hidden divide-y max-h-48 overflow-y-auto">
                            {filteredCourses.length === 0 ? (
                              <p className="px-4 py-3 text-sm text-gray-400">Niciun curs găsit.</p>
                            ) : filteredCourses.map((c) => (
                              <button
                                key={c.id}
                                onClick={() => setSelectedExistingId(c.id)}
                                className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-indigo-50 transition-colors ${
                                  selectedExistingId === c.id ? "bg-indigo-50 border-l-4 border-indigo-500" : ""
                                }`}
                              >
                                <BookOpen size={14} className="text-gray-400 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">{c.title}</p>
                                  <p className="text-xs text-gray-400">Cls. {c.age_group}</p>
                                </div>
                                {selectedExistingId === c.id && (
                                  <span className="ml-auto text-indigo-600 text-xs font-medium shrink-0">Selectat</span>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Separator / toggle */}
                      {courses.length > 0 && (
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-gray-200" />
                          <button
                            onClick={() => {
                              setIsNewCourse(!isNewCourse);
                              setSelectedExistingId("");
                              setError(null);
                            }}
                            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium shrink-0"
                          >
                            {isNewCourse ? "← Alege curs existent" : "Sau creează curs nou →"}
                          </button>
                          <div className="flex-1 h-px bg-gray-200" />
                        </div>
                      )}

                      {/* Formular curs nou */}
                      {(isNewCourse || courses.length === 0) && (
                        <div className="space-y-3 p-4 bg-gray-50 rounded-xl border">
                          <p className="text-xs font-medium text-gray-700">
                            {courses.length === 0 ? "Nu există cursuri. Creează primul:" : "Curs nou"}
                          </p>
                          <div>
                            <label className="text-xs text-gray-500 mb-1 block">Titlul cursului *</label>
                            <input
                              type="text"
                              value={newCourseTitle}
                              onChange={(e) => setNewCourseTitle(e.target.value)}
                              placeholder="ex: Prieteni de Incredere cu Ami si Moti"
                              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">Clasă</label>
                              <select
                                value={newCourseAge}
                                onChange={(e) => setNewCourseAge(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                              >
                                {AGE_GROUP_OPTIONS.map((o) => (
                                  <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 mb-1 block">Audiență</label>
                              <select
                                value={newCourseAudience}
                                onChange={(e) => setNewCourseAudience(e.target.value)}
                                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                              >
                                {AUDIENCE_OPTIONS.map((o) => (
                                  <option key={o.value} value={o.value}>{o.label}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
                  )}

                  <Button
                    onClick={handleCourseConfirm}
                    disabled={courseCreating || loadingCourses}
                    className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700 gap-2"
                  >
                    {courseCreating ? (
                      <><Loader2 size={14} className="animate-spin" />Se creează cursul...</>
                    ) : (
                      isNewCourse || courses.length === 0
                        ? "Creează cursul și continuă →"
                        : selectedExistingId
                          ? `Adaugă modul la "${selectedCourseTitle}" →`
                          : "Continuă →"
                    )}
                  </Button>
                </div>
              )}

              {/* ── PAS 1–4: Selecție fișier → parse → preview → import ── */}
              {phase !== "select-course" && (
                <>
                  {phase === "done" ? (
                    <div className="flex flex-col items-center gap-3 py-8 text-center">
                      <CheckCircle className="text-teal-500" size={40} />
                      <p className="font-semibold text-teal-800">Modul importat cu succes!</p>
                      <p className="text-sm text-gray-500">
                        {propCourseId ? "Pagina se actualizează..." : "Te redirecționez la curs..."}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 py-1">
                      {/* Breadcrumb curs selectat */}
                      {!propCourseId && resolvedCourseId && (
                        <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50 rounded-lg px-3 py-2">
                          <BookOpen size={12} />
                          <span>
                            {courses.find((c) => c.id === resolvedCourseId)?.title ?? "Curs nou creat"}
                          </span>
                          <button
                            onClick={() => { setPhase("select-course"); setResolvedCourseId(null); setParsedModule(null); setFile(null); setError(null); }}
                            className="ml-auto text-gray-400 hover:text-gray-600"
                          >
                            Schimbă
                          </button>
                        </div>
                      )}

                      {/* Drop zone */}
                      <div
                        className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                        onClick={() => fileRef.current?.click()}
                      >
                        <Upload className="mx-auto mb-2 text-gray-400" size={28} />
                        {file ? (
                          <p className="font-medium text-indigo-700 text-sm">{file.name}</p>
                        ) : (
                          <>
                            <p className="font-medium text-gray-700 text-sm">Click pentru a selecta fișierul modulului</p>
                            <p className="text-xs text-gray-400 mt-1">DOCX sau PDF, max 4MB</p>
                            <p className="text-xs text-gray-400">ex: M01_Radacinile.docx</p>
                          </>
                        )}
                        <input
                          ref={fileRef}
                          type="file"
                          accept=".docx,.pdf"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0] ?? null;
                            setFile(f);
                            setParsedModule(null);
                            setError(null);
                            setPhase("idle");
                          }}
                        />
                      </div>

                      {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">{error}</div>
                      )}

                      {(phase === "idle" || phase === "error") && (
                        <Button
                          onClick={handleParse}
                          disabled={!file}
                          className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-700"
                        >
                          Analizează cu AI →
                        </Button>
                      )}

                      {phase === "parsing" && (
                        <div className="flex items-center justify-center gap-2 py-4 text-indigo-600">
                          <Loader2 size={18} className="animate-spin" />
                          <span className="text-sm">Se analizează fișierul...</span>
                        </div>
                      )}

                      {parsedModule && (phase === "preview" || phase === "importing") && (
                        <div className="border rounded-xl overflow-hidden">
                          <div className="bg-indigo-50 border-b p-4">
                            <h3 className="font-semibold text-gray-900">{parsedModule.title}</h3>
                            {parsedModule.description && (
                              <p className="text-xs text-gray-600 mt-1">{parsedModule.description}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2 text-xs text-indigo-600 font-medium">
                              <span>{parsedModule.lessons.length} lecții</span>
                              {parsedModule.has_module_quiz && <span>+ quiz final</span>}
                              {parsedModule.badge_name && <span>· {parsedModule.badge_name}</span>}
                            </div>
                          </div>

                          <ul className="divide-y max-h-64 overflow-y-auto">
                            {parsedModule.lessons.map((lesson, i) => (
                              <li key={i} className="px-4 py-2.5 flex items-start gap-3">
                                <span className="text-xs text-gray-300 mt-0.5 w-5 shrink-0">{i + 1}.</span>
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-gray-800 truncate">{lesson.title}</p>
                                  {lesson.description && (
                                    <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{lesson.description}</p>
                                  )}
                                  <span className="text-xs bg-gray-100 text-gray-500 rounded px-1.5 py-0.5 mt-1 inline-block">
                                    {lesson.content_type ?? "mixed"}
                                  </span>
                                </div>
                              </li>
                            ))}
                            {parsedModule.has_module_quiz && (
                              <li className="px-4 py-2.5 flex items-center gap-3">
                                <span className="text-xs text-gray-300 w-5 shrink-0">🎯</span>
                                <p className="text-sm font-medium text-blue-600">Quiz final modul</p>
                              </li>
                            )}
                          </ul>

                          <div className="p-4 border-t bg-gray-50 flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => { setPhase("idle"); setParsedModule(null); }}
                              className="flex-1"
                            >
                              Alege alt fișier
                            </Button>
                            <Button
                              onClick={handleImport}
                              disabled={phase === "importing"}
                              className="flex-1 bg-teal-100 hover:bg-teal-200 text-teal-700 gap-2"
                            >
                              {phase === "importing" ? (
                                <><Loader2 size={14} className="animate-spin" />Se importă...</>
                              ) : "Adaugă la curs"}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
