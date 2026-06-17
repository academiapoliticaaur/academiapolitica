"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/admin/guard";
import { recalculateCourseDuration } from "@/lib/admin/course-duration";

// ─── Soft delete ────────────────────────────────────────────────────────────

export async function deleteLesson(lessonId: string, courseId: string): Promise<{ error?: string } | void> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("lessons")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", lessonId);
    if (error) return { error: error.message };
    revalidatePath(`/admin/courses/${courseId}`);
    revalidateTag("courses", "max");
    await recalculateCourseDuration(supabase, courseId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Eroare necunoscută" };
  }
}

export async function deleteModule(moduleId: string, courseId: string): Promise<{ error?: string } | void> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const now = new Date().toISOString();
    // Soft-delete modulul și toate lecțiile sale
    await supabase.from("lessons").update({ deleted_at: now }).eq("module_id", moduleId);
    const { error } = await supabase.from("modules").update({ deleted_at: now }).eq("id", moduleId);
    if (error) return { error: error.message };
    revalidatePath(`/admin/courses/${courseId}`);
    revalidateTag("courses", "max");
    await recalculateCourseDuration(supabase, courseId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Eroare necunoscută" };
  }
}

export async function deleteCourse(courseId: string): Promise<{ error?: string } | void> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const now = new Date().toISOString();
    // Soft-delete cursul, modulele și lecțiile sale
    const { data: modules } = await supabase.from("modules").select("id").eq("course_id", courseId);
    if (modules?.length) {
      const moduleIds = modules.map((m) => m.id);
      await supabase.from("lessons").update({ deleted_at: now }).in("module_id", moduleIds);
    }
    await supabase.from("modules").update({ deleted_at: now }).eq("course_id", courseId);
    const { error } = await supabase.from("courses").update({ deleted_at: now }).eq("id", courseId);
    if (error) return { error: error.message };
    revalidatePath("/admin/courses");
    revalidateTag("courses", "max");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Eroare necunoscută" };
  }
}

// ─── Restore ────────────────────────────────────────────────────────────────

export async function restoreLesson(lessonId: string, courseId: string): Promise<{ error?: string } | void> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { error } = await supabase
      .from("lessons")
      .update({ deleted_at: null })
      .eq("id", lessonId);
    if (error) return { error: error.message };
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath("/admin/trash");
    revalidateTag("courses", "max");
    await recalculateCourseDuration(supabase, courseId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Eroare necunoscută" };
  }
}

export async function restoreModule(moduleId: string, courseId: string): Promise<{ error?: string } | void> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    // Restaurează modulul și lecțiile sale șterse odată cu el
    await supabase.from("lessons").update({ deleted_at: null }).eq("module_id", moduleId).not("deleted_at", "is", null);
    const { error } = await supabase.from("modules").update({ deleted_at: null }).eq("id", moduleId);
    if (error) return { error: error.message };
    revalidatePath(`/admin/courses/${courseId}`);
    revalidatePath("/admin/trash");
    revalidateTag("courses", "max");
    await recalculateCourseDuration(supabase, courseId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Eroare necunoscută" };
  }
}

export async function restoreCourse(courseId: string): Promise<{ error?: string } | void> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { data: modules } = await supabase.from("modules").select("id").eq("course_id", courseId);
    if (modules?.length) {
      const moduleIds = modules.map((m) => m.id);
      await supabase.from("lessons").update({ deleted_at: null }).in("module_id", moduleIds).not("deleted_at", "is", null);
    }
    await supabase.from("modules").update({ deleted_at: null }).eq("course_id", courseId).not("deleted_at", "is", null);
    const { error } = await supabase.from("courses").update({ deleted_at: null }).eq("id", courseId);
    if (error) return { error: error.message };
    revalidatePath("/admin/courses");
    revalidatePath("/admin/trash");
    revalidateTag("courses", "max");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Eroare necunoscută" };
  }
}

// ─── Permanent delete ────────────────────────────────────────────────────────

export async function permanentDeleteLesson(lessonId: string, courseId: string): Promise<{ error?: string } | void> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    const { error } = await supabase.from("lessons").delete().eq("id", lessonId);
    if (error) return { error: error.message };
    revalidatePath("/admin/trash");
    revalidateTag("courses", "max");
    await recalculateCourseDuration(supabase, courseId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Eroare necunoscută" };
  }
}

export async function permanentDeleteModule(moduleId: string, courseId: string): Promise<{ error?: string } | void> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    await supabase.from("lessons").delete().eq("module_id", moduleId);
    const { error } = await supabase.from("modules").delete().eq("id", moduleId);
    if (error) return { error: error.message };
    revalidatePath("/admin/trash");
    revalidateTag("courses", "max");
    await recalculateCourseDuration(supabase, courseId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Eroare necunoscută" };
  }
}

export async function permanentDeleteCourse(courseId: string): Promise<{ error?: string } | void> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    await supabase.from("certificates").delete().eq("course_id", courseId);
    await supabase.from("class_student_certificates").delete().eq("course_id", courseId);
    const { data: modules } = await supabase.from("modules").select("id").eq("course_id", courseId);
    if (modules?.length) {
      await supabase.from("lessons").delete().in("module_id", modules.map((m) => m.id));
    }
    await supabase.from("modules").delete().eq("course_id", courseId);
    const { error } = await supabase.from("courses").delete().eq("id", courseId);
    if (error) return { error: error.message };
    revalidatePath("/admin/trash");
    revalidateTag("courses", "max");
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Eroare necunoscută" };
  }
}
