"use client";

import { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormData } from "@/lib/validation/schemas";
import { AcademiaGuide } from "@/components/common/academia-guide";

function ConfirmErrorBanner() {
  const searchParams = useSearchParams();
  if (searchParams.get("mesaj") !== "confirmare-esuata") return null;
  return (
    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
      ❌ Linkul de confirmare este invalid sau a expirat. Încearcă să te înregistrezi din nou.
    </div>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginFormData) => {
    setServerError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      if (error) {
        setServerError("Email sau parolă incorectă. Încearcă din nou.");
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      const isAdmin = user?.app_metadata?.role === "admin";

      router.push(isAdmin ? "/admin" : "/dashboard");
      router.refresh();
    });
  };

  return (
    <div className="w-full max-w-md space-y-4">
      <AcademiaGuide
        variant="tip"
        message="Eu, Moti, te ghidez! Intră în cont ca să explorezi lecțiile și să urmărești progresul copilului tău."
      />
      <Card className="w-full max-w-md shadow-lg">
      <CardHeader className="text-center pb-4">
        <div className="text-4xl mb-2">👧🐱</div>
        <CardTitle className="text-2xl">Intră în contul tău</CardTitle>
        <CardDescription>
          Platforma Ami &amp; Moti — cont de părinte
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Suspense fallback={null}>
          <ConfirmErrorBanner />
        </Suspense>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Adresă de email</Label>
            <Input
              id="email"
              type="email"
              placeholder="parinte@exemplu.com"
              autoComplete="email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">Parolă</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
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
            <LogIn size={18} />
            {isPending ? "Se conectează..." : "Intră în cont"}
          </Button>

          <div className="text-center">
            <Link href="/auth/forgot-password" className="text-sm text-gray-400 hover:text-blue-500">
              Ai uitat parola?
            </Link>
          </div>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Nu ai cont?{" "}
          <Link href="/register" className="text-blue-500 hover:underline font-medium">
            Creează cont de părinte
          </Link>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
