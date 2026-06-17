"use client";

import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeleteButtonProps {
  action: () => Promise<{ error?: string } | void>;
  confirmMessage: string;
  redirectTo?: string;
  label?: string;
  variant?: "icon" | "button";
}

export function DeleteButton({
  action,
  confirmMessage,
  redirectTo,
  label,
  variant = "icon",
}: DeleteButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  function handleConfirm() {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await action();
      if (result && "error" in result && result.error) {
        setErrorMsg(result.error);
      } else {
        setOpen(false);
        if (redirectTo) router.push(redirectTo);
      }
    });
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        className={cn(
          variant === "button"
            ? cn(buttonVariants({ variant: "outline", size: "sm" }), "text-red-600 border-red-200 hover:bg-red-50 gap-2")
            : "p-1.5 rounded hover:bg-red-50 text-red-400 hover:text-red-600 transition-colors"
        )}
        title={variant === "icon" ? "Șterge" : undefined}
      >
        <Trash2 size={15} />
        {variant === "button" && (label ?? "Șterge")}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmare ștergere</AlertDialogTitle>
          <AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
        </AlertDialogHeader>

        {errorMsg && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {errorMsg}
          </p>
        )}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Anulează</AlertDialogCancel>
          <Button
            onClick={handleConfirm}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? "Se șterge..." : "Da, șterge"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
