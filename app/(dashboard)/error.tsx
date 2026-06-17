"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-7xl mb-5">⚠️</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Eroare în dashboard</h1>
      <p className="text-gray-500 max-w-sm mb-8">
        Nu am putut încărca această pagină. Datele tale sunt în siguranță — încearcă din nou.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} className="bg-blue-100 hover:bg-blue-200 text-blue-700">
          Încearcă din nou
        </Button>
        <Button asChild variant="outline">
          <Link href="/dashboard">Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
