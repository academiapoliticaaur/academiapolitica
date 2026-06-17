"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { PLAN_DAYS } from "@/lib/subscription";
import type { SubscriptionPlan } from "@/lib/subscription";

type RedeemResult = { success: true; plan: string; expiresAt: string } | { error: string };

export async function redeemVoucher(_prev: RedeemResult | null, formData: FormData): Promise<RedeemResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Trebuie să fii autentificat." };

  const code = (formData.get("code") as string)?.trim().toUpperCase();
  if (!code) return { error: "Introduceți codul voucherului." };

  const db = createAdminClient();

  // Verifică profilul și abonamentul curent
  const { data: profile } = await db
    .from("parent_profiles")
    .select("approved, subscription_expires_at, account_type")
    .eq("user_id", user.id)
    .single();

  if (!profile?.approved) return { error: "Contul tău nu este aprobat încă." };

  const now = new Date();
  if (profile.subscription_expires_at && new Date(profile.subscription_expires_at) > now) {
    return { error: "Ai deja un abonament activ. Îl poți folosi după expirare." };
  }

  // Caută voucherul (case-insensitive via index UPPER)
  const { data: voucher } = await db
    .from("vouchers")
    .select("*")
    .eq("code", code)
    .single();

  if (!voucher) return { error: "Codul nu există sau este incorect." };
  if (voucher.used_at) return { error: "Voucherul a fost deja folosit." };
  if (voucher.valid_until && new Date(voucher.valid_until) < now) {
    return { error: "Voucherul a expirat." };
  }

  const plan = voucher.plan as SubscriptionPlan;
  const days = PLAN_DAYS[plan];
  if (!days) return { error: "Plan invalid pe voucher." };

  const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);

  // Activează abonamentul
  const { error: updateError } = await db
    .from("parent_profiles")
    .update({
      subscription_plan: plan,
      subscription_expires_at: expiresAt.toISOString(),
      subscription_activated_by: null,
    })
    .eq("user_id", user.id);

  if (updateError) return { error: "Eroare la activare. Încearcă din nou." };

  // Marchează voucherul ca folosit
  await db
    .from("vouchers")
    .update({ used_by: user.id, used_at: now.toISOString() })
    .eq("id", voucher.id);

  revalidatePath("/dashboard");
  return { success: true, plan, expiresAt: expiresAt.toISOString() };
}
