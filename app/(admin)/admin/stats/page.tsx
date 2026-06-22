import { createClient } from "@/lib/supabase/server";
import { Users, UserCheck, BookOpen, CheckCircle, GraduationCap, Zap } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Statistici — Admin" };

export default async function AdminStatsPage() {
  const supabase = await createClient();

  const [
    { count: parentsCount },
    { count: childrenCount },
    { count: coursesCount },
    { count: completionsCount },
    { count: certificatesCount },
    { data: topCourses },
  ] = await Promise.all([
    supabase.from("parent_profiles").select("*", { count: "exact", head: true }),
    supabase.from("child_profiles").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("progress").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("certificates").select("*", { count: "exact", head: true }),
    supabase
      .from("progress")
      .select("course_id, courses(title)")
      .eq("status", "completed")
      .limit(500),
  ]);

  // Top cursuri după număr de completări de lecții
  const courseCompletionMap: Record<string, { title: string; count: number }> = {};
  (topCourses ?? []).forEach((p) => {
    if (!p.course_id) return;
    const title = (p.courses as { title?: string } | null)?.title ?? p.course_id;
    if (!courseCompletionMap[p.course_id]) {
      courseCompletionMap[p.course_id] = { title, count: 0 };
    }
    courseCompletionMap[p.course_id].count++;
  });
  const sortedCourses = Object.values(courseCompletionMap).sort((a, b) => b.count - a.count).slice(0, 5);

  const totalXP = (completionsCount ?? 0) * 10;

  const stats = [
    { icon: <Users size={22} className="text-blue-500" />, label: "Cursanți înregistrați", value: parentsCount ?? 0, bg: "bg-blue-50" },
    { icon: <UserCheck size={22} className="text-teal-500" />, label: "Profiluri active", value: childrenCount ?? 0, bg: "bg-teal-50" },
    { icon: <BookOpen size={22} className="text-purple-500" />, label: "Cursuri publicate", value: coursesCount ?? 0, bg: "bg-purple-50" },
    { icon: <CheckCircle size={22} className="text-green-500" />, label: "Lecții completate", value: completionsCount ?? 0, bg: "bg-green-50" },
    { icon: <GraduationCap size={22} className="text-yellow-500" />, label: "Certificate emise", value: certificatesCount ?? 0, bg: "bg-yellow-50" },
    { icon: <Zap size={22} className="text-orange-500" />, label: "XP total acumulat", value: `${totalXP} XP`, bg: "bg-orange-50" },
  ];

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Statistici platformă</h1>
        <p className="text-gray-500 text-sm mt-1">Date în timp real din baza de date.</p>
      </div>

      {/* Carduri statistici */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`${stat.bg} rounded-2xl p-5 flex flex-col gap-3`}>
            <div className="flex items-center gap-2">
              {stat.icon}
              <span className="text-xs text-gray-500 font-medium leading-tight">{stat.label}</span>
            </div>
            <p className="text-3xl font-black text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Top cursuri */}
      {sortedCourses.length > 0 && (
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b">
            <h2 className="font-bold text-gray-800">Top cursuri după activitate</h2>
            <p className="text-xs text-gray-400 mt-0.5">Număr de lecții completate per curs</p>
          </div>
          <div className="divide-y">
            {sortedCourses.map((course, i) => (
              <div key={course.title} className="px-5 py-4 flex items-center gap-4">
                <span className="w-7 h-7 rounded-full bg-gray-100 text-gray-600 text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {i + 1}
                </span>
                <span className="flex-1 font-medium text-sm text-gray-800 truncate">{course.title}</span>
                <span className="text-sm font-bold text-blue-600 flex-shrink-0">
                  {course.count} {course.count === 1 ? "completare" : "completări"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {sortedCourses.length === 0 && (
        <div className="bg-white rounded-2xl border p-12 text-center text-gray-400">
          <div className="text-4xl mb-2">📊</div>
          <p>Nu există activitate înregistrată încă.</p>
        </div>
      )}
    </div>
  );
}
