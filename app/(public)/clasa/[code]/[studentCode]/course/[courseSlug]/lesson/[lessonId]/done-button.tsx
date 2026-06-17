"use client";

import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function DoneButton({ backUrl }: { backUrl: string }) {
  const router = useRouter();
  return (
    <div className="bg-white rounded-2xl p-6 text-center border border-indigo-100">
      <p className="text-gray-600 mb-4">Ai terminat lecția?</p>
      <Button
        onClick={() => router.push(backUrl)}
        size="lg"
        className="bg-teal-500 hover:bg-teal-600 text-white gap-2"
      >
        <CheckCircle size={20} />
        Am terminat! Înapoi la curs 🎉
      </Button>
    </div>
  );
}
