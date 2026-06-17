import { createAdminClient } from "@/lib/supabase/admin";
import { ArrowLeft, Plus, Pencil } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Administratori" };

export default async function AdministratorsPage() {
  const supabase = createAdminClient();
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
  const admins = (usersData?.users ?? []).filter(
    (u) => u.app_metadata?.role === "admin" || adminEmails.includes(u.email ?? "")
  );

  return (
    <div className="max-w-4xl">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 mb-4">
        <Link href="/admin"><ArrowLeft size={16} />Dashboard</Link>
      </Button>

      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Administratori ({admins.length})
        </h1>
        <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
          <Link href="/admin/parents/add?role=admin">
            <Plus size={16} />
            Adaugă administrator
          </Link>
        </Button>
      </div>

      {admins.length > 0 ? (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Nume</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Email</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Creat</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Ultima autentificare</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {admins.map((admin) => (
                <tr key={admin.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium flex items-center gap-2">
                    {admin.user_metadata?.full_name || "—"}
                    <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium">
                      Admin
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{admin.email || "—"}</td>
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {admin.created_at
                      ? new Date(admin.created_at).toLocaleDateString("ro-RO")
                      : "—"}
                  </td>
                  <td className="px-5 py-4 text-gray-400 text-xs">
                    {admin.last_sign_in_at
                      ? new Date(admin.last_sign_in_at).toLocaleDateString("ro-RO", {
                          day: "numeric", month: "short", year: "numeric",
                          hour: "2-digit", minute: "2-digit",
                        })
                      : "Niciodată"}
                  </td>
                  <td className="px-5 py-4">
                    <Button size="sm" asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-1.5">
                      <Link href={`/admin/parents/${admin.id}/edit`}>
                        <Pencil size={14} />
                        Editează
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl border">
          <p className="text-gray-500">Niciun administrator găsit.</p>
        </div>
      )}
    </div>
  );
}
