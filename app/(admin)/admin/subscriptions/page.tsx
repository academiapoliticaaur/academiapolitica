import { createAdminClient } from "@/lib/supabase/admin";
import { CreditCard, CheckCircle, XCircle, Clock, Edit, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  isSubscriptionActive,
  subscriptionExpiresIn,
  formatSubscriptionExpiry,
  PLAN_LABELS,
  type SubscriptionPlan,
} from "@/lib/subscription";
import { InlineSubscriptionControl } from "@/components/admin/inline-subscription-control";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Abonamente — Admin" };

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  family: "Cursant",
  member: "Cursant",
  formator: "Formator",
  profesor: "Lector",
  lector: "Lector",
};

type FilterType = "all" | "active" | "expired" | "none";

interface PageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function SubscriptionsPage({ searchParams }: PageProps) {
  const { filter = "all" } = await searchParams;
  const db = createAdminClient();

  const [{ data: authData }, { data: profiles }] = await Promise.all([
    db.auth.admin.listUsers({ perPage: 1000 }),
    db.from("parent_profiles")
      .select("user_id, full_name, account_type, approved, subscription_plan, subscription_expires_at")
      .order("full_name"),
  ]);

  const emailMap: Record<string, string> = {};
  (authData?.users ?? []).forEach((u) => { emailMap[u.id] = u.email ?? "—"; });

  const now = new Date();

  const rows = (profiles ?? []).map((p) => {
    const active = isSubscriptionActive(p.subscription_expires_at);
    const expired = !!p.subscription_expires_at && !active;
    const hasNone = !p.subscription_expires_at;
    const daysLeft = subscriptionExpiresIn(p.subscription_expires_at);
    return { ...p, email: emailMap[p.user_id] ?? "—", active, expired, hasNone, daysLeft };
  });

  const filtered = rows.filter((r) => {
    if (filter === "active") return r.active;
    if (filter === "expired") return r.expired;
    if (filter === "none") return r.hasNone;
    return true;
  });

  const countActive = rows.filter((r) => r.active).length;
  const countExpired = rows.filter((r) => r.expired).length;
  const countNone = rows.filter((r) => r.hasNone).length;
  const countExpiringsSoon = rows.filter((r) => r.active && r.daysLeft !== null && r.daysLeft <= 7).length;

  const filterOptions: { value: FilterType; label: string; count: number; color: string }[] = [
    { value: "all",     label: "Toți",           count: rows.length,   color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
    { value: "active",  label: "Activ",           count: countActive,   color: "bg-teal-100 text-teal-700 hover:bg-teal-200" },
    { value: "expired", label: "Expirat",         count: countExpired,  color: "bg-red-100 text-red-700 hover:bg-red-200" },
    { value: "none",    label: "Fără abonament",  count: countNone,     color: "bg-gray-100 text-gray-500 hover:bg-gray-200" },
  ];

  const editPath = (p: { account_type: string; user_id: string }) =>
    p.account_type === "member"
      ? `/admin/parents/${p.user_id}/edit?from=/admin/subscriptions`
      : `/admin/teachers/${p.user_id}/edit?from=/admin/subscriptions`;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <CreditCard size={22} className="text-indigo-500" />
        <h1 className="text-2xl font-bold">Abonamente</h1>
      </div>

      {/* Sumar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Active",         count: countActive,   icon: <CheckCircle size={18} className="text-teal-500" />,  bg: "bg-teal-50 border-teal-200" },
          { label: "Expirate",       count: countExpired,  icon: <XCircle size={18} className="text-red-400" />,       bg: "bg-red-50 border-red-200" },
          { label: "Fără abonament", count: countNone,     icon: <Clock size={18} className="text-gray-400" />,        bg: "bg-gray-50 border-gray-200" },
          { label: "Expiră în 7 zile", count: countExpiringsSoon, icon: <AlertTriangle size={18} className="text-amber-500" />, bg: "bg-amber-50 border-amber-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border px-4 py-3 flex items-center gap-3 ${s.bg}`}>
            {s.icon}
            <div>
              <p className="text-xl font-bold leading-tight">{s.count}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filtre */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/admin/subscriptions" : `/admin/subscriptions?filter=${f.value}`}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.value || (f.value === "all" && filter === "all")
                ? f.value === "active" ? "bg-teal-500 text-white"
                  : f.value === "expired" ? "bg-red-500 text-white"
                  : "bg-gray-700 text-white"
                : f.color
            }`}
          >
            {f.label}
            <span className="text-xs opacity-75">({f.count})</span>
          </Link>
        ))}
      </div>

      {/* Tabel */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed p-12 text-center text-gray-400">
          <CreditCard size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Niciun utilizator în această categorie.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Utilizator</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 hidden sm:table-cell">Tip</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500 hidden md:table-cell">Expiră</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Acțiuni rapide</th>
                <th className="px-4 py-3 text-right font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((row) => {
                const warningZone = row.active && row.daysLeft !== null && row.daysLeft <= 7;
                return (
                  <tr key={row.user_id} className={`hover:bg-gray-50 transition-colors ${warningZone ? "bg-amber-50/40" : ""}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 truncate max-w-[160px]">{row.full_name ?? "—"}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[160px]">{row.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        row.account_type === "member"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-indigo-100 text-indigo-700"
                      }`}>
                        {ACCOUNT_TYPE_LABELS[row.account_type ?? "member"] ?? row.account_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      {row.subscription_expires_at ? (
                        <div>
                          <p className="text-sm text-gray-700">{formatSubscriptionExpiry(row.subscription_expires_at)}</p>
                          {row.active && row.daysLeft !== null && (
                            <p className={`text-xs ${warningZone ? "text-amber-600 font-semibold" : "text-gray-400"}`}>
                              {warningZone && "⚠ "}{row.daysLeft} zile rămase
                            </p>
                          )}
                          {row.subscription_plan && (
                            <p className="text-xs text-gray-400 mt-0.5">
                              {PLAN_LABELS[row.subscription_plan as SubscriptionPlan] ?? row.subscription_plan}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {row.active ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full">
                          <CheckCircle size={11} /> Activ
                        </span>
                      ) : row.expired ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                          <XCircle size={11} /> Expirat
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <Clock size={11} /> Inactiv
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <InlineSubscriptionControl
                        userId={row.user_id}
                        isActive={row.active}
                        currentPlan={row.subscription_plan}
                      />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" asChild className="gap-1.5 text-gray-500 hover:text-gray-900">
                        <Link href={editPath(row)}>
                          <Edit size={13} />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
