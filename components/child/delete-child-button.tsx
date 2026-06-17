"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteChildProfile } from "@/lib/actions/child-profile";
import { Trash2 } from "lucide-react";

export function DeleteChildButton({ profileId, childName }: { profileId: string; childName: string }) {
  const [step, setStep] = useState<"idle" | "confirm">("idle");
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      await deleteChildProfile(profileId);
    });
  };

  if (step === "confirm") {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-red-600 font-medium">Ești sigur? Datele se pierd definitiv.</span>
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isPending}
        >
          {isPending ? "Se șterge..." : "Da, șterge"}
        </Button>
        <Button variant="outline" size="sm" onClick={() => setStep("idle")} disabled={isPending}>
          Anulează
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      className="border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 gap-2"
      onClick={() => setStep("confirm")}
    >
      <Trash2 size={14} />
      Șterge profilul lui {childName}
    </Button>
  );
}
