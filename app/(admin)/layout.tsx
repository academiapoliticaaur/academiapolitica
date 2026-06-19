import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { BookOpen, LayoutDashboard, LogOut, Users, Baby, ShieldCheck, BarChart2, UserCheck, Video, Route, FileUp, GraduationCap, School, Presentation, HardDrive, Trash2, CreditCard, Shield, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InactivityLogout } from "@/components/auth/inactivity-logout";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verificare rol admin (email în lista admins sau metadata)
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim());
  const isAdmin =
    adminEmails.includes(user.email || "") ||
    user.app_metadata?.role === "admin";

  if (!isAdmin) redirect("/dashboard");

  // Badge pending: conturi neaprobate + cereri abonament în așteptare
  const db = createAdminClient();
  const [{ count: pendingAccounts }, { count: pendingSubReqs }] = await Promise.all([
    db.from("parent_profiles").select("user_id", { count: "exact", head: true }).eq("approved", false),
    db.from("subscription_requests").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);
  const totalPending = (pendingAccounts ?? 0) + (pendingSubReqs ?? 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <InactivityLogout />
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center"><Image src="/logo_academia_politica_titu_maiorescu_transparent.png" alt="Academia Politica AUR" width={40} height={40} style={{ width: "auto", height: 40 }} /></Link>
            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
              Admin
            </span>
          </div>
          <form action="/logout" method="post">
            <Button size="sm" type="submit" className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
              <LogOut size={16} />
              Deconectare
            </Button>
          </form>
        </div>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden bg-white border-b overflow-x-auto">
        <div className="flex px-2 py-2 gap-1 min-w-max">
          {[
            { href: "/admin", icon: <LayoutDashboard size={16} />, label: "Dashboard" },
            { href: "/admin/courses?view=cursuri", icon: <BookOpen size={16} />, label: "Cursuri" },
            { href: "/admin/courses?view=resurse-didactice", icon: <Presentation size={16} />, label: "Resurse didactice" },
            { href: "/admin/curriculum-import", icon: <FileUp size={16} />, label: "Import AI" },
            { href: "/admin/paths", icon: <Route size={16} />, label: "Trasee" },
            { href: "/admin/webinars", icon: <Video size={16} />, label: "Webinarii" },
            { href: "/admin/approvals", icon: <UserCheck size={16} />, label: "Aprobare" },
            { href: "/admin/administrators", icon: <ShieldCheck size={16} />, label: "Admini" },
            { href: "/admin/parents", icon: <Users size={16} />, label: "Membri" },
            { href: "/admin/children", icon: <Baby size={16} />, label: "Cursanți" },
            { href: "/admin/teachers", icon: <GraduationCap size={16} />, label: "Cadre did." },
            { href: "/admin/classes", icon: <School size={16} />, label: "Clase" },
            { href: "/admin/subscriptions", icon: <CreditCard size={16} />, label: "Abonamente" },
            { href: "/admin/vouchers", icon: <Ticket size={16} />, label: "Vouchere" },
            { href: "/admin/stats", icon: <BarChart2 size={16} />, label: "Statistici" },
            { href: "/admin/trash", icon: <Trash2 size={16} />, label: "Cos gunoi" },
            { href: "/admin/audit-log", icon: <Shield size={16} />, label: "Audit Log" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 whitespace-nowrap transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="flex flex-1">
        <aside className="hidden md:flex flex-col w-56 bg-white border-r py-6 px-3">
          <nav className="flex flex-col gap-4">
            {/* Dashboard */}
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
            >
              <LayoutDashboard size={18} />
              Dashboard
            </Link>

            {/* Conținut educațional */}
            <div>
              <p className="px-3 mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Conținut educațional</p>
              <div className="flex flex-col gap-0.5">
                {[
                  { href: "/admin/courses?view=cursuri", icon: <BookOpen size={18} />, label: "Cursuri" },
                  { href: "/admin/courses?view=resurse-didactice", icon: <Presentation size={18} />, label: "Resurse didactice" },
                  { href: "/admin/curriculum-import", icon: <FileUp size={18} />, label: "Import AI" },
                  { href: "/admin/paths", icon: <Route size={18} />, label: "Trasee" },
                  { href: "/admin/webinars", icon: <Video size={18} />, label: "Webinarii" },
                  { href: "/admin/settings/google-drive", icon: <HardDrive size={18} />, label: "Google Drive" },
                  { href: "/admin/trash", icon: <Trash2 size={18} />, label: "Coș de gunoi" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Utilizatori */}
            <div>
              <p className="px-3 mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Utilizatori</p>
              <div className="flex flex-col gap-0.5">
                {/* Aprobare conturi — cu badge pending */}
                <Link
                  href="/admin/approvals"
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                >
                  <UserCheck size={18} />
                  <span className="flex-1">Aprobare conturi</span>
                  {totalPending > 0 && (
                    <span className="text-[11px] font-bold bg-red-500 text-white rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none">
                      {totalPending}
                    </span>
                  )}
                </Link>
                {[
                  { href: "/admin/subscriptions", icon: <CreditCard size={18} />, label: "Abonamente" },
                  { href: "/admin/vouchers", icon: <Ticket size={18} />, label: "Vouchere" },
                  { href: "/admin/administrators", icon: <ShieldCheck size={18} />, label: "Administratori" },
                  { href: "/admin/parents", icon: <Users size={18} />, label: "Membri" },
                  { href: "/admin/children", icon: <Baby size={18} />, label: "Cursanți" },
                  { href: "/admin/teachers", icon: <GraduationCap size={18} />, label: "Formatori" },
                  { href: "/admin/classes", icon: <School size={18} />, label: "Clase" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Rapoarte */}
            <div>
              <p className="px-3 mb-1 text-[10px] font-bold tracking-widest text-gray-400 uppercase">Rapoarte</p>
              <div className="flex flex-col gap-0.5">
                {[
                  { href: "/admin/stats",      icon: <BarChart2 size={18} />, label: "Statistici" },
                  { href: "/admin/audit-log",  icon: <Shield size={18} />,    label: "Audit Log" },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
          </nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
