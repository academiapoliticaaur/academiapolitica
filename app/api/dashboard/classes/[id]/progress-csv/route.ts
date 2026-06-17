import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function escapeCell(value: string | number | null | undefined): string {
  const s = String(value ?? "");
  if (s.includes(",") || s.includes('"') || s.includes("\n")) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const { id } = await params;
  const db = createAdminClient();

  const { data: cls } = await db
    .from("classes")
    .select("id, name, access_code")
    .eq("id", id)
    .eq("teacher_id", user.id)
    .single();
  if (!cls) return NextResponse.json({ error: "Clasa nu a fost găsită" }, { status: 404 });

  const { data: students } = await db
    .from("class_students")
    .select("id, display_name, student_code, age_group")
    .eq("class_id", id)
    .order("display_name");

  const { data: classCourseRows } = await db
    .from("class_courses")
    .select("course_id, order_index")
    .eq("class_id", id)
    .order("order_index");

  const assignedIds = (classCourseRows ?? []).map((r) => r.course_id);

  type CourseRow = { id: string; title: string };
  let courses: CourseRow[] = [];
  if (assignedIds.length > 0) {
    const { data } = await db.from("courses").select("id, title").in("id", assignedIds);
    const byId = Object.fromEntries((data ?? []).map((c) => [c.id, c]));
    courses = assignedIds.map((cid) => byId[cid]).filter(Boolean) as CourseRow[];
  }

  // Lecții per curs
  type CourseMeta = { total: number; lessonIds: string[] };
  const coursesMeta: Record<string, CourseMeta> = {};
  for (const course of courses) {
    const { data: mods } = await db.from("modules").select("id").eq("course_id", course.id);
    const modIds = (mods ?? []).map((m) => m.id);
    let lessonIds: string[] = [];
    if (modIds.length > 0) {
      const { data: lessons } = await db.from("lessons").select("id").in("module_id", modIds).eq("status", "published");
      lessonIds = (lessons ?? []).map((l) => l.id);
    }
    coursesMeta[course.id] = { total: lessonIds.length, lessonIds };
  }

  // Progres
  const allLessonIds = Object.values(coursesMeta).flatMap((c) => c.lessonIds);
  const studentIds = (students ?? []).map((s) => s.id);
  type ProgEntry = { completed: number; lastAt: string | null };
  const progressMap: Record<string, Record<string, ProgEntry>> = {};
  const lastActivityMap: Record<string, string | null> = {};

  if (allLessonIds.length > 0 && studentIds.length > 0) {
    const { data: progressRows } = await db
      .from("class_student_progress")
      .select("student_id, lesson_id, completed_at")
      .in("student_id", studentIds)
      .in("lesson_id", allLessonIds)
      .eq("status", "completed");

    for (const row of progressRows ?? []) {
      const courseId = Object.entries(coursesMeta).find(([, meta]) =>
        meta.lessonIds.includes(row.lesson_id)
      )?.[0];
      if (!courseId) continue;

      if (!progressMap[row.student_id]) progressMap[row.student_id] = {};
      if (!progressMap[row.student_id][courseId]) progressMap[row.student_id][courseId] = { completed: 0, lastAt: null };
      progressMap[row.student_id][courseId].completed += 1;

      const prev = progressMap[row.student_id][courseId].lastAt;
      if (!prev || row.completed_at > prev) progressMap[row.student_id][courseId].lastAt = row.completed_at;

      const prevGlobal = lastActivityMap[row.student_id];
      if (!prevGlobal || row.completed_at > prevGlobal) lastActivityMap[row.student_id] = row.completed_at;
    }
  }

  // Construiește CSV — format wide (un rând per elev)
  const headers = ["Elev", "Cod"];
  for (const c of courses) {
    const total = coursesMeta[c.id]?.total ?? 0;
    headers.push(`${c.title} (${total} lecții)`, `${c.title} (%)`);
  }
  headers.push("Ultima activitate");

  const rows: string[][] = [headers];

  for (const s of students ?? []) {
    const row: string[] = [s.display_name, s.student_code];
    for (const c of courses) {
      const prog = progressMap[s.id]?.[c.id];
      const completed = prog?.completed ?? 0;
      const total = coursesMeta[c.id]?.total ?? 0;
      const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
      row.push(`${completed}/${total}`, `${pct}%`);
    }
    const lastAt = lastActivityMap[s.id];
    row.push(lastAt ? new Date(lastAt).toLocaleDateString("ro-RO") : "Inactiv");
    rows.push(row);
  }

  const csv = "﻿" + rows.map((r) => r.map(escapeCell).join(",")).join("\r\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="progres-${cls.access_code}.csv"`,
    },
  });
}
