import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const parentRoutes = ["/dashboard"];
  const adminRoutes = ["/admin"];
  const childRoutes = ["/child"];

  const isProtected =
    parentRoutes.some((r) => pathname.startsWith(r)) ||
    adminRoutes.some((r) => pathname.startsWith(r)) ||
    childRoutes.some((r) => pathname.startsWith(r));

  if (isProtected && !user) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Verificare email admin pentru rutele admin
  const isAdminRoute = pathname.startsWith("/admin");
  const isMfaPage = pathname.startsWith("/admin/mfa-setup") || pathname.startsWith("/admin/mfa-verify");

  if (user && isAdminRoute && !isMfaPage) {
    const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
    const isAdmin = adminEmails.includes(user.email ?? "") || user.app_metadata?.role === "admin";
    if (!isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (user && isAdminRoute && !isMfaPage) {
    const { data: aal, error: aalError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (!aalError && aal) {
      const needsMfaVerify = aal.nextLevel === "aal2" && aal.currentLevel !== "aal2";
      const needsMfaSetup = aal.nextLevel !== "aal2" && aal.currentLevel !== "aal2";

      if (needsMfaVerify) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/admin/mfa-verify";
        return NextResponse.redirect(redirectUrl);
      }

      if (needsMfaSetup) {
        const redirectUrl = request.nextUrl.clone();
        redirectUrl.pathname = "/admin/mfa-setup";
        return NextResponse.redirect(redirectUrl);
      }
    }
  }

  return supabaseResponse;
}
