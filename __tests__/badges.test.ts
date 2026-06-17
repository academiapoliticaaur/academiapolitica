import { describe, it, expect } from "vitest";
import { computeBadges } from "@/lib/badges";

describe("computeBadges", () => {
  it("nicio insignă pentru un utilizator nou (zero activitate)", () => {
    const result = computeBadges({ totalXP: 0, completedLessons: 0, completedCourses: 0, streakDays: 0 });
    expect(result.every((r) => !r.earned)).toBe(true);
  });

  it("acordă 'Prima lecție' după prima lecție completată", () => {
    const result = computeBadges({ totalXP: 10, completedLessons: 1, completedCourses: 0, streakDays: 0 });
    const badge = result.find((r) => r.badge.id === "first-lesson");
    expect(badge?.earned).toBe(true);
  });

  it("nu acordă 'Cititor curios' (5 lecții) cu doar 4 lecții", () => {
    const result = computeBadges({ totalXP: 40, completedLessons: 4, completedCourses: 0, streakDays: 0 });
    const badge = result.find((r) => r.badge.id === "five-lessons");
    expect(badge?.earned).toBe(false);
  });

  it("acordă 'Cititor curios' la exact 5 lecții completate", () => {
    const result = computeBadges({ totalXP: 50, completedLessons: 5, completedCourses: 0, streakDays: 0 });
    const badge = result.find((r) => r.badge.id === "five-lessons");
    expect(badge?.earned).toBe(true);
  });

  it("acordă 'Primul curs' la prima diplomă", () => {
    const result = computeBadges({ totalXP: 100, completedLessons: 10, completedCourses: 1, streakDays: 0 });
    const badge = result.find((r) => r.badge.id === "first-course");
    expect(badge?.earned).toBe(true);
  });

  it("acordă 'Primul centenar' la exact 100 XP", () => {
    const result = computeBadges({ totalXP: 100, completedLessons: 0, completedCourses: 0, streakDays: 0 });
    const badge = result.find((r) => r.badge.id === "xp-100");
    expect(badge?.earned).toBe(true);
  });

  it("nu acordă 'Expert' (500 XP) cu 499 XP", () => {
    const result = computeBadges({ totalXP: 499, completedLessons: 0, completedCourses: 0, streakDays: 0 });
    const badge = result.find((r) => r.badge.id === "xp-500");
    expect(badge?.earned).toBe(false);
  });

  it("acordă 'Seria de 3' la 3 zile consecutive", () => {
    const result = computeBadges({ totalXP: 0, completedLessons: 0, completedCourses: 0, streakDays: 3 });
    const badge = result.find((r) => r.badge.id === "streak-3");
    expect(badge?.earned).toBe(true);
  });

  it("nu acordă 'Săptămâna de foc' cu 6 zile streak", () => {
    const result = computeBadges({ totalXP: 0, completedLessons: 0, completedCourses: 0, streakDays: 6 });
    const badge = result.find((r) => r.badge.id === "streak-7");
    expect(badge?.earned).toBe(false);
  });

  it("returnează întotdeauna toate cele 9 insigne (earned sau nu)", () => {
    const result = computeBadges({ totalXP: 1000, completedLessons: 20, completedCourses: 5, streakDays: 10 });
    expect(result).toHaveLength(9);
    expect(result.every((r) => r.earned)).toBe(true);
  });
});
