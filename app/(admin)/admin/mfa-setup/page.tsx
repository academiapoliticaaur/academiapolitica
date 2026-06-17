"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function MfaSetupPage() {
  const [qrSvg, setQrSvg] = useState<string | null>(null);
  const [secret, setSecret] = useState<string>("");
  const [factorId, setFactorId] = useState<string>("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"loading" | "enroll" | "done">("loading");

  useEffect(() => {
    const enroll = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", issuer: "Ami & Moti Admin" });
      if (error || !data) {
        setError("Eroare la activarea MFA: " + error?.message);
        return;
      }
      setQrSvg(data.totp.qr_code);
      setSecret(data.totp.secret);
      setFactorId(data.id);
      setStep("enroll");
    };
    enroll();
  }, []);

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
    if (challengeError) {
      setError("Eroare challenge: " + challengeError.message);
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

    setStep("done");
    setTimeout(() => { window.location.href = "/admin"; }, 1500);
  };

  if (step === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Se generează codul QR...</p>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-5xl mb-3">✅</div>
          <p className="text-lg font-semibold text-gray-800">MFA activat cu succes!</p>
          <p className="text-gray-500 text-sm mt-1">Redirecționare...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="text-3xl mb-2">🔐</div>
          <CardTitle>Activare autentificare în 2 pași</CardTitle>
          <CardDescription>
            Scanează codul QR cu Google Authenticator, Authy sau altă aplicație TOTP.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {qrSvg && (
            <div className="flex justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`data:image/svg+xml;base64,${btoa(qrSvg)}`}
                alt="QR Code pentru autentificare MFA"
                width={200}
                height={200}
              />
            </div>
          )}

          <div className="bg-gray-50 rounded-lg p-3 text-center">
            <p className="text-xs text-gray-500 mb-1">Sau introdu manual această cheie secretă:</p>
            <code className="text-xs font-mono text-gray-700 break-all">{secret}</code>
          </div>

          <div className="space-y-2">
            <Label htmlFor="code">Cod de verificare (6 cifre)</Label>
            <Input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="000000"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            />
          </div>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          <Button
            className="w-full"
            onClick={handleVerify}
            disabled={loading || code.length !== 6}
          >
            {loading ? "Se verifică..." : "Activează MFA"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
