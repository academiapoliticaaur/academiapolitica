import { cn } from "@/lib/utils";
import type { AgeGroup } from "@/types";

interface AgeGroupBadgeProps {
  ageGroup: AgeGroup;
  size?: "sm" | "md";
  className?: string;
}

export function AgeGroupBadge({ ageGroup, size = "md", className }: AgeGroupBadgeProps) {
  const isYoung = ageGroup === "0-4";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-semibold",
        isYoung
          ? "bg-teal-100 text-teal-700"
          : "bg-indigo-100 text-indigo-700",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
    >
      {isYoung ? "🌱" : "🔬"}
      {isYoung ? "Clasele 0–4" : "Clasele 5–8"}
    </span>
  );
}
