import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface ImportAnswer {
  answer_text: string;
  is_correct: boolean;
  feedback: string;
}
interface ImportQuestion {
  question_text: string;
  answers: ImportAnswer[];
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  const isAdmin = adminEmails.includes(user.email ?? "") || user.app_metadata?.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Acces interzis" }, { status: 403 });

  const body = await request.json() as {
    moduleId: string;
    quizTitle: string;
    questions: ImportQuestion[];
    afterLessonId?: string;
  };

  const { moduleId, quizTitle, questions, afterLessonId } = body;

  if (!moduleId || !quizTitle?.trim()) {
    return NextResponse.json({ error: "moduleId și quizTitle sunt obligatorii" }, { status: 400 });
  }
  if (!Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: "Lista de întrebări este goală" }, { status: 400 });
  }

  const db = createAdminClient();

  // Verifică că modulul există și obține course_id
  const { data: mod } = await db
    .from("modules")
    .select("id, course_id")
    .eq("id", moduleId)
    .single();

  if (!mod) {
    return NextResponse.json({ error: "Modulul nu a fost găsit" }, { status: 404 });
  }

  // Calculează order_index — dacă afterLessonId e furnizat, inserează după lecția respectivă
  let lessonOrderIndex: number;

  if (afterLessonId) {
    const { data: afterLesson } = await db
      .from("lessons")
      .select("order_index")
      .eq("id", afterLessonId)
      .single();

    if (afterLesson) {
      lessonOrderIndex = afterLesson.order_index + 1;
      // Shifteaza lecțiile cu order_index >= lessonOrderIndex (descrescător pentru a evita conflicte)
      const { data: toShift } = await db
        .from("lessons")
        .select("id, order_index")
        .eq("module_id", moduleId)
        .gte("order_index", lessonOrderIndex)
        .order("order_index", { ascending: false });

      for (const lesson of toShift ?? []) {
        await db.from("lessons")
          .update({ order_index: lesson.order_index + 1 })
          .eq("id", lesson.id);
      }
    } else {
      // afterLessonId invalid — fallback la MAX+1
      const { data: maxRow } = await db
        .from("lessons").select("order_index")
        .eq("module_id", moduleId)
        .order("order_index", { ascending: false }).limit(1).maybeSingle();
      lessonOrderIndex = (maxRow?.order_index ?? -1) + 1;
    }
  } else {
    const { data: maxRow } = await db
      .from("lessons").select("order_index")
      .eq("module_id", moduleId)
      .order("order_index", { ascending: false }).limit(1).maybeSingle();
    lessonOrderIndex = (maxRow?.order_index ?? -1) + 1;
  }

  // 1. Creează lecția de tip quiz
  const { data: lesson, error: lessonErr } = await db
    .from("lessons")
    .insert({
      module_id: moduleId,
      title: quizTitle.trim(),
      lesson_type: "quiz",
      status: "draft",
      order_index: lessonOrderIndex,
      description: null,
      video_url: null,
      presentation_url: null,
      worksheet_url: null,
    })
    .select("id")
    .single();

  if (lessonErr || !lesson) {
    return NextResponse.json({ error: lessonErr?.message ?? "Eroare la crearea lecției" }, { status: 500 });
  }

  // 2. Creează quiz-ul pentru lecție
  const { data: quiz, error: quizErr } = await db
    .from("quizzes")
    .insert({ lesson_id: lesson.id, title: quizTitle.trim() })
    .select("id")
    .single();

  if (quizErr || !quiz) {
    // Rollback lecție
    await db.from("lessons").delete().eq("id", lesson.id);
    return NextResponse.json({ error: quizErr?.message ?? "Eroare la crearea quiz-ului" }, { status: 500 });
  }

  // 3. Inserează întrebările și răspunsurile
  for (let qi = 0; qi < questions.length; qi++) {
    const q = questions[qi];

    const { data: qRow, error: qErr } = await db
      .from("quiz_questions")
      .insert({
        quiz_id: quiz.id,
        question_text: q.question_text,
        order_index: qi,
      })
      .select("id")
      .single();

    if (qErr || !qRow) {
      return NextResponse.json({
        error: `Eroare la întrebarea ${qi + 1}: ${qErr?.message ?? "necunoscută"}`,
        lessonId: lesson.id,
      }, { status: 500 });
    }

    // Asigură exact un răspuns corect
    const answers = q.answers ?? [];
    let hasCorrect = answers.some((a) => a.is_correct);
    if (!hasCorrect && answers.length > 0) {
      answers[0].is_correct = true;
      hasCorrect = true;
    }

    for (const ans of answers) {
      const { error: aErr } = await db.from("quiz_answers").insert({
        question_id: qRow.id,
        answer_text: ans.answer_text,
        is_correct: ans.is_correct,
        feedback: ans.feedback ?? "",
      });
      if (aErr) {
        return NextResponse.json({
          error: `Eroare la răspunsurile întrebării ${qi + 1}: ${aErr.message}`,
          lessonId: lesson.id,
        }, { status: 500 });
      }
    }
  }

  revalidateTag("courses", "max");
  return NextResponse.json({
    lessonId: lesson.id,
    quizId: quiz.id,
    courseId: mod.course_id,
    questionsImported: questions.length,
  });
}
