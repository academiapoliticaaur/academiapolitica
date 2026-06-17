import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeCodeForTokens, saveRefreshToken } from "@/lib/google-drive";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", request.url));

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
  const isAdmin = adminEmails.includes(user.email ?? "") || user.app_metadata?.role === "admin";
  if (!isAdmin) return NextResponse.redirect(new URL("/admin", request.url));

  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");

  if (error || !code) {
    return NextResponse.redirect(new URL("/admin/settings/google-drive?error=auth_denied", request.url));
  }

  try {
    const { refresh_token } = await exchangeCodeForTokens(code);
    if (!refresh_token) {
      return NextResponse.redirect(new URL("/admin/settings/google-drive?error=no_refresh_token", request.url));
    }
    await saveRefreshToken(refresh_token);
    return NextResponse.redirect(new URL("/admin/settings/google-drive?success=connected", request.url));
  } catch {
    return NextResponse.redirect(new URL("/admin/settings/google-drive?error=token_exchange", request.url));
  }
}
