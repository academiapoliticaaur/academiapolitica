import { createAdminClient } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { classCode, studentCode, lessonId, courseId } = await req.json() as {
    classCode: string;
    studentCode: string;
    lessonId: string;
    courseId: string;
  };

  if (!classCode || !studentCode || !lessonId || !courseId) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const db = createAdminClient();

  // Validate class
  const { data: cls } = await db
    .from("classes")
    .select("id")
    .eq("access_code", classCode.toUpperCase())
    .eq("status", "active")
    .single();

  if (!cls) return NextResponse.json({ error: "Class not found" }, { status: 404 });

  // Validate that courseId is assigned to this class
  const { data: classCourse } = await db
    .from("class_courses")
    .select("course_id")
    .eq("class_id", cls.id)
    .eq("course_id", courseId)
    .single();

  if (!classCourse) return NextResponse.json({ error: "Course not assigned to class" }, { status: 403 });

  // Validate that lessonId belongs to courseId (through modules)
  const { data: lessonCheck } = await db
    .from("lessons")
    .select("id, modules!inner(course_id)")
    .eq("id", lessonId)
    .single();

  // Relație many-to-one (o lecție aparține unui singur modul) —
  // PostgREST întoarce "modules" ca obiect unic, nu ca array
  const lessonCourseId =
    (lessonCheck?.modules as unknown as { course_id: string } | null)?.course_id ?? null;

  if (!lessonCourseId || lessonCourseId !== courseId) {
    return NextResponse.json({ error: "Lesson does not belong to course" }, { status: 400 });
  }

  // Validate student
  const { data: student } = await db
    .from("class_students")
    .select("id, display_name")
    .eq("class_id", cls.id)
    .eq("student_code", studentCode.toUpperCase())
    .single();

  if (!student) return NextResponse.json({ error: "Student not found" }, { status: 404 });

  // Upsert progress — mark lesson as completed
  const { error: upsertErr } = await db
    .from("class_student_progress")
    .upsert(
      {
        student_id: student.id,
        lesson_id: lessonId,
        status: "completed",
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: "student_id,lesson_id" }
    );

  if (upsertErr) return NextResponse.json({ error: upsertErr.message }, { status: 500 });

  // Fetch all published lessons in this course (via modules)
  const { data: modules } = await db
    .from("modules")
    .select("id")
    .eq("course_id", courseId);

  const moduleIds = (modules ?? []).map((m) => m.id);

  type LessonRow = { id: string; title: string; module_id: string };
  let allLessons: LessonRow[] = [];

  if (moduleIds.length > 0) {
    const { data: lessons } = await db
      .from("lessons")
      .select("id, title, module_id")
      .in("module_id", moduleIds)
      .eq("status", "published");
    allLessons = (lessons ?? []) as LessonRow[];
  }

  const allLessonIds = allLessons.map((l) => l.id);

  // Fetch completed lessons for this student in this course
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
  // Ensure the just-completed lesson is counted even if DB read races
  completedIds.add(lessonId);

  const completedCount = completedIds.size;

  // Per-module completion
  const moduleLessons = moduleIds.map((mid) =>
    allLessons.filter((l) => l.module_id === mid)
  );
  const completedModulesCount = moduleLessons.filter(
    (ls) => ls.length > 0 && ls.every((l) => completedIds.has(l.id))
  ).length;

  const isCourseComplete =
    allLessons.length > 0 && completedCount >= allLessons.length;

  const earnedPoints =
    completedCount * 10 + completedModulesCount * 50 + (isCourseComplete ? 100 : 0);

  // Check if THIS module just completed (for bonus notification)
  const lessonModuleId = allLessons.find((l) => l.id === lessonId)?.module_id;
  const thisModuleLessons = lessonModuleId
    ? allLessons.filter((l) => l.module_id === lessonModuleId)
    : [];
  const thisModuleJustCompleted =
    thisModuleLessons.length > 0 &&
    thisModuleLessons.every((l) => completedIds.has(l.id));

  let certificateId: string | undefined;

  if (isCourseComplete) {
    const { data: courseData } = await db
      .from("courses")
      .select("title")
      .eq("id", courseId)
      .single();

    const { data: certData } = await db
      .from("class_student_certificates")
      .upsert(
        {
          student_id: student.id,
          course_id: courseId,
          course_title: courseData?.title ?? "",
          student_name: student.display_name,
          lessons_completed: allLessons.map((l) => l.title),
          total_points: earnedPoints,
        },
        { onConflict: "student_id,course_id", ignoreDuplicates: false }
      )
      .select("id")
      .single();

    certificateId = certData?.id;
  }

  return NextResponse.json({
    xp: 10,
    moduleBonus: thisModuleJustCompleted,
    courseComplete: isCourseComplete,
    certificateId,
    totalPoints: earnedPoints,
  });
}
