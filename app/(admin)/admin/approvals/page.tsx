import { createAdminClient } from "@/lib/supabase/admin";
import { ApprovalsWithBulk, type AccountPendingRow, type SubRequestRow } from "@/components/admin/approvals-bulk";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Aprobare conturi" };

export default async function ApprovalsPage() {
  const supabase = createAdminClient();

  const [{ data: pending }, { data: subRequests }] = await Promise.all([
    supabase
      .from("parent_profiles")
      .select("user_id, full_name, account_type, created_at")
      .eq("approved", false)
      .order("created_at", { ascending: true }),
    supabase
      .from("subscription_requests")
      .select("id, user_id, plan, created_at")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
  ]);

  const accounts: AccountPendingRow[] = await Promise.all(
    (pending ?? []).map(async (p) => {
      const { data: authUser } = await supabase.auth.admin.getUserById(p.user_id);
      return {
        user_id: p.user_id,
        full_name: p.full_name,
        email: authUser?.user?.email ?? "—",
        account_type: p.account_type,
        created_at: p.created_at,
      };
    })
  );

  const subs: SubRequestRow[] = await Promise.all(
    (subRequests ?? []).map(async (r) => {
      const [{ data: authUser }, { data: profile }] = await Promise.all([
        supabase.auth.admin.getUserById(r.user_id),
        supabase.from("parent_profiles").select("full_name, account_type").eq("user_id", r.user_id).single(),
      ]);
      return {
        id: r.id,
        user_id: r.user_id,
        plan: r.plan,
        created_at: r.created_at,
        email: authUser?.user?.email ?? "—",
        full_name: profile?.full_name ?? "—",
        account_type: profile?.account_type ?? "member",
      };
    })
  );

  return <ApprovalsWithBulk accounts={accounts} subRequests={subs} />;
}
