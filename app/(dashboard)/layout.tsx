import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { LogOut, BookOpen, LayoutDashboard, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InactivityLogout } from "@/components/auth/inactivity-logout";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("parent_profiles")
    .select("full_name, account_type")
    .eq("user_id", user.id)
    .single();

  const accountType = profile?.account_type ?? (user.user_metadata?.account_type as string | null) ?? null;
  const isTeacher = accountType === "formator" || accountType === "lector";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <InactivityLogout />
      {/* Top nav */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center"><Image src="/logo_academia_politica_titu_maiorescu_transparent.png" alt="Academia Politica AUR" width={40} height={40} style={{ width: "auto", height: 40 }} /></Link>

          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-sm text-gray-600">
              Bun venit, <strong>{profile?.full_name || user.email}</strong>
            </span>
            <form action="/logout" method="post">
              <Button variant="ghost" size="sm" type="submit" className="gap-2 text-gray-500">
                <LogOut size={16} />
                <span className="hidden sm:inline">Deconectare</span>
              </Button>
            </form>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-56 bg-white border-r py-6 px-3 gap-1">
          <nav className="flex flex-col gap-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>
            {isTeacher && (
              <Link
                href="/dashboard/grupuri"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              >
                <Users size={18} />
                Grupurile mele
              </Link>
            )}
            <Link
              href={isTeacher ? "/formatori" : "/courses"}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
            >
              {isTeacher ? <GraduationCap size={18} /> : <BookOpen size={18} />}
              {isTeacher ? "Resurse didactice" : "Cursuri disponibile"}
            </Link>
          </nav>
        </aside>

        {/* Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
