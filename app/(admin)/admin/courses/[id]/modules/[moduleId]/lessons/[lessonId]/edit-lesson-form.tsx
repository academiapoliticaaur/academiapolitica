"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { lessonSchema, type LessonFormData } from "@/lib/validation/schemas";
import { GoogleDriveLinkField } from "@/components/admin/google-drive-link-field";
import { updateLesson } from "@/lib/admin/actions";

const LESSON_TYPES = [
  { value: "video", label: "🎬 Video", desc: "Film YouTube sau Google Drive" },
  { value: "presentation", label: "📋 Prezentare", desc: "Prezentare PDF/Slides" },
  { value: "worksheet", label: "📝 Fișă de lucru", desc: "Material descărcabil" },
  { value: "quiz", label: "🎯 Quiz", desc: "Test interactiv" },
  { value: "mixed", label: "📚 Mixt", desc: "Combinație de tipuri" },
];

interface LessonRow {
  title: string;
  description: string | null;
  lesson_type: LessonFormData["lesson_type"];
  video_url: string | null;
  presentation_url: string | null;
  worksheet_url: string | null;
  duration_minutes: number | null;
  order_index: number | null;
  status: LessonFormData["status"];
  ai_generated: boolean | null;
  human_reviewed: boolean | null;
  reviewer_notes: string | null;
  allow_download: boolean | null;
}

interface EditLessonFormProps {
  lesson: LessonRow;
  courseId: string;
  moduleId: string;
  lessonId: string;
}

export function EditLessonForm({ lesson, courseId, moduleId, lessonId }: EditLessonFormProps) {
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
    defaultValues: {
      title: lesson.title,
      description: lesson.description ?? "",
      lesson_type: lesson.lesson_type,
      video_url: lesson.video_url ?? "",
      presentation_url: lesson.presentation_url ?? "",
      worksheet_url: lesson.worksheet_url ?? "",
      duration_minutes: lesson.duration_minutes ?? undefined,
      order_index: lesson.order_index ?? 0,
      status: lesson.status ?? "draft",
      ai_generated: lesson.ai_generated ?? false,
      human_reviewed: lesson.human_reviewed ?? false,
      reviewer_notes: lesson.reviewer_notes ?? "",
      allow_download: lesson.allow_download ?? false,
    },
  });

  const onSubmit = (data: LessonFormData) => {
    setServerError(null);
    startTransition(async () => {
      const result = await updateLesson(lessonId, courseId, data);
      if (result?.error) { setServerError(result.error); return; }
      router.push(`/admin/courses/${courseId}`);
    });
  };

  return (
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

          {/* Quiz editor link — shown immediately when quiz type is selected */}
          {watch("lesson_type") === "quiz" && (
            <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-xl flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-sm text-blue-800">🎯 Editor Quiz</p>
                <p className="text-xs text-blue-600 mt-0.5">
                  Adaugă și gestionează întrebările acestui quiz.
                </p>
              </div>
              <Button asChild size="sm" className="bg-blue-500 hover:bg-blue-600 text-white shrink-0">
                <Link href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/quiz`}>
                  Deschide Editor Quiz →
                </Link>
              </Button>
            </div>
          )}

          <div className="space-y-1.5">
            <Label>URL Video (YouTube sau Google Drive)</Label>
            <GoogleDriveLinkField
              value={watch("video_url") ?? ""}
              onChange={(url) => setValue("video_url", url)}
              placeholder="https://www.youtube.com/watch?v=... sau https://drive.google.com/file/d/..."
              hint="YouTube Unlisted sau Google Drive (fișier partajat cu link). Drive → Share → Copy link."
              accept="video"
              uploadContext={{ lessonId, courseId, moduleId }}
              uploadField="video_url"
              uploadAccept=".mp4,.mov,.webm,.avi"
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
              accept="presentation"
              uploadContext={{ lessonId, courseId, moduleId }}
              uploadField="presentation_url"
              uploadAccept=".pdf,.pptx,.ppt"
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
              accept="worksheet"
              uploadContext={{ lessonId, courseId, moduleId }}
              uploadField="worksheet_url"
              uploadAccept=".pdf,.docx,.doc"
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
                checked={watch("ai_generated") ?? false}
                onCheckedChange={(v) => setValue("ai_generated", !!v)}
              />
              <label htmlFor="ai_generated" className="text-sm cursor-pointer">Conținut generat cu AI</label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="human_reviewed"
                checked={watch("human_reviewed") ?? false}
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
            {isPending ? "Se salvează..." : "Salvează modificările"}
          </Button>

        </form>
      </CardContent>
    </Card>
  );
}
