"use server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function resetCourseProgress(profileId: string, courseId: string) {
  // Verificare autentificare și ownership cu clientul normal (respectă RLS)
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

  // Ștergere cu admin client — RLS nu are politică DELETE pe progress
  const admin = createAdminClient();
  const { error } = await admin
    .from("progress")
    .delete()
    .eq("child_profile_id", profileId)
    .eq("course_id", courseId);

  if (error) throw new Error(`Eroare la resetare progres: ${error.message}`);

  revalidatePath(`/cursant/${profileId}/course/${courseId}`);
}
