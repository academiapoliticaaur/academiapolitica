"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/guard";

function parseScheduledAt(raw: string | null): string | null {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export async function createWebinar(formData: FormData): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("webinars").insert({
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    youtube_id: (formData.get("youtube_id") as string) || null,
    presenter: (formData.get("presenter") as string) || null,
    audience: (formData.get("audience") as string) || "all",
    scheduled_at: parseScheduledAt(formData.get("scheduled_at") as string | null),
    registration_url: (formData.get("registration_url") as string) || null,
    status: "draft",
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/webinars");
  revalidatePath("/webinars");
  redirect("/admin/webinars");
}

export async function updateWebinar(id: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  const { error } = await supabase.from("webinars").update({
    title: formData.get("title") as string,
    description: (formData.get("description") as string) || null,
    youtube_id: (formData.get("youtube_id") as string) || null,
    presenter: (formData.get("presenter") as string) || null,
    audience: (formData.get("audience") as string) || "all",
    scheduled_at: parseScheduledAt(formData.get("scheduled_at") as string | null),
    registration_url: (formData.get("registration_url") as string) || null,
  }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/webinars");
  revalidatePath("/webinars");
  redirect("/admin/webinars");
}

export async function deleteWebinar(id: string): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("webinars").delete().eq("id", id);
  revalidatePath("/admin/webinars");
  revalidatePath("/webinars");
}

export async function toggleWebinarStatus(id: string, currentStatus: string): Promise<void> {
  await requireAdmin();
  const supabase = createAdminClient();
  await supabase.from("webinars").update({
    status: currentStatus === "published" ? "draft" : "published",
  }).eq("id", id);
  revalidatePath("/admin/webinars");
  revalidatePath("/webinars");
}
