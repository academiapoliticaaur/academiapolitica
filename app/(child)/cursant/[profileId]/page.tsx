import { notFound, redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/common/progress-bar";
import { BookOpen, Trophy, Zap, GraduationCap, ArrowRight, Flame } from "lucide-react";
import { AcademiaGuide } from "@/components/common/academia-guide";
import { computeBadges } from "@/lib/badges";
import { DailyTop3 } from "@/components/gamification/DailyTop3";
import type { Metadata } from "next";

function calculateStreak(completed: { completed_at: string | null }[]): number {
  const dates = new Set(
    completed
      .filter((p) => p.completed_at)
      .map((p) => new Date(p.completed_at!).toISOString().split("T")[0])
  );
  if (dates.size === 0) return 0;
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const checkDate = new Date(today);
  if (!dates.has(todayStr)) checkDate.setDate(checkDate.getDate() - 1);
  let streak = 0;
  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (!dates.has(dateStr)) break;
    streak++;
    checkDate.setDate(checkDate.getDate() - 1);
  }
  return streak;
}

interface PageProps {
  params: Promise<{ profileId: string }>;
}

export const metadata: Metadata = { title: "Zona mea de învățare" };

const lessonTypeIcon: Record<string, string> = {
  video: "🎬",
  presentation: "📋",
  quiz: "🎯",
  worksheet: "📝",
  mixed: "📚",
};

export default async function ChildDashboardPage({ params }: PageProps) {
  const { profileId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: childProfile } = await supabase
    .from("child_profiles")
    .select("*")
    .eq("id", profileId)
    .eq("parent_id", user.id)
    .single();

  if (!childProfile) notFound();

  if (childProfile.pin_hash) {
    const cookieStore = await cookies();
    if (cookieStore.get(`pin_ok_${profileId}`)?.value !== "1") {
      redirect(`/cursant/${profileId}/pin`);
    }
  }

  // Cursuri cu lecții
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, slug, description, age_group, estimated_duration, modules(id, title, order_index, lessons(id, title, lesson_type, order_index))")
    .eq("status", "published")
    .eq("age_group", childProfile.age_group)
    .order("order_index");

  // Progres și certificate
  const [{ data: progressData }, { data: certificates }] = await Promise.all([
    supabase
      .from("progress")
      .select("lesson_id, course_id, status, completed_at")
      .eq("child_profile_id", profileId)
      .eq("status", "completed"),
    supabase
      .from("certificates")
      .select("id, course_id, total_points, issued_at")
      .eq("child_profile_id", profileId),
  ]);

  // Calcule
  const completedLessonIds = new Set(progressData?.map((p) => p.lesson_id) || []);
  const completedLessonsCount = completedLessonIds.size;
  const completedCourseIds = new Set(certificates?.map((c) => c.course_id) || []);
  const diplomasCount = certificates?.length || 0;

  // XP permanent din certificate + XP în progres pentru cursuri fără certificat (replay)
  const certXP = certificates?.reduce((sum, c) => sum + (c.total_points || 0), 0) || 0;
  const replayProgressXP = (progressData ?? [])
    .filter((p) => !completedCourseIds.has(p.course_id ?? "")).length * 10;
  const totalXP = certXP + replayProgressXP;
  const streakDays = calculateStreak(progressData ?? []);

  // Progres per curs
  const courseProgressMap: Record<string, number> = {};
  progressData?.forEach((p) => {
    if (p.course_id) courseProgressMap[p.course_id] = (courseProgressMap[p.course_id] || 0) + 1;
  });

  // Cursuri organizate
  type Lesson = { id: string; title: string; lesson_type: string; order_index: number };
  type Module = { id: string; title: string; order_index: number; lessons?: Lesson[] };
  type Course = { id: string; title: string; slug: string; description: string; age_group: string; estimated_duration?: number; modules?: Module[] };

  const allCourses = (courses as Course[]) || [];

  const inProgressCourses = allCourses.filter((c) => {
    const done = courseProgressMap[c.id] || 0;
    const total = c.modules?.flatMap((m) => m.lessons || []).length || 0;
    return done > 0 && !completedCourseIds.has(c.id) && done < total;
  });

  const finishedCourses = allCourses.filter((c) => completedCourseIds.has(c.id));
  const notStartedCourses = allCourses.filter((c) => !courseProgressMap[c.id] && !completedCourseIds.has(c.id));

  const badges = computeBadges({
    totalXP,
    completedLessons: completedLessonsCount,
    completedCourses: finishedCourses.length,
    streakDays,
  });

  // Cursul activ = cel mai recent progresat
  const recentCourseId = progressData
    ?.slice()
    .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())
    ?.[0]?.course_id;

  const activeCourse = recentCourseId
    ? (allCourses.find((c) => c.id === recentCourseId) ?? inProgressCourses[0])
    : inProgressCourses[0];

  const activeLessons = activeCourse?.modules?.flatMap((m) =>
    [...(m.lessons || [])].sort((a, b) => a.order_index - b.order_index)
  ) || [];
  const activeDone = courseProgressMap[activeCourse?.id || ""] || 0;
  const activeTotal = activeLessons.length;

  // Próxima lecție necompletată
  const nextLesson = activeLessons.find((l) => !completedLessonIds.has(l.id));

  // Recomandare curs următor — primul neînceput, când nu există curs activ
  const recommendedCourse = !activeCourse || completedCourseIds.has(activeCourse.id)
    ? notStartedCourses[0] ?? null
    : null;

  const ageEmoji = childProfile.age_group === "0-4" ? "🌈" : "🚀";

  return (
    <div className="max-w-4xl mx-auto space-y-5">

      {/* ── HEADER: salut + statistici rapide ── */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm border">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-teal-400 flex items-center justify-center text-3xl flex-shrink-0 shadow-sm">
            {ageEmoji}
          </div>
          <div>
            <p className="text-gray-400 text-sm leading-none mb-0.5">Salut,</p>
            <h1 className="text-2xl font-black leading-tight">{childProfile.display_name}!</h1>
            <p className="text-sm text-yellow-600 font-semibold mt-0.5">⭐ {totalXP} XP acumulați</p>
          </div>
        </div>
        <div className="flex gap-3 self-start sm:self-auto">
          <div className="border rounded-xl px-4 py-3 text-center min-w-[72px]">
            <p className="text-2xl font-black text-blue-600">{completedLessonsCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">Lecții</p>
          </div>
          <div className={`border rounded-xl px-4 py-3 text-center min-w-[72px] ${streakDays > 0 ? "border-orange-200 bg-orange-50" : ""}`}>
            <p className={`text-2xl font-black ${streakDays > 0 ? "text-orange-500" : "text-gray-300"}`}>{streakDays}</p>
            <p className="text-xs text-gray-500 mt-0.5">🔥 Zile</p>
          </div>
          <div className="border rounded-xl px-4 py-3 text-center min-w-[72px]">
            <p className="text-2xl font-black text-teal-600">{diplomasCount}</p>
            <p className="text-xs text-gray-500 mt-0.5">🏅 Diplome</p>
          </div>
        </div>
      </div>

      {/* ── CURS ACTIV ── */}
      {activeCourse && !completedCourseIds.has(activeCourse.id) ? (
        <div className="bg-white rounded-2xl p-5 sm:p-6 border shadow-sm">
          <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">Continuă de unde ai rămas</p>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
              📖
            </div>
            <div className="flex-1 min-w-0">
              <Link
                href={`/cursant/${profileId}/course/${activeCourse.id}`}
                className="font-bold text-gray-900 hover:text-blue-600 transition-colors text-base leading-snug flex items-center gap-1 group"
              >
                {activeCourse.title}
                <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <p className="text-xs text-gray-400 mt-1 mb-3">
                {activeDone} din {activeTotal} lecții completate
                {activeCourse.estimated_duration && ` · ⏱ ~${activeCourse.estimated_duration} min`}
              </p>
              <ProgressBar value={activeDone} max={activeTotal || 1} color="green" />
            </div>
            <Button
              asChild
              className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2 shrink-0 hidden sm:flex"
            >
              <Link href={nextLesson
                ? `/cursant/${profileId}/course/${activeCourse.id}/lesson/${nextLesson.id}`
                : `/cursant/${profileId}/course/${activeCourse.id}`
              }>
                Continuă →
              </Link>
            </Button>
          </div>
          <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2 w-full mt-4 sm:hidden">
            <Link href={nextLesson
              ? `/cursant/${profileId}/course/${activeCourse.id}/lesson/${nextLesson.id}`
              : `/cursant/${profileId}/course/${activeCourse.id}`
            }>
              Continuă cursul →
            </Link>
          </Button>
        </div>
      ) : !activeCourse ? (
        <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-2xl p-5 sm:p-6 border border-blue-100 text-center">
          <div className="text-4xl mb-2">🌟</div>
          <p className="font-bold text-gray-800 mb-1">Niciun curs început încă</p>
          <p className="text-sm text-gray-500 mb-4">Alege un curs de mai jos și pornește aventura!</p>
        </div>
      ) : null}

      {/* ── ACTIVITATEA MEA ── */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b">
          <h2 className="font-bold text-gray-800">Activitatea mea</h2>
          <p className="text-xs text-gray-400 mt-0.5">Tot ce ai realizat până acum</p>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-5 divide-x divide-y sm:divide-y-0">
          {[
            { icon: <Trophy size={20} className="text-yellow-500" />, value: finishedCourses.length, label: "Finalizate" },
            { icon: <BookOpen size={20} className="text-blue-500" />, value: completedLessonsCount, label: "Lecții" },
            { icon: <Zap size={20} className="text-orange-500" />, value: `${totalXP} XP`, label: "XP câștigați" },
            { icon: <Flame size={20} className={streakDays > 0 ? "text-orange-500" : "text-gray-300"} />, value: streakDays, label: `${streakDays === 1 ? "Zi consecutivă" : "Zile consecutive"}` },
            { icon: <GraduationCap size={20} className="text-teal-500" />, value: diplomasCount, label: "Diplome" },
          ].map((stat) => (
            <div key={stat.label} className="px-3 sm:px-6 py-5 text-center">
              <div className="flex justify-center mb-1">{stat.icon}</div>
              <p className="text-xl sm:text-2xl font-black text-gray-900">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-tight">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── RECOMANDARE CURS URMĂTOR ── */}
      {recommendedCourse && (
        <div className="bg-gradient-to-r from-teal-50 to-blue-50 rounded-2xl p-5 sm:p-6 border border-teal-100">
          <p className="text-xs text-teal-600 uppercase tracking-widest font-semibold mb-3">Încearcă acum</p>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-2xl flex-shrink-0">🌟</div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-gray-900 leading-snug">{recommendedCourse.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {recommendedCourse.modules?.flatMap((m) => m.lessons || []).length || 0} lecții
                {recommendedCourse.estimated_duration && ` · ⏱ ~${recommendedCourse.estimated_duration} min`}
              </p>
            </div>
            <Button asChild className="bg-teal-500 hover:bg-teal-600 text-white gap-1.5 shrink-0 hidden sm:flex">
              <Link href={`/cursant/${profileId}/course/${recommendedCourse.id}`}>
                Începe →
              </Link>
            </Button>
          </div>
          <Button asChild className="bg-teal-500 hover:bg-teal-600 text-white w-full mt-4 sm:hidden">
            <Link href={`/cursant/${profileId}/course/${recommendedCourse.id}`}>
              Începe cursul →
            </Link>
          </Button>
        </div>
      )}

      {/* ── TOP 3 ZILNIC ── */}
      <DailyTop3 currentChildId={profileId} />

      {/* ── INSIGNELE MELE ── */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="font-bold text-gray-800">Insignele mele</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {badges.filter((b) => b.earned).length} din {badges.length} câștigate
            </p>
          </div>
        </div>
        <div className="p-5 sm:p-6 grid grid-cols-3 sm:grid-cols-5 gap-3">
          {badges.map(({ badge, earned }) => (
            <div
              key={badge.id}
              title={earned ? badge.description : `Blocat — ${badge.description}`}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border transition-all ${
                earned
                  ? "border-yellow-200 bg-yellow-50"
                  : "border-gray-100 bg-gray-50 opacity-40 grayscale"
              }`}
            >
              <span className="text-2xl">{badge.icon}</span>
              <span className={`text-xs font-semibold text-center leading-tight ${earned ? "text-gray-800" : "text-gray-400"}`}>
                {badge.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── CURSURILE MELE ── */}
      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-800">Cursurile mele</h2>
          <Link href={`/cursant/${profileId}/transcript`} className="text-xs text-teal-600 hover:underline font-medium">
            📜 Diplome & transcript
          </Link>
        </div>

        {/* În progres */}
        {inProgressCourses.length > 0 && (
          <div className="px-5 sm:px-6 py-4 border-b">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">
              În progres · {inProgressCourses.length}
            </p>
            <div className="space-y-3">
              {inProgressCourses.map((course) => {
                const done = courseProgressMap[course.id] || 0;
                const total = course.modules?.flatMap((m) => m.lessons || []).length || 0;
                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                return (
                  <Link
                    key={course.id}
                    href={`/cursant/${profileId}/course/${course.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-lg flex-shrink-0">📖</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-700 truncate">{course.title}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-400 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">{pct}%</span>
                      </div>
                    </div>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-blue-500 flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Finalizate */}
        {finishedCourses.length > 0 && (
          <div className="px-5 sm:px-6 py-4 border-b">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">
              Finalizate · {finishedCourses.length}
            </p>
            <div className="space-y-3">
              {finishedCourses.map((course) => {
                const cert = certificates?.find((c) => c.course_id === course.id);
                return (
                  <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-teal-50 transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-lg flex-shrink-0">🏅</div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/cursant/${profileId}/course/${course.id}`} className="font-semibold text-sm text-gray-800 group-hover:text-teal-700 truncate block">{course.title}</Link>
                      <p className="text-xs text-teal-600 mt-0.5">✓ Finalizat · {cert?.total_points || 0} XP câștigați</p>
                    </div>
                    {cert?.id && (
                      <Link
                        href={`/cursant/${profileId}/certificate/${cert.id}`}
                        className="text-xs text-yellow-600 hover:text-yellow-700 font-medium flex-shrink-0"
                      >
                        🏆 Diplomă
                      </Link>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Neîncepute */}
        {notStartedCourses.length > 0 && (
          <div className="px-5 sm:px-6 py-4">
            <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-3">
              Disponibile · {notStartedCourses.length}
            </p>
            <div className="space-y-3">
              {notStartedCourses.map((course) => {
                const total = course.modules?.flatMap((m) => m.lessons || []).length || 0;
                return (
                  <Link
                    key={course.id}
                    href={`/cursant/${profileId}/course/${course.id}`}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-lg flex-shrink-0">📚</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 group-hover:text-gray-900 truncate">{course.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{total} lecții · Neînceput</p>
                    </div>
                    <ArrowRight size={14} className="text-gray-300 group-hover:text-gray-500 flex-shrink-0" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {allCourses.length === 0 && (
          <div className="px-5 sm:px-6 py-12 text-center">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-gray-500 text-sm">Cursurile pentru grupa ta sunt în pregătire!</p>
          </div>
        )}
      </div>

      <AcademiaGuide
        variant={completedLessonsCount === 0 ? "info" : streakDays >= 3 ? "tip" : "discovery"}
        message={
          completedLessonsCount === 0
            ? `Bun venit, ${childProfile.display_name}! Alege un curs de mai sus și pornești primul tău modul de formare politică.`
            : streakDays >= 3
            ? `Felicitări, ${childProfile.display_name}! ${streakDays} zile consecutive de studiu — menține ritmul! 🔥`
            : `Misiune: completează câte o lecție în fiecare zi și construiește un streak de activitate! 💪`
        }
      />
    </div>
  );
}
