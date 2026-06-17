import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export interface HomepageStats {
  usersCount: number;
  lessonsCompleted: number;
  certificatesIssued: number;
}

async function fetchHomepageStats(): Promise<HomepageStats> {
  const db = createAdminClient();

  const [
    { count: usersCount },
    { count: progressCount },
    { count: classProgressCount },
    { count: certCount },
    { count: classCertCount },
  ] = await Promise.all([
    db.from("parent_profiles").select("*", { count: "exact", head: true }),
    db.from("progress").select("*", { count: "exact", head: true }).eq("status", "completed"),
    db.from("class_student_progress").select("*", { count: "exact", head: true }).eq("status", "completed"),
    db.from("child_certificates").select("*", { count: "exact", head: true }),
    db.from("class_student_certificates").select("*", { count: "exact", head: true }),
  ]);

  return {
    usersCount: usersCount ?? 0,
    lessonsCompleted: (progressCount ?? 0) + (classProgressCount ?? 0),
    certificatesIssued: (certCount ?? 0) + (classCertCount ?? 0),
  };
}

// Cache 6 ore — revalidat la restart sau manual
export const getHomepageStats = unstable_cache(
  fetchHomepageStats,
  ["homepage-stats"],
  { revalidate: 21600, tags: ["homepage-stats"] }
);
