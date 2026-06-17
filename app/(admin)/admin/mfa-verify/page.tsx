"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MfaVerifyPage() {
  const router = useRouter();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadFactor = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error || !data?.totp?.length) {
        // Nu are MFA enrollat — redirect la setup
        router.replace("/admin/mfa-setup");
        return;
      }
      setFactorId(data.totp[0].id);
    };
    loadFactor();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVerify = async () => {
    if (!factorId || code.length !== 6) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setError("Eroare: " + challengeError.message);
      setLoading(false);
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.id,
      code,
    });

    if (verifyError) {
      setError("Cod incorect. Încearcă din nou.");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="text-3xl mb-2">🔐</div>
          <CardTitle>Verificare în 2 pași</CardTitle>
          <CardDescription>
            Introdu codul din aplicația ta de autentificare (Google Authenticator, Authy etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Cod de 6 cifre</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => e.key === "Enter" && handleVerify()}
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button
            className="w-full"
            onClick={handleVerify}
            disabled={loading || code.length !== 6 || !factorId}
          >
            {loading ? "Se verifică..." : "Verifică"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
