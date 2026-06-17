import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/guard";
import { SubscriptionPanel } from "@/components/admin/subscription-panel";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editează formator — Admin" };

async function saveTeacher(userId: string, formData: FormData) {
  "use server";
  await requireAdmin();
  const db = createAdminClient();
  const fullName = (formData.get("full_name") as string).trim();
  const email = (formData.get("email") as string).trim();
  const accountType = formData.get("account_type") as string;
  const from = formData.get("from") as string | null;
  const safeFrom = from?.startsWith("/admin/") ? from : null;
  const fromParam = safeFrom ? `&from=${encodeURIComponent(safeFrom)}` : "";

  if (!fullName || !email) redirect(`/admin/teachers/${userId}/edit?error=campuri${fromParam}`);
  if (!["formator", "lector"].includes(accountType)) redirect(`/admin/teachers/${userId}/edit?error=tip${fromParam}`);

  const [profileRes, authRes] = await Promise.all([
    db.from("parent_profiles").update({ full_name: fullName, account_type: accountType }).eq("user_id", userId),
    db.auth.admin.updateUserById(userId, { email }),
  ]);

  if (profileRes.error || authRes.error) {
    redirect(`/admin/teachers/${userId}/edit?error=salvare${fromParam}`);
  }

  if (safeFrom) redirect(safeFrom);
  redirect("/admin/teachers");
}

export default async function EditTeacherPage({
  params,
  searchParams,
}: {
  params: Promise<{ userId: string }>;
  searchParams: Promise<{ error?: string; from?: string }>;
}) {
  const { userId } = await params;
  const { error, from } = await searchParams;
  const backUrl = from?.startsWith("/admin/") ? from : "/admin/teachers";

  const db = createAdminClient();

  const [{ data: profile }, { data: authUser, error: authError }] = await Promise.all([
    db.from("parent_profiles").select("full_name, account_type, approved, subscription_plan, subscription_expires_at").eq("user_id", userId).single(),
    db.auth.admin.getUserById(userId),
  ]);

  if (!profile || authError) notFound();

  const email = authUser.user?.email ?? "";

  const errorMessages: Record<string, string> = {
    campuri: "Completează toate câmpurile obligatorii.",
    tip: "Tipul de cont selectat nu este valid.",
    salvare: "Eroare la salvare. Încearcă din nou.",
  };

  const saveAction = saveTeacher.bind(null, userId);

  return (
    <div className="max-w-lg space-y-6">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 mb-4">
        <Link href={backUrl}>
          <ArrowLeft size={16} />
          Înapoi
        </Link>
      </Button>

      {error && errorMessages[error] && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {errorMessages[error]}
        </div>
      )}

      <SubscriptionPanel
        userId={userId}
        subscriptionPlan={profile.subscription_plan ?? null}
        subscriptionExpiresAt={profile.subscription_expires_at ?? null}
      />

      <Card>
        <CardHeader>
          <CardTitle>Editează formator</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={saveAction} className="space-y-4">
            {from && <input type="hidden" name="from" value={from} />}
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Nume complet</Label>
              <Input
                id="full_name"
                name="full_name"
                defaultValue={profile.full_name ?? ""}
                required
                maxLength={100}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={email}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Tip cont</Label>
              <div className="grid gap-2">
                {[
                  { value: "formator", label: "🌈 Formator", desc: "Clasele 0–4 — Ciclul primar" },
                  { value: "lector", label: "🚀 Profesor gimnaziu", desc: "Clasele 5–8 — Ciclul gimnazial" },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      profile.account_type === opt.value
                        ? "border-indigo-400 bg-indigo-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="account_type"
                      value={opt.value}
                      defaultChecked={profile.account_type === opt.value}
                      className="accent-indigo-600"
                    />
                    <div>
                      <p className="text-sm font-medium">{opt.label}</p>
                      <p className="text-xs text-gray-500">{opt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-blue-100 hover:bg-blue-200 text-blue-700">
                Salvează modificările
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={backUrl}>Anulează</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
