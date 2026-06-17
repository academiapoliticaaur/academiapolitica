"use client";

import { useState, useTransition } from "react";
import { CreditCard, CheckCircle, Clock, X } from "lucide-react";
import { requestSubscription, cancelSubscriptionRequest } from "@/lib/actions/subscription-request";
import { PLAN_LABELS, type SubscriptionPlan } from "@/lib/subscription";

const PLANS: { value: SubscriptionPlan; label: string }[] = [
  { value: "monthly",   label: PLAN_LABELS.monthly },
  { value: "quarterly", label: PLAN_LABELS.quarterly },
  { value: "annual",    label: PLAN_LABELS.annual },
];

interface SubscriptionRequestBannerProps {
  hasPendingRequest: boolean;
  pendingPlan?: string | null;
}

export function SubscriptionRequestBanner({
  hasPendingRequest,
  pendingPlan,
}: SubscriptionRequestBannerProps) {
  const [plan, setPlan] = useState<SubscriptionPlan>("monthly");
  const [submitted, setSubmitted] = useState(hasPendingRequest);
  const [submittedPlan, setSubmittedPlan] = useState<string | null>(pendingPlan ?? null);
  const [error, setError] = useState<string | null>(null);
  const [requestPending, startRequest] = useTransition();
  const [cancelPending, startCancel] = useTransition();

  function handleSubmit() {
    setError(null);
    const formData = new FormData();
    formData.set("plan", plan);
    startRequest(async () => {
      const result = await requestSubscription(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setSubmitted(true);
        setSubmittedPlan(plan);
      }
    });
  }

  function handleCancel() {
    startCancel(async () => {
      await cancelSubscriptionRequest();
      setSubmitted(false);
      setSubmittedPlan(null);
    });
  }

  if (submitted) {
    return (
      <div className="mb-6 bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start gap-3">
        <Clock size={22} className="text-teal-500 shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="font-semibold text-teal-800">Cerere abonament trimisă</p>
          <p className="text-sm text-teal-700 mt-0.5">
            Cererea ta pentru planul <strong>{PLAN_LABELS[submittedPlan as SubscriptionPlan] ?? submittedPlan}</strong> a fost trimisă și va fi procesată de un administrator.
          </p>
        </div>
        <button
          onClick={handleCancel}
          disabled={cancelPending}
          className="shrink-0 text-teal-600 hover:text-teal-800 transition-colors disabled:opacity-50"
          title="Anulează cererea"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4">
      <div className="flex items-start gap-3 mb-3">
        <CreditCard size={22} className="text-indigo-500 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-indigo-800">Activează abonamentul</p>
          <p className="text-sm text-indigo-700 mt-0.5">
            Selectează un plan și trimite cererea de activare. Un administrator o va procesa în cel mai scurt timp.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <select
          value={plan}
          onChange={(e) => setPlan(e.target.value as SubscriptionPlan)}
          disabled={requestPending}
          className="text-sm border border-indigo-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:opacity-50"
        >
          {PLANS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        <button
          onClick={handleSubmit}
          disabled={requestPending}
          className="inline-flex items-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          <CheckCircle size={15} />
          {requestPending ? "Se trimite..." : "Solicită abonament"}
        </button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">{error}</p>
      )}
    </div>
  );
}
