"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const appUrl = window.location.origin;
      const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${appUrl}/auth/reset-password`,
      });
      if (err) {
        setError("Nu am putut trimite emailul. Verifică adresa și încearcă din nou.");
        return;
      }
      setSent(true);
    });
  }

  return (
    <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="text-4xl mb-2">🔑</div>
        <CardTitle className="text-2xl">Resetare parolă</CardTitle>
        <CardDescription>
          Introduci emailul și îți trimitem un link de resetare.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {sent ? (
          <div className="text-center py-4">
            <CheckCircle size={48} className="text-teal-500 mx-auto mb-4" />
            <p className="font-semibold text-gray-800 mb-2">Email trimis!</p>
            <p className="text-sm text-gray-500 mb-6">
              Verifică inbox-ul pentru <strong>{email}</strong>. Linkul expiră în 1 oră.
            </p>
            <Link href="/login" className="text-blue-500 hover:underline text-sm font-medium">
              ← Înapoi la autentificare
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Adresa ta de email</Label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="parinte@exemplu.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-9"
                  autoComplete="email"
                />
              </div>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700"
              disabled={isPending || !email}
            >
              {isPending ? "Se trimite..." : "Trimite link de resetare"}
            </Button>

            <div className="text-center">
              <Link href="/login" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
                <ArrowLeft size={14} />
                Înapoi la autentificare
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
