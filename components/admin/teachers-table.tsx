"use client";

import { useState, useTransition, useMemo } from "react";
import { Search, UserCheck, Pencil, ChevronLeft, ChevronRight, X } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DeleteButton } from "@/components/admin/delete-button";
import { approveUser, deleteTeacher } from "@/lib/admin/actions";

const PAGE_SIZE = 25;

const TEACHER_LABELS: Record<string, string> = {
  formator: "Formator (cls. 0–4)",
  profesor: "Profesor gimnaziu (cls. 5–8)",
};

export type TeacherRow = {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string;
  account_type: string | null;
  approved: boolean;
  created_at: string | null;
};

export function TeachersTable({ rows }: { rows: TeacherRow[] }) {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [, startApprove] = useTransition();

  const filtered = useMemo(() => {
    if (!query.trim()) return rows;
    const q = query.toLowerCase();
    return rows.filter(
      (r) =>
        r.full_name?.toLowerCase().includes(q) ||
        r.email.toLowerCase().includes(q)
    );
  }, [rows, query]);

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const pageRows = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleSearch(v: string) {
    setQuery(v);
    setPage(0);
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Caută după nume sau email..."
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-9 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
        />
        {query && (
          <button onClick={() => handleSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={14} />
          </button>
        )}
      </div>

      {query && (
        <p className="text-xs text-gray-400">{filtered.length} rezultate pentru „{query}"</p>
      )}

      {filtered.length === 0 ? (
        <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
          Niciun rezultat pentru „{query}"
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Nume</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Email</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Tip</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-5 py-3 text-left font-semibold text-gray-600">Înregistrat</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {pageRows.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 font-medium text-gray-900">{t.full_name || "—"}</td>
                    <td className="px-5 py-4 text-gray-500">{t.email}</td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        t.account_type === "formator"
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-purple-100 text-purple-700"
                      }`}>
                        {TEACHER_LABELS[t.account_type ?? ""] ?? t.account_type}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {t.approved ? (
                        <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">Aprobat</span>
                      ) : (
                        <button
                          onClick={() =>
                            startApprove(async () => {
                              await approveUser(t.user_id, t.email, t.full_name ?? "");
                            })
                          }
                          className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-700 hover:bg-amber-200 px-2 py-0.5 rounded-full font-medium transition-colors"
                        >
                          <UserCheck size={11} />
                          Aprobă
                        </button>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {t.created_at ? new Date(t.created_at).toLocaleDateString("ro-RO") : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Button size="sm" asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-1.5">
                          <Link href={`/admin/teachers/${t.user_id}/edit`}>
                            <Pencil size={14} />
                            Editează
                          </Link>
                        </Button>
                        <DeleteButton
                          confirmMessage={`Ștergi contul lui ${t.full_name || "acest formator"}? Această acțiune este ireversibilă.`}
                          action={deleteTeacher.bind(null, t.user_id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-between text-sm text-gray-500">
              <p>{filtered.length} formatori · pagina {page + 1} din {pageCount}</p>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setPage((p) => p - 1)} disabled={page === 0}>
                  <ChevronLeft size={14} />
                </Button>
                <Button size="sm" variant="outline" onClick={() => setPage((p) => p + 1)} disabled={page >= pageCount - 1}>
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
