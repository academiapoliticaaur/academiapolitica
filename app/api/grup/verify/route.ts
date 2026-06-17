import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");
  if (!code) return NextResponse.json({ error: "missing code" }, { status: 400 });

  const db = createAdminClient();
  const { data } = await db
    .from("classes")
    .select("id, status")
    .eq("access_code", code.toUpperCase())
    .single();

  if (!data || data.status !== "active") {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
