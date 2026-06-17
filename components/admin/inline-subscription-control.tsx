"use client";

import { useState, useTransition } from "react";
import { CheckCircle, XCircle } from "lucide-react";
import { activateSubscription, deactivateSubscription } from "@/lib/admin/actions";
import { PLAN_LABELS, type SubscriptionPlan } from "@/lib/subscription";

const PLANS: { value: SubscriptionPlan; label: string }[] = [
  { value: "monthly",   label: PLAN_LABELS.monthly },
  { value: "quarterly", label: PLAN_LABELS.quarterly },
  { value: "annual",    label: PLAN_LABELS.annual },
];

interface InlineSubscriptionControlProps {
  userId: string;
  isActive: boolean;
  currentPlan: string | null;
}

export function InlineSubscriptionControl({
  userId,
  isActive,
  currentPlan,
}: InlineSubscriptionControlProps) {
  const [plan, setPlan] = useState<SubscriptionPlan>(
    (currentPlan as SubscriptionPlan) ?? "monthly"
  );
  const [activatePending, startActivate] = useTransition();
  const [deactivatePending, startDeactivate] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const pending = activatePending || deactivatePending;

  function handleActivate() {
    setError(null);
    const formData = new FormData();
    formData.set("plan", plan);
    startActivate(async () => {
      try {
        await activateSubscription(userId, formData);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Eroare");
      }
    });
  }

  function handleDeactivate() {
    setError(null);
    startDeactivate(async () => {
      try {
        await deactivateSubscription(userId);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Eroare");
      }
    });
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {error && (
        <span className="text-xs text-red-500 w-full">{error}</span>
      )}

      {/* Selector plan */}
      <select
        value={plan}
        onChange={(e) => setPlan(e.target.value as SubscriptionPlan)}
        disabled={pending}
        className="text-xs border border-gray-200 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-400 disabled:opacity-50"
      >
        {PLANS.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      {/* Activează / Reînnoire */}
      <button
        onClick={handleActivate}
        disabled={pending}
        className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md bg-teal-100 text-teal-700 hover:bg-teal-200 disabled:opacity-50 transition-colors"
      >
        <CheckCircle size={12} />
        {activatePending ? "..." : isActive ? "Reînnoire" : "Activează"}
      </button>

      {/* Dezactivează — doar dacă e activ */}
      {isActive && (
        <button
          onClick={handleDeactivate}
          disabled={pending}
          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1.5 rounded-md bg-red-100 text-red-600 hover:bg-red-200 disabled:opacity-50 transition-colors"
        >
          <XCircle size={12} />
          {deactivatePending ? "..." : "Dezactivează"}
        </button>
      )}
    </div>
  );
}
