"use client";

import { useState, useTransition } from "react";
import { cancelSubscription } from "@/lib/actions/subscription";

export function CancelSubscriptionButton() {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelSubscription();
      if (result?.error) {
        setError(result.error);
        setShowConfirm(false);
      }
    });
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="text-xs text-red-400 hover:text-red-600 underline mt-1"
      >
        Oprește abonamentul
      </button>
    );
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      {error && <p className="text-xs text-red-600">{error}</p>}
      <p className="text-xs text-red-700 font-semibold">
        Sigur vrei să oprești abonamentul? Accesul va fi dezactivat imediat.
      </p>
      <div className="flex gap-2">
        <button
          onClick={handleCancel}
          disabled={isPending}
          className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md font-medium disabled:opacity-50"
        >
          {isPending ? "Se dezactivează..." : "Da, opresc abonamentul"}
        </button>
        <button
          onClick={() => { setShowConfirm(false); setError(null); }}
          className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1 rounded-md border"
        >
          Anulează
        </button>
      </div>
    </div>
  );
}
