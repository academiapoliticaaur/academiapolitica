"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

function ResetForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const code = searchParams.get("code");
    if (!code) {
      setError("Link invalid sau expirat. Solicită un nou link de resetare.");
      return;
    }
    const supabase = createClient();
    supabase.auth.exchangeCodeForSession(code).then(({ error: err }) => {
      if (err) {
        setError("Linkul a expirat sau este invalid. Solicită un nou link de resetare.");
      } else {
        setSessionReady(true);
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Parola trebuie să aibă cel puțin 8 caractere.");
      return;
    }
    if (password !== confirm) {
      setError("Parolele nu coincid.");
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      const { error: err } = await supabase.auth.updateUser({ password });
      if (err) {
        setError("Nu am putut actualiza parola. Încearcă din nou.");
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/dashboard"), 3000);
    });
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <CheckCircle size={48} className="text-teal-500 mx-auto mb-4" />
        <p className="font-semibold text-gray-800 mb-2">Parola a fost schimbată!</p>
        <p className="text-sm text-gray-500">Ești redirecționat la dashboard...</p>
      </div>
    );
  }

  if (error && !sessionReady) {
    return (
      <div className="text-center py-4">
        <div className="text-4xl mb-3">⚠️</div>
        <p className="text-sm text-red-600 mb-4">{error}</p>
        <Link href="/auth/forgot-password" className="text-blue-500 hover:underline text-sm font-medium">
          Solicită un nou link de resetare
        </Link>
      </div>
    );
  }

  if (!sessionReady) {
    return (
      <div className="text-center py-8 text-gray-400">
        <div className="text-3xl mb-3">⏳</div>
        <p className="text-sm">Se verifică linkul...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="password">Parola nouă</Label>
        <div className="relative">
          <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            id="password"
            type={showPwd ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            placeholder="Minim 6 caractere"
            className="pl-9 pr-10"
            autoComplete="new-password"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => setShowPwd(!showPwd)}
          >
            {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="confirm">Confirmă parola</Label>
        <Input
          id="confirm"
          type={showPwd ? "text" : "password"}
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={6}
          placeholder="Repetă parola nouă"
          autoComplete="new-password"
        />
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Button
        type="submit"
        className="w-full bg-teal-100 hover:bg-teal-200 text-teal-700"
        disabled={isPending}
      >
        {isPending ? "Se salvează..." : "Schimbă parola"}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="text-4xl mb-2">🔐</div>
        <CardTitle className="text-2xl">Parolă nouă</CardTitle>
        <CardDescription>Alege o parolă sigură pentru contul tău.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={<div className="text-center py-8 text-gray-400 text-sm">⏳ Se verifică linkul...</div>}>
          <ResetForm />
        </Suspense>
      </CardContent>
    </Card>
  );
}
