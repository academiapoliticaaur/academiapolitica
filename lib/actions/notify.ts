"use server";

import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  formator: "Formator (cl. 0–4)",
  profesor: "Profesor gimnaziu (cl. 5–8)",
};

export async function notifyAdminNewTeacher({
  fullName,
  email,
  accountType,
}: {
  fullName: string;
  email: string;
  accountType: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const adminEmails = (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);
  if (adminEmails.length === 0) return;

  const siteUrl = getSiteUrl();
  const approvalUrl = `${siteUrl}/admin/approvals`;
  const typeLabel = ACCOUNT_TYPE_LABELS[accountType] ?? accountType;

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Academia Politica AUR <noreply@academia-aur.ro>",
    to: adminEmails,
    subject: `Cont nou de aprobat — ${fullName} (${typeLabel})`,
    html: buildAdminNotifyHtml({ fullName, email, typeLabel, approvalUrl, siteUrl }),
  });
}

export async function sendWelcomeEmail({
  fullName,
  email,
  accountType,
}: {
  fullName: string;
  email: string;
  accountType: string;
}): Promise<void> {
  const resend = getResend();
  if (!resend) return;

  const siteUrl = getSiteUrl();
  const dashboardUrl = `${siteUrl}/dashboard`;
  const isTeacher = accountType === "formator" || accountType === "lector";
  const typeLabel = ACCOUNT_TYPE_LABELS[accountType] ?? null;

  await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "Academia Politica AUR <noreply@academia-aur.ro>",
    to: email,
    subject: `Bun venit pe Academia Politica AUR, ${fullName.split(" ")[0]}!`,
    html: buildWelcomeHtml({ fullName, dashboardUrl, siteUrl, isTeacher, typeLabel }),
  });
}

function buildWelcomeHtml({
  fullName,
  dashboardUrl,
  siteUrl,
  isTeacher,
  typeLabel,
}: {
  fullName: string;
  dashboardUrl: string;
  siteUrl: string;
  isTeacher: boolean;
  typeLabel: string | null;
}) {
  const firstName = fullName.split(" ")[0];
  const teacherNote = isTeacher
    ? `<tr><td style="padding:16px 28px;">
        <div style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;padding:16px;">
          <p style="color:#92400e;font-size:14px;margin:0;">
            <strong>⏳ Contul necesită aprobare</strong><br/>
            Ca ${typeLabel}, contul tău va fi verificat de un administrator.
            Vei primi un email de confirmare când accesul este activat.
          </p>
        </div>
      </td></tr>`
    : "";

  return `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#eff6ff;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#a855f7);padding:28px 24px;text-align:center;">
            <div style="color:#ffffff;font-size:30px;margin-bottom:6px;">👧🐱</div>
            <div style="color:#ffffff;font-size:22px;font-weight:bold;">Bun venit pe Ami &amp; Moti!</div>
            <div style="color:#e0e7ff;font-size:13px;margin-top:6px;">Platformă educațională pentru copii</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 28px 8px;">
            <p style="color:#374151;font-size:16px;margin:0 0 16px;">
              Bună, <strong>${firstName}</strong>! 🎉
            </p>
            <p style="color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 20px;">
              Contul tău a fost creat cu succes. Acum poți accesa platforma și descoperi cursurile noastre interactive pentru copii.
            </p>
            <div style="text-align:center;margin-bottom:24px;">
              <a href="${dashboardUrl}" style="display:inline-block;background:#6366f1;color:#ffffff;font-weight:bold;font-size:15px;padding:14px 32px;border-radius:999px;text-decoration:none;">
                Accesează contul meu →
              </a>
            </div>
          </td>
        </tr>
        ${teacherNote}
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:14px 28px;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">
              Ami &amp; Moti · <a href="${siteUrl}" style="color:#6366f1;text-decoration:none;">Platformă educațională</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildAdminNotifyHtml({
  fullName,
  email,
  typeLabel,
  approvalUrl,
  siteUrl,
}: {
  fullName: string;
  email: string;
  typeLabel: string;
  approvalUrl: string;
  siteUrl: string;
}) {
  return `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#eff6ff;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#eff6ff;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">
        <tr>
          <td style="background:linear-gradient(135deg,#6366f1,#a855f7);padding:28px 24px;text-align:center;">
            <div style="color:#ffffff;font-size:22px;font-weight:bold;">Ami &amp; Moti 👧🐱</div>
            <div style="color:#e0e7ff;font-size:13px;margin-top:6px;">Cont nou de formator — necesită aprobare</div>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 28px 8px;">
            <p style="color:#374151;font-size:16px;margin:0 0 20px;">
              Un formator și-a creat cont și așteaptă aprobare:
            </p>
            <table style="width:100%;border-collapse:collapse;margin-bottom:28px;border-radius:8px;overflow:hidden;">
              <tr>
                <td style="padding:11px 14px;background:#f9fafb;font-weight:bold;color:#6b7280;width:120px;border-bottom:1px solid #e5e7eb;">Nume</td>
                <td style="padding:11px 14px;background:#f9fafb;border-bottom:1px solid #e5e7eb;color:#111827;">${fullName}</td>
              </tr>
              <tr>
                <td style="padding:11px 14px;font-weight:bold;color:#6b7280;border-bottom:1px solid #e5e7eb;">Email</td>
                <td style="padding:11px 14px;border-bottom:1px solid #e5e7eb;"><a href="mailto:${email}" style="color:#6366f1;text-decoration:none;">${email}</a></td>
              </tr>
              <tr>
                <td style="padding:11px 14px;background:#f9fafb;font-weight:bold;color:#6b7280;">Tip cont</td>
                <td style="padding:11px 14px;background:#f9fafb;color:#111827;">${typeLabel}</td>
              </tr>
            </table>
            <div style="text-align:center;margin-bottom:28px;">
              <a href="${approvalUrl}" style="display:inline-block;background:#6366f1;color:#ffffff;font-weight:bold;font-size:15px;padding:14px 32px;border-radius:999px;text-decoration:none;">
                Aprobă contul în Admin →
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:14px 28px;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">
              Ami &amp; Moti · <a href="${siteUrl}" style="color:#6366f1;text-decoration:none;">Platformă educațională</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
