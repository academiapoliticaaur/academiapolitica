import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  const isAdmin = adminEmails.includes(user.email ?? "") || user.app_metadata?.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Acces interzis" }, { status: 403 });

  const db = createAdminClient();
  const { data } = await db
    .from("courses")
    .select("id, title, age_group, audience")
    .order("title");

  return NextResponse.json({ courses: data ?? [] });
}
