"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface Answer {
  id: string;
  answer_text: string;
  is_correct: boolean;
  feedback: string | null;
}

interface Question {
  id: string;
  question_text: string;
  order_index: number;
  answers: Answer[];
}

interface Quiz {
  id: string;
  title: string;
  questions: Question[];
}

interface QuizPlayerProps {
  quiz: Quiz;
  profileId: string;
  onComplete: () => void;
  preview?: boolean;
  skipSave?: boolean;
}

const LETTERS = ["A", "B", "C", "D", "E"];

export function QuizPlayer({ quiz, profileId, onComplete, preview = false, skipSave = false }: QuizPlayerProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleRetry = () => {
    setCurrentIdx(0);
    setSelectedId(null);
    setAnswered(false);
    setCorrectCount(0);
    setFinished(false);
  };

  const questions = quiz.questions;
  const total = questions.length;
  const currentQuestion = questions[currentIdx];
  const isLast = currentIdx === total - 1;

  const handleSelect = (answer: Answer) => {
    if (answered) return;
    setSelectedId(answer.id);
    setAnswered(true);
    if (answer.is_correct) setCorrectCount((c) => c + 1);
  };

  const handleNext = async () => {
    if (!isLast) {
      setCurrentIdx((i) => i + 1);
      setSelectedId(null);
      setAnswered(false);
    } else {
      if (preview || skipSave) {
        setFinished(true);
      } else {
        setSaving(true);
        const supabase = createClient();
        await supabase.from("quiz_attempts").insert({
          child_profile_id: profileId,
          quiz_id: quiz.id,
          score: correctCount,
          total_questions: total,
        });
        setSaving(false);
        setFinished(true);
      }
    }
  };

  if (finished) {
    const pct = total > 0 ? Math.round((correctCount / total) * 100) : 0;
    const passed = pct >= 80;
    return (
      <div className={`border-2 rounded-2xl p-6 sm:p-8 mb-6 text-center ${passed ? "bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200" : "bg-gradient-to-r from-red-50 to-orange-50 border-red-200"}`}>
        <div className="text-5xl mb-3">
          {pct === 100 ? "🏆" : passed ? "🎉" : "💪"}
        </div>
        <h3 className="font-extrabold text-2xl mb-2">
          {pct === 100 ? "Perfect!" : passed ? "Bravo! Ai promovat!" : "Mai încearcă o dată!"}
        </h3>
        <p className="text-2xl font-black text-teal-700 mb-1">
          {correctCount} / {total}
        </p>
        <p className="text-lg font-bold mb-2" style={{ color: passed ? "#0d9488" : "#dc2626" }}>
          {pct}%
        </p>
        <p className="text-gray-500 text-sm mb-2">
          {pct === 100
            ? "Ai răspuns corect la toate întrebările! Ești fantastic!"
            : passed
            ? "Ai trecut testul! Continuă la lecția următoare."
            : "Ai nevoie de cel puțin 80% pentru a trece la lecția următoare."}
        </p>
        {!passed && !preview && (
          <p className="text-sm font-semibold text-red-500 mb-4">
            Ai obținut {pct}% — mai ai nevoie de {80 - pct}% în plus pentru a promova.
          </p>
        )}
        {preview ? (
          <p className="text-sm text-gray-400 italic">Mod previzualizare — progresul nu se salvează</p>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {passed && (
              <Button
                onClick={onComplete}
                className="bg-teal-500 hover:bg-teal-600 text-white gap-2"
                size="lg"
              >
                <CheckCircle size={18} />
                Finalizează lecția 🎉
              </Button>
            )}
            <Button
              onClick={handleRetry}
              variant={passed ? "outline" : "default"}
              size="lg"
              className={passed ? "gap-2" : "bg-blue-500 hover:bg-blue-600 text-white gap-2"}
            >
              🔄 Încearcă din nou
            </Button>
          </div>
        )}
      </div>
    );
  }

  if (!currentQuestion) return null;

  const selectedAnswer = currentQuestion.answers.find((a) => a.id === selectedId);
  const correctAnswer = currentQuestion.answers.find((a) => a.is_correct);

  return (
    <div className="mb-6">
      {/* Progress */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-gray-500 font-medium">
          Întrebarea {currentIdx + 1} din {total}
        </span>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`h-2 rounded-full transition-all ${
                i < currentIdx
                  ? "bg-teal-400 w-5"
                  : i === currentIdx
                  ? "bg-blue-400 w-6"
                  : "bg-gray-200 w-4"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question card */}
      <div className="bg-white rounded-2xl border-2 border-blue-100 p-5 sm:p-6 mb-4 shadow-sm">
        <div className="flex items-start gap-3 mb-6">
          <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
            {currentIdx + 1}
          </span>
          <p className="font-semibold text-gray-800 text-lg leading-snug">
            {currentQuestion.question_text}
          </p>
        </div>

        {/* Answers */}
        <div className="space-y-2.5">
          {currentQuestion.answers.map((answer, i) => {
            let btnClass =
              "w-full text-left px-4 py-3 rounded-xl border-2 flex items-center gap-3 transition-all font-medium text-sm ";

            if (!answered) {
              btnClass +=
                "border-gray-200 hover:border-blue-300 hover:bg-blue-50 cursor-pointer";
            } else if (answer.is_correct) {
              btnClass += "border-teal-500 bg-teal-50 text-teal-800";
            } else if (answer.id === selectedId) {
              btnClass += "border-red-400 bg-red-50 text-red-800";
            } else {
              btnClass += "border-gray-100 text-gray-400 opacity-60";
            }

            const badgeClass = `w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              !answered
                ? "bg-gray-100 text-gray-600"
                : answer.is_correct
                ? "bg-teal-500 text-white"
                : answer.id === selectedId
                ? "bg-red-400 text-white"
                : "bg-gray-100 text-gray-400"
            }`;

            return (
              <button
                key={answer.id}
                className={btnClass}
                onClick={() => handleSelect(answer)}
                disabled={answered}
              >
                <span className={badgeClass}>
                  {answered && answer.is_correct
                    ? "✓"
                    : answered && answer.id === selectedId && !answer.is_correct
                    ? "✗"
                    : LETTERS[i]}
                </span>
                <span>{answer.answer_text}</span>
              </button>
            );
          })}
        </div>

        {/* Feedback */}
        {answered && (
          <div
            className={`mt-5 p-4 rounded-xl ${
              selectedAnswer?.is_correct
                ? "bg-teal-50 border border-teal-200"
                : "bg-orange-50 border border-orange-200"
            }`}
          >
            <p
              className={`font-bold text-sm mb-1 ${
                selectedAnswer?.is_correct ? "text-teal-700" : "text-orange-700"
              }`}
            >
              {selectedAnswer?.is_correct ? "✓ Corect!" : "✗ Răspuns incorect"}
            </p>
            {selectedAnswer?.feedback ? (
              <p className="text-sm text-gray-600">{selectedAnswer.feedback}</p>
            ) : !selectedAnswer?.is_correct && correctAnswer?.feedback ? (
              <p className="text-sm text-gray-600">{correctAnswer.feedback}</p>
            ) : !selectedAnswer?.is_correct ? (
              <p className="text-sm text-gray-600">
                Răspunsul corect este:{" "}
                <strong>{correctAnswer?.answer_text}</strong>
              </p>
            ) : null}
          </div>
        )}
      </div>

      {/* Next button */}
      {answered && (
        <div className="text-center">
          <Button
            onClick={handleNext}
            disabled={saving}
            className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2"
            size="lg"
          >
            {saving
              ? "Se salvează..."
              : isLast
              ? "🏆 Vezi rezultatul"
              : "Întrebarea următoare →"}
          </Button>
        </div>
      )}
    </div>
  );
}
