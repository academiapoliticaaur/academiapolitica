"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { AcademiaGuide } from "@/components/common/academia-guide";
import { createClient } from "@/lib/supabase/client";
import { childProfileSchema, type ChildProfileFormData } from "@/lib/validation/schemas";

const GRADES_0_4 = ["Pregătitoare", "I", "II", "III", "IV"];
const GRADES_5_8 = ["V", "VI", "VII", "VIII"];

export default function AddChildPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ChildProfileFormData>({
    resolver: zodResolver(childProfileSchema),
  });

  const ageGroup = watch("age_group");

  const onSubmit = (data: ChildProfileFormData) => {
    setServerError(null);
    startTransition(async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { error } = await supabase.from("child_profiles").insert({
        parent_id: user.id,
        display_name: data.display_name,
        age_group: data.age_group,
        grade: data.grade || null,
        avatar_url: null,
        pin_hash: null,
      });

      if (error) {
        setServerError("Nu am putut crea profilul. Încearcă din nou.");
        return;
      }

      router.push("/dashboard");
    });
  };

  return (
    <div className="max-w-lg">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-2 mb-4 -ml-2">
          <Link href="/dashboard">
            <ArrowLeft size={16} />
            Înapoi
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Adaugă profil cursant</h1>
        <p className="text-gray-500 mt-1">Creează un profil pentru a permite accesul la cursuri.</p>
      </div>

      <AcademiaGuide
        variant="tip"
        message="Nu avem nevoie de emailul copilului! Folosim doar prenumele sau un pseudonim ales de tine."
        className="mb-6"
      />

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="display_name">Prenume sau pseudonim *</Label>
              <Input
                id="display_name"
                placeholder="ex: Maria, Cosmonautul, Super-Alex"
                {...register("display_name")}
              />
              <p className="text-xs text-gray-400">Poți folosi un pseudonim — nu colectăm date reale despre copii.</p>
              {errors.display_name && (
                <p className="text-sm text-red-500">{errors.display_name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Grupa de vârstă *</Label>
              <div className="grid grid-cols-2 gap-3">
                {(["0-4", "5-8"] as const).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => { setValue("age_group", g); setValue("grade", ""); }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      ageGroup === g
                        ? g === "0-4"
                          ? "border-teal-500 bg-teal-50"
                          : "border-indigo-500 bg-indigo-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{g === "0-4" ? "🌱" : "🔬"}</div>
                    <div className="font-semibold text-sm">Clasele {g}</div>
                  </button>
                ))}
              </div>
              {errors.age_group && (
                <p className="text-sm text-red-500">{errors.age_group.message}</p>
              )}
            </div>

            {ageGroup && (
              <div className="space-y-1.5">
                <Label>Clasa (opțional)</Label>
                <div className="flex flex-wrap gap-2">
                  {(ageGroup === "0-4" ? GRADES_0_4 : GRADES_5_8).map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setValue("grade", watch("grade") === g ? "" : g)}
                      className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                        watch("grade") === g
                          ? "bg-blue-100 text-blue-700 border-blue-300"
                          : "border-gray-200 text-gray-600 hover:border-blue-300"
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            )}

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
              {isPending ? "Se creează profilul..." : "Creează profilul"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
