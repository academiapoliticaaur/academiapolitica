import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye, EyeOff, BookOpen } from "lucide-react";
import { deletePath, togglePathStatus } from "@/lib/admin/path-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Trasee de instruire" };

export default async function AdminPathsPage() {
  const supabase = createAdminClient();
  const { data: paths } = await supabase
    .from("learning_paths")
    .select("id, title, description, skill_name, audience, status, learning_path_courses(count)")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Trasee de instruire</h1>
          <p className="text-sm text-gray-500 mt-1">{paths?.length ?? 0} trasee totale</p>
        </div>
        <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
          <Link href="/admin/paths/new"><Plus size={16} />Traseu nou</Link>
        </Button>
      </div>

      {!paths?.length ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-400 mb-4">Niciun traseu creat încă.</p>
          <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
            <Link href="/admin/paths/new"><Plus size={16} />Creează primul traseu</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {paths.map((p) => {
            const courseCount = (p.learning_path_courses as unknown as { count: number }[])?.[0]?.count ?? 0;
            return (
              <div key={p.id} className="bg-white rounded-xl border p-5 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-semibold text-gray-900 truncate">{p.title}</h2>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                      p.status === "published" ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {p.status === "published" ? "Publicat" : "Draft"}
                    </span>
                  </div>
                  {p.description && <p className="text-sm text-gray-500 truncate">{p.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><BookOpen size={12} />{courseCount} cursuri</span>
                    {p.skill_name && <span>🏅 {p.skill_name}</span>}
                    <span className="bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                      {p.audience === "children" ? "Copii" : p.audience === "adult" ? "Adulți" : "Toți"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <form action={async () => {
                    "use server";
                    await togglePathStatus(p.id, p.status);
                  }}>
                    <Button type="submit" size="sm" variant="outline" className="gap-1.5 text-xs">
                      {p.status === "published" ? <><EyeOff size={12} />Retrage</> : <><Eye size={12} />Publică</>}
                    </Button>
                  </form>
                  <Button asChild size="sm" className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-1.5">
                    <Link href={`/admin/paths/${p.id}`}><Pencil size={12} />Editează</Link>
                  </Button>
                  <form action={async () => {
                    "use server";
                    await deletePath(p.id);
                  }}>
                    <Button type="submit" size="sm" variant="outline" className="text-red-500 hover:text-red-700 border-red-200">
                      <Trash2 size={12} />
                    </Button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
