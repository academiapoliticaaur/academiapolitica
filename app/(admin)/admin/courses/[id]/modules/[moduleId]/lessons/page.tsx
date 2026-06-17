"use client";

import { useState, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { lessonSchema, type LessonFormData } from "@/lib/validation/schemas";
import { GoogleDriveLinkField } from "@/components/admin/google-drive-link-field";

const LESSON_TYPES = [
  { value: "video", label: "🎬 Video", desc: "Film YouTube sau Google Drive" },
  { value: "presentation", label: "📋 Prezentare", desc: "Prezentare PDF/Slides" },
  { value: "worksheet", label: "📝 Fișă de lucru", desc: "Material descărcabil" },
  { value: "quiz", label: "🎯 Quiz", desc: "Test interactiv" },
  { value: "mixed", label: "📚 Mixt", desc: "Combinație de tipuri" },
];

export default function AddLessonPage() {
  const params = useParams();
  const courseId = params.id as string;
  const moduleId = params.moduleId as string;
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LessonFormData>({
    resolver: zodResolver(lessonSchema),
    defaultValues: { status: "draft", ai_generated: false, human_reviewed: false, order_index: 0 },
  });

  const onSubmit = (data: LessonFormData) => {
    setServerError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.from("lessons").insert({
        module_id: moduleId,
        title: data.title,
        description: data.description || null,
        lesson_type: data.lesson_type,
        video_url: data.video_url || null,
        presentation_url: data.presentation_url || null,
        worksheet_url: data.worksheet_url || null,
        duration_minutes: data.duration_minutes ?? null,
        order_index: data.order_index ?? 0,
        status: data.status ?? "draft",
        ai_generated: data.ai_generated ?? false,
        human_reviewed: data.human_reviewed ?? false,
        reviewer_notes: data.reviewer_notes || null,
        allow_download: data.allow_download ?? false,
      });

      if (error) { setServerError(error.message); return; }
      router.push(`/admin/courses/${courseId}`);
    });
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 mb-4">
          <Link href={`/admin/courses/${courseId}`}>
            <ArrowLeft size={16} />
            Înapoi la curs
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Adaugă lecție</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label>Titlul lecției *</Label>
              <Input {...register("title")} placeholder="ex: Lecția 1 — Ce sunt emoțiile?" />
              {errors.title && <p className="text-sm text-red-500">{errors.title.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Descriere</Label>
              <Textarea {...register("description")} rows={3} />
            </div>

            <div className="space-y-2">
              <Label>Tipul lecției *</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {LESSON_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => setValue("lesson_type", t.value as LessonFormData["lesson_type"])}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      watch("lesson_type") === t.value
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-medium text-sm">{t.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
              {errors.lesson_type && <p className="text-sm text-red-500">{errors.lesson_type.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>URL Video (YouTube sau Google Drive)</Label>
              <GoogleDriveLinkField
                value={watch("video_url") ?? ""}
                onChange={(url) => setValue("video_url", url)}
                placeholder="https://www.youtube.com/watch?v=... sau https://drive.google.com/file/d/..."
                hint="YouTube Unlisted sau Google Drive (fișier partajat cu link). Drive → Share → Copy link."
              />
              {errors.video_url && <p className="text-sm text-red-500">{errors.video_url.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Prezentare (PDF, PPTX sau Google Slides)</Label>
              <GoogleDriveLinkField
                value={watch("presentation_url") ?? ""}
                onChange={(url) => setValue("presentation_url", url)}
                placeholder="https://drive.google.com/file/d/... sau https://docs.google.com/presentation/d/..."
                hint="Drive → Share → Copy link. Fișierul trebuie să fie partajat public (Anyone with the link)."
              />
              {errors.presentation_url && <p className="text-sm text-red-500">{errors.presentation_url.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label>Fișă de lucru (PDF descărcabil — Google Drive)</Label>
              <GoogleDriveLinkField
                value={watch("worksheet_url") ?? ""}
                onChange={(url) => setValue("worksheet_url", url)}
                placeholder="https://drive.google.com/file/d/..."
                hint="Elevii vor accesa fișa direct din Google Drive. Setează permisiunea la Anyone with the link."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Durată (minute)</Label>
                <Input type="number" min={1} {...register("duration_minutes", { valueAsNumber: true })} />
              </div>
              <div className="space-y-1.5">
                <Label>Ordine afișare</Label>
                <Input type="number" min={0} {...register("order_index", { valueAsNumber: true })} />
              </div>
            </div>

            <div className="space-y-2 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <p className="font-semibold text-sm text-indigo-800">Verificare conținut AI</p>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="ai_generated"
                  onCheckedChange={(v) => setValue("ai_generated", !!v)}
                />
                <label htmlFor="ai_generated" className="text-sm cursor-pointer">Conținut generat cu AI</label>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="human_reviewed"
                  onCheckedChange={(v) => setValue("human_reviewed", !!v)}
                />
                <label htmlFor="human_reviewed" className="text-sm cursor-pointer">Verificat de om înainte de publicare</label>
              </div>
              <Textarea
                {...register("reviewer_notes")}
                rows={2}
                placeholder="Note verificator (opțional)..."
                className="text-sm"
              />
            </div>

            <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
              <p className="font-semibold text-sm text-gray-700 mb-3">Permisiuni conținut</p>
              <label className="flex items-center gap-3 cursor-pointer">
                <Checkbox
                  id="allow_download"
                  checked={watch("allow_download") ?? false}
                  onCheckedChange={(v) => setValue("allow_download", !!v)}
                />
                <div>
                  <p className="text-sm font-medium">Permite descărcarea și printarea PDF-ului</p>
                  <p className="text-xs text-gray-400">Dacă e dezactivat, toolbar-ul PDF (download/print) este ascuns</p>
                </div>
              </label>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex gap-2 flex-wrap">
                {(["draft", "reviewed", "published"] as const).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setValue("status", s)}
                    className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                      watch("status") === s
                        ? s === "published" ? "bg-teal-500 text-white border-teal-500"
                          : s === "reviewed" ? "bg-indigo-500 text-white border-indigo-500"
                          : "bg-sky-100 text-sky-700 border-sky-300"
                        : "border-gray-200 text-gray-600"
                    }`}
                  >
                    {s === "published" ? "✅ Publicat" : s === "reviewed" ? "🔍 Verificat" : "📝 Draft"}
                  </button>
                ))}
              </div>
            </div>

            {serverError && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{serverError}</div>
            )}

            <Button type="submit" disabled={isPending} className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
              <Save size={18} />
              {isPending ? "Se salvează..." : "Salvează lecția"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
