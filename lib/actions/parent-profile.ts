"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateParentProfile(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Neautorizat");

  const fullName = (formData.get("full_name") as string | null)?.trim();
  if (!fullName || fullName.length < 2) throw new Error("Numele trebuie să aibă cel puțin 2 caractere.");

  const { error } = await supabase
    .from("parent_profiles")
    .update({ full_name: fullName })
    .eq("user_id", user.id);

  if (error) throw new Error(`Eroare: ${error.message}`);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateParentPassword(formData: FormData) {
  const newPassword = (formData.get("new_password") as string | null) || "";
  const confirmPassword = (formData.get("confirm_password") as string | null) || "";

  if (newPassword.length < 8) throw new Error("Parola trebuie să aibă cel puțin 8 caractere.");
  if (newPassword !== confirmPassword) throw new Error("Parolele nu coincid.");

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw new Error(`Eroare: ${error.message}`);

  redirect("/dashboard");
}

export async function toggleEmailReports(enabled: boolean): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Neautorizat");

  const { error } = await supabase
    .from("parent_profiles")
    .update({ email_reports: enabled })
    .eq("user_id", user.id);

  if (error) throw new Error(`Eroare: ${error.message}`);
  revalidatePath("/dashboard/profile");
}

export async function deleteOwnAccount(): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Neautorizat");

  const admin = createAdminClient();

  // Ștergere în cascadă: copii → profil → auth user
  const { data: children } = await supabase
    .from("child_profiles")
    .select("id")
    .eq("parent_id", user.id);

  if (children && children.length > 0) {
    const childIds = children.map((c) => c.id);
    await admin.from("quiz_attempts").delete().in("child_profile_id", childIds);
    await admin.from("progress").delete().in("child_profile_id", childIds);
    await admin.from("certificates").delete().in("child_profile_id", childIds);
    await admin.from("child_profiles").delete().in("id", childIds);
  }

  await admin.from("parent_profiles").delete().eq("user_id", user.id);
  await admin.auth.admin.deleteUser(user.id);

  redirect("/");
}
