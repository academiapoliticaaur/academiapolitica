import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { BookOpen, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Trasee de instruire — Ami & Moti",
  description: "Parcurge un traseu complet și obține o diplomă de certificare.",
};

export default async function PathsPage() {
  const supabase = await createClient();
  const { data: paths } = await supabase
    .from("learning_paths")
    .select("id, title, slug, description, skill_name, audience, learning_path_courses(count)")
    .eq("status", "published")
    .order("order_index");

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-3">Trasee de instruire</h1>
        <p className="text-gray-500 text-lg">Completează un traseu și obține o diplomă de certificare</p>
      </div>

      {!paths?.length ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🗺️</div>
          <p className="text-lg">Traseele de instruire vor fi disponibile în curând.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {paths.map((p) => {
            const courseCount = (p.learning_path_courses as unknown as { count: number }[])?.[0]?.count ?? 0;
            return (
              <div key={p.id} className="bg-white rounded-2xl border p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                    {p.audience === "children" ? "Copii" : p.audience === "adult" ? "Adulți" : "Toți"}
                  </span>
                </div>
                <h2 className="font-bold text-lg text-gray-900 mb-2">{p.title}</h2>
                {p.description && (
                  <p className="text-sm text-gray-500 leading-relaxed mb-4 flex-1">{p.description}</p>
                )}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <BookOpen size={14} />
                    <span>{courseCount} {courseCount === 1 ? "curs" : "cursuri"}</span>
                  </div>
                  {p.skill_name && (
                    <div className="flex items-center gap-2 text-sm text-amber-600">
                      <Award size={14} />
                      <span>Diplomă: {p.skill_name}</span>
                    </div>
                  )}
                </div>
                <Button asChild className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 mt-auto">
                  <Link href={`/paths/${p.slug}`}>Vezi traseul →</Link>
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
