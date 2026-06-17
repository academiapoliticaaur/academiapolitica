import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, User, GraduationCap, BookOpen, Users, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SubscriptionRequestBanner } from "@/components/dashboard/subscription-request-banner";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSubscriptionActive, subscriptionExpiresIn, formatSubscriptionExpiry } from "@/lib/subscription";
import { CancelSubscriptionButton } from "@/components/dashboard/cancel-subscription-button";
import { VoucherRedeemForm } from "@/components/dashboard/VoucherRedeemForm";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
  const isAdmin = adminEmails.includes(user.email || "") || user.app_metadata?.role === "admin";

  let { data: profile } = await supabase
    .from("parent_profiles")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    const fullName = user.user_metadata?.full_name || user.email?.split("@")[0] || "Utilizator";
    const accountType = (user.user_metadata?.account_type as string) || "member";
    const { data: created } = await supabase
      .from("parent_profiles")
      .insert({ user_id: user.id, full_name: fullName, accepted_terms: true, parental_consent: true, account_type: accountType })
      .select()
      .maybeSingle();
    profile = created;
  }

  const accountType = profile?.account_type ?? (user.user_metadata?.account_type as string | null) ?? null;
  const isTeacher = accountType === "formator" || accountType === "lector";

  // Formatori → zona grupuri
  if (isTeacher) redirect("/dashboard/grupuri");

  // Membri (cursanți adulți) — asigurăm un singur profil de cursant și redirecționăm
  if (!isTeacher && !isAdmin) {
    let { data: memberProfile } = await supabase
      .from("child_profiles")
      .select("id")
      .eq("parent_id", user.id)
      .limit(1)
      .maybeSingle();

    if (!memberProfile) {
      const fullName = profile?.full_name || user.email?.split("@")[0] || "Cursant";
      const { data: created } = await supabase
        .from("child_profiles")
        .insert({ parent_id: user.id, display_name: fullName, age_group: "5-8", pin_code: null })
        .select("id")
        .maybeSingle();
      memberProfile = created;
    }

    if (memberProfile?.id) {
      redirect(`/cursant/${memberProfile.id}`);
    }
  }

  // Admin dashboard
  const hasActiveSubscription = isAdmin || isSubscriptionActive(profile?.subscription_expires_at);
  let hasPendingRequest = false;
  let pendingPlan: string | null = null;
  if (!isAdmin && !hasActiveSubscription) {
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
      {!hasActiveSubscription && !isAdmin && (
        <div className="mb-6 space-y-3">
          <SubscriptionRequestBanner hasPendingRequest={hasPendingRequest} pendingPlan={pendingPlan} />
          <VoucherRedeemForm />
        </div>
      )}

      {hasActiveSubscription && !isAdmin && profile?.subscription_expires_at && (() => {
        const daysLeft = subscriptionExpiresIn(profile.subscription_expires_at);
        if (!daysLeft || daysLeft > 7) return null;
        const isUrgent = daysLeft <= 1;
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
              <CancelSubscriptionButton />
            </div>
          </div>
        );
      })()}

      <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">
            Bun venit, {profile?.full_name || "Utilizator"} 👋
          </h1>
          <p className="text-gray-500">Acces rapid la resursele Academia Politica AUR.</p>
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

      {/* Admin quick links */}
      <section className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold">Acces rapid</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          <Link href="/courses" className="block rounded-xl border-2 border-yellow-200 hover:border-yellow-400 bg-yellow-50 hover:bg-yellow-100 transition-all p-6">
            <BookOpen size={28} className="text-yellow-600 mb-3" />
            <h3 className="font-semibold text-yellow-800 mb-1">Cursuri</h3>
            <p className="text-sm text-yellow-700">Explorează toate cursurile platformei</p>
          </Link>
          <Link href="/dashboard/grupuri" className="block rounded-xl border-2 border-emerald-200 hover:border-emerald-400 bg-emerald-50 hover:bg-emerald-100 transition-all p-6">
            <Users size={28} className="text-emerald-500 mb-3" />
            <h3 className="font-semibold text-emerald-800 mb-1">Grupuri</h3>
            <p className="text-sm text-emerald-600">Gestionează grupurile de formare</p>
          </Link>
          <Link href="/webinars" className="block rounded-xl border-2 border-indigo-200 hover:border-indigo-400 bg-indigo-50 hover:bg-indigo-100 transition-all p-6">
            <PlayCircle size={28} className="text-indigo-500 mb-3" />
            <h3 className="font-semibold text-indigo-800 mb-1">Webinarii</h3>
            <p className="text-sm text-indigo-600">Seminarii online și înregistrări</p>
          </Link>
          <Link href="/formatori" className="block rounded-xl border-2 border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 transition-all p-6">
            <GraduationCap size={28} className="text-blue-500 mb-3" />
            <h3 className="font-semibold text-blue-800 mb-1">Resurse formatori</h3>
            <p className="text-sm text-blue-600">Materiale pentru formatori și lectori</p>
          </Link>
        </div>
      </section>
    </div>
  );
}
