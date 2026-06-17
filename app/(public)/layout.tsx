import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { createClient } from "@/lib/supabase/server";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let parentName: string | undefined;
  let accountType: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("parent_profiles")
      .select("full_name, account_type")
      .eq("user_id", user.id)
      .single();
    parentName = data?.full_name;
    accountType = data?.account_type ?? null;
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
  const isAdmin = user ? (adminEmails.includes(user.email || "") || user.app_metadata?.role === "admin") : false;

  return (
    <>
      <Header user={user} parentName={parentName} isAdmin={isAdmin} accountType={accountType} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
