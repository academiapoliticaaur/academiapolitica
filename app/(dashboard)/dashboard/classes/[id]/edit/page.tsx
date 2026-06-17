import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editează clasa — Ami & Moti" };

async function updateClass(classId: string, formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = (formData.get("name") as string).trim();
  const grade = (formData.get("grade") as string).trim();
  const school_year = (formData.get("school_year") as string).trim();
  const access_code = (formData.get("access_code") as string).trim().toUpperCase();

  if (!name || !school_year || !access_code) {
    redirect(`/dashboard/classes/${classId}/edit?error=campuri_obligatorii`);
  }
  if (!/^[A-Z0-9]{4,12}$/.test(access_code)) {
    redirect(`/dashboard/classes/${classId}/edit?error=cod_invalid`);
  }

  const db = createAdminClient();
  const { error } = await db
    .from("classes")
    .update({ name, grade: grade || null, school_year, access_code })
    .eq("id", classId)
    .eq("teacher_id", user.id);

  if (error?.code === "23505") {
    redirect(`/dashboard/classes/${classId}/edit?error=cod_existent`);
  }

  redirect(`/dashboard/classes/${classId}`);
}

async function deleteClass(classId: string) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  // Verify ownership before delete (cascade handles students/courses/progress)
  const { data: cls } = await db
    .from("classes")
    .select("id")
    .eq("id", classId)
    .eq("teacher_id", user.id)
    .single();
  if (!cls) redirect("/dashboard/classes");

  await db.from("classes").delete().eq("id", classId);
  redirect("/dashboard/classes");
}

export default async function EditClassPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { error } = await searchParams;

  const db = createAdminClient();
  const { data: cls } = await db
    .from("classes")
    .select("*")
    .eq("id", id)
    .eq("teacher_id", user.id)
    .single();

  if (!cls) notFound();

  const errorMessages: Record<string, string> = {
    campuri_obligatorii: "Completează toate câmpurile obligatorii.",
    cod_invalid: "Codul clasei trebuie să aibă 4–12 caractere (litere mari și cifre).",
    cod_existent: "Acest cod de clasă există deja. Alege un cod unic.",
  };

  const updateClassAction = updateClass.bind(null, id);
  const deleteClassAction = deleteClass.bind(null, id);

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <Link href={`/dashboard/classes/${id}`} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} />
          Înapoi la clasă
        </Link>
        <h1 className="text-2xl font-bold">Editează clasa</h1>
      </div>

      {error && errorMessages[error] && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
          {errorMessages[error]}
        </div>
      )}

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Detalii clasă</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateClassAction} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="name">Numele clasei <span className="text-red-500">*</span></Label>
              <Input id="name" name="name" defaultValue={cls.name} required maxLength={60} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="grade">Clasa (an de studiu)</Label>
                <Input id="grade" name="grade" defaultValue={cls.grade ?? ""} maxLength={5} placeholder="ex. 3" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="school_year">An școlar <span className="text-red-500">*</span></Label>
                <Input id="school_year" name="school_year" defaultValue={cls.school_year} required maxLength={10} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="access_code">Cod de acces <span className="text-red-500">*</span></Label>
              <Input
                id="access_code"
                name="access_code"
                defaultValue={cls.access_code}
                required
                maxLength={12}
                className="font-mono uppercase"
              />
              <p className="text-xs text-gray-400">4–12 caractere, litere mari și cifre.</p>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Salvează modificările
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href={`/dashboard/classes/${id}`}>Anulează</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Delete zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-base text-red-700">Șterge clasa</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Ștergerea clasei este permanentă. Se vor șterge toți elevii și progresul lor din această clasă.
          </p>
          <form action={deleteClassAction}>
            <Button type="submit" variant="outline" className="gap-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-500">
              <Trash2 size={15} />
              Șterge clasa definitiv
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
