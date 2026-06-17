import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { updateParentProfile, updateParentPassword } from "@/lib/actions/parent-profile";
import { DeleteAccountButton } from "@/components/dashboard/delete-account-button";
import { EmailReportsToggle } from "@/components/dashboard/email-reports-toggle";
import { AcademiaGuide } from "@/components/common/academia-guide";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profilul meu" };

export default async function ParentProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("parent_profiles")
    .select("full_name, email_reports")
    .eq("user_id", user.id)
    .single();

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  return (
    <div className="max-w-md mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/dashboard" className="text-sm text-gray-400 hover:text-blue-500">← Înapoi la dashboard</Link>
        <h1 className="text-2xl font-bold mt-2">Profilul meu</h1>
        <p className="text-gray-500 text-sm mt-1">Modifică datele contului tău</p>
      </div>

      {/* Date de bază */}
      <div className="bg-white rounded-xl border p-5 mb-5">
        <h2 className="font-semibold mb-4">Informații personale</h2>
        <form action={updateParentProfile} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Numele tău</Label>
            <Input
              id="full_name"
              name="full_name"
              defaultValue={profile?.full_name || ""}
              required
              minLength={2}
              maxLength={80}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Adresa de email</Label>
            <Input value={user.email || ""} disabled className="bg-gray-50 text-gray-400" />
            <p className="text-xs text-gray-400">Emailul nu poate fi modificat din aplicație.</p>
          </div>
          <Button type="submit" className="bg-blue-100 hover:bg-blue-200 text-blue-700 w-full">
            Salvează numele
          </Button>
        </form>
      </div>

      {/* Schimbare parolă */}
      <div className="bg-white rounded-xl border p-5 mb-5">
        <h2 className="font-semibold mb-4">Schimbă parola</h2>
        <form action={updateParentPassword} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="new_password">Parola nouă</Label>
            <Input
              id="new_password"
              name="new_password"
              type="password"
              required
              minLength={6}
              placeholder="Minim 6 caractere"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">Confirmă parola</Label>
            <Input
              id="confirm_password"
              name="confirm_password"
              type="password"
              required
              minLength={6}
              placeholder="Repetă parola nouă"
            />
          </div>
          <Button type="submit" variant="outline" className="w-full">
            Schimbă parola
          </Button>
        </form>
      </div>

      {/* Notificări — GDPR Art. 21 */}
      <div className="bg-white rounded-xl border p-5 mb-5">
        <h2 className="font-semibold mb-1">Notificări email</h2>
        <p className="text-xs text-gray-500 mb-4">
          Controlează ce emailuri primești de la Ami &amp; Moti.
        </p>
        <EmailReportsToggle enabled={profile?.email_reports ?? true} />
      </div>

      {/* Export date — GDPR Art. 20 */}
      <div className="bg-white rounded-xl border p-5 mb-5">
        <h2 className="font-semibold mb-1">Datele mele</h2>
        <p className="text-xs text-gray-500 mb-4">
          Conform GDPR Art. 20, poți descărca toate datele pe care le deținem despre tine.
        </p>
        <a
          href={`${siteUrl}/api/export-my-data`}
          download="datele-mele-academia-aur.json"
          className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 underline"
        >
          ⬇️ Descarcă datele mele (JSON)
        </a>
      </div>

      <AcademiaGuide
        variant="info"
        className="mb-5"
        message="Datele tale și ale copiilor sunt stocate securizat, conform GDPR. Poți exporta toate datele oricând sau solicita ștergerea completă a contului. Controlul este 100% al tău."
      />

      {/* Zonă periculoasă — GDPR Art. 17 */}
      <div className="bg-white rounded-xl border border-red-100 p-5">
        <h2 className="font-semibold text-red-700 mb-1">Zonă periculoasă</h2>
        <p className="text-xs text-gray-500 mb-4">
          Ștergerea contului este permanentă și ireversibilă. Se vor șterge toate
          profilurile copiilor, progresul, certificatele și datele contului tău.
        </p>
        <DeleteAccountButton />
      </div>
    </div>
  );
}
