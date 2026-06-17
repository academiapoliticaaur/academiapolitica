"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileUp, Loader2, CheckCircle, AlertCircle, Trash2, X, HelpCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ParsedAnswer {
  answer_text: string;
  is_correct: boolean;
  feedback: string;
}
interface ParsedQuestion {
  question_text: string;
  answers: ParsedAnswer[];
}
interface QuizSection {
  title: string;
  questions: ParsedQuestion[];
  selected: boolean;
  customTitle: string;
}

interface ImportQuizButtonProps {
  moduleId: string;
  courseId: string;
  existingLessonIds?: string[]; // în ordine, pentru interleaving
}

type Phase = "idle" | "parsing" | "preview" | "importing" | "done" | "error";

export function ImportQuizButton({ moduleId, courseId, existingLessonIds = [] }: ImportQuizButtonProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [sections, setSections] = useState<QuizSection[]>([]);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(0);
  const [importProgress, setImportProgress] = useState<{ done: number; total: number }>({ done: 0, total: 0 });

  const reset = useCallback(() => {
    setPhase("idle");
    setErrorMsg("");
    setSections([]);
    setExpandedIdx(0);
    setImportProgress({ done: 0, total: 0 });
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleClose = () => { setOpen(false); reset(); };

  const handleFile = async (file: File) => {
    setPhase("parsing");
    setErrorMsg("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/admin/parse-quiz", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare server");
      if (!data.quizzes?.length && !data.questions?.length) {
        throw new Error("Nu s-au găsit întrebări tip grilă. Verifică formatul documentului.");
      }

      // Build sections from response
      const rawSections: Array<{ title: string; questions: ParsedQuestion[] }> =
        data.quizzes ??
        [{ title: file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() || "Quiz", questions: data.questions }];

      setSections(rawSections.map((s) => ({
        title: s.title,
        customTitle: s.title,
        questions: s.questions,
        selected: true,
      })));
      setExpandedIdx(0);
      setPhase("preview");
    } catch (e) {
      setErrorMsg(e instanceof Error ? e.message : "Eroare necunoscută");
      setPhase("error");
    }
  };

  const updateSectionTitle = (idx: number, val: string) => {
    setSections((prev) => prev.map((s, i) => i === idx ? { ...s, customTitle: val } : s));
  };

  const toggleSection = (idx: number) => {
    setSections((prev) => prev.map((s, i) => i === idx ? { ...s, selected: !s.selected } : s));
  };

  const setCorrect = (sIdx: number, qIdx: number, aIdx: number) => {
    setSections((prev) => prev.map((s, si) =>
      si !== sIdx ? s : {
        ...s,
        questions: s.questions.map((q, qi) =>
          qi !== qIdx ? q : {
            ...q,
            answers: q.answers.map((a, ai) => ({ ...a, is_correct: ai === aIdx })),
          }
        ),
      }
    ));
  };

  const removeQuestion = (sIdx: number, qIdx: number) => {
    setSections((prev) => prev.map((s, si) =>
      si !== sIdx ? s : { ...s, questions: s.questions.filter((_, qi) => qi !== qIdx) }
    ));
  };

  const handleImport = async () => {
    const toImport = sections.filter((s) => s.selected && s.questions.length > 0);
    if (toImport.length === 0) return;

    const hasEmpty = toImport.some((s) => !s.customTitle.trim());
    if (hasEmpty) { setErrorMsg("Completează titlul pentru fiecare quiz selectat."); return; }

    setPhase("importing");
    setErrorMsg("");
    setImportProgress({ done: 0, total: toImport.length });

    let lastLessonId = "";
    let lastCourseId = courseId;

    for (let i = 0; i < toImport.length; i++) {
      const s = toImport[i];
      try {
        // Quiz la poziția i → inserează după lecția i (dacă există lecție la acea poziție)
        const afterLessonId = existingLessonIds[i] ?? undefined;
        const res = await fetch("/api/admin/import-quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleId, quizTitle: s.customTitle.trim(), questions: s.questions, afterLessonId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Eroare import");
        lastLessonId = data.lessonId;
        if (data.courseId) lastCourseId = data.courseId;
        setImportProgress({ done: i + 1, total: toImport.length });
      } catch (e) {
        setErrorMsg(`Eroare la "${s.customTitle}": ${e instanceof Error ? e.message : "necunoscută"}`);
        setPhase("error");
        return;
      }
    }

    setPhase("done");
    setTimeout(() => {
      if (toImport.length === 1 && lastLessonId) {
        router.push(`/admin/courses/${lastCourseId}/modules/${moduleId}/lessons/${lastLessonId}/quiz`);
      } else {
        router.push(`/admin/courses/${lastCourseId}`);
        router.refresh();
      }
    }, 1200);
  };

  const selectedCount = sections.filter((s) => s.selected).length;

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="bg-purple-100 hover:bg-purple-200 text-purple-700 gap-1.5" size="sm">
        <HelpCircle size={14} />
        Import Quiz AI
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <HelpCircle size={18} className="text-purple-600" />
            <span className="font-semibold text-gray-800">Import Quiz din fișier</span>
          </div>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X size={18} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Idle */}
          {phase === "idle" && (
            <div>
              <p className="text-sm text-gray-500 mb-4">
                Încarcă un fișier <strong>.docx</strong> cu întrebările quiz-ului.
                Dacă fișierul conține mai multe quiz-uri (unul per lecție), se vor detecta automat.
              </p>
              <div
                className="border-2 border-dashed border-purple-200 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
              >
                <FileUp size={32} className="text-purple-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-700">Trage fișierul sau apasă pentru selectare</p>
                <p className="text-xs text-gray-400 mt-1">DOCX, PDF — max 4MB</p>
                <p className="text-xs text-gray-400">Format: Întrebare: / • A. / Răspuns corect: A</p>
                <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
              </div>
            </div>
          )}

          {/* Parsing */}
          {phase === "parsing" && (
            <div className="text-center py-12">
              <Loader2 size={36} className="animate-spin text-purple-500 mx-auto mb-4" />
              <p className="font-semibold text-gray-700">AI analizează documentul...</p>
              <p className="text-sm text-gray-400 mt-1">Detectează quiz-uri și extrage întrebările</p>
            </div>
          )}

          {/* Error */}
          {phase === "error" && (
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle size={18} className="text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-700 text-sm">Eroare</p>
                  <p className="text-sm text-red-600 mt-0.5">{errorMsg}</p>
                </div>
              </div>
              <Button onClick={reset} variant="outline" className="w-full">Încearcă din nou</Button>
            </div>
          )}

          {/* Done */}
          {phase === "done" && (
            <div className="text-center py-12">
              <CheckCircle size={40} className="text-teal-500 mx-auto mb-4" />
              <p className="font-semibold text-gray-800">
                {importProgress.total === 1 ? "Quiz importat cu succes!" : `${importProgress.total} quiz-uri importate!`}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                {importProgress.total === 1 ? "Se deschide editorul..." : "Se revine la lista de module..."}
              </p>
            </div>
          )}

          {/* Importing */}
          {phase === "importing" && (
            <div className="text-center py-12">
              <Loader2 size={36} className="animate-spin text-purple-500 mx-auto mb-4" />
              <p className="font-semibold text-gray-700">
                Se importă quiz {importProgress.done + 1} din {importProgress.total}...
              </p>
              <div className="mt-4 bg-gray-100 rounded-full h-2 mx-8">
                <div
                  className="bg-purple-500 h-2 rounded-full transition-all"
                  style={{ width: `${(importProgress.done / importProgress.total) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Preview */}
          {phase === "preview" && sections.length > 0 && (
            <div className="space-y-3">
              {errorMsg && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errorMsg}</p>
              )}

              {sections.length > 1 && (
                <div className="bg-purple-50 border border-purple-200 rounded-xl px-4 py-3 text-sm text-purple-700">
                  <strong>{sections.length} quiz-uri detectate</strong> — se vor crea {sections.length} lecții quiz în modul.
                  Debifează quiz-urile pe care nu vrei să le imporți acum.
                </div>
              )}

              {sections.map((section, sIdx) => (
                <div key={sIdx} className={`border-2 rounded-xl overflow-hidden transition-colors ${section.selected ? "border-purple-300" : "border-gray-200 opacity-60"}`}>
                  {/* Section header */}
                  <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border-b">
                    <input
                      type="checkbox"
                      checked={section.selected}
                      onChange={() => toggleSection(sIdx)}
                      className="accent-purple-600 w-4 h-4 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <Input
                        value={section.customTitle}
                        onChange={(e) => updateSectionTitle(sIdx, e.target.value)}
                        placeholder="Titlul lecției quiz"
                        className="h-8 text-sm font-semibold"
                        disabled={!section.selected}
                      />
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">{section.questions.length} întrebări</span>
                    <button
                      onClick={() => setExpandedIdx(expandedIdx === sIdx ? null : sIdx)}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                    >
                      {expandedIdx === sIdx ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>

                  {/* Expanded questions */}
                  {expandedIdx === sIdx && (
                    <div className="p-3 space-y-2 max-h-60 overflow-y-auto">
                      {section.questions.map((q, qIdx) => (
                        <div key={qIdx} className="rounded-xl border border-gray-200 p-3 bg-white">
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 mb-2">{qIdx + 1}. {q.question_text}</p>
                              <div className="space-y-1">
                                {q.answers.map((a, aIdx) => (
                                  <button
                                    key={aIdx}
                                    type="button"
                                    onClick={() => setCorrect(sIdx, qIdx, aIdx)}
                                    className={`w-full text-xs flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors text-left ${
                                      a.is_correct
                                        ? "bg-teal-50 border border-teal-300 text-teal-700 font-semibold"
                                        : "border border-transparent hover:bg-gray-100 text-gray-600"
                                    }`}
                                    title="Apasă pentru a seta ca răspuns corect"
                                  >
                                    <span className={`w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] ${a.is_correct ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                                      {a.is_correct ? "✓" : String.fromCharCode(65 + aIdx)}
                                    </span>
                                    {a.answer_text}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <button onClick={() => removeQuestion(sIdx, qIdx)} className="text-red-400 hover:text-red-600 p-0.5 flex-shrink-0">
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {phase === "preview" && (
          <div className="border-t px-5 py-4 flex gap-3 flex-shrink-0">
            <Button
              onClick={handleImport}
              disabled={selectedCount === 0}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white gap-2"
            >
              <CheckCircle size={16} />
              {selectedCount === 1
                ? "Creează 1 lecție quiz"
                : `Creează ${selectedCount} lecții quiz`}
            </Button>
            <Button variant="outline" onClick={handleClose}>Anulează</Button>
          </div>
        )}
      </div>
    </div>
  );
}
