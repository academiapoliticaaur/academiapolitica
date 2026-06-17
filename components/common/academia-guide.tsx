import { cn } from "@/lib/utils";

type GuideVariant = "info" | "tip" | "mission" | "discovery";

interface AcademiaGuideProps {
  variant?: GuideVariant;
  message: string;
  className?: string;
}

const config: Record<GuideVariant, { emoji: string; label: string; colors: string }> = {
  info: {
    emoji: "📘",
    label: "Informație utilă",
    colors: "bg-yellow-50 border-yellow-200 text-yellow-800",
  },
  tip: {
    emoji: "💡",
    label: "Sfat de formare",
    colors: "bg-blue-50 border-blue-200 text-blue-800",
  },
  mission: {
    emoji: "🎯",
    label: "Obiectivul modulului",
    colors: "bg-purple-50 border-purple-200 text-purple-800",
  },
  discovery: {
    emoji: "✨",
    label: "Ce ai învățat?",
    colors: "bg-sky-50 border-sky-200 text-sky-800",
  },
};

export function AcademiaGuide({ variant = "info", message, className }: AcademiaGuideProps) {
  const { emoji, label, colors } = config[variant];

  return (
    <div className={cn("rounded-xl border-2 p-4 flex gap-3 items-start", colors, className)}>
      <span className="text-3xl flex-shrink-0">{emoji}</span>
      <div>
        <p className="font-semibold text-sm mb-1">{label}</p>
        <p className="text-sm leading-relaxed">{message}</p>
      </div>
    </div>
  );
}
