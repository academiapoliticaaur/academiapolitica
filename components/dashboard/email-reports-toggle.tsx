"use client";

import { useTransition } from "react";
import { toggleEmailReports } from "@/lib/actions/parent-profile";

export function EmailReportsToggle({ enabled }: { enabled: boolean }) {
  const [isPending, startTransition] = useTransition();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const checked = e.target.checked;
    startTransition(async () => {
      await toggleEmailReports(checked);
    });
  }

  return (
    <label className="flex items-center justify-between gap-4 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-gray-800">Raport săptămânal pe email</p>
        <p className="text-xs text-gray-500 mt-0.5">
          Primești în fiecare luni un rezumat cu progresul copilului
        </p>
      </div>
      <div className="relative flex-shrink-0">
        <input
          type="checkbox"
          className="sr-only peer"
          defaultChecked={enabled}
          onChange={handleChange}
          disabled={isPending}
        />
        <div className="w-10 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-500 peer-disabled:opacity-50 transition-colors" />
        <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
      </div>
    </label>
  );
}
