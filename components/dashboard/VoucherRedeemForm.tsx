"use client";

import { useActionState } from "react";
import { Ticket, CheckCircle } from "lucide-react";
import { redeemVoucher } from "@/lib/actions/voucher";
import { PLAN_LABELS } from "@/lib/subscription";
import type { SubscriptionPlan } from "@/lib/subscription";

export function VoucherRedeemForm() {
  const [state, action, pending] = useActionState(redeemVoucher, null);

  if (state && "success" in state) {
    const label = PLAN_LABELS[state.plan as SubscriptionPlan] ?? state.plan;
    const expires = new Date(state.expiresAt).toLocaleDateString("ro-RO", {
      day: "numeric", month: "long", year: "numeric",
    });
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-start gap-3">
        <CheckCircle size={22} className="text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-emerald-800">Voucher activat cu succes!</p>
          <p className="text-sm text-emerald-700 mt-0.5">
            Abonament <strong>{label.split("—")[0].trim()}</strong> activ până pe <strong>{expires}</strong>.
          </p>
          <p className="text-xs text-emerald-600 mt-1">Reîncarcă pagina pentru a vedea toate funcțiile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-violet-50 border border-violet-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <Ticket size={18} className="text-violet-600" />
        <p className="font-semibold text-violet-800 text-sm">Am un voucher</p>
      </div>
      <form action={action} className="flex gap-2 flex-wrap">
        <input
          name="code"
          placeholder="AMI-XXXXX-XXXXX"
          autoComplete="off"
          spellCheck={false}
          className="flex-1 min-w-[180px] h-9 px-3 rounded-lg border border-violet-200 bg-white text-sm font-mono uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-violet-300"
          style={{ letterSpacing: "0.1em" }}
        />
        <button
          type="submit"
          disabled={pending}
          className="h-9 px-4 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors disabled:opacity-60"
        >
          {pending ? "Se verifică..." : "Activează"}
        </button>
      </form>
      {state && "error" in state && (
        <p className="text-sm text-red-600 mt-2">{state.error}</p>
      )}
    </div>
  );
}
