"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { registerSchema, type RegisterFormData } from "@/lib/validation/schemas";
import { notifyAdminNewTeacher } from "@/lib/actions/notify";
import { AcademiaGuide } from "@/components/common/academia-guide";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [emailSent, setEmailSent] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { accepted_terms: false, parental_consent: false, account_type: "member" as const },
  });

  const onSubmit = (data: RegisterFormData) => {
    setServerError(null);
    startTransition(async () => {
      const supabase = createClient();

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.full_name,
            accepted_terms: data.accepted_terms,
            parental_consent: data.parental_consent,
            account_type: data.account_type || "member",
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) {
        setServerError(authError.message);
        return;
      }

      if (!authData.user) {
        setServerError("A apărut o eroare. Încearcă din nou.");
        return;
      }

      // Notifică adminul pentru conturi formatori (fire-and-forget)
      if (data.account_type === "formator" || data.account_type === "lector") {
        notifyAdminNewTeacher({
          fullName: data.full_name,
          email: data.email,
          accountType: data.account_type,
        }).catch(() => {});
      }

      // Dacă confirmarea email e dezactivată în Supabase, sesiunea e deja activă
      if (authData.session) {
        router.push("/dashboard");
        return;
      }

      // Altfel arătăm ecranul de verificare email
      setRegisteredEmail(data.email);
      setEmailSent(true);
    });
  };

  if (emailSent) {
    return (
      <Card className="w-full max-w-md shadow-lg text-center">
        <CardContent className="pt-8 pb-8 px-8">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Verifică-ți adresa de email!</h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            Ți-am trimis un email de confirmare la:<br />
            <span className="font-semibold text-yellow-600">{registeredEmail}</span>
          </p>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4 text-sm text-yellow-800 text-left">
            <p className="font-semibold mb-1">Pașii următori:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Deschide emailul primit de la Academia Politica AUR</li>
              <li>Apasă pe butonul <strong>&bdquo;Confirmă adresa de email&rdquo;</strong></li>
              <li>Vei fi redirecționat automat la contul tău</li>
            </ol>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm text-amber-800 text-left">
            <p className="font-semibold mb-1">⏳ Aprobare necesară (formatori)</p>
            <p>Conturile de formator și lector vor fi revizuite de un administrator. Vei fi notificat pe email când contul este aprobat.</p>
          </div>
          <p className="text-xs text-gray-400">
            Nu ai primit emailul? Verifică dosarul Spam/Junk.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <AcademiaGuide
        variant="tip"
        message="Înregistrarea durează un minut — după aceea vei putea accesa toate cursurile și materialele de formare politică."
      />
      <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="text-4xl mb-2">🎓</div>
        <CardTitle className="text-2xl">Creează cont</CardTitle>
        <CardDescription>
          Alătură-te comunității Academia Politica AUR și accesează resursele de formare.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="full_name">Numele tău complet</Label>
            <Input
              id="full_name"
              type="text"
              placeholder="Ion Popescu"
              autoComplete="name"
              {...register("full_name")}
            />
            {errors.full_name && (
              <p className="text-sm text-red-500">{errors.full_name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Adresă de email</Label>
            <Input
              id="email"
              type="email"
              placeholder="ion.popescu@exemplu.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="account_type">Tip cont</Label>
            <select
              id="account_type"
              {...register("account_type")}
              className="w-full border border-input rounded-md px-3 py-2 text-sm bg-background"
              defaultValue="member"
            >
              <option value="member">Membru AUR / Simpatizant</option>
              <option value="formator">Formator (necesită aprobare)</option>
              <option value="lector">Lector / Conferențiar (necesită aprobare)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Parolă</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                {...register("password")}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirm_password">Confirmă parola</Label>
            <Input
              id="confirm_password"
              type="password"
              autoComplete="new-password"
              {...register("confirm_password")}
            />
            {errors.confirm_password && (
              <p className="text-sm text-red-500">{errors.confirm_password.message}</p>
            )}
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3">
              <Checkbox
                id="accepted_terms"
                onCheckedChange={(checked) => setValue("accepted_terms", !!checked)}
              />
              <label htmlFor="accepted_terms" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                Accept{" "}
                <Link href="/termeni" className="text-blue-500 hover:underline" target="_blank">
                  termenii și condițiile
                </Link>{" "}
                platformei
              </label>
            </div>
            {errors.accepted_terms && (
              <p className="text-sm text-red-500">{errors.accepted_terms.message}</p>
            )}

            <div className="flex items-start gap-3">
              <Checkbox
                id="parental_consent"
                onCheckedChange={(checked) => setValue("parental_consent", !!checked)}
              />
              <label htmlFor="parental_consent" className="text-sm text-gray-600 cursor-pointer leading-relaxed">
                Confirm că am citit și accept{" "}
                <Link href="/confidentialitate" className="text-blue-500 hover:underline" target="_blank">
                  politica de confidențialitate
                </Link>{" "}
                și îmi exprim consimțământul pentru prelucrarea datelor
              </label>
            </div>
            {errors.parental_consent && (
              <p className="text-sm text-red-500">{errors.parental_consent.message}</p>
            )}
          </div>

          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
              {serverError}
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2"
            disabled={isPending}
          >
            <UserPlus size={18} />
            {isPending ? "Se creează contul..." : "Creează cont"}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Ai deja cont?{" "}
          <Link href="/login" className="text-blue-500 hover:underline font-medium">
            Intră în cont
          </Link>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
