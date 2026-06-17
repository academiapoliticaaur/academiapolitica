"use server";
import { createHash } from "crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

function hashPin(pin: string): string {
  return createHash("sha256").update(`ami-moti-pin:${pin}`).digest("hex");
}

export async function verifyChildPin(profileId: string, pin: string): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  const { data } = await supabase
    .from("child_profiles")
    .select("pin_hash")
    .eq("id", profileId)
    .eq("parent_id", user.id)
    .single();

  if (!data?.pin_hash) return true;
  const matches = data.pin_hash === hashPin(pin);
  if (matches) {
    const cookieStore = await cookies();
    cookieStore.set(`pin_ok_${profileId}`, "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 8,
    });
  }
  return matches;
}

export async function updateChildProfile(profileId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Neautorizat");

  const displayName = (formData.get("display_name") as string | null)?.trim();
  const ageGroup = formData.get("age_group") as string | null;
  const pinRaw = (formData.get("pin") as string | null)?.trim();
  const clearPin = formData.get("clear_pin") === "1";

  if (!displayName || displayName.length < 2) throw new Error("Numele trebuie să aibă cel puțin 2 caractere.");
  if (!ageGroup || !["0-4", "5-8"].includes(ageGroup)) throw new Error("Grupă de vârstă invalidă.");
  if (pinRaw && !/^\d{4}$/.test(pinRaw)) throw new Error("PIN-ul trebuie să aibă exact 4 cifre.");

  const updateData: Record<string, string | null> = { display_name: displayName, age_group: ageGroup };
  if (clearPin) updateData.pin_hash = null;
  else if (pinRaw) updateData.pin_hash = hashPin(pinRaw);

  const { error } = await supabase
    .from("child_profiles")
    .update(updateData)
    .eq("id", profileId)
    .eq("parent_id", user.id);

  if (error) throw new Error(`Eroare la salvare: ${error.message}`);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function deleteChildProfile(profileId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Neautorizat");

  const { data: child } = await supabase
    .from("child_profiles")
    .select("id")
    .eq("id", profileId)
    .eq("parent_id", user.id)
    .single();
  if (!child) throw new Error("Acces interzis");

  const admin = createAdminClient();
  await admin.from("quiz_attempts").delete().eq("child_profile_id", profileId);
  await admin.from("progress").delete().eq("child_profile_id", profileId);
  await admin.from("certificates").delete().eq("child_profile_id", profileId);
  const { error } = await admin.from("child_profiles").delete().eq("id", profileId);

  if (error) throw new Error(`Eroare la ștergere: ${error.message}`);

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
