import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET() {
  const db = createAdminClient();
  const { data } = await db
    .from("classes")
    .select("name, school_year, grade")
    .eq("status", "active")
    .order("name");

  return NextResponse.json(data ?? []);
}
