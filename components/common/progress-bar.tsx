import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  color?: "orange" | "green" | "blue";
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  className,
  color = "orange",
}: ProgressBarProps) {
  const percentage = Math.round((value / max) * 100);

  const colors = {
    orange: "bg-blue-400",
    green: "bg-teal-400",
    blue: "bg-indigo-400",
  };

  return (
    <div className={cn("w-full", className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          {label && <span>{label}</span>}
          {showPercentage && <span className="font-medium">{percentage}%</span>}
        </div>
      )}
      <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all duration-500", colors[color])}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
}
