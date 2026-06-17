import { redirect, notFound } from "next/navigation";
import { revalidateTag } from "next/cache";
import Link from "next/link";
import { ArrowLeft, Save, HardDrive, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/guard";
import { ensureModuleDriveFolder } from "@/lib/admin/actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editează modul — Admin" };

async function saveModule(courseId: string, moduleId: string, formData: FormData) {
  "use server";
  await requireAdmin();
  const db = createAdminClient();

  const title = (formData.get("title") as string).trim();
  const description = (formData.get("description") as string).trim();
  const order_index = Number(formData.get("order_index") ?? 0);

  if (!title) redirect(`/admin/courses/${courseId}/modules/${moduleId}?error=titlu`);

  const { error } = await db.from("modules").update({
    title, description: description || null, order_index,
  }).eq("id", moduleId);

  if (error) redirect(`/admin/courses/${courseId}/modules/${moduleId}?error=salvare`);

  revalidateTag("courses", "max");
  redirect(`/admin/courses/${courseId}`);
}

export default async function EditModulePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; moduleId: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id, moduleId } = await params;
  const { error } = await searchParams;

  const db = createAdminClient();
  const { data: mod } = await db.from("modules").select("*").eq("id", moduleId).single();

  if (!mod) notFound();

  const errorMessages: Record<string, string> = {
    titlu: "Titlul modulului este obligatoriu.",
    salvare: "Eroare la salvare. Încearcă din nou.",
  };

  const saveAction = saveModule.bind(null, id, moduleId);

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 mb-4">
          <Link href={`/admin/courses/${id}`}>
            <ArrowLeft size={16} />
            Înapoi la curs
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Editează modulul</h1>
          {mod.drive_folder_id ? (
            <Button asChild size="sm" className="bg-green-100 hover:bg-green-200 text-green-700 gap-1.5">
              <a href={`https://drive.google.com/drive/folders/${mod.drive_folder_id}`} target="_blank" rel="noreferrer">
                <HardDrive size={14} />
                Drive
                <ExternalLink size={12} />
              </a>
            </Button>
          ) : (
            <form action={ensureModuleDriveFolder.bind(null, moduleId, mod.title, id)}>
              <Button type="submit" size="sm" variant="outline" className="gap-1.5 text-gray-500">
                <HardDrive size={14} />
                Crează folder Drive
              </Button>
            </form>
          )}
        </div>
      </div>

      {error && errorMessages[error] && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {errorMessages[error]}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <form action={saveAction} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Titlul modulului *</Label>
              <Input id="title" name="title" defaultValue={mod.title} required maxLength={120} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Descriere (opțional)</Label>
              <Textarea id="description" name="description" rows={3} defaultValue={mod.description ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order_index">Ordine afișare</Label>
              <Input id="order_index" name="order_index" type="number" min={0} defaultValue={mod.order_index ?? 0} />
            </div>

            <Button type="submit" className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
              <Save size={18} />
              Salvează modificările
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
