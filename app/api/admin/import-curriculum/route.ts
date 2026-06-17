export const runtime = "nodejs";
export const maxDuration = 60;

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recalculateCourseDuration } from "@/lib/admin/course-duration";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

interface QuizAnswer {
  answer_text: string;
  is_correct: boolean;
  feedback?: string;
}
interface QuizQuestion {
  question_text: string;
  answers?: QuizAnswer[];
}
interface QuizData {
  quiz_id?: string;
  title: string;
  question_count?: number;
  questions?: QuizQuestion[];
}
interface ParsedLesson {
  title: string;
  description?: string;
  main_message?: string;
  content_type?: string;
  has_lesson_quiz?: boolean;
  quiz?: QuizData;
  duration_minutes?: number | null;
}
interface ParsedModule {
  title: string;
  description?: string;
  badge_name?: string;
  learning_objectives?: string[];
  has_module_quiz?: boolean;
  final_module_quiz?: QuizData;
  lessons: ParsedLesson[];
}

type DbClient = ReturnType<typeof createAdminClient>;

interface QuizInsertResult {
  quizId: string | null;
  questionsImported: number;
  needsQuestions: boolean;
}

async function insertQuizData(db: DbClient, lessonId: string, quizData: QuizData): Promise<QuizInsertResult> {
  const { data: quiz, error: quizErr } = await db
    .from("quizzes")
    .insert({ lesson_id: lessonId, title: quizData.title })
    .select("id")
    .single();

  if (quizErr || !quiz) return { quizId: null, questionsImported: 0, needsQuestions: true };

  const questions = quizData.questions ?? [];
  if (questions.length === 0) return { quizId: quiz.id, questionsImported: 0, needsQuestions: true };

  let questionsImported = 0;
  for (let qi = 0; qi < questions.length; qi++) {
    const q = questions[qi];
    const { data: qRow } = await db
      .from("quiz_questions")
      .insert({ quiz_id: quiz.id, question_text: q.question_text, order_index: qi })
      .select("id")
      .single();

    if (!qRow) continue;

    const answers = q.answers ?? [];
    let hasCorrect = answers.some((a) => a.is_correct);
    if (!hasCorrect && answers.length > 0) answers[0].is_correct = true;

    for (const ans of answers) {
      await db.from("quiz_answers").insert({
        question_id: qRow.id,
        answer_text: ans.answer_text,
        is_correct: ans.is_correct,
        feedback: ans.feedback ?? "",
      });
    }
    questionsImported++;
  }

  return { quizId: quiz.id, questionsImported, needsQuestions: false };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  const isAdmin = adminEmails.includes(user.email ?? "") || user.app_metadata?.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Acces interzis" }, { status: 403 });

  const body = await request.json();
  const { curriculum } = body;
  const isDemo: boolean = body.is_demo === true;
  if (!curriculum?.course_title || !Array.isArray(curriculum.modules)) {
    return NextResponse.json({ error: "Date curriculum invalide" }, { status: 400 });
  }

  const validAudiences = ["children", "formator", "lector", "all"];
  const audience: string = validAudiences.includes(curriculum.audience) ? curriculum.audience : "children";

  function normalizeAgeGroup(raw: string | undefined | null): "0-4" | "5-8" {
    const s = (raw ?? "").toLowerCase();
    if (s.includes("0-4") || s.includes("0–4") || s.includes("primar") || s.includes("0 4")) return "0-4";
    if (s.includes("5-8") || s.includes("5–8") || s.includes("gimna") || s.includes("5 8")) return "5-8";
    if (audience === "formator") return "0-4";
    return "5-8";
  }
  const ageGroup = normalizeAgeGroup(curriculum.age_group);

  const db = createAdminClient();

  const { data: existing } = await db
    .from("courses")
    .select("id, title, status")
    .ilike("title", curriculum.course_title.trim())
    .limit(1)
    .single();

  if (existing) {
    return NextResponse.json({
      error: `Cursul „${existing.title}" există deja în platformă (status: ${existing.status}).`,
      duplicate: true,
    }, { status: 409 });
  }

  const slug = slugify(curriculum.course_title) + "-" + Date.now();
  const { data: course, error: courseErr } = await db
    .from("courses")
    .insert({
      title: curriculum.course_title,
      slug,
      description: curriculum.course_description || curriculum.course_title,
      age_group: ageGroup,
      audience,
      is_demo: isDemo,
      status: "draft",
      validation_status: "draft_ai_generat",
    })
    .select("id")
    .single();

  if (courseErr || !course) {
    return NextResponse.json({ error: courseErr?.message ?? "Eroare creare curs" }, { status: 500 });
  }

  // ─── Counters pentru raport ────────────────────────────────────────────────
  let modulesImported = 0;
  let lessonsImported = 0;
  let lessonQuizzesImported = 0;
  let moduleQuizzesImported = 0;
  let quizzesNeedingQuestions = 0;
  const schemaErrors: string[] = [];

  for (let mIdx = 0; mIdx < curriculum.modules.length; mIdx++) {
    const mod = curriculum.modules[mIdx] as ParsedModule;

    if (!mod.title) {
      schemaErrors.push(`Modul index ${mIdx}: titlu lipsă — omis`);
      continue;
    }
    if (!Array.isArray(mod.lessons)) {
      schemaErrors.push(`Modul "${mod.title}": lessons[] lipsă — omis`);
      continue;
    }

    const { data: module_, error: modErr } = await db
      .from("modules")
      .insert({
        course_id: course.id,
        title: mod.title,
        description: mod.description || null,
        badge_name: mod.badge_name || null,
        learning_objectives: mod.learning_objectives || [],
        order_index: mIdx,
      })
      .select("id")
      .single();

    if (modErr || !module_) {
      schemaErrors.push(`Modul "${mod.title}": eroare DB — ${modErr?.message}`);
      continue;
    }
    modulesImported++;

    // ─── Lecții + quiz lecție intercalat ────────────────────────────────────
    let orderIdx = 0;
    for (let lIdx = 0; lIdx < mod.lessons.length; lIdx++) {
      const lesson = mod.lessons[lIdx];

      if (!lesson.title) {
        schemaErrors.push(`Modul "${mod.title}", lecție index ${lIdx}: titlu lipsă — omisă`);
        continue;
      }

      const lessonType = lesson.content_type === "video" ? "video"
        : lesson.content_type === "presentation" ? "presentation"
        : lesson.content_type === "worksheet" ? "worksheet"
        : "mixed";

      const { data: lessonRow } = await db.from("lessons").insert({
        module_id: module_.id,
        title: lesson.title,
        description: lesson.description || null,
        main_message: lesson.main_message || null,
        lesson_type: lessonType,
        duration_minutes: lesson.duration_minutes || null,
        order_index: orderIdx++,
        status: "draft",
        ai_generated: true,
        human_reviewed: false,
      }).select("id").single();

      if (lessonRow) lessonsImported++;

      // Quiz lecție — creat DOAR dacă există întrebări reale (nu cochilii goale)
      // Cochiliile goale blochează "Import Quiz AI" prin creare de duplicate
      const quizData = lesson.quiz?.questions?.length ? lesson.quiz : null;
      if (quizData && lessonRow) {
        const { data: quizLesson } = await db.from("lessons").insert({
          module_id: module_.id,
          title: quizData.title || `Quiz — ${lesson.title}`,
          lesson_type: "quiz",
          order_index: orderIdx++,
          status: "draft",
          ai_generated: true,
          human_reviewed: false,
        }).select("id").single();

        if (quizLesson) {
          const result = await insertQuizData(db, quizLesson.id, quizData);
          if (result.needsQuestions) quizzesNeedingQuestions++;
          else lessonQuizzesImported++;
        }
      }
    }

    // ─── Quiz final modul — creat DOAR dacă există întrebări reale ──────────
    const finalQuizData = mod.final_module_quiz?.questions?.length ? mod.final_module_quiz : null;
    if (finalQuizData) {
      const { data: finalLesson } = await db.from("lessons").insert({
        module_id: module_.id,
        title: finalQuizData.title || `Quiz final — ${mod.title}`,
        description: "Quiz de evaluare la finalul modulului.",
        lesson_type: "quiz",
        order_index: orderIdx,
        status: "draft",
        ai_generated: true,
        human_reviewed: false,
      }).select("id").single();

      if (finalLesson) {
        const result = await insertQuizData(db, finalLesson.id, finalQuizData);
        if (result.needsQuestions) quizzesNeedingQuestions++;
        else moduleQuizzesImported++;
      }
    }
  }

  await recalculateCourseDuration(db, course.id);
  revalidateTag("courses", "max");

  return NextResponse.json({
    success: true,
    courseId: course.id,
    slug,
    report: {
      sourceFile: curriculum.source_file ?? "COURSE_IMPORT.json",
      modulesImported,
      lessonsImported,
      lessonQuizzesImported,
      moduleQuizzesImported,
      quizzesNeedingQuestions,
      schemaErrors,
    },
  });
}
