"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/guard";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createPath(formData: FormData): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const title = formData.get("title") as string;
  const { error } = await supabase.from("learning_paths").insert({
    title,
    slug: slugify(title) + "-" + Date.now(),
    description: (formData.get("description") as string) || null,
    skill_name: (formData.get("skill_name") as string) || null,
    audience: (formData.get("audience") as string) || "children",
    status: "draft",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/paths");
  redirect("/admin/paths");
}

export async function updatePath(id: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("learning_paths").update({
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    skill_name: (formData.get("skill_name") as string) || null,
    audience: (formData.get("audience") as string) || "children",
  }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/paths");
  revalidatePath(`/admin/paths/${id}`);
  redirect(`/admin/paths/${id}`);
}

export async function deletePath(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("learning_paths").delete().eq("id", id);
  revalidatePath("/admin/paths");
  revalidatePath("/paths");
}

export async function togglePathStatus(id: string, currentStatus: string): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("learning_paths").update({
    status: currentStatus === "published" ? "draft" : "published",
  }).eq("id", id);
  revalidatePath("/admin/paths");
  revalidatePath(`/admin/paths/${id}`);
  revalidatePath("/paths");
}

export async function addCourseToPath(pathId: string, courseId: string): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("learning_path_courses")
    .select("order_index")
    .eq("path_id", pathId)
    .order("order_index", { ascending: false })
    .limit(1);
  const nextIdx = existing?.length ? (existing[0].order_index + 1) : 0;
  await supabase.from("learning_path_courses").upsert({
    path_id: pathId,
    course_id: courseId,
    order_index: nextIdx,
  }, { onConflict: "path_id,course_id" });
  revalidatePath(`/admin/paths/${pathId}`);
}

export async function removeCourseFromPath(pathId: string, courseId: string): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("learning_path_courses")
    .delete()
    .eq("path_id", pathId)
    .eq("course_id", courseId);
  revalidatePath(`/admin/paths/${pathId}`);
}
