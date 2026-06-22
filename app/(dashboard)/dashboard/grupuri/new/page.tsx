import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AcademiaGuide } from "@/components/common/academia-guide";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Grup nou — Academia Politica AUR" };

async function createClass(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = (formData.get("name") as string).trim();
  const grade = (formData.get("grade") as string).trim();
  const school_year = (formData.get("school_year") as string).trim();
  const access_code = (formData.get("access_code") as string).trim().toUpperCase();

  if (!name || !access_code || !school_year) {
    redirect("/dashboard/grupuri/new?error=campuri_obligatorii");
  }

  if (!/^[A-Z0-9]{4,12}$/.test(access_code)) {
    redirect("/dashboard/grupuri/new?error=cod_invalid");
  }

  const db = createAdminClient();
  const { error } = await db.from("classes").insert({
    teacher_id: user.id,
    name,
    grade: grade || null,
    school_year,
    access_code,
    status: "active",
  });

  if (error) {
    if (error.code === "23505") {
      redirect("/dashboard/grupuri/new?error=cod_existent");
    }
    redirect("/dashboard/grupuri/new?error=eroare_server");
  }

  redirect("/dashboard/grupuri");
}

export default async function NewClassPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await searchParams;

  const errorMessages: Record<string, string> = {
    campuri_obligatorii: "Completează toate câmpurile obligatorii.",
    cod_invalid: "Codul grupului trebuie să aibă 4–12 caractere (litere mari și cifre).",
    cod_existent: "Acest cod de grup există deja. Alege un cod unic.",
    eroare_server: "Eroare de server. Încearcă din nou.",
  };

  const currentYear = new Date().getFullYear();
  const defaultYear = `${currentYear}-${currentYear + 1}`;

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href="/dashboard/grupuri" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} />
          Înapoi la grupuri
        </Link>
        <h1 className="text-2xl font-bold">Grup nou</h1>
        <p className="text-gray-500 text-sm mt-1">Creează un grup de formare și invită participanții cu codul de acces.</p>
      </div>

      {error && errorMessages[error] && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {errorMessages[error]}
        </div>
      )}

      <AcademiaGuide
        variant="info"
        className="mb-6"
        message="Codul de acces este cheia grupului tău! Alege ceva ușor de memorat — de exemplu GRUP1AUR sau FORM2025. Îl comunici participanților, iar aceștia intră instant fără cont."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalii grup</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createClass} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Numele grupului <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                placeholder="ex. Formare politică — Iași 2025"
                required
                maxLength={60}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="grade">Nivel (opțional)</Label>
                <Input
                  id="grade"
                  name="grade"
                  placeholder="ex. Introductiv"
                  maxLength={20}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="school_year">
                  An formare <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="school_year"
                  name="school_year"
                  defaultValue={defaultYear}
                  placeholder="2025-2026"
                  required
                  maxLength={10}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="access_code">
                Cod de acces <span className="text-red-500">*</span>
              </Label>
              <Input
                id="access_code"
                name="access_code"
                placeholder="ex. GRUP1AUR"
                required
                maxLength={12}
                className="font-mono uppercase"
              />
              <p className="text-xs text-gray-400">
                4–12 caractere, litere mari și cifre. Participanții vor folosi acest cod pentru a intra în grup.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Creează grupul
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/dashboard/grupuri">Anulează</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
