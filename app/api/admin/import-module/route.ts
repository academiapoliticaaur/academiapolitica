import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { recalculateCourseDuration } from "@/lib/admin/course-duration";

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

async function insertQuizData(db: DbClient, lessonId: string, quizData: QuizData) {
  const { data: quiz, error: quizErr } = await db
    .from("quizzes")
    .insert({ lesson_id: lessonId, title: quizData.title })
    .select("id")
    .single();

  if (quizErr || !quiz) return { needsQuestions: true };

  const questions = quizData.questions ?? [];
  if (questions.length === 0) return { quizId: quiz.id, needsQuestions: true };

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
  }

  return { quizId: quiz.id, needsQuestions: false };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  const isAdmin = adminEmails.includes(user.email ?? "") || user.app_metadata?.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Acces interzis" }, { status: 403 });

  const { courseId, module: mod } = await request.json() as { courseId: string; module: ParsedModule };

  if (!courseId || !mod?.title || !Array.isArray(mod.lessons)) {
    return NextResponse.json({ error: "courseId și module valid sunt obligatorii" }, { status: 400 });
  }

  const db = createAdminClient();

  const { data: maxRow } = await db
    .from("modules")
    .select("order_index")
    .eq("course_id", courseId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  const moduleOrderIndex = (maxRow?.order_index ?? -1) + 1;

  const { data: createdModule, error: modErr } = await db
    .from("modules")
    .insert({
      course_id: courseId,
      title: mod.title,
      description: mod.description || null,
      badge_name: mod.badge_name || null,
      learning_objectives: mod.learning_objectives || [],
      order_index: moduleOrderIndex,
    })
    .select("id")
    .single();

  if (modErr || !createdModule) {
    return NextResponse.json({ error: modErr?.message ?? "Eroare creare modul" }, { status: 500 });
  }

  let orderIdx = 0;
  let lessonsImported = 0;
  let lessonQuizzesImported = 0;
  let quizzesNeedingQuestions = 0;

  for (const lesson of mod.lessons) {
    if (!lesson.title) continue;

    const lessonType = lesson.content_type === "video" ? "video"
      : lesson.content_type === "presentation" ? "presentation"
      : lesson.content_type === "worksheet" ? "worksheet"
      : "mixed";

    const { data: lessonRow } = await db.from("lessons").insert({
      module_id: createdModule.id,
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

    // Quiz lecție — imediat după lecție
    const quizData = lesson.quiz ?? (lesson.has_lesson_quiz ? { title: `Quiz — ${lesson.title}` } : null);
    if (quizData && lessonRow) {
      const { data: quizLesson } = await db.from("lessons").insert({
        module_id: createdModule.id,
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

  // Quiz final modul
  const finalQuizData = mod.final_module_quiz ?? (mod.has_module_quiz ? { title: `Quiz final — ${mod.title}` } : null);
  if (finalQuizData) {
    const { data: finalLesson } = await db.from("lessons").insert({
      module_id: createdModule.id,
      title: finalQuizData.title || `Quiz final — ${mod.title}`,
      description: "Quiz de evaluare la finalul modulului.",
      lesson_type: "quiz",
      order_index: orderIdx,
      status: "draft",
      ai_generated: true,
      human_reviewed: false,
    }).select("id").single();

    if (finalLesson && finalQuizData.questions?.length) {
      const result = await insertQuizData(db, finalLesson.id, finalQuizData);
      if (result.needsQuestions) quizzesNeedingQuestions++;
    } else if (finalLesson) {
      quizzesNeedingQuestions++;
    }
  }

  await recalculateCourseDuration(db, courseId);
  revalidateTag("courses", "max");

  return NextResponse.json({
    moduleId: createdModule.id,
    lessonCount: lessonsImported,
    lessonQuizzesImported,
    quizzesNeedingQuestions,
  });
}
