import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Neautentificat" }, { status: 401 });

  const db = createAdminClient();
  const { data: profile } = await db
    .from("parent_profiles")
    .select("account_type, subscription_plan")
    .eq("user_id", user.id)
    .single();

  // Activăm trial doar pentru conturi family noi, fără plan existent
  if (profile?.account_type !== "member" || profile?.subscription_plan) {
    return NextResponse.json({ activated: false });
  }

  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  await db
    .from("parent_profiles")
    .update({ subscription_plan: "trial", subscription_expires_at: expiresAt })
    .eq("user_id", user.id);

  return NextResponse.json({ activated: true, expiresAt });
}
