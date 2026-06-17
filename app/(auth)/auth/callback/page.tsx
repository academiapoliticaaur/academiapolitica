"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sendWelcomeEmail } from "@/lib/actions/notify";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();

    async function handleCallback() {
      const code = searchParams.get("code");

      if (code) {
        // PKCE flow — schimbă codul pentru sesiune
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (error || !data.session) {
          router.replace("/login?error=confirmare_esuata");
          return;
        }
        const { isNew } = await ensureParentProfile(supabase, data.session.user);
        if (isNew) {
          // Trial gratuit 7 zile pentru conturi family noi
          fetch("/api/auth/activate-trial", { method: "POST" }).catch(() => {});
          if (data.session.user.email) {
            const meta = data.session.user.user_metadata ?? {};
            sendWelcomeEmail({
              fullName: (meta.full_name as string) || "Utilizator",
              email: data.session.user.email,
              accountType: (meta.account_type as string) || "member",
            }).catch(() => {});
          }
        }
        router.replace("/dashboard");
        return;
      }

      // Fallback: implicit flow (hash fragment) — ascultă schimbarea de stare
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          if (event === "SIGNED_IN" && session?.user) {
            const { isNew } = await ensureParentProfile(supabase, session.user);
            if (isNew) {
              fetch("/api/auth/activate-trial", { method: "POST" }).catch(() => {});
              if (session.user.email) {
                const meta = session.user.user_metadata ?? {};
                sendWelcomeEmail({
                  fullName: (meta.full_name as string) || "Utilizator",
                  email: session.user.email,
                  accountType: (meta.account_type as string) || "member",
                }).catch(() => {});
              }
            }
            router.replace("/dashboard");
          }
        }
      );

      // Timeout de siguranță — dacă nu primim event în 8 secunde, trimitem la login
      const timer = setTimeout(() => {
        subscription.unsubscribe();
        router.replace("/login?error=confirmare_esuata");
      }, 8000);

      return () => {
        clearTimeout(timer);
        subscription.unsubscribe();
      };
    }

    handleCallback();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="text-center p-8">
      <div className="text-4xl mb-4">⏳</div>
      <p className="text-gray-600">Se confirmă contul tău...</p>
    </div>
  );
}

async function ensureParentProfile(
  supabase: ReturnType<typeof createClient>,
  user: { id: string; user_metadata?: Record<string, unknown> }
): Promise<{ isNew: boolean }> {
  const accountType = (user.user_metadata?.account_type as string) || "member";

  const { data: existing } = await supabase
    .from("parent_profiles")
    .select("id, account_type")
    .eq("user_id", user.id)
    .single();

  if (!existing) {
    await supabase.from("parent_profiles").insert({
      user_id: user.id,
      full_name: (user.user_metadata?.full_name as string) || "",
      accepted_terms: (user.user_metadata?.accepted_terms as boolean) ?? true,
      parental_consent: (user.user_metadata?.parental_consent as boolean) ?? true,
      account_type: accountType,
    });
    return { isNew: true };
  }

  if (!existing.account_type || (existing.account_type === "member" && accountType !== "member")) {
    // Actualizează account_type dacă profilul a fost creat înainte de această funcționalitate
    await supabase.from("parent_profiles")
      .update({ account_type: accountType })
      .eq("user_id", user.id);
  }
  return { isNew: false };
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Se confirmă contul tău...</p>
        </div>
      </div>
    }>
      <CallbackHandler />
    </Suspense>
  );
}
