"use client";

import { useState, useTransition } from "react";
import { RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

interface TrashRestoreButtonProps {
  restoreAction: () => Promise<{ error?: string } | void>;
  permanentDeleteAction: () => Promise<{ error?: string } | void>;
  itemName: string;
}

export function TrashRestoreButton({
  restoreAction,
  permanentDeleteAction,
  itemName,
}: TrashRestoreButtonProps) {
  const [restorePending, startRestore] = useTransition();
  const [deletePending, startDelete] = useTransition();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  function handleRestore() {
    setErrorMsg(null);
    startRestore(async () => {
      const result = await restoreAction();
      if (result && "error" in result && result.error) setErrorMsg(result.error);
    });
  }

  function handlePermanentDelete() {
    setErrorMsg(null);
    startDelete(async () => {
      const result = await permanentDeleteAction();
      if (result && "error" in result && result.error) {
        setErrorMsg(result.error);
      } else {
        setDeleteOpen(false);
      }
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      {errorMsg && (
        <span className="text-xs text-red-500 max-w-[140px] truncate">{errorMsg}</span>
      )}

      {/* Restaurare */}
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-teal-700 border-teal-200 hover:bg-teal-50"
        onClick={handleRestore}
        disabled={restorePending || deletePending}
      >
        <RotateCcw size={13} />
        {restorePending ? "..." : "Restaurare"}
      </Button>

      {/* Ștergere permanentă */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogTrigger
          className={cn(
            buttonVariants({ variant: "outline", size: "sm" }),
            "gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
          )}
          disabled={restorePending || deletePending}
        >
          <Trash2 size={13} />
          Permanent
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ștergere permanentă</AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi definitiv <strong>{itemName}</strong>?
              Această acțiune este ireversibilă — datele nu pot fi recuperate.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletePending}>Anulează</AlertDialogCancel>
            <Button
              disabled={deletePending}
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handlePermanentDelete}
            >
              {deletePending ? "Se șterge..." : "Șterge definitiv"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
