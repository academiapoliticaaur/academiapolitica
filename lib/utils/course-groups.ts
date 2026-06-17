import type { Course } from "@/types";

export interface CourseSeriesBase {
  id: string;
  slug: string;
  title: string;
  description?: string | null;
  series_slug?: string | null;
  series_order?: number | null;
  series_title?: string | null;
}

export type CourseGroup<T extends CourseSeriesBase = CourseSeriesBase> =
  | { type: "single"; course: T }
  | { type: "series"; seriesSlug: string; seriesTitle: string; parts: T[] };

export function groupCourses<T extends CourseSeriesBase>(courses: T[]): CourseGroup<T>[] {
  const seriesMap = new Map<string, T[]>();
  for (const course of courses) {
    if (course.series_slug) {
      const arr = seriesMap.get(course.series_slug) ?? [];
      arr.push(course);
      seriesMap.set(course.series_slug, arr);
    }
  }
  for (const parts of seriesMap.values()) {
    parts.sort((a, b) => (a.series_order ?? 1) - (b.series_order ?? 1));
  }

  const result: CourseGroup<T>[] = [];
  const emitted = new Set<string>();
  for (const course of courses) {
    if (!course.series_slug) {
      result.push({ type: "single", course });
    } else if (!emitted.has(course.series_slug)) {
      emitted.add(course.series_slug);
      result.push({
        type: "series",
        seriesSlug: course.series_slug,
        seriesTitle: course.series_title ?? course.series_slug,
        parts: seriesMap.get(course.series_slug)!,
      });
    }
  }
  return result;
}

export function filterCourses(
  courses: Course[],
  query: string,
  titleIndex: Record<string, string[]> = {}
): { filtered: Course[]; contentMatchIds: Set<string> } {
  if (!query.trim()) return { filtered: courses, contentMatchIds: new Set() };
  const q = query.toLowerCase();
  const contentMatchIds = new Set<string>();

  const filtered = courses.filter((c) => {
    const directMatch =
      c.title.toLowerCase().includes(q) ||
      (c.description ?? "").toLowerCase().includes(q) ||
      (c.series_title ?? "").toLowerCase().includes(q);
    if (directMatch) return true;

    const inContent = (titleIndex[c.id] ?? []).some((t) => t.toLowerCase().includes(q));
    if (inContent) { contentMatchIds.add(c.id); return true; }
    return false;
  });

  return { filtered, contentMatchIds };
}
