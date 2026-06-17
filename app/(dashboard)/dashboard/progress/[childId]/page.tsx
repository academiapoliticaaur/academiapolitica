import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, CheckCircle, BookOpen, Trophy, TrendingUp } from "lucide-react";
import { AcademiaGuide } from "@/components/common/academia-guide";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Progres detaliat" };

interface PageProps {
  params: Promise<{ childId: string }>;
}

function ProgressBar({ value, max, color = "teal" }: { value: number; max: number; color?: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const colorClass = color === "teal" ? "bg-teal-500" : color === "yellow" ? "bg-yellow-400" : "bg-blue-500";
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default async function ChildProgressPage({ params }: PageProps) {
  const { childId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: child } = await supabase
    .from("child_profiles")
    .select("id, display_name, age_group")
    .eq("id", childId)
    .eq("parent_id", user.id)
    .single();

  if (!child) notFound();

  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, slug, modules(id, title, order_index, lessons(id, title, lesson_type, order_index))")
    .eq("status", "published")
    .eq("age_group", child.age_group)
    .order("order_index");

  const { data: progress } = await supabase
    .from("progress")
    .select("lesson_id, course_id, status, completed_at")
    .eq("child_profile_id", childId)
    .eq("status", "completed")
    .order("completed_at", { ascending: false });

  const { data: quizAttempts } = await supabase
    .from("quiz_attempts")
    .select("quiz_id, score, total_questions, completed_at")
    .eq("child_profile_id", childId)
    .order("completed_at", { ascending: false });

  const { data: certificates } = await supabase
    .from("certificates")
    .select("course_id, total_points, issued_at")
    .eq("child_profile_id", childId);

  const completedIds = new Set(progress?.map((p) => p.lesson_id) || []);

  type Lesson = { id: string; title: string; lesson_type: string; order_index: number };
  type Module = { id: string; title: string; order_index: number; lessons?: Lesson[] };
  type Course = { id: string; title: string; slug: string; modules?: Module[] };

  const allCourses = (courses as Course[]) || [];

  // Batch-fetch quiz→lesson mappings (evităm N+1)
  const quizIds = [...new Set((quizAttempts ?? []).map((qa) => qa.quiz_id))];
  const quizLessonMap: Record<string, string> = {};
  if (quizIds.length > 0) {
    const { data: quizRows } = await supabase
      .from("quizzes")
      .select("id, lesson_id")
      .in("id", quizIds);
    (quizRows ?? []).forEach((q) => { quizLessonMap[q.id] = q.lesson_id; });
  }

  // Păstrăm scorul cel mai bun per lecție
  const quizByLesson: Record<string, { score: number; total: number; at: string }> = {};
  for (const qa of quizAttempts ?? []) {
    const lessonId = quizLessonMap[qa.quiz_id];
    if (!lessonId) continue;
    const pct = qa.total_questions > 0 ? qa.score / qa.total_questions : 0;
    const existing = quizByLesson[lessonId];
    if (!existing || pct > existing.score / existing.total) {
      quizByLesson[lessonId] = { score: qa.score, total: qa.total_questions, at: qa.completed_at };
    }
  }

  const totalCompleted = completedIds.size;
  const totalLessons = allCourses.reduce((acc, c) =>
    acc + (c.modules?.flatMap((m) => m.lessons || []).length || 0), 0);
  const overallPct = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  // Activitate din ultimele 7 zile
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 6);
  weekAgo.setHours(0, 0, 0, 0);

  const weekDays: { label: string; date: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const count = (progress ?? []).filter((p) => p.completed_at?.slice(0, 10) === dateStr).length;
    weekDays.push({
      label: d.toLocaleDateString("ro-RO", { weekday: "short" }),
      date: dateStr,
      count,
    });
  }
  const maxDayCount = Math.max(...weekDays.map((d) => d.count), 1);
  const totalThisWeek = weekDays.reduce((s, d) => s + d.count, 0);

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-blue-500 flex items-center gap-1">
          <ArrowLeft size={14} />
          Înapoi la dashboard
        </Link>
        <h1 className="text-2xl font-bold mt-3">Progresul lui {child.display_name}</h1>
        <p className="text-gray-500 text-sm mt-1">Toate lecțiile parcurse și scorurile la quiz</p>
      </div>

      {/* Sumar */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="bg-white rounded-xl border p-4 text-center">
          <CheckCircle size={20} className="text-teal-500 mx-auto mb-1" />
          <p className="text-2xl font-black text-teal-700">{totalCompleted}</p>
          <p className="text-xs text-gray-500">Lecții completate</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <BookOpen size={20} className="text-blue-500 mx-auto mb-1" />
          <p className="text-2xl font-black text-blue-700">{totalLessons}</p>
          <p className="text-xs text-gray-500">Total lecții</p>
        </div>
        <div className="bg-white rounded-xl border p-4 text-center">
          <Trophy size={20} className="text-yellow-500 mx-auto mb-1" />
          <p className="text-2xl font-black text-yellow-700">{certificates?.length || 0}</p>
          <p className="text-xs text-gray-500">Cursuri finalizate</p>
        </div>
      </div>

      {/* Progres general */}
      {totalLessons > 0 && (
        <div className="bg-white rounded-xl border p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-gray-700">Progres general</span>
            <span className="text-sm font-bold text-teal-700">{overallPct}%</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-teal-400 to-teal-600 transition-all"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">{totalCompleted} din {totalLessons} lecții completate</p>
        </div>
      )}

      {/* Activitate săptămânală */}
      <div className="bg-white rounded-xl border p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-blue-500" />
            <span className="text-sm font-semibold text-gray-700">Activitate (ultimele 7 zile)</span>
          </div>
          {totalThisWeek > 0 && (
            <span className="text-xs text-teal-600 font-semibold bg-teal-50 px-2 py-1 rounded-full">
              {totalThisWeek} lecții săptămâna aceasta
            </span>
          )}
        </div>
        <div className="flex items-end gap-2 h-20">
          {weekDays.map((day) => {
            const heightPct = Math.round((day.count / maxDayCount) * 100);
            const isToday = day.date === today.toISOString().slice(0, 10);
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex items-end justify-center" style={{ height: "60px" }}>
                  {day.count > 0 ? (
                    <div
                      className={`w-full rounded-t-md transition-all ${isToday ? "bg-blue-500" : "bg-teal-400"}`}
                      style={{ height: `${Math.max(heightPct, 15)}%` }}
                      title={`${day.count} lecții`}
                    />
                  ) : (
                    <div className="w-full h-1 rounded bg-gray-100" />
                  )}
                </div>
                <span className={`text-[10px] font-medium ${isToday ? "text-blue-600" : "text-gray-400"}`}>
                  {day.label}
                </span>
                {day.count > 0 && (
                  <span className="text-[10px] font-bold text-teal-600">{day.count}</span>
                )}
              </div>
            );
          })}
        </div>
        {totalThisWeek === 0 && (
          <p className="text-xs text-gray-400 text-center mt-2">Nicio activitate în ultimele 7 zile</p>
        )}
      </div>

      <AcademiaGuide
        variant={totalThisWeek >= 3 ? "tip" : totalCompleted === 0 ? "info" : "discovery"}
        message={
          totalCompleted === 0
            ? `${child.display_name} nu a început niciun curs încă. Accesează zona cursantului și pornește prima lecție — primele 10 XP sunt la un click distanță!`
            : totalThisWeek >= 3
            ? `Bravo! ${child.display_name} a completat ${totalThisWeek} lecții săptămâna aceasta — continuați ritmul! 🔥`
            : `Urmărești progresul cursantului — apasă pe un modul pentru a vedea detaliile fiecărei lecții. Fiecare lecție finalizată înseamnă +10 XP!`
        }
      />

      {/* Per curs */}
      <div className="space-y-4">
        {allCourses.map((course) => {
          const lessons = course.modules?.flatMap((m) =>
            [...(m.lessons || [])].sort((a, b) => a.order_index - b.order_index)
          ) || [];
          const done = lessons.filter((l) => completedIds.has(l.id)).length;
          const pct = lessons.length > 0 ? Math.round((done / lessons.length) * 100) : 0;
          const cert = certificates?.find((c) => c.course_id === course.id);

          return (
            <div key={course.id} className="bg-white rounded-xl border overflow-hidden">
              <div className="px-5 py-4 border-b">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${cert ? "bg-teal-100" : "bg-blue-50"}`}>
                      {cert ? "🏅" : "📚"}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{course.title}</p>
                      <p className="text-xs text-gray-400">{done}/{lessons.length} lecții</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {cert && (
                      <span className="text-xs bg-teal-100 text-teal-700 px-2 py-1 rounded-full font-medium hidden sm:inline">
                        ✅ {cert.total_points} XP
                      </span>
                    )}
                    <span className={`text-sm font-bold ${pct === 100 ? "text-teal-600" : pct > 0 ? "text-blue-600" : "text-gray-400"}`}>
                      {pct}%
                    </span>
                  </div>
                </div>
                <ProgressBar value={done} max={lessons.length} color={pct === 100 ? "teal" : "blue"} />
              </div>

              {(course.modules ?? []).length > 0 && (
                <div className="divide-y">
                  {[...(course.modules ?? [])]
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((mod) => {
                      const modLessons = [...(mod.lessons ?? [])].sort((a, b) => a.order_index - b.order_index);
                      const modDone = modLessons.filter((l) => completedIds.has(l.id)).length;
                      const modPct = modLessons.length > 0 ? Math.round((modDone / modLessons.length) * 100) : 0;
                      const modQuizResults = modLessons
                        .filter((l) => quizByLesson[l.id])
                        .map((l) => quizByLesson[l.id]);
                      const modAvgScore = modQuizResults.length > 0
                        ? Math.round(modQuizResults.reduce((s, q) => s + Math.round((q.score / q.total) * 100), 0) / modQuizResults.length)
                        : null;
                      return (
                        <details key={mod.id} className="group">
                          <summary className="px-5 py-3 flex items-center gap-3 cursor-pointer hover:bg-gray-50 list-none">
                            <span className="text-xs font-bold text-gray-400 w-5 text-center group-open:rotate-90 transition-transform inline-block">▶</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm font-semibold text-gray-700 truncate">{mod.title}</p>
                                <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                                  {modAvgScore !== null && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${modAvgScore >= 80 ? "bg-teal-100 text-teal-700" : modAvgScore >= 50 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}`}>
                                      🎯 {modAvgScore}%
                                    </span>
                                  )}
                                  <span className={`text-xs font-bold ${modPct === 100 ? "text-teal-600" : modPct > 0 ? "text-blue-600" : "text-gray-400"}`}>
                                    {modDone}/{modLessons.length}
                                  </span>
                                </div>
                              </div>
                              <ProgressBar value={modDone} max={modLessons.length} color={modPct === 100 ? "teal" : "blue"} />
                            </div>
                          </summary>
                          <ul className="divide-y bg-gray-50/50">
                            {modLessons.map((lesson) => {
                              const isCompleted = completedIds.has(lesson.id);
                              const quizResult = quizByLesson[lesson.id];
                              const completedAt = progress?.find((p) => p.lesson_id === lesson.id)?.completed_at;
                              return (
                                <li key={lesson.id} className="px-8 py-2.5 flex items-center gap-3">
                                  <span className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${isCompleted ? "bg-teal-500" : "bg-gray-200"}`}>
                                    {isCompleted && <CheckCircle size={10} className="text-white" />}
                                  </span>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-sm truncate ${isCompleted ? "text-gray-700" : "text-gray-400"}`}>
                                      {lesson.lesson_type === "video" ? "🎬" :
                                       lesson.lesson_type === "quiz" ? "🎯" :
                                       lesson.lesson_type === "presentation" ? "📋" : "📝"}{" "}
                                      {lesson.title}
                                    </p>
                                    {completedAt && (
                                      <p className="text-xs text-gray-400">
                                        {new Date(completedAt).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" })}
                                        {quizResult && ` · Quiz: ${quizResult.score}/${quizResult.total}`}
                                      </p>
                                    )}
                                  </div>
                                  {isCompleted && <span className="text-xs text-teal-600 font-medium flex-shrink-0">+10 XP</span>}
                                </li>
                              );
                            })}
                          </ul>
                        </details>
                      );
                    })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {allCourses.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <div className="text-4xl mb-2">📚</div>
          <p>Niciun curs disponibil pentru această grupă de vârstă.</p>
        </div>
      )}
    </div>
  );
}
