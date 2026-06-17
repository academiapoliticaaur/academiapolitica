import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { ArrowLeft, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InactivityLogout } from "@/components/auth/inactivity-logout";

export default async function ChildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-teal-50 flex flex-col">
      <InactivityLogout />
      <header className="bg-white/80 backdrop-blur border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <span className="text-xl">🌟</span>
            <span className="text-blue-500">Ami</span>
            <span className="text-gray-400">&amp;</span>
            <span className="text-teal-500">Moti</span>
          </Link>
          <div className="flex items-center gap-3">
            <Button size="sm" asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
              <Link href="/dashboard">
                <ArrowLeft size={14} />
                Contul părintelui
              </Link>
            </Button>
            <form action="/logout" method="post">
              <Button variant="ghost" size="sm" type="submit" className="gap-2 text-gray-500">
                <LogOut size={14} />
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 container mx-auto px-4 py-8 max-w-5xl">
        {children}
      </main>
    </div>
  );
}
