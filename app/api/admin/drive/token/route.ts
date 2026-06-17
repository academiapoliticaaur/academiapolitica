import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccessToken } from "@/lib/google-drive";

// Returnează un access_token proaspăt pentru Google Picker (client-side)
export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
  const isAdmin = adminEmails.includes(user.email ?? "") || user.app_metadata?.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Acces interzis" }, { status: 403 });

  try {
    const accessToken = await getAccessToken();
    return NextResponse.json({ accessToken });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Eroare token" }, { status: 503 });
  }
}
