"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSubscriptionRequestToAdmin } from "@/lib/email";
import type { SubscriptionPlan } from "@/lib/subscription";
import { PLAN_DAYS } from "@/lib/subscription";

export async function requestSubscription(formData: FormData): Promise<{ error?: string } | void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Neautentificat" };

  const plan = formData.get("plan") as SubscriptionPlan;
  if (!plan || !PLAN_DAYS[plan]) return { error: "Plan invalid" };

  const db = createAdminClient();

  // Verifică dacă există deja o cerere pending
  const { data: existing } = await db
    .from("subscription_requests")
    .select("id")
    .eq("user_id", user.id)
    .eq("status", "pending")
    .maybeSingle();

  if (existing) return { error: "Ai deja o cerere în așteptare." };

  const { error } = await db.from("subscription_requests").insert({
    user_id: user.id,
    plan,
    status: "pending",
  });

  if (error) {
    // Unique index violation = cerere pending există deja
    if (error.code === "23505") return { error: "Ai deja o cerere în așteptare." };
    return { error: error.message };
  }

  // Trimite email la admin
  try {
    const adminEmail = process.env.ADMIN_EMAIL || process.env.ADMIN_EMAILS?.split(",")[0]?.trim();
    if (adminEmail) {
      const { data: profile } = await db
        .from("parent_profiles")
        .select("full_name")
        .eq("user_id", user.id)
        .single();

      await sendSubscriptionRequestToAdmin({
        adminEmail,
        userName: profile?.full_name ?? "Utilizator",
        userEmail: user.email ?? "",
        plan,
      });
    }
  } catch {
    // Email non-critical — cererea a fost salvată
  }
}

export async function cancelSubscriptionRequest(): Promise<{ error?: string } | void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Neautentificat" };

  const db = createAdminClient();
  const { error } = await db
    .from("subscription_requests")
    .delete()
    .eq("user_id", user.id)
    .eq("status", "pending");

  if (error) return { error: error.message };
}
