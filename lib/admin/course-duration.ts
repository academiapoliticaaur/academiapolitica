import { createAdminClient } from "@/lib/supabase/admin";

// Recalculează durata estimată a unui curs ca sumă a duratelor declarate
// la nivel de lecție (lessons.duration_minutes) — singura sursă de adevăr,
// nu estimarea brută a AI-ului la nivel de curs (estimated_duration_hours)
export async function recalculateCourseDuration(
  supabase: ReturnType<typeof createAdminClient>,
  courseId: string
): Promise<void> {
  const { data: modules } = await supabase
    .from("modules")
    .select("id")
    .eq("course_id", courseId);

  const moduleIds = (modules ?? []).map((m) => m.id);

  let total = 0;
  if (moduleIds.length > 0) {
    const { data: lessons } = await supabase
      .from("lessons")
      .select("duration_minutes")
      .in("module_id", moduleIds);

    total = (lessons ?? []).reduce((sum, l) => sum + (l.duration_minutes || 0), 0);
  }

  await supabase
    .from("courses")
    .update({ estimated_duration: total > 0 ? total : null })
    .eq("id", courseId);
}
