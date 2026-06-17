"use client";

import { useState, useTransition } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { ensureModuleDriveFolder } from "@/lib/admin/actions";

export default function AddModulePage() {
  const params = useParams();
  const courseId = params.id as string;
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [orderIndex, setOrderIndex] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError("Titlul este obligatoriu."); return; }

    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { data: created, error: dbError } = await supabase.from("modules").insert({
        course_id: courseId,
        title: title.trim(),
        description: description.trim() || null,
        order_index: orderIndex,
      }).select("id").single();

      if (dbError) { setError(dbError.message); return; }

      // Crează folder Drive în background (fire-and-forget)
      if (created?.id) ensureModuleDriveFolder(created.id, title.trim(), courseId).catch(() => {});
      router.push(`/admin/courses/${courseId}`);
    });
  };

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 mb-4">
          <Link href={`/admin/courses/${courseId}`}>
            <ArrowLeft size={16} />
            Înapoi la curs
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Adaugă modul</h1>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Titlul modulului *</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="ex: Modulul 1 — Introducere" />
            </div>
            <div className="space-y-1.5">
              <Label>Descriere (opțional)</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="space-y-1.5">
              <Label>Ordine afișare</Label>
              <Input type="number" min={0} value={orderIndex} onChange={(e) => setOrderIndex(Number(e.target.value))} />
            </div>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <Button type="submit" disabled={isPending} className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
              <Save size={18} />
              {isPending ? "Se salvează..." : "Salvează modulul"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
