"use client";

import { useTransition } from "react";
import { deleteOwnAccount } from "@/lib/actions/parent-profile";

export function DeleteAccountButton() {
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    const confirmed = confirm(
      "Ești sigur că vrei să îți ștergi contul?\n\n" +
      "Se vor șterge permanent:\n" +
      "• Profilurile tuturor copiilor\n" +
      "• Progresul și certificatele lor\n" +
      "• Datele contului tău\n\n" +
      "Această acțiune este IREVERSIBILĂ."
    );
    if (!confirmed) return;

    startTransition(async () => {
      await deleteOwnAccount();
    });
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      className="w-full py-2.5 px-4 rounded-lg border-2 border-red-200 text-red-600 font-medium text-sm hover:bg-red-50 hover:border-red-300 disabled:opacity-50 transition-colors"
    >
      {isPending ? "Se șterge contul..." : "Șterge definitiv contul meu"}
    </button>
  );
}
