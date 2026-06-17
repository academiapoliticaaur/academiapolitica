"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resetCourseProgress } from "@/lib/actions/course-progress";

export function ReplayCourseButton({ profileId, courseId }: { profileId: string; courseId: string }) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleReset = () => {
    startTransition(async () => {
      await resetCourseProgress(profileId, courseId);
      router.refresh();
    });
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2 flex-wrap justify-center">
        <span className="text-sm text-yellow-100 font-medium">Progresul se va reseta. Ești sigur?</span>
        <Button
          size="sm"
          onClick={handleReset}
          disabled={isPending}
          className="bg-white text-yellow-700 hover:bg-yellow-50 font-bold"
        >
          {isPending ? "Se resetează..." : "Da, reia cursul"}
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setShowConfirm(false)}
          className="text-yellow-100 hover:bg-yellow-500/30"
        >
          Anulează
        </Button>
      </div>
    );
  }

  return (
    <Button
      size="sm"
      onClick={() => setShowConfirm(true)}
      className="bg-white/20 hover:bg-white/30 text-white border border-white/40 gap-2"
    >
      <RotateCcw size={14} />
      Reia cursul
    </Button>
  );
}
