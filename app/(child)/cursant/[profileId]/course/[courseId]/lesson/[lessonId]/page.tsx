"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoEmbed } from "@/components/lesson/video-embed";
import { PresentationViewer } from "@/components/lesson/presentation-viewer";
import { AcademiaGuide } from "@/components/common/academia-guide";
import { QuizPlayer } from "@/components/lesson/quiz-player";
import { LessonCompleteOverlay } from "@/components/lesson/lesson-complete-overlay";
import { createClient } from "@/lib/supabase/client";

interface LessonPageProps {
  params: Promise<{ profileId: string; courseId: string; lessonId: string }>;
}

export default function LessonPlayerPage({ params }: LessonPageProps) {
  const [lesson, setLesson] = useState<{
    id: string;
    title: string;
    description?: string;
    lesson_type: string;
    video_url?: string;
    presentation_url?: string;
    worksheet_url?: string;
    duration_minutes?: number;
    ai_generated: boolean;
    allow_download: boolean;
  } | null>(null);
  const [profileId, setProfileId] = useState("");
  const [courseId, setCourseId] = useState("");
  const [lessonId, setLessonId] = useState("");
  const [isCompleted, setIsCompleted] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<{
    id: string;
    title: string;
    questions: {
      id: string;
      question_text: string;
      order_index: number;
      answers: { id: string; answer_text: string; is_correct: boolean; feedback: string | null }[];
    }[];
  } | null>(null);
  const [quizAttempt, setQuizAttempt] = useState<{ score: number; total_questions: number } | null>(null);
  const router = useRouter();

  useEffect(() => {
    params.then(async (p) => {
      setProfileId(p.profileId);
      setCourseId(p.courseId);
      setLessonId(p.lessonId);

      const supabase = createClient();

      const { data: lessonData } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", p.lessonId)
        .single();

      if (!lessonData) {
        router.push(`/cursant/${p.profileId}/course/${p.courseId}`);
        return;
      }

      setLesson(lessonData);

      const { data: progress } = await supabase
        .from("progress")
        .select("status")
        .eq("child_profile_id", p.profileId)
        .eq("lesson_id", p.lessonId)
        .single();

      if (progress?.status === "completed") setIsCompleted(true);

      if (lessonData.lesson_type === "quiz") {
        const { data: quizData } = await supabase
          .from("quizzes")
          .select(`id, title, quiz_questions(id, question_text, order_index, quiz_answers(id, answer_text, is_correct, feedback))`)
          .eq("lesson_id", p.lessonId)
          .single();

        if (quizData) {
          const sortedQuestions = ((quizData.quiz_questions as {
            id: string; question_text: string; order_index: number;
            quiz_answers: { id: string; answer_text: string; is_correct: boolean; feedback: string | null }[];
          }[]) ?? [])
            .sort((a, b) => a.order_index - b.order_index)
            .map((q) => ({ ...q, answers: q.quiz_answers ?? [] }));
          setQuiz({ id: quizData.id, title: quizData.title, questions: sortedQuestions });

          const { data: attempt } = await supabase
            .from("quiz_attempts")
            .select("score, total_questions")
            .eq("child_profile_id", p.profileId)
            .eq("quiz_id", quizData.id)
            .order("completed_at", { ascending: false })
            .limit(1)
            .single();
          if (attempt) setQuizAttempt(attempt);
        }
      }

      setLoading(false);
    });
  }, [params, router]);

  const handleComplete = () => {
    setIsCompleted(true);
    setShowOverlay(true);
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("progress").upsert({
        child_profile_id: profileId,
        course_id: courseId,
        lesson_id: lessonId,
        status: "completed",
        completed_at: new Date().toISOString(),
      }, { onConflict: "child_profile_id,lesson_id" });
    });
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-8 text-center">
        <div className="text-4xl animate-bounce mb-4">🐱</div>
        <p className="text-gray-500">Se încarcă lecția...</p>
      </div>
    );
  }

  if (!lesson) return null;

  return (
    <div className="max-w-3xl mx-auto">
      {showOverlay && lesson && (
        <LessonCompleteOverlay
          lessonTitle={lesson.title}
          xp={10}
          onDone={() => {
            setShowOverlay(false);
            router.push(`/cursant/${profileId}/course/${courseId}`);
          }}
        />
      )}

      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
          <a href={`/cursant/${profileId}/course/${courseId}`}>
            <ArrowLeft size={16} />
            Înapoi la curs
          </a>
        </Button>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold mb-2">{lesson.title}</h1>
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
              <div className="bg-white rounded-2xl p-5 sm:p-6 text-center border mb-6">
                <CheckCircle size={48} className="text-teal-500 mx-auto mb-3" />
                <p className="font-bold text-teal-700 text-lg mb-1">Lecție completată! 🎉</p>
                {quizAttempt && (
                  <p className="text-gray-500 text-sm mb-4">
                    Scor quiz:{" "}
                    <span className="font-bold text-teal-600">
                      {quizAttempt.score}/{quizAttempt.total_questions}
                    </span>
                  </p>
                )}
                <Button asChild variant="outline" className="gap-2">
                  <a href={`/cursant/${profileId}/course/${courseId}`}>
                    <ArrowRight size={16} />
                    Continuă cu lecția următoare
                  </a>
                </Button>
              </div>
            ) : (
              <QuizPlayer
                quiz={quiz}
                profileId={profileId}
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
          {/* Video */}
          {lesson.video_url && (
            <div className="mb-6">
              <VideoEmbed videoUrl={lesson.video_url} title={lesson.title} />
            </div>
          )}

          {/* Prezentare */}
          {lesson.presentation_url && (
            <div className="mb-6">
              <PresentationViewer
                presentationUrl={lesson.presentation_url}
                title={lesson.title}
                worksheetUrl={lesson.worksheet_url}
                allowDownload={lesson.allow_download}
              />
            </div>
          )}

          {/* Worksheet only */}
          {lesson.worksheet_url && !lesson.presentation_url && (
            <div className="mb-6 p-4 bg-teal-50 border border-teal-200 rounded-xl">
              <p className="font-medium mb-2">📝 Material de lucru</p>
              <Button asChild variant="outline" className="gap-2">
                <a href={lesson.worksheet_url} download target="_blank" rel="noopener noreferrer">
                  Descarcă fișa de lucru
                </a>
              </Button>
            </div>
          )}

          <AcademiaGuide
            variant="discovery"
            message="Ce ai descoperit în această lecție? Gândește-te la cel mai interesant lucru pe care l-ai aflat azi!"
            className="mb-6"
          />

          {/* Buton completare */}
          <div className="bg-white rounded-2xl p-4 sm:p-6 text-center border">
            {isCompleted ? (
              <div className="flex flex-col items-center gap-3">
                <CheckCircle size={48} className="text-teal-500" />
                <p className="font-semibold text-teal-700">Lecție completată!</p>
                <Button asChild variant="outline" className="gap-2">
                  <a href={`/cursant/${profileId}/course/${courseId}`}>
                    <ArrowRight size={16} />
                    Continuă cu lecția următoare
                  </a>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="text-gray-600 mb-2">Ai terminat lecția?</p>
                <Button
                  onClick={handleComplete}
                  disabled={isPending}
                  size="lg"
                  className="bg-teal-500 hover:bg-teal-600 text-white gap-2"
                >
                  <CheckCircle size={20} />
                  {isPending ? "Se salvează..." : "Am terminat lecția! 🎉"}
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
