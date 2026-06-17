import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Eye, Plus, LayoutDashboard, ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Admin Dashboard" };

export default async function AdminDashboardPage() {
  const supabase = createAdminClient();

  // Admini = utilizatori cu role: "admin" în user_metadata
  const { data: allUsersData } = await supabase.auth.admin.listUsers();
  const allUsers = allUsersData?.users ?? [];
  const adminUsers = allUsers.filter((u) => u.user_metadata?.role === "admin");
  const adminUserIds = adminUsers.map((u) => u.id);
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);

  let parentsQuery = supabase.from("parent_profiles").select("*", { count: "exact", head: true });
  if (adminUserIds.length > 0) {
    parentsQuery = parentsQuery.not("user_id", "in", `(${adminUserIds.join(",")})`);
  }

  const [
    { count: coursesCount },
    { count: publishedCount },
    { count: parentsCount },
    { count: childrenCount },
  ] = await Promise.all([
    supabase.from("courses").select("*", { count: "exact", head: true }),
    supabase.from("courses").select("*", { count: "exact", head: true }).eq("status", "published"),
    parentsQuery,
    supabase.from("child_profiles").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "Total cursuri", value: coursesCount || 0, icon: <BookOpen className="text-blue-500" />, color: "bg-blue-50", href: "/admin/courses" },
    { label: "Cursuri publicate", value: publishedCount || 0, icon: <Eye className="text-teal-500" />, color: "bg-teal-50", href: "/admin/courses" },
    { label: "Părinți înregistrați", value: parentsCount || 0, icon: <Users className="text-indigo-500" />, color: "bg-indigo-50", href: "/admin/parents" },
    { label: "Profiluri cursanți", value: childrenCount || 0, icon: <Users className="text-purple-500" />, color: "bg-purple-50", href: "/admin/children" },
    { label: "Administratori", value: adminUsers.length, icon: <ShieldCheck className="text-rose-500" />, color: "bg-rose-50", href: "/admin/administrators" },
  ];

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard Admin</h1>
          <p className="text-gray-500">Platformă Academia Politica AUR</p>
        </div>
        <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2 shrink-0 self-start">
          <Link href="/dashboard">
            <LayoutDashboard size={16} />
            Dashboard Părinte
          </Link>
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="hover:shadow-md hover:border-blue-200 transition-all cursor-pointer h-full">
              <CardContent className={`p-5 ${stat.color} rounded-xl`}>
                <div className="flex items-center justify-between mb-2">
                  {stat.icon}
                </div>
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
          <Link href="/admin/courses/new">
            <Plus size={16} />
            Adaugă curs nou
          </Link>
        </Button>
        <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
          <Link href="/admin/courses">
            <BookOpen size={16} />
            Gestionează cursurile
          </Link>
        </Button>
      </div>
    </div>
  );
}
