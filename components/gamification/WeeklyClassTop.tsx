import { createAdminClient } from "@/lib/supabase/admin";

const MEDALS = ["🥇", "🥈", "🥉"];

interface Props {
  currentClassId?: string;
}

export async function WeeklyClassTop({ currentClassId }: Props) {
  const db = createAdminClient();

  const monday = new Date();
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  const { data: weekProgress } = await db
    .from("class_student_progress")
    .select("student_id")
    .eq("status", "completed")
    .gte("completed_at", monday.toISOString());

  if (!weekProgress || weekProgress.length === 0) return null;

  // Count completions per student
  const countByStudent: Record<string, number> = {};
  weekProgress.forEach((p) => {
    countByStudent[p.student_id] = (countByStudent[p.student_id] || 0) + 1;
  });

  const studentIds = Object.keys(countByStudent);
  if (studentIds.length === 0) return null;

  // Map students → classes
  const { data: students } = await db
    .from("class_students")
    .select("id, class_id")
    .in("id", studentIds);

  const countByClass: Record<string, number> = {};
  (students ?? []).forEach((s) => {
    countByClass[s.class_id] = (countByClass[s.class_id] || 0) + (countByStudent[s.id] || 0);
  });

  const top3 = Object.entries(countByClass)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id, count]) => ({ id, count }));

  if (top3.length === 0) return null;

  const { data: classes } = await db
    .from("classes")
    .select("id, name")
    .in("id", top3.map((t) => t.id));

  const nameMap = Object.fromEntries((classes ?? []).map((c) => [c.id, c.name]));

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b flex items-center gap-2">
        <span className="text-lg">🏆</span>
        <div>
          <h2 className="font-bold text-gray-800">Top clase — săptămâna aceasta</h2>
          <p className="text-xs text-gray-400 mt-0.5">Clasele cu cele mai multe lecții completate</p>
        </div>
      </div>
      <div className="divide-y">
        {top3.map((entry, i) => {
          const isMyClass = entry.id === currentClassId;
          return (
            <div
              key={entry.id}
              className={`flex items-center gap-3 px-5 sm:px-6 py-3.5 ${isMyClass ? "bg-blue-50" : ""}`}
            >
              <span className="text-2xl w-8 text-center flex-shrink-0">{MEDALS[i]}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${isMyClass ? "text-blue-700" : "text-gray-800"}`}>
                  {nameMap[entry.id] ?? "—"}
                  {isMyClass && <span className="ml-1 text-xs font-normal text-blue-500">(clasa ta)</span>}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-teal-600 text-sm">{entry.count} lecții</p>
                <p className="text-xs text-gray-400">completate</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
