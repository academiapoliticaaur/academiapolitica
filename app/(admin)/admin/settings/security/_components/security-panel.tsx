"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, ShieldAlert, RefreshCw, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { disableMyMfa, resetAdminMfaByEmail } from "@/lib/admin/mfa-actions";

interface Factor {
  id: string;
  friendly_name?: string;
  created_at: string;
  status: string;
}

interface Props {
  initialFactors: Factor[];
}

export function SecurityPanel({ initialFactors }: Props) {
  const router = useRouter();
  const [factors, setFactors] = useState<Factor[]>(initialFactors);
  const [disableError, setDisableError] = useState<string | null>(null);
  const [disableSuccess, setDisableSuccess] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isPendingDisable, startDisable] = useTransition();

  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<string | null>(null);
  const [isPendingReset, startReset] = useTransition();

  const handleDisable = (factorId: string) => {
    if (confirmId !== factorId) {
      setConfirmId(factorId);
      return;
    }
    startDisable(async () => {
      setDisableError(null);
      setConfirmId(null);
      const result = await disableMyMfa(factorId);
      if (result.error) {
        setDisableError(result.error);
        return;
      }
      setDisableSuccess(true);
      setFactors([]);
      setTimeout(() => router.push("/admin/mfa-setup"), 2000);
    });
  };

  const handleReset = () => {
    startReset(async () => {
      setResetError(null);
      setResetSuccess(null);
      const result = await resetAdminMfaByEmail(resetEmail.trim());
      if (result.error) {
        setResetError(result.error);
        return;
      }
      if (result.count === 0) {
        setResetSuccess(`Utilizatorul nu are MFA configurat.`);
      } else {
        setResetSuccess(`MFA resetat pentru ${resetEmail}. ${result.count} factor(i) eliminat(i). La următoarea autentificare va fi forțat să configureze MFA.`);
        setResetEmail("");
      }
    });
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Securitate cont admin</h1>

      {/* MFA Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            {factors.length > 0 ? (
              <ShieldCheck className="text-green-600" size={22} />
            ) : (
              <ShieldAlert className="text-red-500" size={22} />
            )}
            <CardTitle className="text-lg">Autentificare în 2 pași (MFA)</CardTitle>
            <span className={`ml-auto text-xs font-semibold px-2 py-0.5 rounded-full ${factors.length > 0 ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
              {factors.length > 0 ? "Activ" : "Inactiv"}
            </span>
          </div>
          <CardDescription>
            {factors.length > 0
              ? "Contul dvs. este protejat cu autentificare în 2 pași TOTP."
              : "MFA este obligatoriu pentru conturi admin. Configurați un autentificator."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {disableSuccess && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
              MFA dezactivat. Veți fi redirecționat spre configurarea unui nou autentificator...
            </div>
          )}
          {disableError && (
            <p className="text-sm text-red-500">{disableError}</p>
          )}

          {factors.length > 0 ? (
            <>
              {factors.map((factor) => (
                <div key={factor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {factor.friendly_name || "TOTP Authenticator"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Configurat: {new Date(factor.created_at).toLocaleDateString("ro-RO")}
                    </p>
                  </div>
                  <Button
                    variant={confirmId === factor.id ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => handleDisable(factor.id)}
                    disabled={isPendingDisable}
                    className="min-w-[110px]"
                  >
                    <Trash2 size={14} className="mr-1.5" />
                    {confirmId === factor.id ? "Confirmi?" : "Dezactivează"}
                  </Button>
                </div>
              ))}
              {confirmId && (
                <p className="text-xs text-gray-500">
                  Apasă din nou "Confirmi?" pentru a dezactiva MFA. Vei fi redirecționat să configurezi un autentificator nou.
                </p>
              )}
              <Link href="/admin/mfa-setup">
                <Button variant="outline" size="sm" className="mt-1">
                  <Plus size={14} className="mr-1.5" />
                  Adaugă autentificator nou
                </Button>
              </Link>
            </>
          ) : (
            <Link href="/admin/mfa-setup">
              <Button className="bg-green-600 hover:bg-green-700">
                <ShieldCheck size={16} className="mr-2" />
                Configurează MFA acum
              </Button>
            </Link>
          )}
        </CardContent>
      </Card>

      {/* Emergency Reset */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RefreshCw className="text-orange-500" size={22} />
            <CardTitle className="text-lg">Resetare MFA (urgență)</CardTitle>
          </div>
          <CardDescription>
            Resetați MFA-ul unui alt administrator care și-a pierdut accesul la autentificator.
            La următoarea autentificare va fi forțat să configureze MFA din nou.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email administrator</Label>
            <Input
              id="reset-email"
              type="email"
              placeholder="admin@example.com"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && resetEmail.trim() && handleReset()}
            />
          </div>

          {resetError && (
            <p className="text-sm text-red-500">{resetError}</p>
          )}
          {resetSuccess && (
            <p className="text-sm text-green-600">{resetSuccess}</p>
          )}

          <Button
            variant="outline"
            onClick={handleReset}
            disabled={!resetEmail.trim() || isPendingReset}
            className="border-orange-300 text-orange-700 hover:bg-orange-50"
          >
            <RefreshCw size={14} className={`mr-2 ${isPendingReset ? "animate-spin" : ""}`} />
            {isPendingReset ? "Se resetează..." : "Resetează MFA"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
