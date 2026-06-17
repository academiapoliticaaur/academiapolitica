"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Trash2, ClipboardPaste } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ParsedAnswer {
  answer_text: string;
  is_correct: boolean;
  feedback: string;
}
interface ParsedQuestion {
  question_text: string;
  answers: ParsedAnswer[];
}

interface QuizPdfImportProps {
  quizId: string;
  startingIndex: number;
  onImported: () => void;
}

export function QuizPdfImport({ quizId, startingIndex, onImported }: QuizPdfImportProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ParsedQuestion[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pasteMode, setPasteMode] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const sendToApi = async (formData: FormData) => {
    setLoading(true);
    setError(null);
    setQuestions(null);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/parse-quiz", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Eroare server");
      if (!data.questions?.length) throw new Error("Nu s-au găsit întrebări tip grilă. Verifică că fișierul conține întrebări cu variante de răspuns (a, b, c).");
      setQuestions(data.questions);
      setSelected(new Set(data.questions.map((_: ParsedQuestion, i: number) => i)));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare necunoscută");
    } finally {
      setLoading(false);
    }
  };

  const handleFile = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    await sendToApi(formData);
  };

  const handlePaste = async () => {
    if (!pastedText.trim()) return;
    const formData = new FormData();
    formData.append("text", pastedText);
    await sendToApi(formData);
  };

  const toggleSelect = (idx: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const removeQuestion = (idx: number) => {
    setQuestions((prev) => prev ? prev.filter((_, i) => i !== idx) : prev);
    setSelected((prev) => {
      const next = new Set<number>();
      prev.forEach((i) => { if (i !== idx) next.add(i > idx ? i - 1 : i); });
      return next;
    });
  };

  const handleSave = async () => {
    if (!questions) return;
    setSaving(true);
    setError(null);
    const supabase = createClient();
    const toSave = questions.filter((_, i) => selected.has(i));

    try {
      for (let qi = 0; qi < toSave.length; qi++) {
        const q = toSave[qi];
        const { data: qData, error: qErr } = await supabase
          .from("quiz_questions")
          .insert({ quiz_id: quizId, question_text: q.question_text, order_index: startingIndex + qi })
          .select("id")
          .single();
        if (qErr) throw new Error(`Întrebarea ${qi + 1}: ${qErr.message}`);

        for (const a of q.answers) {
          const { error: aErr } = await supabase.from("quiz_answers").insert({
            question_id: qData.id,
            answer_text: a.answer_text,
            is_correct: a.is_correct,
            feedback: a.feedback || "",
          });
          if (aErr) throw new Error(`Răspuns: ${aErr.message}`);
        }
      }
      setSaved(true);
      onImported();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Eroare la salvare");
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-blue-200 rounded-xl text-sm text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-colors"
      >
        <FileUp size={16} />
        Importă întrebări din PDF (AI)
        <ChevronDown size={14} />
      </button>
    );
  }

  return (
    <div className="border-2 border-blue-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileUp size={16} className="text-blue-600" />
          <span className="font-semibold text-sm text-blue-800">Import din PDF cu AI</span>
        </div>
        <button onClick={() => setOpen(false)} className="text-blue-400 hover:text-blue-600">
          <ChevronUp size={16} />
        </button>
      </div>

      <div className="p-4 bg-white space-y-4">
        {/* Upload zone */}
        {!questions && !loading && (
          <div className="space-y-3">
            {/* Tab selector */}
            <div className="flex rounded-lg border overflow-hidden">
              <button
                onClick={() => setPasteMode(false)}
                className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${!pasteMode ? "bg-blue-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                <FileUp size={14} />
                Fișier PDF / DOCX / TXT
              </button>
              <button
                onClick={() => setPasteMode(true)}
                className={`flex-1 py-2 text-sm font-medium flex items-center justify-center gap-1.5 transition-colors ${pasteMode ? "bg-blue-500 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
              >
                <ClipboardPaste size={14} />
                Lipește text
              </button>
            </div>

            {!pasteMode ? (
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
                onClick={() => fileRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleFile(file);
                }}
              >
                <FileUp size={28} className="text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-600">Trage fișierul aici sau apasă pentru a selecta</p>
                <p className="text-xs text-gray-400 mt-1">Formate acceptate: <strong>.pdf</strong>, <strong>.docx</strong>, <strong>.txt</strong></p>
                <p className="text-xs text-gray-400">Întrebările tip grilă vor fi extrase automat</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.docx,.txt,text/plain,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
              </div>
            ) : (
              <div className="space-y-2">
                <textarea
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Lipește aici textul cu întrebările (Ctrl+A din Word/PDF, apoi Ctrl+C și Ctrl+V)..."
                  rows={8}
                  className="w-full border rounded-xl p-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <Button
                  onClick={handlePaste}
                  disabled={!pastedText.trim()}
                  className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2"
                >
                  <ClipboardPaste size={16} />
                  Analizează cu Claude AI
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="text-center py-8">
            <Loader2 size={32} className="animate-spin text-blue-500 mx-auto mb-3" />
            <p className="text-sm text-gray-600 font-medium">Claude analizează PDF-ul...</p>
            <p className="text-xs text-gray-400 mt-1">Extrage întrebările și variantele de răspuns</p>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Eroare</p>
              <p>{error}</p>
              <button onClick={() => { setError(null); setQuestions(null); }} className="mt-2 text-red-500 underline text-xs">
                Încearcă din nou
              </button>
            </div>
          </div>
        )}

        {/* Success saved */}
        {saved && (
          <div className="flex items-center gap-2 p-3 bg-teal-50 border border-teal-200 rounded-xl text-sm text-teal-700">
            <CheckCircle size={16} />
            <span className="font-medium">Întrebările au fost salvate cu succes!</span>
          </div>
        )}

        {/* Preview questions */}
        {questions && !saved && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-700">
                {questions.length} întrebări extrase:
              </p>
              <div className="flex gap-2">
                <button onClick={() => setSelected(new Set(questions.map((_, i) => i)))} className="text-xs text-blue-500 hover:underline">
                  Toate
                </button>
                <button onClick={() => setSelected(new Set())} className="text-xs text-gray-400 hover:underline">
                  Niciunul
                </button>
              </div>
            </div>

            {/* Save button — always visible above the list */}
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={saving || selected.size === 0}
                className="flex-1 bg-teal-500 hover:bg-teal-600 text-white gap-2 text-sm font-semibold"
              >
                {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {saving ? "Se salvează..." : `✓ Salvează ${selected.size} întrebări în quiz`}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setQuestions(null); setSaved(false); setError(null); setPastedText(""); }}
                className="text-sm"
              >
                Alt fișier
              </Button>
            </div>

            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {questions.map((q, qi) => (
                <div
                  key={qi}
                  className={`rounded-xl border p-3 transition-colors ${
                    selected.has(qi) ? "border-blue-300 bg-blue-50" : "border-gray-200 bg-gray-50 opacity-60"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      checked={selected.has(qi)}
                      onChange={() => toggleSelect(qi)}
                      className="mt-1 accent-blue-500 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 mb-2">{qi + 1}. {q.question_text}</p>
                      <div className="space-y-1">
                        {q.answers.map((a, ai) => (
                          <button
                            key={ai}
                            type="button"
                            onClick={() => {
                              setQuestions((prev) => prev ? prev.map((pq, pqi) =>
                                pqi === qi
                                  ? { ...pq, answers: pq.answers.map((pa, pai) => ({ ...pa, is_correct: pai === ai })) }
                                  : pq
                              ) : prev);
                            }}
                            className={`w-full text-xs flex items-center gap-1.5 rounded-lg px-2 py-1 transition-colors text-left ${
                              a.is_correct
                                ? "text-teal-700 font-semibold bg-teal-50 border border-teal-300"
                                : "text-gray-600 hover:bg-gray-100 border border-transparent"
                            }`}
                            title="Apasă pentru a seta ca răspuns corect"
                          >
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] ${a.is_correct ? "bg-teal-500 text-white" : "bg-gray-200 text-gray-500"}`}>
                              {a.is_correct ? "✓" : String.fromCharCode(65 + ai)}
                            </span>
                            {a.answer_text}
                            {a.feedback && <span className="text-gray-400 italic"> — {a.feedback}</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button onClick={() => removeQuestion(qi)} className="text-red-400 hover:text-red-600 flex-shrink-0 p-0.5">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
