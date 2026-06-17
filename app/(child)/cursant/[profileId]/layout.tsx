import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function getTotalPoints(profileId: string): Promise<number> {
  const supabase = await createClient();

  // XP permanent din certificate — nu se pierde niciodată la replay
  const { data: certificates } = await supabase
    .from("certificates")
    .select("course_id, total_points")
    .eq("child_profile_id", profileId);

  const certXP = (certificates ?? []).reduce((sum, c) => sum + (c.total_points || 0), 0);
  const certCourseIds = new Set((certificates ?? []).map((c) => c.course_id));

  // XP din progresul curent — doar pentru cursuri fără certificat (în progres / replay)
  const { data: progress } = await supabase
    .from("progress")
    .select("lesson_id, course_id")
    .eq("child_profile_id", profileId)
    .eq("status", "completed");

  const inProgress = (progress ?? []).filter((p) => !certCourseIds.has(p.course_id));
  if (!inProgress.length) return certXP;

  const completedIds = new Set(inProgress.map((p) => p.lesson_id));
  const courseIds = [...new Set(inProgress.map((p) => p.course_id).filter(Boolean))];

  let inProgressXP = inProgress.length * 10;

  if (courseIds.length > 0) {
    const { data: courses } = await supabase
      .from("courses")
      .select("id, modules(id, lessons(id))")
      .in("id", courseIds);

    for (const course of courses ?? []) {
      let allModulesComplete = true;
      for (const mod of (course.modules as { id: string; lessons: { id: string }[] }[]) ?? []) {
        const lessons = mod.lessons ?? [];
        const modComplete = lessons.length > 0 && lessons.every((l) => completedIds.has(l.id));
        if (modComplete) inProgressXP += 50;
        else allModulesComplete = false;
      }
      const modules = (course.modules as unknown[]) ?? [];
      if (allModulesComplete && modules.length > 0) inProgressXP += 100;
    }
  }

  return certXP + inProgressXP;
}

export default async function ChildProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ profileId: string }>;
}) {
  const { profileId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: child }, totalPoints] = await Promise.all([
    supabase
      .from("child_profiles")
      .select("display_name, age_group")
      .eq("id", profileId)
      .eq("parent_id", user.id)
      .single(),
    getTotalPoints(profileId),
  ]);

  if (!child) redirect("/dashboard");

  return (
    <>
      {child && (
        <div className="bg-gradient-to-r from-blue-500 to-teal-500 text-white">
          <div className="container mx-auto max-w-5xl px-4 py-2 flex items-center justify-between">
            <span className="font-bold flex items-center gap-2 text-sm sm:text-base">
              <span>{child.age_group === "0-4" ? "🌈" : "🚀"}</span>
              {child.display_name}
            </span>
            <span className="flex items-center gap-1.5 bg-white/25 rounded-full px-3 py-1 text-sm font-bold">
              ⭐ {totalPoints} XP
            </span>
          </div>
        </div>
      )}
      {children}
    </>
  );
}
