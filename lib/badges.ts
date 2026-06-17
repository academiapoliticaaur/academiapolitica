export interface Badge {
  id: string;
  icon: string;
  name: string;
  description: string;
}

interface BadgeStats {
  totalXP: number;
  completedLessons: number;
  completedCourses: number;
  streakDays: number;
}

const BADGE_DEFINITIONS: (Badge & { check: (s: BadgeStats) => boolean })[] = [
  {
    id: "first-lesson",
    icon: "🎯",
    name: "Prima lecție",
    description: "Completează prima lecție",
    check: (s) => s.completedLessons >= 1,
  },
  {
    id: "five-lessons",
    icon: "📖",
    name: "Cititor curios",
    description: "5 lecții completate",
    check: (s) => s.completedLessons >= 5,
  },
  {
    id: "ten-lessons",
    icon: "📚",
    name: "Cititor activ",
    description: "10 lecții completate",
    check: (s) => s.completedLessons >= 10,
  },
  {
    id: "first-course",
    icon: "🏆",
    name: "Primul curs",
    description: "Obține prima diplomă",
    check: (s) => s.completedCourses >= 1,
  },
  {
    id: "three-courses",
    icon: "🎓",
    name: "Student harnic",
    description: "3 cursuri finalizate",
    check: (s) => s.completedCourses >= 3,
  },
  {
    id: "xp-100",
    icon: "⭐",
    name: "Primul centenar",
    description: "Acumulează 100 XP",
    check: (s) => s.totalXP >= 100,
  },
  {
    id: "xp-500",
    icon: "🚀",
    name: "Expert",
    description: "Acumulează 500 XP",
    check: (s) => s.totalXP >= 500,
  },
  {
    id: "streak-3",
    icon: "🔥",
    name: "Seria de 3",
    description: "3 zile consecutive de activitate",
    check: (s) => s.streakDays >= 3,
  },
  {
    id: "streak-7",
    icon: "💫",
    name: "Săptămâna de foc",
    description: "7 zile consecutive de activitate",
    check: (s) => s.streakDays >= 7,
  },
];

export function computeBadges(stats: BadgeStats): { badge: Badge; earned: boolean }[] {
  return BADGE_DEFINITIONS.map(({ check, ...badge }) => ({
    badge,
    earned: check(stats),
  }));
}
