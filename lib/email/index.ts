import { Resend } from "resend";

// Inițializare lazy — evitare eroare la build fără RESEND_API_KEY
function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY lipsă din variabilele de mediu.");
  return new Resend(key);
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export async function sendDiplomaEmail({
  parentEmail,
  parentName,
  childName,
  courseName,
  diplomaUrl,
  totalPoints,
}: {
  parentEmail: string;
  parentName: string;
  childName: string;
  courseName: string;
  diplomaUrl: string;
  totalPoints: number;
}) {
  const fullDiplomaUrl = diplomaUrl.startsWith("http") ? diplomaUrl : `${siteUrl}${diplomaUrl}`;

  const resend = getResend();
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "Academia Politica AUR <noreply@academia-aur.ro>",
    to: parentEmail,
    subject: `🎓 ${childName} a finalizat cursul "${courseName}"!`,
    html: diplomaEmailHtml({ parentName, childName, courseName, diplomaUrl: fullDiplomaUrl, totalPoints }),
  });
}

export async function sendSubscriptionRequestToAdmin({
  adminEmail,
  userName,
  userEmail,
  plan,
}: {
  adminEmail: string;
  userName: string;
  userEmail: string;
  plan: string;
}) {
  const resend = getResend();
  const planLabels: Record<string, string> = {
    monthly: "30 zile (lunar)",
    quarterly: "90 zile (trimestrial)",
    annual: "365 zile (anual)",
  };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? siteUrl;
  await resend.emails.send({
    from: process.env.EMAIL_FROM || "Academia Politica AUR <noreply@academia-aur.ro>",
    to: adminEmail,
    subject: `Cerere abonament nouă — ${userName}`,
    html: `<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"></head>
<body style="font-family:sans-serif;background:#f9fafb;padding:32px;color:#1f2937">
  <div style="max-width:480px;margin:0 auto;background:white;border-radius:16px;padding:32px;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
    <h1 style="font-size:20px;margin-bottom:8px">Cerere abonament nouă</h1>
    <p style="color:#6b7280;margin-bottom:16px">Un utilizator a solicitat activarea unui abonament.</p>
    <table style="width:100%;border-collapse:collapse;margin-bottom:24px">
      <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Utilizator:</td><td style="padding:6px 0;font-weight:600">${userName}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Email:</td><td style="padding:6px 0">${userEmail}</td></tr>
      <tr><td style="padding:6px 0;color:#6b7280;font-size:14px">Plan solicitat:</td><td style="padding:6px 0;font-weight:600;color:#0f766e">${planLabels[plan] ?? plan}</td></tr>
    </table>
    <a href="${appUrl}/admin/approvals" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:white;border-radius:10px;text-decoration:none;font-weight:600">
      Procesează cererea →
    </a>
    <p style="margin-top:32px;font-size:12px;color:#9ca3af">Academia Politica AUR · Platformă educațională</p>
  </div>
</body></html>`,
  });
}

export async function sendSubscriptionResponseEmail({
  userEmail,
  userName,
  approved,
  plan,
}: {
  userEmail: string;
  userName: string;
  approved: boolean;
  plan?: string;
}) {
  const resend = getResend();
  const planLabels: Record<string, string> = {
    monthly: "30 zile (lunar)",
    quarterly: "90 zile (trimestrial)",
    annual: "365 zile (anual)",
  };
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? siteUrl;
  const subject = approved
    ? "Abonamentul tău Academia Politica AUR a fost activat!"
    : "Cererea ta de abonament a fost respinsă";
  const html = approved
    ? `<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"></head>
<body style="font-family:sans-serif;background:#f0fdfa;padding:32px;color:#1f2937">
  <div style="max-width:480px;margin:0 auto;background:white;border-radius:16px;padding:32px;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
    <h1 style="font-size:22px;margin-bottom:8px">Bună, ${userName}! 🎉</h1>
    <p style="color:#6b7280;margin-bottom:8px">Abonamentul tău a fost activat de un administrator.</p>
    <p style="color:#6b7280;margin-bottom:24px">Plan activ: <strong style="color:#0f766e">${planLabels[plan ?? ""] ?? plan}</strong></p>
    <a href="${appUrl}/dashboard" style="display:inline-block;padding:12px 24px;background:#0f766e;color:white;border-radius:10px;text-decoration:none;font-weight:600">
      Intră în cont →
    </a>
    <p style="margin-top:32px;font-size:12px;color:#9ca3af">Academia Politica AUR · Platformă educațională</p>
  </div>
</body></html>`
    : `<!DOCTYPE html><html lang="ro"><head><meta charset="UTF-8"></head>
<body style="font-family:sans-serif;background:#f9fafb;padding:32px;color:#1f2937">
  <div style="max-width:480px;margin:0 auto;background:white;border-radius:16px;padding:32px;box-shadow:0 1px 4px rgba(0,0,0,0.08)">
    <h1 style="font-size:22px;margin-bottom:8px">Bună, ${userName}!</h1>
    <p style="color:#6b7280;margin-bottom:24px">Din păcate, cererea ta de abonament nu a putut fi aprobată în acest moment. Contactează administratorul pentru mai multe detalii.</p>
    <a href="${appUrl}/dashboard" style="display:inline-block;padding:12px 24px;background:#3b82f6;color:white;border-radius:10px;text-decoration:none;font-weight:600">
      Înapoi la dashboard →
    </a>
    <p style="margin-top:32px;font-size:12px;color:#9ca3af">Academia Politica AUR · Platformă educațională</p>
  </div>
</body></html>`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "Academia Politica AUR <noreply@academia-aur.ro>",
    to: userEmail,
    subject,
    html,
  });
}

function diplomaEmailHtml({
  parentName,
  childName,
  courseName,
  diplomaUrl,
  totalPoints,
}: {
  parentName: string;
  childName: string;
  courseName: string;
  diplomaUrl: string;
  totalPoints: number;
}) {
  return `<!DOCTYPE html>
<html lang="ro">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f0fdfa;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0fdfa;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#0f766e,#0ea5e9);padding:32px 24px;text-align:center;">
            <div style="font-size:48px;margin-bottom:8px;">🌟</div>
            <div style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:1px;">Academia Politica AUR</div>
            <div style="color:#99f6e4;font-size:14px;margin-top:4px;">Platforma educațională pentru copii</div>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px 28px;">
            <p style="color:#374151;font-size:16px;margin:0 0 12px;">Dragă ${parentName},</p>
            <p style="color:#374151;font-size:16px;margin:0 0 24px;line-height:1.6;">
              Îți aducem o veste minunată! <strong>${childName}</strong> a finalizat cu succes cursul
              <strong>"${courseName}"</strong> și a obținut diploma de absolvire! 🎉
            </p>

            <!-- Diploma card -->
            <div style="background:linear-gradient(135deg,#fef9c3,#fef3c7);border:2px solid #f59e0b;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
              <div style="font-size:48px;margin-bottom:12px;">🏆</div>
              <div style="font-size:20px;font-weight:bold;color:#92400e;margin-bottom:6px;">${childName}</div>
              <div style="font-size:14px;color:#78350f;margin-bottom:16px;">a absolvit cursul „${courseName}"</div>
              <div style="display:inline-block;background:#f59e0b;color:#ffffff;font-weight:bold;padding:6px 18px;border-radius:999px;font-size:14px;">
                ⭐ ${totalPoints} XP acumulați
              </div>
            </div>

            <!-- CTA Button -->
            <div style="text-align:center;margin-bottom:28px;">
              <a href="${diplomaUrl}"
                style="display:inline-block;background:#0f766e;color:#ffffff;font-weight:bold;font-size:16px;padding:14px 32px;border-radius:999px;text-decoration:none;">
                🎓 Vezi diploma de absolvire
              </a>
            </div>

            <p style="color:#6b7280;font-size:14px;margin:0 0 8px;line-height:1.6;">
              Felicitări ${childName}! Dedicarea și efortul depus merită toată aprecierea.
              Continuați împreună această aventură a cunoașterii! 🚀
            </p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 28px;text-align:center;">
            <p style="color:#9ca3af;font-size:12px;margin:0;">
              Academia Politica AUR — Platforma educațională pentru copii de 0–8 ani<br>
              Psiholog Ionela Pandilică
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
