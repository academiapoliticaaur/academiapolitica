"use client";

import { useState, useTransition } from "react";
import { CheckCircle, XCircle, Clock, CreditCard, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  approveUser,
  rejectSubscriptionRequest,
  bulkApproveAccounts,
  bulkApproveSubscriptions,
} from "@/lib/admin/actions";
import { PLAN_LABELS, type SubscriptionPlan } from "@/lib/subscription";

export type AccountPendingRow = {
  user_id: string;
  full_name: string | null;
  email: string;
  account_type: string | null;
  created_at: string | null;
};

export type SubRequestRow = {
  id: string;
  user_id: string;
  plan: string;
  created_at: string | null;
  email: string;
  full_name: string | null;
  account_type: string | null;
};

export function ApprovalsWithBulk({
  accounts,
  subRequests,
}: {
  accounts: AccountPendingRow[];
  subRequests: SubRequestRow[];
}) {
  const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
  const [selectedSubs, setSelectedSubs] = useState<Set<string>>(new Set());
  const [accountsPending, startAccounts] = useTransition();
  const [subsPending, startSubs] = useTransition();
  const [singlePending, startSingle] = useTransition();

  // ─── Accounts ────────────────────────────────────────────────────────────────
  function toggleAccount(userId: string) {
    setSelectedAccounts((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  }

  function toggleAllAccounts() {
    setSelectedAccounts((prev) =>
      prev.size === accounts.length ? new Set() : new Set(accounts.map((a) => a.user_id))
    );
  }

  function handleBulkApproveAccounts() {
    const selected = accounts.filter((a) => selectedAccounts.has(a.user_id));
    startAccounts(async () => {
      await bulkApproveAccounts(
        selected.map((a) => ({ userId: a.user_id, email: a.email, fullName: a.full_name ?? "" }))
      );
      setSelectedAccounts(new Set());
    });
  }

  // ─── Subscriptions ───────────────────────────────────────────────────────────
  function toggleSub(id: string) {
    setSelectedSubs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAllSubs() {
    setSelectedSubs((prev) =>
      prev.size === subRequests.length ? new Set() : new Set(subRequests.map((r) => r.id))
    );
  }

  function handleBulkApproveSubs() {
    const selected = subRequests.filter((r) => selectedSubs.has(r.id));
    startSubs(async () => {
      await bulkApproveSubscriptions(
        selected.map((r) => ({ requestId: r.id, userId: r.user_id, plan: r.plan as SubscriptionPlan }))
      );
      setSelectedSubs(new Set());
    });
  }

  return (
    <div className="max-w-4xl space-y-10">

      {/* ── Secțiunea 1 — Conturi în așteptare ── */}
      <div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Aprobare conturi noi</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              {accounts.length === 0
                ? "Nicio cerere în așteptare."
                : `${accounts.length} cont${accounts.length !== 1 ? "uri" : ""} în așteptare`}
            </p>
          </div>
          {selectedAccounts.size > 0 && (
            <Button
              onClick={handleBulkApproveAccounts}
              disabled={accountsPending}
              className="bg-teal-600 hover:bg-teal-700 text-white gap-2 shrink-0"
            >
              <CheckCircle size={15} />
              {accountsPending ? "Se aprobă..." : `Aprobă selectate (${selectedAccounts.size})`}
            </Button>
          )}
        </div>

        {accounts.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <CheckCircle className="mx-auto mb-3 text-teal-400" size={40} />
            <p className="text-gray-500">Toate conturile au fost procesate.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <button onClick={toggleAllAccounts} className="text-gray-400 hover:text-gray-700 transition-colors">
                      {selectedAccounts.size === accounts.length ? (
                        <CheckSquare size={16} className="text-teal-600" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Nume</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Email</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Tip cont</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Înregistrat</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {accounts.map((a) => (
                  <tr
                    key={a.user_id}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedAccounts.has(a.user_id) ? "bg-teal-50" : ""}`}
                    onClick={() => toggleAccount(a.user_id)}
                  >
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleAccount(a.user_id)} className="text-gray-400 hover:text-gray-700">
                        {selectedAccounts.has(a.user_id) ? (
                          <CheckSquare size={16} className="text-teal-600" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 font-medium flex items-center gap-2">
                      <Clock size={14} className="text-amber-400 shrink-0" />
                      {a.full_name || "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-500">{a.email}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                        {a.account_type ?? "family"}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {a.created_at ? new Date(a.created_at).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <Button
                        size="sm"
                        disabled={singlePending}
                        onClick={() =>
                          startSingle(async () => {
                            await approveUser(a.user_id, a.email, a.full_name ?? "");
                          })
                        }
                        className="bg-teal-100 hover:bg-teal-200 text-teal-700 gap-1.5"
                      >
                        <CheckCircle size={14} />
                        Aprobă
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Secțiunea 2 — Cereri abonament ── */}
      <div>
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CreditCard size={20} className="text-indigo-500" />
            <div>
              <h2 className="text-xl font-bold">Cereri abonament</h2>
              <p className="text-sm text-gray-500">
                {subRequests.length === 0
                  ? "Nicio cerere în așteptare."
                  : `${subRequests.length} cerere${subRequests.length !== 1 ? "ri" : ""} în așteptare`}
              </p>
            </div>
          </div>
          {selectedSubs.size > 0 && (
            <Button
              onClick={handleBulkApproveSubs}
              disabled={subsPending}
              className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shrink-0"
            >
              <CheckCircle size={15} />
              {subsPending ? "Se aprobă..." : `Aprobă selectate (${selectedSubs.size})`}
            </Button>
          )}
        </div>

        {subRequests.length === 0 ? (
          <div className="bg-white rounded-xl border p-10 text-center">
            <CreditCard className="mx-auto mb-3 text-indigo-300" size={36} />
            <p className="text-gray-500">Nicio cerere de abonament în așteptare.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 w-10">
                    <button onClick={toggleAllSubs} className="text-gray-400 hover:text-gray-700 transition-colors">
                      {selectedSubs.size === subRequests.length ? (
                        <CheckSquare size={16} className="text-indigo-600" />
                      ) : (
                        <Square size={16} />
                      )}
                    </button>
                  </th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Utilizator</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Email</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Plan solicitat</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Data</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Acțiuni</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {subRequests.map((r) => (
                  <tr
                    key={r.id}
                    className={`hover:bg-gray-50 cursor-pointer transition-colors ${selectedSubs.has(r.id) ? "bg-indigo-50" : ""}`}
                    onClick={() => toggleSub(r.id)}
                  >
                    <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => toggleSub(r.id)} className="text-gray-400 hover:text-gray-700">
                        {selectedSubs.has(r.id) ? (
                          <CheckSquare size={16} className="text-indigo-600" />
                        ) : (
                          <Square size={16} />
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-4 font-medium">
                      <p>{r.full_name || "—"}</p>
                      <span className="text-xs text-gray-400">{r.account_type}</span>
                    </td>
                    <td className="px-5 py-4 text-gray-500">{r.email}</td>
                    <td className="px-5 py-4">
                      <span className="text-xs font-semibold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                        {PLAN_LABELS[r.plan as SubscriptionPlan] ?? r.plan}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {r.created_at ? new Date(r.created_at).toLocaleDateString("ro-RO", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          disabled={subsPending}
                          onClick={() =>
                            startSubs(async () => {
                              const { approveSubscriptionRequest } = await import("@/lib/admin/actions");
                              await approveSubscriptionRequest(r.id, r.user_id, r.plan as SubscriptionPlan);
                            })
                          }
                          className="bg-teal-100 hover:bg-teal-200 text-teal-700 gap-1.5"
                        >
                          <CheckCircle size={13} />
                          Aprobă
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={subsPending}
                          onClick={() =>
                            startSubs(async () => {
                              await rejectSubscriptionRequest(r.id, r.user_id);
                            })
                          }
                          className="border-red-200 text-red-600 hover:bg-red-50 gap-1.5"
                        >
                          <XCircle size={13} />
                          Respinge
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
