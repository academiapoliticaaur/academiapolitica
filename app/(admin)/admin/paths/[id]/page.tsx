import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createAdminClient } from "@/lib/supabase/admin";
import { updatePath, addCourseToPath, removeCourseFromPath } from "@/lib/admin/path-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Editează traseu" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPathPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createAdminClient();

  const [{ data: path }, { data: allCourses }] = await Promise.all([
    supabase.from("learning_paths")
      .select("*, learning_path_courses(order_index, course:courses(id, title, age_group, status))")
      .eq("id", id)
      .single(),
    supabase.from("courses").select("id, title, age_group, status").order("title"),
  ]);

  if (!path) notFound();

  const pathCourseIds = new Set(
    (path.learning_path_courses as { course: { id: string } }[]).map((lpc) => lpc.course.id)
  );
  const availableCourses = (allCourses ?? []).filter((c) => !pathCourseIds.has(c.id));

  const action = async (formData: FormData) => {
    "use server";
    await updatePath(id, formData);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 mb-4">
          <Link href="/admin/paths"><ArrowLeft size={16} />Înapoi la trasee</Link>
        </Button>
        <h1 className="text-2xl font-bold">{path.title}</h1>
      </div>

      {/* Editare metadate */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-4">Detalii traseu</h2>
        <form action={action} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">Titlu</Label>
            <Input id="title" name="title" required defaultValue={path.title} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Descriere</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={path.description ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="skill_name">Competența dobândită</Label>
            <Input id="skill_name" name="skill_name" defaultValue={path.skill_name ?? ""} placeholder="ex: AI Explorer" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="audience">Audiență</Label>
            <select id="audience" name="audience" defaultValue={path.audience}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background">
              <option value="children">Copii</option>
              <option value="adult">Adulți / Părinți</option>
              <option value="all">Toți</option>
            </select>
          </div>
          <Button type="submit" className="bg-blue-100 hover:bg-blue-200 text-blue-700">Salvează</Button>
        </form>
      </div>

      {/* Cursuri în traseu */}
      <div className="bg-white rounded-xl border p-5">
        <h2 className="font-semibold mb-4">Cursuri în traseu ({pathCourseIds.size})</h2>
        {pathCourseIds.size === 0 ? (
          <p className="text-sm text-gray-400 mb-4">Niciun curs adăugat încă.</p>
        ) : (
          <ul className="space-y-2 mb-4">
            {(path.learning_path_courses as { course: { id: string; title: string; age_group: string } }[]).map((lpc) => (
              <li key={lpc.course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">{lpc.course.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">{lpc.course.age_group}</span>
                  <form action={async () => {
                    "use server";
                    await removeCourseFromPath(id, lpc.course.id);
                  }}>
                    <Button type="submit" size="sm" variant="outline" className="text-red-500 border-red-200 h-7 w-7 p-0">
                      <Trash2 size={12} />
                    </Button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}

        {availableCourses.length > 0 && (
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Adaugă curs:</p>
            <div className="space-y-1.5">
              {availableCourses.map((c) => (
                <form key={c.id} action={async () => {
                  "use server";
                  await addCourseToPath(id, c.id);
                }}>
                  <button type="submit"
                    className="w-full text-left flex items-center justify-between p-3 rounded-lg border border-dashed border-blue-200 hover:border-blue-400 hover:bg-blue-50 transition-colors text-sm">
                    <span>{c.title}</span>
                    <span className="flex items-center gap-1.5 text-blue-500 text-xs">
                      <Plus size={12} />Adaugă
                    </span>
                  </button>
                </form>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
