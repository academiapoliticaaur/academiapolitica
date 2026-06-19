"use server";

import { requireAdmin } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function getMyMfaFactors() {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const { data, error } = await supabase.auth.mfa.listFactors();
    if (error) return { error: error.message, factors: [] as { id: string; friendly_name?: string; created_at: string; status: string }[] };
    const verified = (data.totp ?? []).filter((f) => f.status === "verified");
    return { factors: verified };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Eroare", factors: [] as { id: string; friendly_name?: string; created_at: string; status: string }[] };
  }
}

export async function disableMyMfa(factorId: string): Promise<{ error?: string }> {
  try {
    await requireAdmin();
    const supabase = await createClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    if (error) return { error: error.message };
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Eroare" };
  }
}

export async function resetAdminMfaByEmail(email: string): Promise<{ error?: string; count?: number }> {
  try {
    await requireAdmin();
    const supabase = createAdminClient();

    const { data: { users }, error: listError } = await supabase.auth.admin.listUsers({ perPage: 1000 });
    if (listError) return { error: listError.message };

    const targetUser = users.find((u) => u.email === email);
    if (!targetUser) return { error: "Administrator negăsit cu emailul specificat" };

    const { data: factorsData, error: factorsError } = await supabase.auth.admin.mfa.listFactors({
      userId: targetUser.id,
    });
    if (factorsError) return { error: factorsError.message };

    const factors = factorsData?.factors ?? [];
    if (factors.length === 0) return { count: 0 };

    for (const factor of factors) {
      const { error: deleteError } = await supabase.auth.admin.mfa.deleteFactor({
        id: factor.id,
        userId: targetUser.id,
      });
      if (deleteError) return { error: `Eroare la ștergere factor: ${deleteError.message}` };
    }

    return { count: factors.length };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Eroare" };
  }
}
