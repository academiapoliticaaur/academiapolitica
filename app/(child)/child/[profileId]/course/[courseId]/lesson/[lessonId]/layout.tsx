import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Lock, CreditCard } from "lucide-react";
import { isSubscriptionActive } from "@/lib/subscription";

export default async function LessonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ profileId: string; courseId: string; lessonId: string }>;
}) {
  const { profileId, courseId } = await params;
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
  const isAdmin = adminEmails.includes(user.email || "") || user.app_metadata?.role === "admin";

  if (!isAdmin) {
    const { data: profile } = await supabase
      .from("parent_profiles")
      .select("approved, subscription_expires_at")
      .eq("user_id", user.id)
      .single();

    if (!profile?.approved) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-10">
            <Lock className="mx-auto mb-4 text-amber-400" size={48} />
            <h2 className="text-xl font-bold text-amber-800 mb-3">Cont în așteptare</h2>
            <p className="text-amber-700 mb-6">
              Contul tău este în curs de aprobare de către un administrator.
              Poți naviga prin cursuri, dar accesul la lecții va fi disponibil după aprobare.
            </p>
            <Link
              href={`/child/${profileId}/course/${courseId}`}
              className="inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-800 font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              ← Înapoi la curs
            </Link>
          </div>
        </div>
      );
    }

    if (!isSubscriptionActive(profile.subscription_expires_at)) {
      return (
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-10">
            <CreditCard className="mx-auto mb-4 text-indigo-400" size={48} />
            <h2 className="text-xl font-bold text-indigo-800 mb-3">Abonament necesar</h2>
            <p className="text-indigo-700 mb-6">
              Accesul la lecții necesită un abonament activ.
              Contactează administratorul platformei pentru activarea abonamentului tău.
            </p>
            <Link
              href={`/child/${profileId}/course/${courseId}`}
              className="inline-flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              ← Înapoi la curs
            </Link>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
