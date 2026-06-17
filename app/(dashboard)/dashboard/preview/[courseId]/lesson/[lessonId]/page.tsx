"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoEmbed } from "@/components/lesson/video-embed";
import { PresentationViewer } from "@/components/lesson/presentation-viewer";
import { QuizPlayer } from "@/components/lesson/quiz-player";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

interface LessonData {
  id: string;
  title: string;
  description?: string;
  lesson_type: string;
  video_url?: string;
  presentation_url?: string;
  worksheet_url?: string;
  allow_download: boolean;
}

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

interface NavLesson {
  id: string;
  title: string;
}

export default function ParentLessonPreviewPage() {
  const { courseId, lessonId } = useParams<{ courseId: string; lessonId: string }>();
  const router = useRouter();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [courseSlug, setCourseSlug] = useState<string>("");
  const [allLessons, setAllLessons] = useState<NavLesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      const supabase = createClient();

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { data: lessonData } = await supabase
        .from("lessons")
        .select("*")
        .eq("id", lessonId)
        .single();

      if (!lessonData) { router.push("/dashboard"); return; }
      setLesson(lessonData);

      // Fetch course for slug + lesson ordering
      const { data: courseData } = await supabase
        .from("courses")
        .select("slug, modules(lessons(id, title, order_index, module_id))")
        .eq("id", courseId)
        .single();

      if (courseData) {
        setCourseSlug(courseData.slug || "");
        const lessons: NavLesson[] = (courseData.modules as { lessons: NavLesson[] }[] ?? [])
          .flatMap((m) => m.lessons ?? []);
        setAllLessons(lessons);
      }

      // Fetch quiz if quiz type
      if (lessonData.lesson_type === "quiz") {
        const { data: quizData } = await supabase
          .from("quizzes")
          .select(`id, title, quiz_questions(id, question_text, order_index, quiz_answers(id, answer_text, is_correct, feedback))`)
          .eq("lesson_id", lessonId)
          .single();

        if (quizData) {
          setQuiz({
            id: quizData.id,
            title: quizData.title,
            questions: ((quizData.quiz_questions as {
              id: string; question_text: string; order_index: number;
              quiz_answers: { id: string; answer_text: string; is_correct: boolean; feedback: string | null }[];
            }[]) ?? [])
              .sort((a, b) => a.order_index - b.order_index)
              .map((q) => ({ ...q, answers: q.quiz_answers ?? [] })),
          });
        }
      }

      setLoading(false);
    };
    run();
  }, [courseId, lessonId, router]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-12 text-center">
        <div className="text-4xl animate-bounce mb-4">📖</div>
        <p className="text-gray-500">Se încarcă lecția...</p>
      </div>
    );
  }

  if (!lesson) return null;

  const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Banner previzualizare */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 mb-5 flex items-center gap-2 text-sm text-blue-700">
        <span>👁️</span>
        <span><strong>Previzualizare pentru părinți</strong> — XP și progres nu se salvează</span>
      </div>

      {/* Navigare */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2">
          <Link href={courseSlug ? `/courses/${courseSlug}` : "/courses"}>
            <ArrowLeft size={16} />
            Înapoi la curs
          </Link>
        </Button>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold mb-2">{lesson.title}</h1>
      {lesson.description && (
        <p className="text-gray-600 mb-6">{lesson.description}</p>
      )}

      {/* Conținut lecție */}
      {lesson.lesson_type === "quiz" ? (
        quiz ? (
          <QuizPlayer quiz={quiz} profileId="" onComplete={() => {}} preview={true} />
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 text-center text-yellow-700">
            Quiz-ul pentru această lecție nu este disponibil încă.
          </div>
        )
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
                worksheetUrl={lesson.worksheet_url}
                allowDownload={lesson.allow_download}
              />
            </div>
          )}
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
        </>
      )}

      {/* Navigare lecții */}
      {(prevLesson || nextLesson) && (
        <div className="flex justify-between gap-3 mt-8 pt-6 border-t">
          {prevLesson ? (
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link href={`/dashboard/preview/${courseId}/lesson/${prevLesson.id}`}>
                <ArrowLeft size={14} />
                Lecția anterioară
              </Link>
            </Button>
          ) : <div />}
          {nextLesson && (
            <Button size="sm" asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
              <Link href={`/dashboard/preview/${courseId}/lesson/${nextLesson.id}`}>
                Lecția următoare
                <ArrowRight size={14} />
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
