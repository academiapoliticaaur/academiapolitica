import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle, Circle, PlayCircle, FileText, ClipboardList } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { ProgressBar } from "@/components/common/progress-bar";
import { AmiMotiGuide } from "@/components/common/ami-moti-guide";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Curs — Ami & Moti" };

const lessonTypeIcon: Record<string, React.ReactNode> = {
  video: <PlayCircle size={16} className="text-red-400" />,
  presentation: <FileText size={16} className="text-indigo-400" />,
  worksheet: <ClipboardList size={16} className="text-teal-400" />,
  quiz: <span className="text-sm">🎯</span>,
  mixed: <span className="text-sm">📚</span>,
};

export default async function StudentCoursePage({
  params,
}: {
  params: Promise<{ code: string; studentCode: string; courseSlug: string }>;
}) {
  const { code, studentCode, courseSlug } = await params;
  const db = createAdminClient();

  // Validate class + student
  const { data: cls } = await db
    .from("classes")
    .select("id, name")
    .eq("access_code", code.toUpperCase())
    .eq("status", "active")
    .single();

  if (!cls) notFound();

  const { data: student } = await db
    .from("class_students")
    .select("id, display_name")
    .eq("class_id", cls.id)
    .eq("student_code", studentCode.toUpperCase())
    .single();

  if (!student) notFound();

  // Fetch course
  const { data: course } = await db
    .from("courses")
    .select("id, title, description")
    .eq("slug", courseSlug)
    .single();

  if (!course) notFound();

  // Validate course assigned to this class
  const { data: assigned } = await db
    .from("class_courses")
    .select("course_id")
    .eq("class_id", cls.id)
    .eq("course_id", course.id)
    .single();

  if (!assigned) notFound();

  // Fetch modules + lessons
  const { data: modules } = await db
    .from("modules")
    .select("id, title, description, order_index")
    .eq("course_id", course.id)
    .order("order_index");

  const moduleIds = (modules ?? []).map((m) => m.id);
  type LessonRow = { id: string; title: string; lesson_type: string; order_index: number; module_id: string };
  let allLessons: LessonRow[] = [];

  if (moduleIds.length > 0) {
    const { data: lessons } = await db
      .from("lessons")
      .select("id, module_id, title, lesson_type, order_index")
      .in("module_id", moduleIds)
      .eq("status", "published")
      .order("order_index");
    allLessons = (lessons ?? []) as LessonRow[];
  }

  // Fetch student progress for this course
  const allLessonIds = allLessons.map((l) => l.id);
  let completedIds = new Set<string>();

  if (allLessonIds.length > 0) {
    const { data: progRows } = await db
      .from("class_student_progress")
      .select("lesson_id")
      .eq("student_id", student.id)
      .in("lesson_id", allLessonIds)
      .eq("status", "completed");
    completedIds = new Set((progRows ?? []).map((p) => p.lesson_id));
  }

  // Calculate XP + completion
  const completedCount = completedIds.size;
  const isCourseComplete = allLessons.length > 0 && completedCount === allLessons.length;

  const moduleStats = (modules ?? []).map((mod) => {
    const lessons = allLessons.filter((l) => l.module_id === mod.id);
    const isModuleComplete = lessons.length > 0 && lessons.every((l) => completedIds.has(l.id));
    return { ...mod, lessons, isModuleComplete };
  });

  const completedModulesCount = moduleStats.filter((m) => m.isModuleComplete).length;
  const earnedPoints =
    completedCount * 10 + completedModulesCount * 50 + (isCourseComplete ? 100 : 0);
  const totalPossiblePoints =
    allLessons.length * 10 + (moduleStats.length * 50) + 100;

  // Fetch certificate if course is complete
  let certificateId: string | undefined;
  if (isCourseComplete) {
    const { data: cert } = await db
      .from("class_student_certificates")
      .select("id")
      .eq("student_id", student.id)
      .eq("course_id", course.id)
      .single();
    certificateId = cert?.id;
  }

  const baseUrl = `/clasa/${code.toUpperCase()}/${studentCode.toUpperCase()}/course/${courseSlug}`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mt-2 mb-6">
          <Link
            href={`/clasa/${code.toUpperCase()}/${studentCode.toUpperCase()}`}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft size={16} />
            Înapoi la cursurile mele
          </Link>
        </div>

        <div className="mb-4">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{course.title}</h1>
          {course.description && (
            <p className="text-gray-500 text-sm">{course.description}</p>
          )}
        </div>

        {/* XP banner */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
          <div className="text-sm text-yellow-800">
            <span className="font-bold">⭐ {earnedPoints} XP</span>
            <span className="text-yellow-600"> câștigați din </span>
            <span className="font-semibold">{totalPossiblePoints} XP posibili</span>
          </div>
          <div className="text-xs text-yellow-700 hidden sm:block">
            10 XP/lecție · +50 XP modul · +100 XP curs
          </div>
        </div>

        {allLessons.length > 0 && (
          <ProgressBar
            value={completedCount}
            max={allLessons.length}
            label={`${completedCount} din ${allLessons.length} lecții completate`}
            className="mb-4"
            color="green"
          />
        )}

        {/* Course complete banner */}
        {isCourseComplete && (
          <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-xl p-5 mb-4 text-center">
            <div className="text-4xl mb-2">🏆</div>
            <h3 className="font-extrabold text-xl mb-1">Felicitări! Curs finalizat!</h3>
            <p className="font-semibold opacity-90 mb-3">+100 XP bonus pentru finalizarea cursului!</p>
            {certificateId && (
              <Link
                href={`/clasa/${code.toUpperCase()}/${studentCode.toUpperCase()}/certificate/${certificateId}`}
                className="inline-flex items-center gap-2 bg-white text-yellow-700 font-bold px-5 py-2 rounded-full hover:bg-yellow-50 transition-colors shadow"
              >
                🎓 Vezi diploma ta de absolvire
              </Link>
            )}
          </div>
        )}

        {!isCourseComplete && (
          <AmiMotiGuide
            variant="mission"
            message="Misiunea ta: parcurge toate lecțiile acestui curs. Progresul se salvează automat!"
            className="mb-4"
          />
        )}

        {/* Modules + lessons */}
        <div className="space-y-4">
          {moduleStats.map((module, modIdx) => (
            <div key={module.id} className="bg-white rounded-2xl border border-indigo-100 overflow-hidden">
              <div className={`px-5 py-4 border-b ${module.isModuleComplete ? "bg-teal-50 border-teal-100" : "bg-indigo-50 border-indigo-100"}`}>
                <div className="flex items-center justify-between gap-2">
                  <h2 className="font-semibold flex items-center gap-2">
                    <span className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center ${module.isModuleComplete ? "bg-teal-500 text-white" : "bg-indigo-200 text-indigo-700"}`}>
                      {module.isModuleComplete ? "✓" : modIdx + 1}
                    </span>
                    {module.title}
                  </h2>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${module.isModuleComplete ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-500"}`}>
                    {module.isModuleComplete ? "✓ +50 XP" : "+50 XP bonus"}
                  </span>
                </div>
                {module.description && (
                  <p className="text-sm text-gray-500 mt-1 ml-9">{module.description}</p>
                )}
              </div>

              {module.lessons.length > 0 ? (
                <ul className="divide-y divide-indigo-50">
                  {module.lessons.map((lesson, lIdx) => {
                    const done = completedIds.has(lesson.id);
                    return (
                      <li key={lesson.id}>
                        <Link
                          href={`${baseUrl}/lesson/${lesson.id}`}
                          className={`flex items-center gap-3 px-5 py-3.5 hover:bg-indigo-50 transition-colors group ${done ? "bg-teal-50/40" : ""}`}
                        >
                          <span className="text-gray-300 text-sm w-8 flex-shrink-0">
                            {modIdx + 1}.{lIdx + 1}
                          </span>
                          <span className="flex-shrink-0">
                            {lessonTypeIcon[lesson.lesson_type] || <Circle size={16} />}
                          </span>
                          <span className={`flex-1 text-sm font-medium ${done ? "text-teal-600" : "text-gray-700 group-hover:text-indigo-700"}`}>
                            {lesson.title}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${done ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-400"}`}>
                            {done ? "✓" : ""} 10 XP
                          </span>
                          {done ? (
                            <CheckCircle size={18} className="text-teal-500 flex-shrink-0" />
                          ) : (
                            <Circle size={18} className="text-gray-200 flex-shrink-0" />
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="px-5 py-4 text-sm text-gray-400">Lecțiile sunt în pregătire.</p>
              )}
            </div>
          ))}
        </div>

        {/* Course bonus row */}
        <div className={`mt-4 rounded-xl border px-5 py-3 flex items-center justify-between ${isCourseComplete ? "bg-yellow-50 border-yellow-300" : "bg-gray-50 border-gray-200"}`}>
          <span className={`text-sm font-semibold ${isCourseComplete ? "text-yellow-700" : "text-gray-500"}`}>
            {isCourseComplete ? "🏆 Bonus finalizare curs" : "🏆 Bonus la finalizarea cursului"}
          </span>
          <span className={`text-sm font-bold ${isCourseComplete ? "text-yellow-600" : "text-gray-400"}`}>
            {isCourseComplete ? "✓ " : ""}+100 XP
          </span>
        </div>
      </div>
    </div>
  );
}
