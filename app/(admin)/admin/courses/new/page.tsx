"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { courseSchema, type CourseFormData } from "@/lib/validation/schemas";
import { ensureCourseDriveFolder } from "@/lib/admin/actions";

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

export default function NewCoursePage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: { status: "draft", order_index: 0 },
  });

  const onSubmit = (data: CourseFormData) => {
    setServerError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { data: created, error } = await supabase
        .from("courses")
        .insert({
          title: data.title,
          slug: data.slug,
          description: data.description,
          age_group: data.age_group,
          audience: data.audience ?? "children",
          status: data.status ?? "draft",
          estimated_duration: data.estimated_duration ?? null,
          order_index: data.order_index ?? 0,
        })
        .select()
        .single();

      if (error) {
        setServerError("Eroare la crearea cursului: " + error.message);
        return;
      }

      // Crează folder Drive în background (fire-and-forget)
      ensureCourseDriveFolder(created.id, data.title).catch(() => {});
      router.push(`/admin/courses/${created.id}`);
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-2 mb-4 -ml-2">
          <Link href="/admin/courses">
            <ArrowLeft size={16} />
            Înapoi la cursuri
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Curs nou</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="title">Titlul cursului *</Label>
              <Input
                id="title"
                placeholder="ex: Atelierul de zâmbete"
                {...register("title")}
                onChange={(e) => {
                  register("title").onChange(e);
                  setValue("slug", slugify(e.target.value));
                }}
              />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">Slug URL *</Label>
              <Input
                id="slug"
                placeholder="ex: atelierul-de-zambete"
                {...register("slug")}
              />
              <p className="text-xs text-gray-400">URL: /courses/{watch("slug") || "slug-curs"}</p>
              {errors.slug && <p className="text-sm text-red-500">{errors.slug.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="description">Descriere *</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Descrierea cursului pentru părinți și copii..."
                {...register("description")}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="audience">Audiență</Label>
              <select
                id="audience"
                {...register("audience")}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                defaultValue="children"
              >
                <option value="children">Copii (implicit)</option>
                <option value="invatator">Învățători — Clasele 0–4</option>
                <option value="profesor">Profesori gimnaziu — Clasele 5–8</option>
                <option value="all">Toți</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Grupa de vârstă *</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["0-4", "5-8"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setValue("age_group", g)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      watch("age_group") === g
                        ? g === "0-4" ? "border-teal-500 bg-teal-50" : "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-xl mb-1">{g === "0-4" ? "🌱" : "🔬"}</div>
                    <div className="font-medium text-sm">Clasele {g}</div>
                  </button>
                ))}
              </div>
              {errors.age_group && <p className="text-sm text-red-500">{errors.age_group.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="estimated_duration">Durată estimată (minute)</Label>
                <Input
                  id="estimated_duration"
                  type="number"
                  min={1}
                  placeholder="60"
                  {...register("estimated_duration", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="order_index">Ordine afișare</Label>
                <Input
                  id="order_index"
                  type="number"
                  min={0}
                  {...register("order_index", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status publicare</Label>
              <div className="flex gap-3">
                {(["draft", "published"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setValue("status", s)}
                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      watch("status") === s
                        ? s === "published" ? "bg-teal-500 text-white border-teal-500" : "bg-sky-100 text-sky-700 border-sky-300"
                        : "border-gray-200 text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    {s === "published" ? "✅ Publicat" : "📝 Draft"}
                  </button>
                ))}
              </div>
            </div>

            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending}
              className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2"
            >
              <Save size={18} />
              {isPending ? "Se salvează..." : "Creează cursul"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
