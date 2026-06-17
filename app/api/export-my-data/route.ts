import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const admin = createAdminClient();

  const [
    { data: profile },
    { data: children },
  ] = await Promise.all([
    supabase.from("parent_profiles").select("full_name, account_type, accepted_terms, parental_consent, email_reports, created_at").eq("user_id", user.id).single(),
    supabase.from("child_profiles").select("id, display_name, age_group, created_at").eq("parent_id", user.id),
  ]);

  const childIds = (children ?? []).map((c) => c.id);

  const [
    { data: progress },
    { data: certificates },
    { data: quizAttempts },
  ] = await Promise.all([
    childIds.length > 0
      ? admin.from("progress").select("child_profile_id, lesson_id, status, completed_at").in("child_profile_id", childIds)
      : Promise.resolve({ data: [] }),
    childIds.length > 0
      ? admin.from("certificates").select("child_profile_id, course_id, total_points, issued_at").in("child_profile_id", childIds)
      : Promise.resolve({ data: [] }),
    childIds.length > 0
      ? admin.from("quiz_attempts").select("child_profile_id, quiz_id, score, total_questions, completed_at").in("child_profile_id", childIds)
      : Promise.resolve({ data: [] }),
  ]);

  const exportData = {
    export_date: new Date().toISOString(),
    gdpr_basis: "GDPR Art. 20 — Dreptul la portabilitatea datelor",
    account: {
      email: user.email,
      created_at: user.created_at,
      full_name: profile?.full_name,
      account_type: profile?.account_type,
      accepted_terms: profile?.accepted_terms,
      parental_consent: profile?.parental_consent,
      email_reports: profile?.email_reports,
      profile_created_at: profile?.created_at,
    },
    children: (children ?? []).map((child) => ({
      display_name: child.display_name,
      age_group: child.age_group,
      created_at: child.created_at,
      progress: (progress ?? [])
        .filter((p) => p.child_profile_id === child.id)
        .map((p) => ({ lesson_id: p.lesson_id, status: p.status, completed_at: p.completed_at })),
      certificates: (certificates ?? [])
        .filter((c) => c.child_profile_id === child.id)
        .map((c) => ({ course_id: c.course_id, total_points: c.total_points, issued_at: c.issued_at })),
      quiz_attempts: (quizAttempts ?? [])
        .filter((q) => q.child_profile_id === child.id)
        .map((q) => ({ quiz_id: q.quiz_id, score: q.score, total_questions: q.total_questions, completed_at: q.completed_at })),
    })),
  };

  return new NextResponse(JSON.stringify(exportData, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="datele-mele-ami-moti-${new Date().toISOString().split("T")[0]}.json"`,
    },
  });
}
