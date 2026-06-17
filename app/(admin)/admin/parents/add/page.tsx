"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createUser, activateSubscription } from "@/lib/admin/actions";
import { PLAN_LABELS, type SubscriptionPlan } from "@/lib/subscription";

const PLANS: { value: SubscriptionPlan; label: string }[] = [
  { value: "monthly",   label: PLAN_LABELS.monthly },
  { value: "quarterly", label: PLAN_LABELS.quarterly },
  { value: "annual",    label: PLAN_LABELS.annual },
];

function AddUserForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(searchParams.get("role") === "admin");
  const [activateSub, setActivateSub] = useState(false);
  const [subPlan, setSubPlan] = useState<SubscriptionPlan>("monthly");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const full_name = (form.elements.namedItem("full_name") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;

    if (!full_name || !email || !password) {
      setError("Completează toate câmpurile.");
      return;
    }
    if (password.length < 6) {
      setError("Parola trebuie să aibă cel puțin 6 caractere.");
      return;
    }

    startTransition(async () => {
      try {
        const userId = await createUser({ full_name, email, password, isAdmin });
        if (activateSub && userId) {
          const fd = new FormData();
          fd.set("plan", subPlan);
          await activateSubscription(userId, fd);
        }
        router.push("/admin/parents");
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Eroare necunoscută.");
      }
    });
  };

  return (
    <div className="max-w-lg">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 mb-4">
        <Link href="/admin/parents"><ArrowLeft size={16} />Înapoi</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Adaugă utilizator nou</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name">Nume complet</Label>
              <Input id="full_name" name="full_name" placeholder="Ion Popescu" autoComplete="off" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="utilizator@exemplu.com" autoComplete="off" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Parolă temporară</Label>
              <Input id="password" name="password" type="password" placeholder="Minim 6 caractere" autoComplete="new-password" />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Checkbox
                id="isAdmin"
                checked={isAdmin}
                onCheckedChange={(v) => setIsAdmin(!!v)}
              />
              <label htmlFor="isAdmin" className="text-sm text-gray-700 cursor-pointer">
                Cont de administrator
              </label>
            </div>

            {/* Secțiunea opțională abonament */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="activateSub"
                  checked={activateSub}
                  onCheckedChange={(v) => setActivateSub(!!v)}
                />
                <label htmlFor="activateSub" className="text-sm text-gray-700 cursor-pointer font-medium">
                  Activează abonament imediat
                </label>
              </div>

              {activateSub && (
                <div className="ml-7 space-y-1.5">
                  <Label htmlFor="subPlan">Plan abonament</Label>
                  <select
                    id="subPlan"
                    value={subPlan}
                    onChange={(e) => setSubPlan(e.target.value as SubscriptionPlan)}
                    className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                  >
                    {PLANS.map((p) => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={isPending} className="bg-blue-100 hover:bg-blue-200 text-blue-700">
                {isPending ? "Se creează..." : "Creează utilizator"}
              </Button>
              <Button type="button" variant="outline" asChild className="border-blue-300 text-blue-600 hover:bg-blue-50">
                <Link href="/admin/parents">Anulează</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AddUserPage() {
  return (
    <Suspense fallback={<div className="p-8 text-gray-500">Se încarcă...</div>}>
      <AddUserForm />
    </Suspense>
  );
}
