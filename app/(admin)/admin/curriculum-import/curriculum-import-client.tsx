"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, CheckCircle, ChevronDown, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ParsedAnswer {
  answer_text: string;
  is_correct: boolean;
  feedback: string;
}
interface QuizData {
  title: string;
  questions: Array<{ question_text: string; answers: ParsedAnswer[] }>;
}
interface ParsedLesson {
  title: string;
  description: string;
  main_message: string;
  content_type: string;
  has_lesson_quiz: boolean;
  quiz?: QuizData;
  duration_minutes: number | null;
}
interface ParsedModule {
  title: string;
  description: string;
  badge_name: string;
  learning_objectives: string[];
  has_module_quiz: boolean;
  final_module_quiz?: QuizData;
  lessons: ParsedLesson[];
}
interface ParsedCurriculum {
  course_title: string;
  course_description: string;
  age_group: string;
  audience: string;
  estimated_duration_hours: number;
  modules: ParsedModule[];
}

const AGE_GROUPS = [
  { value: "modul-1", label: "Modulul I" },
  { value: "modul-2", label: "Modulul II" },
  { value: "modul-3", label: "Modulul III" },
  { value: "modul-4", label: "Modulul IV" },
  { value: "adult", label: "General (adulți)" },
];

const AUDIENCE_OPTIONS = [
  { value: "member", label: "🎓 Cursanți / Membri AUR", desc: "Apare la Cursuri" },
  { value: "formator", label: "🌈 Formatori", desc: "Apare la Resurse Formatori" },
  { value: "lector", label: "🚀 Lectori", desc: "Apare la Resurse Formatori" },
];

export function CurriculumImportClient() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [curriculum, setCurriculum] = useState<ParsedCurriculum | null>(null);
  const [selectedAgeGroup, setSelectedAgeGroup] = useState("modul-1");
  const [selectedAudience, setSelectedAudience] = useState("member");
  const [isDemo, setIsDemo] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importSuccess, setImportSuccess] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Set<number>>(new Set([0]));
  const [parseWarning, setParseWarning] = useState<string | null>(null);
  const [quizzesDetected, setQuizzesDetected] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleParse() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setIsRateLimited(false);
    setCurriculum(null);
    setImportSuccess(false);
    setIsDuplicate(false);
    setQuizzesDetected(0);

    const fd = new FormData();
    fd.append("file", file);

    const res = await fetch("/api/admin/parse-curriculum", { method: "POST", body: fd });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setIsRateLimited(data.rateLimited === true);
      setError(data.error ?? "Eroare necunoscută");
      return;
    }

    setParseWarning(data.warning ?? null);
    setCurriculum(data.curriculum);
    setQuizzesDetected(data.quizzesDetected ?? 0);

    const detectedAudience = data.curriculum.audience ?? "member";
    setSelectedAudience(["member", "formator", "lector", "children"].includes(detectedAudience) ? (detectedAudience === "children" ? "member" : detectedAudience) : "member");

    const rawAge: string = data.curriculum.age_group ?? "";
    const normalizedAge = ["modul-1", "modul-2", "modul-3", "modul-4"].includes(rawAge) ? rawAge : "modul-1";
    setSelectedAgeGroup(normalizedAge);
  }

  async function handleImport() {
    if (!curriculum) return;
    setImporting(true);
    setError(null);
    setIsRateLimited(false);

    const res = await fetch("/api/admin/import-curriculum", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        curriculum: {
          ...curriculum,
          age_group: selectedAgeGroup,
          audience: selectedAudience,
        },
        is_demo: isDemo,
      }),
    });
    const data = await res.json();
    setImporting(false);

    if (!res.ok) {
      setIsDuplicate(data.duplicate === true);
      setError(data.error ?? "Eroare la import");
      return;
    }
    setIsDuplicate(false);
    setImportSuccess(true);
  }

  function toggleModule(idx: number) {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

  // Numără quiz-urile cu întrebări detectate
  const totalLessonQuizzes = curriculum?.modules.reduce(
    (sum, m) => sum + m.lessons.filter((l) => l.has_lesson_quiz).length, 0
  ) ?? 0;
  const totalModuleQuizzes = curriculum?.modules.filter((m) => m.has_module_quiz).length ?? 0;

  return (
    <div className="max-w-3xl">

      {/* Upload */}
      <div className="bg-white rounded-xl border p-6 mb-4">
        <div
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <Upload className="mx-auto mb-3 text-gray-400" size={32} />
          {file ? (
            <p className="font-medium text-blue-700">{file.name}</p>
          ) : (
            <>
              <p className="font-medium text-gray-700">Click pentru a selecta fișierul</p>
              <p className="text-sm text-gray-400 mt-1">DOCX sau PDF, max 4MB</p>
            </>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".docx,.pdf"
            className="hidden"
            onChange={(e) => {
              setFile(e.target.files?.[0] ?? null);
              setCurriculum(null);
              setImportSuccess(false);
              setError(null);
              setIsRateLimited(false);
              setQuizzesDetected(0);
            }}
          />
        </div>

        <Button
          onClick={handleParse}
          disabled={!file || loading}
          className="w-full mt-4 bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2"
        >
          {loading ? <><Loader2 size={16} className="animate-spin" />Se analizează...</> : "Analizează cu AI →"}
        </Button>
      </div>

      {/* Erori */}
      {error && (
        <div className={`mb-4 p-4 rounded-xl text-sm border ${
          isRateLimited
            ? "bg-orange-50 border-orange-200 text-orange-800"
            : isDuplicate
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-red-50 border-red-200 text-red-600"
        }`}>
          {isRateLimited && (
            <div className="flex items-start gap-2">
              <Clock size={16} className="shrink-0 mt-0.5 text-orange-500" />
              <div>
                <p className="font-semibold mb-1">Limită API atinsă</p>
                <p>{error}</p>
                <p className="mt-2 text-xs">
                  Soluții: <strong>1)</strong> Așteaptă resetarea zilnică (ora 00:00 UTC) •{" "}
                  <strong>2)</strong> Upgradeazā planul Groq la{" "}
                  <a href="https://console.groq.com/settings/billing" target="_blank" rel="noopener noreferrer" className="underline">
                    console.groq.com
                  </a>
                </p>
              </div>
            </div>
          )}
          {isDuplicate && (
            <>
              <p className="font-semibold mb-1">Curs duplicat detectat</p>
              <p>{error}</p>
            </>
          )}
          {!isRateLimited && !isDuplicate && error}
        </div>
      )}

      {parseWarning && !error && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          ⚠️ {parseWarning}
        </div>
      )}

      {importSuccess && (
        <div className="mb-4 p-4 bg-teal-50 border border-teal-200 rounded-xl flex items-center gap-3">
          <CheckCircle className="text-teal-500 shrink-0" size={20} />
          <div>
            <p className="font-semibold text-teal-800">Curriculum importat cu succes!</p>
            <p className="text-sm text-teal-600">
              Cursul a fost creat cu status Draft{isDemo ? " și marcat ca Demo public" : ""}. Verifică și publică din Admin → Cursuri.
            </p>
          </div>
        </div>
      )}

      {/* Preview */}
      {curriculum && !importSuccess && (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="bg-blue-50 border-b p-5">
            <h2 className="text-xl font-bold text-gray-900">{curriculum.course_title}</h2>
            <p className="text-sm text-gray-600 mt-1">{curriculum.course_description}</p>
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-gray-500">
              <span>⏱ {curriculum.estimated_duration_hours}h estimat</span>
              <span>📚 {curriculum.modules.length} module</span>
              <span>📝 {curriculum.modules.reduce((a, m) => a + m.lessons.length, 0)} lecții</span>
              {totalLessonQuizzes > 0 && (
                <span className="text-blue-600">
                  🎯 {totalLessonQuizzes} quiz-uri lecție
                  {quizzesDetected > 0 && ` (${quizzesDetected} cu întrebări)`}
                </span>
              )}
              {totalModuleQuizzes > 0 && (
                <span className="text-purple-600">🏆 {totalModuleQuizzes} quiz-uri modul</span>
              )}
            </div>
          </div>

          {/* Selector audiență */}
          <div className="p-5 border-b bg-indigo-50">
            <Label className="text-sm font-semibold text-indigo-800 mb-2 block">
              ✅ Confirmă audiența cursului:
            </Label>
            <p className="text-xs text-indigo-600 mb-3">
              AI-ul a detectat: <strong>{AUDIENCE_OPTIONS.find(a => a.value === (curriculum.audience ?? "member"))?.label ?? curriculum.audience}</strong>
            </p>
            <div className="grid gap-2">
              {AUDIENCE_OPTIONS.map((opt) => (
                <label key={opt.value} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedAudience === opt.value
                    ? "border-indigo-400 bg-indigo-50"
                    : "border-gray-200 bg-white hover:border-gray-300"
                }`}>
                  <input
                    type="radio"
                    name="audience"
                    value={opt.value}
                    checked={selectedAudience === opt.value}
                    onChange={() => setSelectedAudience(opt.value)}
                    className="accent-indigo-600"
                  />
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-gray-500">{opt.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Selector grupă vârstă */}
          <div className="p-5 border-b bg-amber-50">
            <Label htmlFor="age_group" className="text-sm font-semibold text-amber-800">
              Confirmă grupa de vârstă:
            </Label>
            <select
              id="age_group"
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="mt-2 w-full border border-amber-300 rounded-lg px-3 py-2 text-sm bg-white"
            >
              {AGE_GROUPS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
          </div>

          {/* Toggle Demo */}
          <div className="p-5 border-b bg-orange-50">
            <Label className="text-sm font-semibold text-orange-800 mb-2 block">
              🎁 Curs demonstrativ (acces public fără cont):
            </Label>
            <div className="flex gap-3 mt-2">
              {([false, true] as const).map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => setIsDemo(v)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    isDemo === v
                      ? v
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-gray-100 text-gray-700 border-gray-300"
                      : "border-gray-200 text-gray-500 hover:border-gray-300 bg-white"
                  }`}
                >
                  {v ? "🎁 Demo public" : "🔒 Necesită cont"}
                </button>
              ))}
            </div>
            {isDemo && (
              <p className="text-xs text-orange-600 mt-2">
                Lecțiile vor fi accesibile public la /demo/[slug]/lesson/[id] fără autentificare.
              </p>
            )}
          </div>

          {/* Module */}
          <div className="divide-y">
            {curriculum.modules.map((mod, mIdx) => (
              <div key={mIdx}>
                <button
                  onClick={() => toggleModule(mIdx)}
                  className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-gray-50 transition-colors"
                >
                  {expandedModules.has(mIdx) ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {mIdx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{mod.title}</p>
                    {mod.badge_name && <p className="text-xs text-gray-400">🏅 {mod.badge_name}</p>}
                  </div>
                  <span className="text-xs text-gray-400 shrink-0">{mod.lessons.length} lecții</span>
                </button>

                {expandedModules.has(mIdx) && (
                  <ul className="border-t divide-y bg-gray-50">
                    {mod.lessons.map((lesson, lIdx) => (
                      <li key={lIdx} className="px-8 py-3 flex items-start gap-3">
                        <span className="text-xs text-gray-300 mt-0.5 w-8 shrink-0">{mIdx + 1}.{lIdx + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{lesson.title}</p>
                          {lesson.main_message && (
                            <p className="text-xs text-gray-400 mt-0.5 italic">{lesson.main_message}</p>
                          )}
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <span className="text-xs bg-white border rounded px-1.5 py-0.5 text-gray-500">
                              {lesson.content_type}
                            </span>
                            {lesson.has_lesson_quiz && (
                              <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 rounded px-1.5 py-0.5">
                                + quiz{lesson.quiz?.questions?.length
                                  ? ` (${lesson.quiz.questions.length} întrebări)`
                                  : ""}
                              </span>
                            )}
                            {lesson.duration_minutes && (
                              <span className="text-xs text-gray-400">{lesson.duration_minutes} min</span>
                            )}
                          </div>
                        </div>
                      </li>
                    ))}
                    {mod.has_module_quiz && (
                      <li className="px-8 py-3 flex items-center gap-3">
                        <span className="text-xs text-gray-300 w-8 shrink-0">🎯</span>
                        <p className="text-sm font-medium text-purple-600">
                          Quiz final modul
                          {mod.final_module_quiz?.questions?.length
                            ? ` (${mod.final_module_quiz.questions.length} întrebări)`
                            : ""}
                        </p>
                      </li>
                    )}
                  </ul>
                )}
              </div>
            ))}
          </div>

          <div className="p-5 border-t bg-gray-50">
            <Button
              onClick={handleImport}
              disabled={importing}
              className="w-full bg-teal-100 hover:bg-teal-200 text-teal-700 gap-2"
            >
              {importing ? <><Loader2 size={16} className="animate-spin" />Se importă...</> : "✅ Importă în platformă"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
