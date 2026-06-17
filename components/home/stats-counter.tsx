"use client";

import { useEffect, useRef } from "react";

function useCountUp(target: number, duration = 1800) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || target === 0) {
      if (el) el.textContent = "0";
      return;
    }

    let startTime: number | null = null;
    const start = 0;

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 3);
    }

    function tick(now: number) {
      if (!startTime) startTime = now;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(start + easeOut(progress) * (target - start));
      if (el) el.textContent = current.toLocaleString("ro-RO");
      if (progress < 1) requestAnimationFrame(tick);
    }

    const raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);

  return ref;
}

interface StatItemProps {
  value: number;
  label: string;
  sublabel: string;
  emoji: string;
  color: string;
}

function StatItem({ value, label, sublabel, emoji, color }: StatItemProps) {
  const ref = useCountUp(value);
  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${color}`}>
      <span className="text-2xl shrink-0">{emoji}</span>
      <div>
        <p className="text-2xl font-extrabold tabular-nums leading-tight">
          <span ref={ref}>0</span>
        </p>
        <p className="text-xs font-semibold text-gray-700 leading-tight">{label}</p>
        <p className="text-xs text-gray-400 leading-snug">{sublabel}</p>
      </div>
    </div>
  );
}

interface StatsCounterProps {
  usersCount: number;
  lessonsCompleted: number;
  certificatesIssued: number;
}

export function StatsCounter({ usersCount, lessonsCompleted, certificatesIssued }: StatsCounterProps) {
  const items: StatItemProps[] = [
    {
      value: usersCount,
      label: "Utilizatori înregistrați",
      sublabel: "Pe drumul spre 1.000.000",
      emoji: "👥",
      color: "border-blue-200 bg-blue-50",
    },
    {
      value: lessonsCompleted,
      label: "Lecții finalizate",
      sublabel: "Completate de copii și elevi",
      emoji: "✅",
      color: "border-teal-200 bg-teal-50",
    },
    {
      value: certificatesIssued,
      label: "Certificate emise",
      sublabel: "Diplome de absolvire curs",
      emoji: "🎓",
      color: "border-amber-200 bg-amber-50",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {items.map((item) => (
        <StatItem key={item.label} {...item} />
      ))}
    </div>
  );
}
