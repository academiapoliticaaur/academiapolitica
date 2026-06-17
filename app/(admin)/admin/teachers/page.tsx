import { createAdminClient } from "@/lib/supabase/admin";
import { GraduationCap, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TeachersTable, type TeacherRow } from "@/components/admin/teachers-table";
import { Pagination } from "@/components/admin/pagination";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Formatori" };

const TEACHER_TYPES = ["formator", "lector"] as const;
const PAGE_SIZE = 25;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminTeachersPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createAdminClient();

  const [{ data: authData }, { data: teachers, count }] = await Promise.all([
    supabase.auth.admin.listUsers({ perPage: 1000 }),
    supabase
      .from("parent_profiles")
      .select("id, user_id, full_name, account_type, approved, created_at", { count: "exact" })
      .in("account_type", TEACHER_TYPES)
      .order("created_at", { ascending: false })
      .range(from, to),
  ]);

  const emailMap: Record<string, string> = {};
  (authData?.users ?? []).forEach((u) => { emailMap[u.id] = u.email || "—"; });

  const rows: TeacherRow[] = (teachers ?? []).map((t) => ({
    id: t.id,
    user_id: t.user_id,
    full_name: t.full_name,
    email: emailMap[t.user_id] || "—",
    account_type: t.account_type,
    approved: t.approved ?? false,
    created_at: t.created_at,
  }));

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="max-w-5xl">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 mb-4">
        <Link href="/admin"><ArrowLeft size={16} />Dashboard</Link>
      </Button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <GraduationCap size={24} className="text-indigo-500" />
          Formatori{count != null ? ` (${count})` : ""}
        </h1>
      </div>

      {rows.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <GraduationCap className="mx-auto mb-3 text-gray-300" size={40} />
          <p className="text-gray-400 mb-2">Niciun formator înregistrat încă.</p>
          <p className="text-sm text-gray-400">
            Cadrele didactice se înregistrează selectând tipul de cont{" "}
            <strong>Formator</strong> sau <strong>Profesor gimnaziu</strong> la creare cont.
          </p>
        </div>
      ) : (
        <>
          <TeachersTable rows={rows} />
          <Pagination page={page} totalPages={totalPages} basePath="/admin/teachers" />
        </>
      )}
    </div>
  );
}
