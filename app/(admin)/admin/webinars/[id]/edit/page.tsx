import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { updateWebinar } from "@/lib/admin/webinar-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editează webinar" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditWebinarPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: w } = await supabase.from("webinars").select("*").eq("id", id).single();
  if (!w) notFound();

  const action = async (formData: FormData) => {
    "use server";
    await updateWebinar(id, formData);
  };

  return (
    <div className="max-w-lg">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 mb-4">
        <Link href="/admin/webinars"><ArrowLeft size={16} />Înapoi</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Editează webinar</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={action} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Titlu *</Label>
              <Input id="title" name="title" required defaultValue={w.title} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Descriere</Label>
              <Textarea id="description" name="description" rows={3} defaultValue={w.description ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scheduled_at">Data și ora (opțional)</Label>
              <Input
                id="scheduled_at"
                name="scheduled_at"
                type="datetime-local"
                defaultValue={w.scheduled_at ? new Date(w.scheduled_at).toISOString().slice(0, 16) : ""}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="registration_url">Link înregistrare (opțional)</Label>
              <Input id="registration_url" name="registration_url" type="url" defaultValue={w.registration_url ?? ""} placeholder="https://forms.google.com/..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="youtube_id">YouTube Video ID</Label>
              <Input id="youtube_id" name="youtube_id" defaultValue={w.youtube_id ?? ""} placeholder="ex: dQw4w9WgXcQ" />
              <p className="text-xs text-gray-400">Lasă gol pentru webinarii viitoare fără înregistrare video.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="presenter">Prezentator</Label>
              <Input id="presenter" name="presenter" defaultValue={w.presenter ?? ""} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audience">Audiență</Label>
              <select
                id="audience"
                name="audience"
                defaultValue={w.audience}
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
              >
                <option value="all">Toți (părinți + copii)</option>
                <option value="children">Copii</option>
                <option value="adult">Adulți / Părinți</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-blue-100 hover:bg-blue-200 text-blue-700">
                Salvează modificările
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/webinars">Anulează</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
