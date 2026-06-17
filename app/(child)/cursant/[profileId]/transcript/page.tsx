import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Award, BookOpen, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Transcriptul meu" };

interface PageProps {
  params: Promise<{ profileId: string }>;
}

export default async function TranscriptPage({ params }: PageProps) {
  const { profileId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: child } = await supabase
    .from("child_profiles")
    .select("display_name, age_group")
    .eq("id", profileId)
    .eq("parent_id", user.id)
    .single();

  if (!child) redirect("/dashboard");

  const { data: certificates } = await supabase
    .from("certificates")
    .select("*")
    .eq("child_profile_id", profileId)
    .order("issued_at", { ascending: false });

  const totalPoints = (certificates ?? []).reduce((sum, c) => sum + (c.total_points || 0), 0);

  return (
    <div className="max-w-3xl mx-auto">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 mb-4">
        <Link href={`/cursant/${profileId}`}>
          <ArrowLeft size={16} />
          Înapoi
        </Link>
      </Button>

      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold mb-1">Transcriptul meu 📜</h1>
            <p className="opacity-90 text-sm">{child.display_name} — {child.age_group === "0-4" ? "Clasele 0–4" : "Clasele 5–8"}</p>
          </div>
          <div className="text-center bg-white/20 rounded-xl px-4 py-3">
            <p className="text-3xl font-black">⭐ {totalPoints}</p>
            <p className="text-xs opacity-90 mt-1">XP total</p>
          </div>
        </div>
      </div>

      {/* Diplome */}
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Award size={20} className="text-teal-600" />
        Diplome obținute ({certificates?.length ?? 0})
      </h2>

      {certificates && certificates.length > 0 ? (
        <div className="space-y-4 mb-8">
          {certificates.map((cert) => (
            <div key={cert.id} className="bg-white rounded-xl border-2 border-yellow-200 p-5 flex items-center justify-between gap-4 hover:border-yellow-400 transition-colors">
              <div className="flex items-start gap-4">
                <div className="text-4xl flex-shrink-0">🏅</div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-0.5">{cert.course_title}</h3>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(cert.issued_at).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen size={12} />
                      {cert.lessons_completed?.length || 0} lecții
                    </span>
                    <span className="font-semibold text-yellow-600">⭐ {cert.total_points} XP</span>
                  </div>
                </div>
              </div>
              <Button asChild size="sm" className="bg-teal-600 hover:bg-teal-700 text-white shrink-0 gap-1">
                <Link href={`/cursant/${profileId}/certificate/${cert.id}`}>
                  🎓 Diplomă
                </Link>
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border-dashed border-2 border-gray-200 mb-8">
          <div className="text-5xl mb-3">🎓</div>
          <p className="font-semibold text-gray-600 mb-1">Nicio diplomă încă</p>
          <p className="text-sm text-gray-400">Finalizează un curs complet pentru a obține prima ta diplomă!</p>
        </div>
      )}
    </div>
  );
}
