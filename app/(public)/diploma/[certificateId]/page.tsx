import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { PrintButton } from "@/components/certificate/print-button";
import { ShareButtons } from "@/components/certificate/share-buttons";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ certificateId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { certificateId } = await params;
  const db = createAdminClient();
  const { data: cert } = await db.from("certificates").select("child_name, course_title").eq("id", certificateId).single();
  if (!cert) return { title: "Diplomă — Ami & Moti" };
  return {
    title: `Diplomă — ${cert.child_name} | Ami & Moti`,
    description: `${cert.child_name} a absolvit cursul "${cert.course_title}" pe platforma educațională Ami & Moti.`,
    openGraph: {
      title: `🎓 ${cert.child_name} a absolvit "${cert.course_title}"`,
      description: "Platformă educațională românească pentru copii — Ami & Moti",
    },
  };
}

export default async function PublicDiplomaPage({ params }: PageProps) {
  const { certificateId } = await params;
  const db = createAdminClient();

  const { data: cert } = await db
    .from("certificates")
    .select("*")
    .eq("id", certificateId)
    .single();

  if (!cert) notFound();

  const issueDate = new Date(cert.issued_at).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const shareUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/diploma/${certificateId}`;

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4 landscape; margin: 8mm; }
          body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="no-print flex items-center justify-between gap-3 px-4 py-3 bg-white border-b mb-6 flex-wrap">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">
          <span>🌟</span> Ami &amp; Moti — platformă educațională pentru copii
        </Link>
        <div className="flex items-center gap-2 flex-wrap">
          <ShareButtons
            shareUrl={shareUrl}
            courseTitle={cert.course_title}
            childName={cert.child_name}
          />
          <PrintButton />
        </div>
      </div>

      <div className="flex justify-center px-4 pb-12">
        <div
          className="w-full max-w-4xl relative shadow-2xl"
          style={{ background: "#faf7ed", border: "8px double #c8a84b", padding: "2rem" }}
        >
          <span className="absolute top-2 left-3 text-2xl" style={{ color: "#c8a84b" }}>❦</span>
          <span className="absolute top-2 right-3 text-2xl rotate-90" style={{ color: "#c8a84b" }}>❦</span>
          <span className="absolute bottom-2 left-3 text-2xl -rotate-90" style={{ color: "#c8a84b" }}>❦</span>
          <span className="absolute bottom-2 right-3 text-2xl rotate-180" style={{ color: "#c8a84b" }}>❦</span>

          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="w-24 h-24 rounded-full flex flex-col items-center justify-center text-white flex-shrink-0"
              style={{ background: "#0f766e", border: "3px solid #0f766e" }}>
              <span className="text-3xl">🌟</span>
              <span className="text-xs font-bold text-center leading-tight px-1">Ami &amp; Moti</span>
            </div>

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

          <div className="mb-4" style={{ borderTop: "2px solid #c8a84b" }} />

          <div className="text-center mb-3">
            <p className="text-gray-500 text-sm mb-1">acordată lui</p>
            <h2 className="font-black text-gray-900 inline-block pb-1 px-8"
              style={{ fontSize: "2rem", borderBottom: "2px solid #c8a84b" }}>
              {cert.child_name}
            </h2>
          </div>

          <div className="text-center mb-4">
            <p className="text-gray-500 text-sm mb-2">pentru absolvirea cu succes a cursului</p>
            <h3 className="font-black text-gray-900 uppercase leading-tight" style={{ fontSize: "1.6rem" }}>
              {cert.course_title}
            </h3>
          </div>

          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-xl" style={{ color: "#c8a84b" }}>🌿</span>
            <p className="text-gray-600 text-sm text-center italic">
              Ai demonstrat dedicare, creativitate și dorința de a învăța. Îți dorim mult succes în continuare!
            </p>
            <span className="text-xl" style={{ color: "#c8a84b" }}>🌿</span>
          </div>

          {cert.lessons_completed?.length > 0 && (
            <div className="rounded-lg p-3 mb-4" style={{ background: "#f0fdfa", border: "1px solid #99f6e4" }}>
              <p className="text-xs font-bold text-center mb-2" style={{ color: "#0f766e" }}>
                Lecții parcurse:
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-0.5">
                {(cert.lessons_completed as string[]).map((lesson: string, i: number) => (
                  <p key={i} className="text-xs flex items-center gap-1" style={{ color: "#0f766e" }}>
                    <span>✓</span> {lesson}
                  </p>
                ))}
              </div>
            </div>
          )}

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

      {/* Promo Ami & Moti pentru vizitatori */}
      <div className="no-print max-w-lg mx-auto px-4 pb-16 text-center">
        <p className="text-gray-500 text-sm mb-3">Vrei și copilul tău să obțină diplome ca aceasta?</p>
        <Link
          href="/register"
          className="inline-block bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
        >
          Creează cont gratuit pe Ami &amp; Moti
        </Link>
      </div>
    </>
  );
}
