"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ChildError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-7xl mb-5">🐾</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Ups! Ceva nu a mers bine</h1>
      <p className="text-gray-500 max-w-sm mb-8">
        Ami și Moti lucrează să repare. Încearcă din nou!
      </p>
      <Button onClick={reset} className="bg-teal-500 hover:bg-teal-600 text-white">
        Încearcă din nou
      </Button>
    </div>
  );
}
