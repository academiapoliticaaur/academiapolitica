import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, LayoutDashboard, Pencil, BarChart2, User, GraduationCap, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChildProfileCard } from "@/components/child/child-profile-card";
import { AmiMotiGuide } from "@/components/common/ami-moti-guide";
import { SubscriptionRequestBanner } from "@/components/dashboard/subscription-request-banner";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSubscriptionActive, subscriptionExpiresIn, formatSubscriptionExpiry } from "@/lib/subscription";
import { CancelSubscriptionButton } from "@/components/dashboard/cancel-subscription-button";
import { VoucherRedeemForm } from "@/components/dashboard/VoucherRedeemForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function ParentDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
  const isAdmin = adminEmails.includes(user.email || "") || user.app_metadata?.role === "admin";

  let { data: profile } = await supabase
    .from("parent_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  // Crează automat profilul de părinte dacă lipsește (ex: admin)
  if (!profile) {
    const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Utilizator";
    const accountType = (user.user_metadata?.account_type as string) || "family";
    const { data: created } = await supabase
      .from("parent_profiles")
      .insert({ user_id: user.id, full_name: fullName, accepted_terms: true, parental_consent: true, account_type: accountType })
      .select()
      .single();
    profile = created;
  }

  const { data: children } = await supabase
    .from("child_profiles")
    .select("*")
    .eq("parent_id", user.id)
    .order("created_at");

  // Rezumat săptămânal — lecții completate de luni până azi
  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const childIds = (children ?? []).map((c) => c.id);
  const weekProgressMap: Record<string, number> = {};
  if (childIds.length > 0) {
    const { data: weekProgress } = await supabase
      .from("progress")
      .select("child_profile_id")
      .in("child_profile_id", childIds)
      .eq("status", "completed")
      .gte("completed_at", monday.toISOString());
    (weekProgress ?? []).forEach((p) => {
      weekProgressMap[p.child_profile_id] = (weekProgressMap[p.child_profile_id] || 0) + 1;
    });
  }

  const accountType = profile?.account_type ?? (user.user_metadata?.account_type as string | null) ?? null;
  const isTeacher = accountType === "invatator" || accountType === "profesor";
  // Cadrele didactice necesită aprobare explicită; conturile family sunt auto-aprobate
  const needsApproval = isTeacher && !(profile?.approved ?? false);
  const isApproved = isAdmin || !needsApproval;

  if (isTeacher) redirect("/dashboard/classes");

  // Banner abonament: afișat dacă e aprobat, nu admin, și nu are abonament activ
  const hasActiveSubscription = isAdmin || isSubscriptionActive(profile?.subscription_expires_at);
  let hasPendingRequest = false;
  let pendingPlan: string | null = null;
  if (isApproved && !isAdmin && !hasActiveSubscription) {
    const db = createAdminClient();
    const { data: pendingReq } = await db
      .from("subscription_requests")
      .select("plan")
      .eq("user_id", user.id)
      .eq("status", "pending")
      .maybeSingle();
    hasPendingRequest = !!pendingReq;
    pendingPlan = pendingReq?.plan ?? null;
  }

  return (
    <div className="max-w-4xl">
      {!isApproved && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <span className="text-2xl shrink-0">⏳</span>
          <div>
            <p className="font-semibold text-amber-800">Cont în așteptare</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Contul tău este în curs de aprobare de către un administrator. Vei putea accesa toate funcțiile platformei după aprobare.
            </p>
          </div>
        </div>
      )}

      {isApproved && !isAdmin && hasActiveSubscription && profile?.subscription_expires_at && (() => {
        const daysLeft = subscriptionExpiresIn(profile.subscription_expires_at);
        const isTrial = profile.subscription_plan === "trial";
        const isUrgent = daysLeft !== null && daysLeft <= 1;
        const isWarnSoon = daysLeft !== null && daysLeft <= 7 && !isUrgent;

        if (isTrial) {
          const bg = isUrgent ? "bg-red-50 border-red-200" : isWarnSoon ? "bg-amber-50 border-amber-200" : "bg-violet-50 border-violet-200";
          const textColor = isUrgent ? "text-red-800" : isWarnSoon ? "text-amber-800" : "text-violet-800";
          const subColor = isUrgent ? "text-red-700" : isWarnSoon ? "text-amber-700" : "text-violet-700";
          return (
            <div className={`mb-6 ${bg} border rounded-xl p-4 flex items-start gap-3`}>
              <span className="text-2xl shrink-0">{isUrgent ? "⚠️" : isWarnSoon ? "⏰" : "🎁"}</span>
              <div>
                <p className={`font-semibold ${textColor}`}>
                  {isUrgent ? "Trial expiră mâine!" : isWarnSoon ? `Trial expiră în ${daysLeft} zile` : "Trial gratuit activ"}
                </p>
                <p className={`text-sm ${subColor} mt-0.5`}>
                  Ai acces complet până pe <strong>{formatSubscriptionExpiry(profile.subscription_expires_at)}</strong>.
                  {" "}Contactează-ne pentru a activa un abonament plătit.
                </p>
              </div>
            </div>
          );
        }

        if (isUrgent || isWarnSoon) {
          const bg = isUrgent ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200";
          const textColor = isUrgent ? "text-red-800" : "text-amber-800";
          const subColor = isUrgent ? "text-red-700" : "text-amber-700";
          return (
            <div className={`mb-6 ${bg} border rounded-xl p-4 flex items-start gap-3`}>
              <span className="text-2xl shrink-0">{isUrgent ? "🔴" : "⏰"}</span>
              <div>
                <p className={`font-semibold ${textColor}`}>
                  {isUrgent ? "Abonamentul expiră mâine!" : `Abonamentul expiră în ${daysLeft} zile`}
                </p>
                <p className={`text-sm ${subColor} mt-0.5`}>
                  Valabil până pe <strong>{formatSubscriptionExpiry(profile.subscription_expires_at)}</strong>.
                  {" "}Contactează adminul pentru reînnoire.
                </p>
              </div>
            </div>
          );
        }

        return (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
            <span className="text-2xl shrink-0">✅</span>
            <div className="flex-1">
              <p className="font-semibold text-emerald-800">Abonament activ</p>
              <p className="text-sm text-emerald-700 mt-0.5">
                Activ până pe <strong>{formatSubscriptionExpiry(profile.subscription_expires_at)}</strong>
                {daysLeft !== null && ` — ${daysLeft} zile rămase`}.
              </p>
              <CancelSubscriptionButton />
            </div>
          </div>
        );
      })()}

      {isApproved && !isAdmin && !hasActiveSubscription && (
        <div className="mb-6 space-y-3">
          <SubscriptionRequestBanner
            hasPendingRequest={hasPendingRequest}
            pendingPlan={pendingPlan}
          />
          <VoucherRedeemForm />
        </div>
      )}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            Bun venit, {profile?.full_name || "Utilizator"} 👋
          </h1>
          <p className="text-gray-500">
            {isTeacher
              ? "Contul tău de cadru didactic este activ. Accesează cursurile și resursele tale."
              : "Gestionează profilurile copiilor tăi și urmărește progresul lor."}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap self-start">
          <Button asChild variant="outline" className="gap-2 shrink-0 border-blue-200 text-blue-700 hover:bg-blue-50">
            <Link href="/dashboard/profile">
              <User size={16} />
              Profilul meu
            </Link>
          </Button>
          {isAdmin && (
            <Button asChild variant="outline" className="gap-2 shrink-0 border-purple-200 text-purple-700 hover:bg-purple-50">
              <Link href="/admin">
                <LayoutDashboard size={16} />
                Dashboard Admin
              </Link>
            </Button>
          )}
        </div>
      </div>

      {isTeacher ? (
        /* Zona cadre didactice */
        <section className="mb-8 space-y-4">
          <h2 className="text-xl font-semibold">Resurse pentru cadre didactice</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <Link href="/dashboard/classes" className="block rounded-xl border-2 border-emerald-200 hover:border-emerald-400 bg-emerald-50 hover:bg-emerald-100 transition-all p-6 group">
              <Users size={28} className="text-emerald-500 mb-3" />
              <h3 className="font-semibold text-emerald-800 mb-1">Clasele mele</h3>
              <p className="text-sm text-emerald-600">Creează clase, adaugă elevi și asignează cursuri</p>
            </Link>
            <Link href="/cadre-didactice" className="block rounded-xl border-2 border-indigo-200 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-100 transition-all p-6 group">
              <GraduationCap size={28} className="text-indigo-500 mb-3" />
              <h3 className="font-semibold text-indigo-800 mb-1">Resurse didactice</h3>
              <p className="text-sm text-indigo-600">
                {accountType === "invatator"
                  ? "Resurse pentru Învățători — Clasele 0–4"
                  : "Resurse pentru Profesori Gimnaziu — Clasele 5–8"}
              </p>
            </Link>
            <Link href="/courses" className="block rounded-xl border-2 border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 transition-all p-6 group">
              <BookOpen size={28} className="text-blue-500 mb-3" />
              <h3 className="font-semibold text-blue-800 mb-1">Cursuri elevi</h3>
              <p className="text-sm text-blue-600">Explorează cursurile disponibile pentru elevi</p>
            </Link>
          </div>
          <AmiMotiGuide
            variant="moti"
            message="Din Clasele mele poți crea o clasă, adăuga elevii și asigna cursuri. Elevii intră pe /clasa cu codul clasei!"
          />
        </section>
      ) : (
        /* Zona părinți — profiluri copii */
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Profilurile copiilor</h2>
            <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
              <Link href="/dashboard/add-child">
                <Plus size={16} />
                Adaugă copil
              </Link>
            </Button>
          </div>

          {children && children.length > 0 ? (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {children.map((child) => (
                <div key={child.id} className="flex flex-col gap-2">
                  <Link href={`/child/${child.id}`}>
                    <ChildProfileCard profile={child} />
                  </Link>
                  <div className="flex items-center justify-between px-1">
                    <div className="text-xs text-gray-500">
                      <span>Săptămâna aceasta: </span>
                      {weekProgressMap[child.id] ? (
                        <span className="font-semibold text-teal-600">
                          ✅ {weekProgressMap[child.id]} {weekProgressMap[child.id] === 1 ? "lecție" : "lecții"}
                        </span>
                      ) : (
                        <span className="text-gray-400">nicio lecție</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <Link href={`/dashboard/progress/${child.id}`} className="flex items-center gap-1 text-xs text-gray-400 hover:text-teal-600 transition-colors">
                        <BarChart2 size={12} />
                        Progres
                      </Link>
                      <Link href={`/dashboard/edit-child/${child.id}`} className="flex items-center gap-1 text-xs text-gray-400 hover:text-blue-600 transition-colors">
                        <Pencil size={12} />
                        Editează
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-dashed border-2">
              <CardContent className="p-8 text-center">
                <div className="text-5xl mb-3">👶</div>
                <p className="font-semibold text-gray-700 mb-2">Nu ai adăugat niciun copil</p>
                <p className="text-sm text-gray-500 mb-4">
                  Adaugă profilul copilului pentru a-i permite accesul la cursuri.
                </p>
                <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700">
                  <Link href="/dashboard/add-child">Adaugă primul profil</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <AmiMotiGuide
            variant="ami"
            message="Fiecare copil are propriul profil! Apasă pe un profil pentru a intra în zona lui și a vedea cursurile disponibile."
          />
        </section>
      )}
    </div>
  );
}
