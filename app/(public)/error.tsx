"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PublicError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-7xl mb-5">📚</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Pagina nu s-a putut încărca</h1>
      <p className="text-gray-500 max-w-sm mb-8">
        A apărut o eroare neașteptată. Încearcă din nou sau revino mai târziu.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} className="bg-blue-100 hover:bg-blue-200 text-blue-700">
          Încearcă din nou
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Acasă</Link>
        </Button>
      </div>
    </div>
  );
}
