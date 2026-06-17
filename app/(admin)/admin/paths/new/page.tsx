import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPath } from "@/lib/admin/path-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Traseu nou" };

export default function NewPathPage() {
  return (
    <div className="max-w-lg">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 mb-4">
        <Link href="/admin/paths"><ArrowLeft size={16} />Înapoi</Link>
      </Button>
      <Card>
        <CardHeader><CardTitle>Traseu de instruire nou</CardTitle></CardHeader>
        <CardContent>
          <form action={createPath} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Titlu *</Label>
              <Input id="title" name="title" required placeholder="ex: Primii pași cu AI" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Descriere</Label>
              <Textarea id="description" name="description" rows={3} placeholder="Despre ce este acest traseu..." />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="skill_name">Competența dobândită (pentru diplomă)</Label>
              <Input id="skill_name" name="skill_name" placeholder="ex: AI Explorer" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audience">Audiență</Label>
              <select id="audience" name="audience" defaultValue="children"
                className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background">
                <option value="children">Copii</option>
                <option value="adult">Adulți / Părinți</option>
                <option value="all">Toți</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button type="submit" className="bg-blue-100 hover:bg-blue-200 text-blue-700">Creează traseu</Button>
              <Button type="button" variant="outline" asChild><Link href="/admin/paths">Anulează</Link></Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
