import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  // Găsim conturi cu abonament care expiră în 1-7 zile
  const now = new Date();
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const in1Day  = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000);

  const { data: expiring } = await supabase
    .from("parent_profiles")
    .select("user_id, full_name, subscription_plan, subscription_expires_at")
    .not("subscription_expires_at", "is", null)
    .gte("subscription_expires_at", now.toISOString())
    .lte("subscription_expires_at", in7Days.toISOString());

  if (!expiring?.length) return NextResponse.json({ sent: 0 });

  let sent = 0;

  for (const profile of expiring) {
    const { data: authUser } = await supabase.auth.admin.getUserById(profile.user_id);
    const email = authUser?.user?.email;
    if (!email) continue;

    const expiresAt = new Date(profile.subscription_expires_at!);
    const daysLeft = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    // Trimitem doar la 7 zile și 1 zi înainte (evităm spam zilnic)
    const sendToday = daysLeft <= 1 || (daysLeft <= 7 && expiresAt.getDate() === in7Days.getDate());
    if (!sendToday) continue;

    const expiryFormatted = expiresAt.toLocaleDateString("ro-RO", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const urgentBg = daysLeft <= 1 ? "#fef2f2" : "#fffbeb";
    const urgentBorder = daysLeft <= 1 ? "#fca5a5" : "#fcd34d";
    const urgentText = daysLeft <= 1
      ? `Abonamentul tău <strong>expiră mâine</strong> (${expiryFormatted}).`
      : `Abonamentul tău expiră în <strong>${daysLeft} zile</strong> (${expiryFormatted}).`;

    const html = `
<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="font-family:sans-serif;background:#f9fafb;padding:32px;color:#1f2937">
  <div style="max-width:480px;margin:0 auto;background:white;border-radius:16px;padding:32px;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
    <h1 style="font-size:22px;margin-bottom:4px">Bună, ${profile.full_name}! 👋</h1>
    <p style="color:#6b7280;margin-top:0">Ai un mesaj important despre contul tău Ami &amp; Moti.</p>

    <div style="background:${urgentBg};border:1px solid ${urgentBorder};border-radius:12px;padding:16px;margin:24px 0">
      <p style="margin:0;font-size:15px">${urgentText}</p>
    </div>

    <p style="color:#374151">
      Pentru a continua accesul la toate cursurile și pentru a nu întrerupe progresul copiilor tăi,
      reactivează abonamentul accesând platforma sau contactând echipa noastră.
    </p>

    <a href="${siteUrl}/dashboard" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#3b82f6;color:white;border-radius:10px;text-decoration:none;font-weight:600">
      Mergi la Dashboard →
    </a>
    <a href="${siteUrl}/help" style="display:inline-block;margin-top:12px;margin-left:12px;padding:12px 24px;background:#f3f4f6;color:#374151;border-radius:10px;text-decoration:none;font-weight:600">
      Contactează-ne
    </a>

    <p style="margin-top:32px;font-size:12px;color:#9ca3af;line-height:1.6">
      Ami &amp; Moti · Platformă educațională ·
      <a href="${siteUrl}" style="color:#9ca3af">${siteUrl.replace("https://", "")}</a>
    </p>
  </div>
</body>
</html>`;

    const subject = daysLeft <= 1
      ? "⚠️ Abonamentul Ami & Moti expiră mâine"
      : `⏰ Abonamentul Ami & Moti expiră în ${daysLeft} zile`;

    await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Ami & Moti <noreply@everydai.ro>",
      to: email,
      subject,
      html,
    });
    sent++;
  }

  return NextResponse.json({ sent, checked: expiring.length });
}
