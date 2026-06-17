import { redirect, notFound } from "next/navigation";
import { revalidateTag } from "next/cache";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/guard";
import { deleteCourse } from "@/lib/actions/admin-delete";
import { EditCourseForm } from "./edit-form";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editează curs — Admin" };

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function saveCourse(courseId: string, formData: FormData) {
  "use server";
  await requireAdmin();
  const db = createAdminClient();

  const title = (formData.get("title") as string).trim();
  const description = (formData.get("description") as string).trim();
  const age_group = formData.get("age_group") as string;
  const audience = formData.get("audience") as string;
  const status = formData.get("status") as string;
  const rawSlug = (formData.get("slug") as string).trim();
  const slug = slugify(rawSlug) || slugify(title);
  const order_index = Number(formData.get("order_index") ?? 0);
  const is_demo = formData.get("is_demo") === "1";
  const series_title = (formData.get("series_title") as string).trim() || null;
  const series_slug = series_title ? slugify(series_title) : null;
  const series_order = Number(formData.get("series_order") ?? 1) || 1;

  if (!title || !slug || !age_group) {
    redirect(`/admin/courses/${courseId}/edit?error=campuri`);
  }

  // estimated_duration NU se trimite din formular — se calculează automat
  // din duratele declarate la nivel de lecție (vezi recalculateCourseDuration)
  const { error } = await db.from("courses").update({
    title, slug, description: description || null, age_group, audience, status,
    order_index, is_demo,
  }).eq("id", courseId);

  if (error) redirect(`/admin/courses/${courseId}/edit?error=salvare`);

  // Câmpurile de serie sunt opționale — necesită migrația 013_course_series.sql.
  // Update separat ca eroarea de coloane lipsă să nu blocheze salvarea normală.
  const { error: seriesError } = await db.from("courses").update({
    series_title, series_slug, series_order,
  }).eq("id", courseId);

  revalidateTag("courses", "max");

  if (seriesError) redirect(`/admin/courses/${courseId}/edit?error=serie`);
  redirect(`/admin/courses/${courseId}`);
}

export default async function EditCoursePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const { error } = await searchParams;

  const db = createAdminClient();
  const { data: course } = await db.from("courses").select("*").eq("id", id).single();

  if (!course) notFound();

  const errorMessages: Record<string, string> = {
    campuri: "Completează titlul, slug-ul și grupa de vârstă.",
    salvare: "Eroare la salvare. Încearcă din nou.",
    serie: "Cursul a fost salvat, dar gruparea în serie a eșuat. Aplică migrația 013_course_series.sql în Supabase Dashboard (SQL Editor).",
  };

  const saveAction = saveCourse.bind(null, id);

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-2 mb-4 -ml-2">
          <Link href={`/admin/courses/${id}`}>
            <ArrowLeft size={16} />
            Înapoi la curs
          </Link>
        </Button>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Editează cursul</h1>
          <DeleteButton
            action={deleteCourse.bind(null, id)}
            confirmMessage={`Ștergi cursul "${course.title}"? Se vor șterge toate modulele și lecțiile. Această acțiune este ireversibilă.`}
            redirectTo="/admin/courses"
          />
        </div>
      </div>

      {error && errorMessages[error] && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {errorMessages[error]}
        </div>
      )}

      <EditCourseForm course={course} courseId={id} action={saveAction} />
    </div>
  );
}
