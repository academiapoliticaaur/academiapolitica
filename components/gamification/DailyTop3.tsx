import { createAdminClient } from "@/lib/supabase/admin";

const MEDALS = ["🥇", "🥈", "🥉"];

interface Props {
  currentChildId?: string;
}

export async function DailyTop3({ currentChildId }: Props) {
  const db = createAdminClient();

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: todayProgress } = await db
    .from("progress")
    .select("child_profile_id")
    .eq("status", "completed")
    .gte("completed_at", todayStart.toISOString());

  if (!todayProgress || todayProgress.length === 0) return null;

  const countByChild: Record<string, number> = {};
  todayProgress.forEach((p) => {
    if (p.child_profile_id) {
      countByChild[p.child_profile_id] = (countByChild[p.child_profile_id] || 0) + 1;
    }
  });

  const top3 = Object.entries(countByChild)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([id, count]) => ({ id, count }));

  if (top3.length === 0) return null;

  const { data: profiles } = await db
    .from("child_profiles")
    .select("id, display_name")
    .in("id", top3.map((t) => t.id));

  const nameMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p.display_name]));

  return (
    <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
      <div className="px-5 sm:px-6 py-4 border-b flex items-center gap-2">
        <span className="text-lg">⚡</span>
        <div>
          <h2 className="font-bold text-gray-800">Top 3 azi</h2>
          <p className="text-xs text-gray-400 mt-0.5">Cei mai activi copii de astăzi</p>
        </div>
      </div>
      <div className="divide-y">
        {top3.map((entry, i) => {
          const isMe = entry.id === currentChildId;
          return (
            <div
              key={entry.id}
              className={`flex items-center gap-3 px-5 sm:px-6 py-3.5 ${isMe ? "bg-yellow-50" : ""}`}
            >
              <span className="text-2xl w-8 text-center flex-shrink-0">{MEDALS[i]}</span>
              <div className="flex-1 min-w-0">
                <p className={`font-semibold truncate ${isMe ? "text-yellow-700" : "text-gray-800"}`}>
                  {nameMap[entry.id] ?? "—"}
                  {isMe && <span className="ml-1 text-xs font-normal text-yellow-600">(tu)</span>}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="font-bold text-orange-500 text-sm">{entry.count * 10} XP</p>
                <p className="text-xs text-gray-400">{entry.count} {entry.count === 1 ? "lecție" : "lecții"}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
