import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createWebinar } from "@/lib/admin/webinar-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Webinar nou" };

export default function NewWebinarPage() {
  return (
    <div className="max-w-lg">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 mb-4">
        <Link href="/admin/webinars"><ArrowLeft size={16} />Înapoi</Link>
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Webinar nou</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createWebinar} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Titlu *</Label>
              <Input id="title" name="title" required placeholder="ex: Introducere în AI pentru copii" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Descriere</Label>
              <Textarea id="description" name="description" rows={3} placeholder="Despre ce este acest webinar..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="scheduled_at">Data și ora (opțional)</Label>
              <Input id="scheduled_at" name="scheduled_at" type="datetime-local" />
              <p className="text-xs text-gray-400">Lasă gol dacă webinarul este deja înregistrat.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="registration_url">Link înregistrare (opțional)</Label>
              <Input id="registration_url" name="registration_url" type="url" placeholder="https://forms.google.com/..." />
              <p className="text-xs text-gray-400">URL extern (Google Forms, Eventbrite etc.) pentru înregistrarea participanților.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="youtube_id">YouTube Video ID</Label>
              <Input id="youtube_id" name="youtube_id" placeholder="ex: dQw4w9WgXcQ" />
              <p className="text-xs text-gray-400">ID-ul din URL: youtube.com/watch?v=<strong>ID</strong>. Lasă gol pentru webinarii viitoare.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="presenter">Prezentator</Label>
              <Input id="presenter" name="presenter" placeholder="Numele prezentatorului" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audience">Audiență</Label>
              <select
                id="audience"
                name="audience"
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
                defaultValue="all"
              >
                <option value="all">Toți (părinți + copii)</option>
                <option value="children">Copii</option>
                <option value="adult">Adulți / Părinți</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-blue-100 hover:bg-blue-200 text-blue-700">
                Salvează webinar
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
