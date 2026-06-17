"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactResult {
  success: boolean;
  error?: string;
}

export async function sendContactEmail(formData: FormData): Promise<ContactResult> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !message) {
    return { success: false, error: "Completează toate câmpurile." };
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Adresa de email nu este validă." };
  }

  if (message.length < 10) {
    return { success: false, error: "Mesajul este prea scurt." };
  }

  const adminEmail = process.env.ADMIN_EMAIL || "mpandilica@yahoo.com";

  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM || "Ami & Moti <noreply@everydai.ro>",
    to: adminEmail,
    replyTo: email,
    subject: `Mesaj nou de la ${name} — suport@amisimoti.ro`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3b82f6;">Mesaj nou prin formularul de contact</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px; font-weight: bold; color: #6b7280; width: 120px;">Nume:</td>
            <td style="padding: 8px;">${name}</td>
          </tr>
          <tr style="background: #f9fafb;">
            <td style="padding: 8px; font-weight: bold; color: #6b7280;">Email:</td>
            <td style="padding: 8px;"><a href="mailto:${email}">${email}</a></td>
          </tr>
        </table>
        <div style="background: #f3f4f6; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 4px;">
          <p style="margin: 0; white-space: pre-wrap;">${message}</p>
        </div>
        <p style="color: #9ca3af; font-size: 12px; margin-top: 24px;">
          Mesaj primit prin suport@amisimoti.ro — platforma Ami &amp; Moti
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Contact email error:", error);
    return { success: false, error: "Eroare la trimiterea mesajului. Încearcă din nou." };
  }

  return { success: true };
}
