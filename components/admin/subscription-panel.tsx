import { CreditCard, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activateSubscription, deactivateSubscription } from "@/lib/admin/actions";
import {
  isSubscriptionActive,
  subscriptionExpiresIn,
  formatSubscriptionExpiry,
  PLAN_LABELS,
  type SubscriptionPlan,
} from "@/lib/subscription";

interface SubscriptionPanelProps {
  userId: string;
  subscriptionPlan: string | null;
  subscriptionExpiresAt: string | null;
}

const PLANS: { value: SubscriptionPlan; label: string }[] = [
  { value: "monthly",   label: PLAN_LABELS.monthly },
  { value: "quarterly", label: PLAN_LABELS.quarterly },
  { value: "annual",    label: PLAN_LABELS.annual },
];

export function SubscriptionPanel({
  userId,
  subscriptionPlan,
  subscriptionExpiresAt,
}: SubscriptionPanelProps) {
  const active = isSubscriptionActive(subscriptionExpiresAt);
  const daysLeft = subscriptionExpiresIn(subscriptionExpiresAt);

  const activateAction = activateSubscription.bind(null, userId);
  const deactivateAction = deactivateSubscription.bind(null, userId);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <CreditCard size={18} />
          Subscripție
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Status curent */}
        <div className={`flex items-center gap-3 p-3 rounded-lg border ${
          active
            ? "bg-teal-50 border-teal-200"
            : "bg-gray-50 border-gray-200"
        }`}>
          {active ? (
            <CheckCircle size={20} className="text-teal-500 shrink-0" />
          ) : (
            <XCircle size={20} className="text-gray-400 shrink-0" />
          )}
          <div className="text-sm">
            {active ? (
              <>
                <p className="font-semibold text-teal-800">Abonament activ</p>
                <p className="text-teal-600">
                  Plan: <strong>{PLAN_LABELS[subscriptionPlan as SubscriptionPlan] ?? subscriptionPlan}</strong>
                  {" · "}Expiră: <strong>{formatSubscriptionExpiry(subscriptionExpiresAt)}</strong>
                  {daysLeft !== null && (
                    <span className="ml-1 text-teal-500">({daysLeft} zile rămase)</span>
                  )}
                </p>
              </>
            ) : subscriptionExpiresAt ? (
              <>
                <p className="font-semibold text-red-700">Abonament expirat</p>
                <p className="text-red-600">
                  A expirat pe {formatSubscriptionExpiry(subscriptionExpiresAt)}
                </p>
              </>
            ) : (
              <p className="text-gray-600">Nicio subscripție activă</p>
            )}
          </div>
        </div>

        {/* Activare */}
        <form action={activateAction} className="flex items-end gap-3">
          <div className="flex-1 space-y-1.5">
            <label htmlFor="plan" className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Clock size={14} />
              {active ? "Reînnoire / extindere" : "Activează abonament"}
            </label>
            <select
              id="plan"
              name="plan"
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {PLANS.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <Button
            type="submit"
            className="bg-teal-100 hover:bg-teal-200 text-teal-700 shrink-0"
          >
            {active ? "Reînnoire" : "Activează"}
          </Button>
        </form>

        {/* Dezactivare (doar dacă e activ) */}
        {active && (
          <form action={deactivateAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50 w-full"
            >
              Dezactivează abonament
            </Button>
          </form>
        )}

      </CardContent>
    </Card>
  );
}
