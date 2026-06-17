import { createAdminClient } from "@/lib/supabase/admin";
import { deleteChild } from "@/lib/admin/actions";
import { DeleteButton } from "@/components/admin/delete-button";
import { Pagination } from "@/components/admin/pagination";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Profiluri copii" };

const PAGE_SIZE = 25;

interface PageProps {
  searchParams: Promise<{ page?: string }>;
}

export default async function AdminChildrenPage({ searchParams }: PageProps) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam ?? 1));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabase = createAdminClient();

  const { data: children, count } = await supabase
    .from("child_profiles")
    .select("id, display_name, age_group, created_at, parent_id", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  const parentUserIds = [...new Set((children ?? []).map((c) => c.parent_id))];
  const parentNameMap: Record<string, string> = {};
  if (parentUserIds.length > 0) {
    const { data: parents } = await supabase
      .from("parent_profiles")
      .select("user_id, full_name")
      .in("user_id", parentUserIds);
    (parents ?? []).forEach((p) => { parentNameMap[p.user_id] = p.full_name || "—"; });
  }

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  return (
    <div className="max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 mb-4">
        <Link href="/admin"><ArrowLeft size={16} />Dashboard</Link>
      </Button>
      <h1 className="text-2xl font-bold mb-6">
        Profiluri copii{count != null ? ` (${count})` : ""}
      </h1>

      {children && children.length > 0 ? (
        <>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Nume copil</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Grupă vârstă</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Părinte</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Creat</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {children.map((child) => (
                  <tr key={child.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium">{child.display_name || "—"}</td>
                    <td className="px-5 py-4">
                      {child.age_group ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          child.age_group === "0-4" ? "bg-teal-100 text-teal-700"
                          : "bg-indigo-100 text-indigo-700"
                        }`}>
                          Clasele {child.age_group}
                        </span>
                      ) : "—"}
                    </td>
                    <td className="px-5 py-4 text-gray-500">{parentNameMap[child.parent_id] || child.parent_id.slice(0, 8) + "…"}</td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {child.created_at ? new Date(child.created_at).toLocaleDateString("ro-RO") : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <DeleteButton
                        confirmMessage={`Ștergi profilul copilului "${child.display_name}"?`}
                        action={async () => { "use server"; await deleteChild(child.id); }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination page={page} totalPages={totalPages} basePath="/admin/children" />
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-500">Niciun profil de copil înregistrat încă.</p>
        </div>
      )}
    </div>
  );
}
