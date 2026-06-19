import { requireAdmin } from "@/lib/admin/guard";
import { createClient } from "@/lib/supabase/server";
import { SecurityPanel } from "./_components/security-panel";

export default async function SecurityPage() {
  await requireAdmin();
  const supabase = await createClient();
  const { data } = await supabase.auth.mfa.listFactors();
  const verifiedFactors = (data?.totp ?? []).filter((f) => f.status === "verified");
  return <SecurityPanel initialFactors={verifiedFactors} />;
}
