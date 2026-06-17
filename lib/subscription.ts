export type SubscriptionPlan = "trial" | "monthly" | "quarterly" | "annual";

export const PLAN_DAYS: Record<SubscriptionPlan, number> = {
  trial: 7,
  monthly: 30,
  quarterly: 90,
  annual: 365,
};

export const PLAN_LABELS: Record<SubscriptionPlan, string> = {
  trial: "Trial gratuit (7 zile)",
  monthly: "Lunar — 29 lei/lună (30 zile)",
  quarterly: "Trimestrial — 24 lei/lună (90 zile, 72 lei)",
  annual: "Anual — 19 lei/lună (365 zile, 228 lei)",
};

export function isSubscriptionActive(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return false;
  return new Date(expiresAt) > new Date();
}

export function subscriptionExpiresIn(expiresAt: string | null | undefined): number | null {
  if (!expiresAt) return null;
  const diff = new Date(expiresAt).getTime() - Date.now();
  return diff > 0 ? Math.ceil(diff / (1000 * 60 * 60 * 24)) : null;
}

export function formatSubscriptionExpiry(expiresAt: string | null | undefined): string {
  if (!expiresAt) return "—";
  return new Date(expiresAt).toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
