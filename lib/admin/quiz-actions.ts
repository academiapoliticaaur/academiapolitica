"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/guard";

export async function createQuiz(lessonId: string, title: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { data, error } = await db
    .from("quizzes")
    .insert({ lesson_id: lessonId, title })
    .select("id, title")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateQuizTitle(quizId: string, title: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("quizzes").update({ title }).eq("id", quizId);
  if (error) throw new Error(error.message);
}

export async function addQuestion(quizId: string, questionText: string, orderIndex: number) {
  await requireAdmin();
  const db = createAdminClient();
  const { data, error } = await db
    .from("quiz_questions")
    .insert({ quiz_id: quizId, question_text: questionText, order_index: orderIndex })
    .select("id, question_text, order_index")
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateQuestion(questionId: string, questionText: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db
    .from("quiz_questions")
    .update({ question_text: questionText })
    .eq("id", questionId);
  if (error) throw new Error(error.message);
}

export async function deleteQuestion(questionId: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("quiz_questions").delete().eq("id", questionId);
  if (error) throw new Error(error.message);
}

export async function addAnswer(questionId: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { data, error } = await db
    .from("quiz_answers")
    .insert({ question_id: questionId, answer_text: "Răspuns nou", is_correct: false, feedback: "" })
    .select("id, answer_text, is_correct, feedback")
    .single();
  if (error) throw new Error(error.message);
  return { ...data, feedback: data.feedback ?? "" };
}

export async function updateAnswer(
  answerId: string,
  fields: { answer_text?: string; is_correct?: boolean; feedback?: string }
) {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("quiz_answers").update(fields).eq("id", answerId);
  if (error) throw new Error(error.message);
}

export async function setCorrectAnswer(questionId: string, correctAnswerId: string) {
  await requireAdmin();
  const db = createAdminClient();
  await db.from("quiz_answers").update({ is_correct: false }).eq("question_id", questionId);
  const { error } = await db
    .from("quiz_answers")
    .update({ is_correct: true })
    .eq("id", correctAnswerId);
  if (error) throw new Error(error.message);
}

export async function deleteAnswer(answerId: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { error } = await db.from("quiz_answers").delete().eq("id", answerId);
  if (error) throw new Error(error.message);
}

export async function loadQuizData(lessonId: string) {
  await requireAdmin();
  const db = createAdminClient();
  const { data } = await db
    .from("quizzes")
    .select("id, title, quiz_questions(id, question_text, order_index, quiz_answers(id, answer_text, is_correct, feedback))")
    .eq("lesson_id", lessonId)
    .single();
  return data ?? null;
}

export { revalidatePath };
