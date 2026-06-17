"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-white">
      <div className="text-8xl mb-6">⚡</div>
      <h1 className="text-2xl font-black text-gray-800 mb-2">Ceva nu a mers bine</h1>
      <p className="text-gray-500 max-w-sm mb-8">
        Ami și Moti lucrează să repare. Încearcă din nou sau revino mai târziu.
      </p>
      <div className="flex gap-3">
        <Button onClick={reset} className="bg-blue-100 hover:bg-blue-200 text-blue-700">
          Încearcă din nou
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Înapoi acasă</Link>
        </Button>
      </div>
    </div>
  );
}
