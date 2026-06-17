"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

interface Course {
  title: string;
  slug: string;
  description: string | null;
  age_group: string;
  audience: string | null;
  status: string;
  estimated_duration: number | null;
  order_index: number | null;
  is_demo: boolean;
  series_title?: string | null;
  series_order?: number | null;
}

interface EditCourseFormProps {
  course: Course;
  courseId: string;
  action: (formData: FormData) => Promise<void>;
}

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

export function EditCourseForm({ course, action }: EditCourseFormProps) {
  const [slug, setSlug] = useState(course.slug);
  const [ageGroup, setAgeGroup] = useState(course.age_group);
  const [status, setStatus] = useState(course.status ?? "draft");
  const [isDemo, setIsDemo] = useState(course.is_demo ?? false);

  return (
    <Card>
      <CardContent className="pt-6">
        <form action={action} className="space-y-5">
          {/* hidden inputs for interactive state */}
          <input type="hidden" name="slug" value={slug} />
          <input type="hidden" name="age_group" value={ageGroup} />
          <input type="hidden" name="status" value={status} />
          <input type="hidden" name="is_demo" value={isDemo ? "1" : "0"} />

          <div className="space-y-1.5">
            <Label htmlFor="title">Titlul cursului *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={course.title}
              required
              maxLength={120}
              onChange={(e) => setSlug(slugify(e.target.value))}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="slug_display">Slug URL *</Label>
            <Input
              id="slug_display"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              maxLength={120}
              className="font-mono text-sm"
            />
            <p className="text-xs text-gray-400">URL: /courses/{slug}</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descriere</Label>
            <Textarea id="description" name="description" rows={4} defaultValue={course.description ?? ""} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="audience">Audiență</Label>
            <select
              id="audience"
              name="audience"
              defaultValue={course.audience ?? "children"}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
            >
              <option value="children">Copii (implicit)</option>
              <option value="formator">Formatori — Clasele 0–4</option>
              <option value="lector">Profesori gimnaziu — Clasele 5–8</option>
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
                  onClick={() => setAgeGroup(g)}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${
                    ageGroup === g
                      ? g === "0-4"
                        ? "border-teal-500 bg-teal-50"
                        : "border-indigo-500 bg-indigo-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="text-xl mb-1">{g === "0-4" ? "🌱" : "🔬"}</div>
                  <div className="font-medium text-sm">Clasele {g}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Durată estimată</Label>
              <div className="flex h-10 items-center rounded-md border border-input bg-gray-50 px-3 text-sm text-gray-600">
                {course.estimated_duration ? `${course.estimated_duration} minute` : "— (fără lecții cu durată declarată)"}
              </div>
              <p className="text-xs text-gray-400">Calculată automat din duratele declarate la editarea lecțiilor.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="order_index">Ordine afișare</Label>
              <Input
                id="order_index"
                name="order_index"
                type="number"
                min={0}
                defaultValue={course.order_index ?? 0}
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
                  onClick={() => setStatus(s)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    status === s
                      ? s === "published"
                        ? "bg-teal-500 text-white border-teal-500"
                        : "bg-sky-100 text-sky-700 border-sky-300"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {s === "published" ? "✅ Publicat" : "📝 Draft"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Curs demonstrativ (public, fără autentificare)</Label>
            <div className="flex gap-3">
              {([false, true] as const).map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => setIsDemo(v)}
                  className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                    isDemo === v
                      ? v
                        ? "bg-amber-400 text-white border-amber-400"
                        : "bg-gray-100 text-gray-700 border-gray-300"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  {v ? "🎁 Demo public" : "🔒 Necesită cont"}
                </button>
              ))}
            </div>
            {isDemo && (
              <p className="text-xs text-amber-600">
                Lecțiile acestui curs vor fi accesibile public la /demo/[slug]/lesson/[id] fără autentificare.
              </p>
            )}
          </div>

          {/* Grupare serie */}
          <div className="border-t pt-4 space-y-3">
            <div>
              <Label htmlFor="series_title">Titlu serie (opțional)</Label>
              <input
                id="series_title"
                name="series_title"
                type="text"
                defaultValue={course.series_title ?? ""}
                placeholder="ex: Prieteni de Încredere 0-4"
                maxLength={120}
                className="mt-1.5 w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
              />
              <p className="text-xs text-gray-400 mt-1">
                Lasă gol pentru curs independent. Cursurile cu același titlu de serie se grupează pe pagina de cursuri.
              </p>
            </div>
            <div className="w-32">
              <Label htmlFor="series_order">Ordinea în serie</Label>
              <input
                id="series_order"
                name="series_order"
                type="number"
                min={1}
                defaultValue={course.series_order ?? 1}
                className="mt-1.5 w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
              />
            </div>
          </div>

          <Button type="submit" className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
            <Save size={18} />
            Salvează modificările
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
