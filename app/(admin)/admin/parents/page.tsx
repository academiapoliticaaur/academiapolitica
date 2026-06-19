import { createAdminClient } from "@/lib/supabase/admin";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ParentsTable, type ParentRow } from "@/components/admin/parents-table";
import { Pagination } from "@/components/admin/pagination";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Membri înregistrați" };

const PAGE_SIZE = 25;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminParentsPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createAdminClient();
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);

  const [{ data: authData }, { data: parents, count }] = await Promise.all([
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    supabase
      .from("parent_profiles")
      .select("id, user_id, full_name, created_at, approved", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to),
  ]);

  const emailMap: Record<string, string> = {};
  (authData?.users ?? []).forEach((u) => { emailMap[u.id] = u.email || "—"; });

  const userIds = (parents ?? []).map((p) => p.user_id);
  const { data: children } = userIds.length > 0
    ? await supabase.from("child_profiles").select("parent_id").in("parent_id", userIds)
    : { data: [] };

  const childCountMap: Record<string, number> = {};
  (children ?? []).forEach((c) => {
    childCountMap[c.parent_id] = (childCountMap[c.parent_id] || 0) + 1;
  });

  const rows: ParentRow[] = (parents ?? []).map((p) => ({
    id: p.id,
    user_id: p.user_id,
    full_name: p.full_name,
    email: emailMap[p.user_id] || "—",
    approved: p.approved ?? false,
    childCount: childCountMap[p.user_id] || 0,
    created_at: p.created_at,
    isAdmin: adminEmails.includes(emailMap[p.user_id] || ""),
  }));

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="max-w-5xl">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 mb-4">
        <Link href="/admin"><ArrowLeft size={16} />Dashboard</Link>
      </Button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Membri înregistrați{count != null ? ` (${count})` : ""}
        </h1>
        <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
          <Link href="/admin/parents/add">
            <Plus size={16} />
            Adaugă utilizator
          </Link>
        </Button>
      </div>

      {rows.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-500">Niciun membru înregistrat încă.</p>
        </div>
      ) : (
        <>
          <ParentsTable rows={rows} />
          <Pagination page={page} totalPages={totalPages} basePath="/admin/parents" />
        </>
      )}
    </div>
  );
}
