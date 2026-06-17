"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/guard";

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // fără 0,O,1,I — confundabile

function generateCode(): string {
  const seg = () =>
    Array.from({ length: 5 }, () => CHARS[Math.floor(Math.random() * CHARS.length)]).join("");
  return `AMI-${seg()}-${seg()}`;
}

export async function generateVouchers(formData: FormData): Promise<void> {
  await requireAdmin();

  const plan = formData.get("plan") as string;
  const quantity = Math.min(Math.max(parseInt(formData.get("quantity") as string) || 1, 1), 50);
  const notes = (formData.get("notes") as string)?.trim() || null;
  const validUntilRaw = formData.get("valid_until") as string;
  const valid_until = validUntilRaw ? new Date(validUntilRaw).toISOString() : null;

  if (!["monthly", "quarterly", "annual"].includes(plan)) {
    throw new Error("Plan invalid");
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const db = createAdminClient();

  // Generează coduri unice cu retry dacă există coliziune
  const toInsert: Array<{ code: string; plan: string; notes: string | null; valid_until: string | null; created_by: string | null }> = [];
  const attempts = quantity * 3;
  const seen = new Set<string>();

  for (let i = 0; i < attempts && toInsert.length < quantity; i++) {
    const code = generateCode();
    if (!seen.has(code)) {
      seen.add(code);
      toInsert.push({ code, plan, notes, valid_until, created_by: user?.id ?? null });
    }
  }

  const { error } = await db.from("vouchers").insert(toInsert);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/vouchers");
  redirect("/admin/vouchers?generated=" + toInsert.length);
}

export async function deleteVoucher(id: string): Promise<void> {
  await requireAdmin();
  const db = createAdminClient();

  const { data } = await db.from("vouchers").select("used_at").eq("id", id).single();
  if (data?.used_at) throw new Error("Voucherul a fost deja folosit și nu poate fi șters.");

  await db.from("vouchers").delete().eq("id", id);
  revalidatePath("/admin/vouchers");
}
