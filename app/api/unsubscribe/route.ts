import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHmac } from "crypto";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");

  if (!token) {
    return new NextResponse(buildHtml("Token lipsă", "Link-ul de dezabonare este invalid.", false), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
      status: 400,
    });
  }

  let userId: string;
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf-8");
    const [id, sig] = decoded.split(":");
    if (!id || !sig || !/^[0-9a-f-]{36}$/i.test(id)) throw new Error("invalid");
    const secret = process.env.CRON_SECRET ?? "fallback-secret";
    const expected = createHmac("sha256", secret).update(id).digest("hex");
    if (sig !== expected) throw new Error("invalid signature");
    userId = id;
  } catch {
    return new NextResponse(buildHtml("Link invalid", "Link-ul de dezabonare nu este valid.", false), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
      status: 400,
    });
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("parent_profiles")
    .update({ email_reports: false })
    .eq("user_id", userId);

  if (error) {
    return new NextResponse(buildHtml("Eroare", "A apărut o eroare. Încearcă din nou sau contactează-ne.", false), {
      headers: { "Content-Type": "text/html; charset=utf-8" },
      status: 500,
    });
  }

  return new NextResponse(
    buildHtml(
      "Dezabonat cu succes",
      "Nu vei mai primi raportul săptămânal Academia Politica AUR. Te poți reabona oricând din profilul tău.",
      true
    ),
    { headers: { "Content-Type": "text/html; charset=utf-8" } }
  );
}

function buildHtml(title: string, message: string, success: boolean): string {
  const color = success ? "#0d9488" : "#dc2626";
  const icon = success ? "✅" : "❌";
  return `<!DOCTYPE html>
<html lang="ro">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title} — Academia Politica AUR</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:Arial,sans-serif;min-height:100vh;display:flex;align-items:center;justify-content:center;">
  <div style="max-width:420px;width:90%;background:#fff;border-radius:16px;padding:40px 32px;box-shadow:0 4px 24px rgba(0,0,0,0.08);text-align:center;">
    <div style="font-size:52px;margin-bottom:16px;">${icon}</div>
    <h1 style="font-size:22px;color:${color};margin:0 0 12px;">${title}</h1>
    <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 28px;">${message}</p>
    <a href="/" style="display:inline-block;background:#3b82f6;color:#fff;text-decoration:none;padding:12px 28px;border-radius:10px;font-weight:600;font-size:14px;">
      Înapoi la Academia Politica AUR
    </a>
  </div>
</body>
</html>`;
}
