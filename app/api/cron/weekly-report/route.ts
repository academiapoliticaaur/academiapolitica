import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHmac } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

function unsubscribeToken(userId: string): string {
  const secret = process.env.CRON_SECRET ?? "fallback-secret";
  const sig = createHmac("sha256", secret).update(userId).digest("hex");
  return Buffer.from(`${userId}:${sig}`).toString("base64url");
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  // Filtrăm doar părinții care au email_reports activ (GDPR Art. 21)
  const { data: parents } = await supabase
    .from("parent_profiles")
    .select("user_id, full_name")
    .eq("email_reports", true);

  if (!parents?.length) return NextResponse.json({ sent: 0 });

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  let sent = 0;

  for (const parent of parents) {
    const { data: authUser } = await supabase.auth.admin.getUserById(parent.user_id);
    const email = authUser?.user?.email;
    if (!email) continue;

    const { data: children } = await supabase
      .from("child_profiles")
      .select("id, display_name")
      .eq("parent_id", parent.user_id);

    if (!children?.length) continue;

    const childIds = children.map((c) => c.id);
    const { data: weekProgress } = await supabase
      .from("progress")
      .select("child_profile_id, lesson_id")
      .in("child_profile_id", childIds)
      .eq("status", "completed")
      .gte("completed_at", monday.toISOString());

    const progressMap: Record<string, number> = {};
    (weekProgress ?? []).forEach((p) => {
      progressMap[p.child_profile_id] = (progressMap[p.child_profile_id] || 0) + 1;
    });

    const totalLessons = Object.values(progressMap).reduce((a, b) => a + b, 0);
    if (totalLessons === 0) continue;

    const childRows = children
      .map((c) => {
        const n = progressMap[c.id] || 0;
        if (n === 0) return "";
        return `<tr><td style="padding:8px 0;font-weight:600">${c.display_name}</td><td style="padding:8px 0;color:#0d9488">✅ ${n} ${n === 1 ? "lecție" : "lecții"}</td></tr>`;
      })
      .filter(Boolean)
      .join("");

    const unsubUrl = `${siteUrl}/api/unsubscribe?token=${unsubscribeToken(parent.user_id)}`;

    const html = `
<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;background:#f9fafb;padding:32px;color:#1f2937">
  <div style="max-width:480px;margin:0 auto;background:white;border-radius:16px;padding:32px;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
    <h1 style="font-size:22px;margin-bottom:4px">Bună ziua, ${parent.full_name}! 👋</h1>
    <p style="color:#6b7280;margin-top:0">Iată rezumatul săptămânii cu Ami &amp; Moti:</p>

    <table width="100%" style="margin:24px 0;border-top:1px solid #f3f4f6;border-collapse:collapse">
      ${childRows}
    </table>

    <p style="color:#374151">Continuați să explorați împreună! 🌟</p>
    <a href="${siteUrl}/dashboard" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#3b82f6;color:white;border-radius:10px;text-decoration:none;font-weight:600">
      Mergi la Dashboard →
    </a>
    <p style="margin-top:32px;font-size:12px;color:#9ca3af;line-height:1.6">
      Ami &amp; Moti · Platformă educațională ·
      <a href="${siteUrl}" style="color:#9ca3af">${siteUrl.replace("https://", "")}</a><br>
      <a href="${unsubUrl}" style="color:#9ca3af;text-decoration:underline">Dezabonare raport săptămânal</a>
    </p>
  </div>
</body>
</html>`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Ami & Moti <noreply@everydai.ro>",
      to: email,
      subject: `📚 Rezumatul săptămânii — ${totalLessons} ${totalLessons === 1 ? "lecție" : "lecții"} completate!`,
      html,
    });
    sent++;
  }

  return NextResponse.json({ sent });
}
