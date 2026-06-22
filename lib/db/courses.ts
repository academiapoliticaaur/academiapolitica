import { unstable_cache } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Course, Module, Lesson } from "@/types";

// Catalogul de cursuri publicate e date public (filtrat explicit pe status="published"),
// nu depinde de sesiunea utilizatorului — folosim admin client (fără cookies) ca să fie
// cacheable cu unstable_cache. Tag "courses" e invalidat din mutațiile admin (revalidateTag).
export const getPublishedCourses = unstable_cache(
  async (ageGroup?: import("@/types").AgeGroup) => {
    const supabase = createAdminClient();

    // Pagina /courses arată DOAR cursuri pentru copii (nu resurse formatori)
    let query = supabase
      .from("courses")
      .select("*")
      .eq("status", "published")
      .eq("is_demo", false)
      .in("audience", ["children", "all"])
      .is("deleted_at", null)
      .order("title"); // alfabetic
    if (ageGroup) query = query.eq("age_group", ageGroup);
    const { data, error } = await query;
    if (error) throw error;
    return data as Course[];
  },
  ["published-courses"],
  { tags: ["courses"], revalidate: 3600 }
);

export const getCourseBySlug = unstable_cache(
  async (slug: string) => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("courses")
      .select(`*, modules(*, lessons(*))`)
      .eq("slug", slug)
      .eq("status", "published")
      .is("deleted_at", null)
      .order("order_index", { referencedTable: "modules" })
      .order("order_index", { referencedTable: "modules.lessons" })
      .single();

    if (error) return null;
    const raw = data as Course & { modules: (Module & { lessons: Lesson[] })[] };
    return {
      ...raw,
      modules: (raw.modules ?? [])
        .filter((m) => !m.deleted_at)
        .map((m) => ({ ...m, lessons: (m.lessons ?? []).filter((l) => !l.deleted_at) })),
    } as Course & { modules: (Module & { lessons: Lesson[] })[] };
  },
  ["course-by-slug"],
  { tags: ["courses"], revalidate: 3600 }
);

export const getDemoCourses = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("courses")
      .select(`*, modules(*, lessons(*))`)
      .eq("status", "published")
      .eq("is_demo", true)
      .is("deleted_at", null)
      .order("order_index")
      .order("order_index", { referencedTable: "modules" })
      .order("order_index", { referencedTable: "modules.lessons" });
    if (error) throw error;
    const raw = data as (Course & { modules: (Module & { lessons: Lesson[] })[] })[];
    return raw.map((c) => ({
      ...c,
      modules: (c.modules ?? [])
        .filter((m) => !m.deleted_at)
        .map((m) => ({ ...m, lessons: (m.lessons ?? []).filter((l) => !l.deleted_at) })),
    }));
  },
  ["demo-courses"],
  { tags: ["courses"], revalidate: 3600 }
);

export const getPublishedCourseLessonTitles = unstable_cache(
  async () => {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("courses")
      .select("id, modules(title, lessons(title))")
      .eq("status", "published")
      .eq("is_demo", false)
      .in("audience", ["children", "all"])
      .is("deleted_at", null);

    const index: Record<string, string[]> = {};
    for (const course of (data ?? []) as Array<{ id: string; modules: Array<{ title: string; lessons: Array<{ title: string }> }> }>) {
      const titles: string[] = [];
      for (const mod of course.modules ?? []) {
        if (mod.title) titles.push(mod.title);
        for (const lesson of mod.lessons ?? []) {
          if (lesson.title) titles.push(lesson.title);
        }
      }
      index[course.id] = titles;
    }
    return index;
  },
  ["course-lesson-titles"],
  { tags: ["courses"], revalidate: 3600 }
);

export async function getChildProgress(childProfileId: string, courseId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("progress")
    .select("*")
    .eq("child_profile_id", childProfileId);

  if (courseId) {
    query = query.eq("course_id", courseId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function markLessonComplete(
  childProfileId: string,
  courseId: string,
  lessonId: string
) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("progress")
    .upsert({
      child_profile_id: childProfileId,
      course_id: courseId,
      lesson_id: lessonId,
      status: "completed",
      completed_at: new Date().toISOString(),
    }, {
      onConflict: "child_profile_id,lesson_id",
    });

  if (error) throw error;
}
