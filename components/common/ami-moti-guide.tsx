import { cn } from "@/lib/utils";

type GuideVariant = "ami" | "moti" | "mission" | "discovery";

interface AmiMotiGuideProps {
  variant?: GuideVariant;
  message: string;
  className?: string;
}

const config: Record<GuideVariant, { emoji: string; label: string; colors: string }> = {
  ami: {
    emoji: "👧",
    label: "Ami îți explică",
    colors: "bg-teal-50 border-teal-200 text-teal-800",
  },
  moti: {
    emoji: "🐱",
    label: "Moti te provoacă",
    colors: "bg-blue-50 border-blue-200 text-blue-800",
  },
  mission: {
    emoji: "🎯",
    label: "Misiunea lecției",
    colors: "bg-purple-50 border-purple-200 text-purple-800",
  },
  discovery: {
    emoji: "✨",
    label: "Ce ai descoperit azi?",
    colors: "bg-sky-50 border-sky-200 text-sky-800",
  },
};

export function AmiMotiGuide({ variant = "ami", message, className }: AmiMotiGuideProps) {
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
