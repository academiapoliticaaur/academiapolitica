"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoEmbed } from "@/components/lesson/video-embed";
import { PresentationViewer } from "@/components/lesson/presentation-viewer";
import { AcademiaGuide } from "@/components/common/academia-guide";
import { QuizPlayer } from "@/components/lesson/quiz-player";
import { LessonCompleteOverlay } from "@/components/lesson/lesson-complete-overlay";

interface QuizData {
  id: string;
  title: string;
  questions: {
    id: string;
    question_text: string;
    order_index: number;
    answers: { id: string; answer_text: string; is_correct: boolean; feedback: string | null }[];
  }[];
}

interface LessonData {
  id: string;
  title: string;
  description: string | null;
  lesson_type: string;
  video_url: string | null;
  presentation_url: string | null;
  worksheet_url: string | null;
  allow_download: boolean;
  ai_generated: boolean;
}

interface Props {
  lesson: LessonData;
  quiz: QuizData | null;
  backUrl: string;
  classCode: string;
  studentCode: string;
  courseId: string;
  isCompleted: boolean;
}

export function ClassStudentLessonPlayer({
  lesson,
  quiz,
  backUrl,
  classCode,
  studentCode,
  courseId,
  isCompleted: initialCompleted,
}: Props) {
  const router = useRouter();
  const [isCompleted, setIsCompleted] = useState(initialCompleted);
  const [showOverlay, setShowOverlay] = useState(false);
  const [saving, setSaving] = useState(false);
  const [completionData, setCompletionData] = useState<{
    moduleBonus?: boolean;
    courseComplete?: boolean;
    certificateId?: string;
  } | null>(null);

  const handleComplete = async () => {
    if (isCompleted || saving) return;
    setSaving(true);
    try {
      const res = await fetch("/api/grup/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classCode,
          studentCode,
          lessonId: lesson.id,
          courseId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setCompletionData(data);
      }
    } finally {
      setSaving(false);
      setIsCompleted(true);
      setShowOverlay(true);
    }
  };

  const handleOverlayDone = () => {
    setShowOverlay(false);
    if (completionData?.courseComplete && completionData?.certificateId) {
      router.push(
        `/grup/${classCode}/${studentCode}/certificate/${completionData.certificateId}`
      );
    } else {
      router.push(backUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      {showOverlay && (
        <LessonCompleteOverlay
          lessonTitle={lesson.title}
          xp={10}
          onDone={handleOverlayDone}
        />
      )}

      <div className="max-w-3xl mx-auto">
        <div className="mt-2 mb-6">
          <Link
            href={backUrl}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft size={16} />
            Înapoi la curs
          </Link>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold mb-2 text-gray-900">{lesson.title}</h1>
        {lesson.description && (
          <p className="text-gray-600 mb-6">{lesson.description}</p>
        )}

        {lesson.ai_generated && (
          <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-700">
            ℹ️ Acest conținut a fost creat cu ajutorul AI și validat de echipa noastră.
          </div>
        )}

        {/* Quiz lesson */}
        {lesson.lesson_type === "quiz" ? (
          <>
            {quiz ? (
              isCompleted ? (
                <div className="bg-white rounded-2xl p-6 text-center border border-indigo-100 mb-6">
                  <CheckCircle size={48} className="text-teal-500 mx-auto mb-3" />
                  <p className="font-bold text-teal-700 text-lg mb-4">Lecție completată! 🎉</p>
                  <Button asChild variant="outline" className="gap-2">
                    <Link href={backUrl}>
                      <ArrowRight size={16} />
                      Continuă
                    </Link>
                  </Button>
                </div>
              ) : (
                <QuizPlayer
                  quiz={quiz}
                  profileId=""
                  skipSave={true}
                  onComplete={handleComplete}
                />
              )
            ) : (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-center text-yellow-700">
                Quiz-ul pentru această lecție nu este disponibil încă.
              </div>
            )}
          </>
        ) : (
          <>
            {lesson.video_url && (
              <div className="mb-6">
                <VideoEmbed videoUrl={lesson.video_url} title={lesson.title} />
              </div>
            )}

            {lesson.presentation_url && (
              <div className="mb-6">
                <PresentationViewer
                  presentationUrl={lesson.presentation_url}
                  title={lesson.title}
                  worksheetUrl={lesson.worksheet_url ?? undefined}
                  allowDownload={lesson.allow_download}
                />
              </div>
            )}

            <AcademiaGuide
              variant="discovery"
              message="Ce ai descoperit în această lecție? Gândește-te la cel mai interesant lucru pe care l-ai aflat azi!"
              className="mb-6"
            />

            <div className="bg-white rounded-2xl p-6 text-center border border-indigo-100">
              {isCompleted ? (
                <div className="flex flex-col items-center gap-3">
                  <CheckCircle size={48} className="text-teal-500" />
                  <p className="font-semibold text-teal-700">Lecție completată!</p>
                  <Button asChild variant="outline" className="gap-2">
                    <Link href={backUrl}>
                      <ArrowRight size={16} />
                      Continuă cu lecția următoare
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <p className="text-gray-600 mb-2">Ai terminat lecția?</p>
                  <Button
                    onClick={handleComplete}
                    disabled={saving}
                    size="lg"
                    className="bg-teal-500 hover:bg-teal-600 text-white gap-2"
                  >
                    <CheckCircle size={20} />
                    {saving ? "Se salvează..." : "Am terminat lecția! 🎉"}
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
