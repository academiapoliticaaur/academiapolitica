import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PrintButton } from "@/components/certificate/print-button";
import { ShareButtons } from "@/components/certificate/share-buttons";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Diplomă de absolvire" };

interface PageProps {
  params: Promise<{ profileId: string; certificateId: string }>;
}

export default async function CertificatePage({ params }: PageProps) {
  const { profileId, certificateId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean);
  const isAdmin = adminEmails.includes(user.email ?? "") || user.app_metadata?.role === "admin";

  // Folosim admin client (bypass RLS) — verificarea accesului se face manual mai jos
  const adminClient = createAdminClient();
  const { data: cert } = await adminClient
    .from("certificates")
    .select("*")
    .eq("id", certificateId)
    .eq("child_profile_id", profileId)
    .single();

  if (!cert) notFound();

  // Verificare acces: trebuie să fie adminul SAU părintele copilului
  if (!isAdmin) {
    const { data: childProfile } = await adminClient
      .from("child_profiles")
      .select("parent_id")
      .eq("id", profileId)
      .single();
    if (!childProfile || childProfile.parent_id !== user.id) notFound();
  }

  const issueDate = new Date(cert.issued_at).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Navigare — ascunsă la print */}
      <div className="no-print flex items-center justify-between gap-3 px-4 py-3 bg-white border-b mb-6 flex-wrap">
        <Button variant="ghost" size="sm" asChild className="gap-2">
          <Link href={`/cursant/${profileId}/transcript`}>
            <ArrowLeft size={16} />
            Transcriptul meu
          </Link>
        </Button>
        <div className="flex items-center gap-2 flex-wrap">
          <ShareButtons
            shareUrl={`${process.env.NEXT_PUBLIC_SITE_URL}/diploma/${certificateId}`}
            courseTitle={cert.course_title}
            childName={cert.child_name}
          />
          <PrintButton />
        </div>
      </div>

      {/* Diploma */}
      <div className="flex justify-center px-4 pb-12">
        <div
          className="w-full max-w-4xl relative shadow-2xl"
          style={{ background: "#faf7ed", border: "8px double #c8a84b", padding: "2rem" }}
        >
          {/* Ornamente colțuri */}
          <span className="absolute top-2 left-3 text-2xl" style={{ color: "#c8a84b" }}>❦</span>
          <span className="absolute top-2 right-3 text-2xl rotate-90" style={{ color: "#c8a84b" }}>❦</span>
          <span className="absolute bottom-2 left-3 text-2xl -rotate-90" style={{ color: "#c8a84b" }}>❦</span>
          <span className="absolute bottom-2 right-3 text-2xl rotate-180" style={{ color: "#c8a84b" }}>❦</span>

          {/* Header */}
          <div className="flex items-start justify-between gap-4 mb-4">

            {/* Stânga: sigiliu Academia Politica AUR */}
            <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center text-white flex-shrink-0"
              style={{ background: "#b8860b", border: "3px solid #b8860b" }}>
              <span className="text-3xl">🏛️</span>
              <span className="text-xs font-bold text-center leading-tight px-1">Academia Politica AUR</span>
            </div>

            {/* Centru: titlu */}
            <div className="flex-1 text-center">
              <h1 className="font-black text-gray-900 leading-none" style={{ fontSize: "2.8rem", letterSpacing: "0.05em" }}>
                DIPLOMĂ
              </h1>
              <div className="text-white text-sm font-bold px-6 py-1 inline-block my-1" style={{ background: "#0f766e" }}>
                DE ABSOLVIRE
              </div>
              <div className="mt-2">
                <span className="text-sm font-semibold px-6 py-1 border rounded" style={{ color: "#c8a84b", borderColor: "#c8a84b" }}>
                  ✦ Se acordă ✦
                </span>
              </div>
            </div>

            {/* Dreapta: box felicitări */}
            <div className="w-44 text-white p-3 rounded text-center flex-shrink-0" style={{ background: "#0f766e" }}>
              <div className="text-2xl mb-1">🎓</div>
              <p className="text-xs font-bold leading-tight mb-2">
                Felicitări pentru implicare, curaj și perseverență!
              </p>
              <div className="border-t pt-2" style={{ borderColor: "#0d9488" }}>
                <p className="text-xs leading-tight">
                  Ești pregătit(ă) pentru noi provocări și reușite!
                </p>
              </div>
            </div>
          </div>

          {/* Linie separatoare */}
          <div className="mb-4" style={{ borderTop: "2px solid #c8a84b" }} />

          {/* Numele copilului */}
          <div className="text-center mb-3">
            <p className="text-gray-500 text-sm mb-1">acordată lui</p>
            <h2 className="font-black text-gray-900 inline-block pb-1 px-8"
              style={{ fontSize: "2rem", borderBottom: "2px solid #c8a84b" }}>
              {cert.child_name}
            </h2>
          </div>

          {/* Cursul */}
          <div className="text-center mb-4">
            <p className="text-gray-500 text-sm mb-2">pentru absolvirea cu succes a cursului</p>
            <h3 className="font-black text-gray-900 uppercase leading-tight" style={{ fontSize: "1.6rem" }}>
              {cert.course_title}
            </h3>
          </div>

          {/* Mesaj decorativ */}
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-xl" style={{ color: "#c8a84b" }}>🌿</span>
            <p className="text-gray-600 text-sm text-center italic">
              Ai demonstrat dedicare, creativitate și dorința de a învăța. Îți dorim mult succes în continuare!
            </p>
            <span className="text-xl" style={{ color: "#c8a84b" }}>🌿</span>
          </div>

          {/* Lecții parcurse */}
          {cert.lessons_completed?.length > 0 && (
            <div className="rounded-lg p-3 mb-4" style={{ background: "#f0fdfa", border: "1px solid #99f6e4" }}>
              <p className="text-xs font-bold text-center mb-2" style={{ color: "#0f766e" }}>
                Lecții parcurse:
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                {(cert.lessons_completed as string[]).map((lesson, i) => (
                  <p key={i} className="text-xs flex items-center gap-1" style={{ color: "#0f766e" }}>
                    <span>✓</span> {lesson}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-end justify-between mt-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <div>
                <div className="text-sm font-semibold text-gray-700 pb-0.5" style={{ borderBottom: "1px solid #9ca3af", minWidth: "160px" }}>
                  {issueDate}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">DATA</p>
              </div>
            </div>

            <div className="text-center">
              <div className="text-4xl">🏅</div>
              <p className="text-xs font-bold mt-1" style={{ color: "#0f766e" }}>{cert.total_points} XP</p>
            </div>

            <div className="text-right">
              <div style={{ borderBottom: "1px solid #9ca3af", minWidth: "180px", height: "1.5rem" }} />
              <p className="text-xs text-gray-500 mt-0.5">Psiholog Ionela Pandilică</p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
