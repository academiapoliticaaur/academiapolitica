"use client";

interface LessonCompleteOverlayProps {
  lessonTitle: string;
  xp?: number;
  onDone: () => void;
}

export function LessonCompleteOverlay({ lessonTitle, xp = 10, onDone }: LessonCompleteOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-teal-400 to-blue-500 text-white">
      {/* Confetti emoji-uri animate */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
        {["🌟", "⭐", "✨", "🎉", "🎊", "💫", "🏆", "🎯"].map((emoji, i) => (
          <span
            key={i}
            className="absolute text-2xl animate-bounce"
            style={{
              left: `${10 + i * 11}%`,
              top: `${5 + (i % 3) * 15}%`,
              animationDelay: `${i * 0.15}s`,
              animationDuration: `${0.8 + (i % 3) * 0.3}s`,
            }}
          >
            {emoji}
          </span>
        ))}
      </div>

      <div className="text-7xl mb-6 animate-bounce">🎉</div>
      <h2 className="text-3xl font-black mb-2 text-center px-4">Bravo!</h2>
      <p className="text-white/90 text-center px-8 mb-6 text-lg leading-snug">
        Ai terminat lecția<br />
        <span className="font-semibold">&bdquo;{lessonTitle}&rdquo;</span>
      </p>
      <div className="bg-white/20 rounded-2xl px-8 py-4 text-center backdrop-blur-sm mb-8">
        <p className="text-4xl font-black">⭐ +{xp} XP</p>
        <p className="text-white/80 text-sm mt-1">adăugat la profilul tău</p>
      </div>

      <button
        onClick={onDone}
        className="bg-white text-teal-600 font-black text-lg px-10 py-4 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-transform"
      >
        Continuă! →
      </button>
    </div>
  );
}
