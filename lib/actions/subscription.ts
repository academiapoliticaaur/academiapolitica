"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

export async function cancelSubscription(): Promise<{ error?: string }> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Trebuie să fii autentificat." };

    const adminClient = createAdminClient();

    const { data: profile } = await adminClient
      .from("parent_profiles")
      .select("full_name, subscription_plan, subscription_expires_at")
      .eq("user_id", user.id)
      .single();

    const { error } = await adminClient
      .from("parent_profiles")
      .update({
        subscription_plan: null,
        subscription_expires_at: null,
        subscription_activated_by: null,
      })
      .eq("user_id", user.id);

    if (error) return { error: "Eroare la dezactivarea abonamentului." };

    notifyAdminCancelledSubscription({
      userEmail: user.email ?? "—",
      fullName: profile?.full_name ?? "—",
      plan: profile?.subscription_plan ?? "—",
    }).catch(() => {});

    revalidatePath("/dashboard");
    return {};
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Eroare necunoscută" };
  }
}

async function notifyAdminCancelledSubscription({
  userEmail,
  fullName,
  plan,
}: {
  userEmail: string;
  fullName: string;
  plan: string;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const resend = new Resend(key);

  const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (adminEmails.length === 0) return;

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_SITE_URL ??
    "http://localhost:3000";

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Academia Politica AUR <noreply@academia-aur.ro>",
    to: adminEmails,
    subject: `Abonament anulat — ${fullName} (${userEmail})`,
    html: `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#fef2f2;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef2f2;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#ef4444,#f97316);padding:28px 24px;text-align:center;">
            <div style="color:#ffffff;font-size:22px;font-weight:bold;">Ami &amp; Moti 👧🐱</div>
            <div style="color:#fee2e2;font-size:13px;margin-top:6px;">Abonament anulat de utilizator</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px;">
            <p style="color:#374151;font-size:16px;margin:0 0 16px;">Un utilizator și-a anulat abonamentul:</p>
            <table style="width:100%;border-collapse:collapse;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="padding:11px 14px;background:#f9fafb;font-weight:bold;color:#6b7280;width:120px;border-bottom:1px solid #e5e7eb;">Nume</td>
                <td style="padding:11px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;color:#111827;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding:11px 14px;font-weight:bold;color:#6b7280;border-bottom:1px solid #e5e7eb;">Email</td>
                <td style="padding:11px 14px;border-bottom:1px solid #e5e7eb;"><a href="mailto:${userEmail}" style="color:#ef4444;text-decoration:none;">${userEmail}</a></td>
              </tr>
              <tr>
                <td style="padding:11px 14px;background:#f9fafb;font-weight:bold;color:#6b7280;">Plan anulat</td>
                <td style="padding:11px 14px;background:#f9fafb;color:#111827;">${plan}</td>
              </tr>
            </table>
            <div style="margin-top:24px;text-align:center;">
              <a href="${siteUrl}/admin/subscriptions" style="display:inline-block;background:#ef4444;color:#ffffff;font-weight:bold;font-size:15px;padding:14px 32px;border-radius:999px;text-decoration:none;">
                Vezi în Admin →
              </a>
            </div>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`,
  });
}
