import { notFound } from "next/navigation";
import Link from "next/link";
import { CreditCard } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { ClassStudentLessonPlayer } from "./lesson-player";
import { isSubscriptionActive } from "@/lib/subscription";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Lecție — Academia Politica AUR" };

export default async function StudentLessonPage({
  params,
}: {
  params: Promise<{ code: string; studentCode: string; courseSlug: string; lessonId: string }>;
}) {
  const { code, studentCode, courseSlug, lessonId } = await params;
  const db = createAdminClient();

  // Validate class + get teacher_id for subscription check
  const { data: cls } = await db
    .from("classes")
    .select("id, teacher_id")
    .eq("access_code", code.toUpperCase())
    .eq("status", "active")
    .single();

  if (!cls) notFound();

  // Verifică subscripția profesorului — elevii moștenesc accesul cadrului didactic
  const { data: teacherProfile } = await db
    .from("parent_profiles")
    .select("subscription_expires_at")
    .eq("user_id", cls.teacher_id)
    .single();

  if (!isSubscriptionActive(teacherProfile?.subscription_expires_at)) {
    const backUrl = `/grup/${code.toUpperCase()}/${studentCode.toUpperCase()}/course/${courseSlug}`;
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-indigo-50 border border-indigo-200 rounded-2xl p-10 text-center">
          <CreditCard className="mx-auto mb-4 text-indigo-400" size={48} />
          <h2 className="text-xl font-bold text-indigo-800 mb-3">Abonament necesar</h2>
          <p className="text-indigo-700 mb-6">
            Profesorul tău nu are un abonament activ. Contactează cadrul didactic pentru a reactiva accesul.
          </p>
          <Link
            href={backUrl}
            className="inline-flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            ← Înapoi la curs
          </Link>
        </div>
      </div>
    );
  }

  // Validate student
  const { data: student } = await db
    .from("class_students")
    .select("id, display_name")
    .eq("class_id", cls.id)
    .eq("student_code", studentCode.toUpperCase())
    .single();

  if (!student) notFound();

  // Fetch course (validate it's assigned to this class)
  const { data: course } = await db
    .from("courses")
    .select("id")
    .eq("slug", courseSlug)
    .single();

  if (!course) notFound();

  const { data: assigned } = await db
    .from("class_courses")
    .select("course_id")
    .eq("class_id", cls.id)
    .eq("course_id", course.id)
    .single();

  if (!assigned) notFound();

  // Fetch lesson
  const { data: lesson } = await db
    .from("lessons")
    .select("id, title, description, lesson_type, video_url, presentation_url, worksheet_url, allow_download, ai_generated")
    .eq("id", lessonId)
    .single();

  if (!lesson) notFound();

  // Fetch quiz data if needed
  type QuizData = {
    id: string;
    title: string;
    questions: {
      id: string;
      question_text: string;
      order_index: number;
      answers: { id: string; answer_text: string; is_correct: boolean; feedback: string | null }[];
    }[];
  };
  let quiz: QuizData | null = null;

  if (lesson.lesson_type === "quiz") {
    const { data: quizData } = await db
      .from("quizzes")
      .select("id, title, quiz_questions(id, question_text, order_index, quiz_answers(id, answer_text, is_correct, feedback))")
      .eq("lesson_id", lessonId)
      .single();

    if (quizData?.quiz_questions) {
      const sorted = [...(quizData.quiz_questions as {
        id: string; question_text: string; order_index: number;
        quiz_answers: { id: string; answer_text: string; is_correct: boolean; feedback: string | null }[];
      }[])].sort((a, b) => a.order_index - b.order_index);

      quiz = {
        id: quizData.id,
        title: quizData.title,
        questions: sorted.map((q) => ({
          id: q.id,
          question_text: q.question_text,
          order_index: q.order_index,
          answers: q.quiz_answers ?? [],
        })),
      };
    }
  }

  // Check if already completed
  const { data: progress } = await db
    .from("class_student_progress")
    .select("status")
    .eq("student_id", student.id)
    .eq("lesson_id", lessonId)
    .single();

  const isCompleted = progress?.status === "completed";

  const backUrl = `/grup/${code.toUpperCase()}/${studentCode.toUpperCase()}/course/${courseSlug}`;

  return (
    <ClassStudentLessonPlayer
      lesson={{
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        lesson_type: lesson.lesson_type,
        video_url: lesson.video_url,
        presentation_url: lesson.presentation_url,
        worksheet_url: lesson.worksheet_url,
        allow_download: lesson.allow_download ?? false,
        ai_generated: lesson.ai_generated ?? false,
      }}
      quiz={quiz}
      backUrl={backUrl}
      classCode={code.toUpperCase()}
      studentCode={studentCode.toUpperCase()}
      courseId={course.id}
      isCompleted={isCompleted}
    />
  );
}
