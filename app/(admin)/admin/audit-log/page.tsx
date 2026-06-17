import { createAdminClient } from "@/lib/supabase/admin";
import { Shield, User, CreditCard, Trash2, CheckCircle, XCircle, Activity } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Audit Log — Admin" };

const ACTION_META: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  approve_account:      { label: "Aprobare cont",         icon: <CheckCircle size={14} />,  color: "text-teal-600 bg-teal-50" },
  delete_user:          { label: "Ștergere utilizator",   icon: <Trash2 size={14} />,        color: "text-red-600 bg-red-50" },
  approve_subscription: { label: "Aprobare abonament",    icon: <CreditCard size={14} />,    color: "text-indigo-600 bg-indigo-50" },
  reject_subscription:  { label: "Respingere abonament",  icon: <XCircle size={14} />,       color: "text-orange-600 bg-orange-50" },
  activate_subscription:{ label: "Activare abonament",    icon: <CreditCard size={14} />,    color: "text-teal-600 bg-teal-50" },
  deactivate_subscription:{ label: "Dezactivare abonament", icon: <XCircle size={14} />,     color: "text-gray-600 bg-gray-100" },
};

export default async function AuditLogPage() {
  const db = createAdminClient();

  const { data: logs } = await db
    .from("admin_audit_log")
    .select("id, admin_id, action, details, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const adminIds = [...new Set((logs ?? []).map((l) => l.admin_id).filter(Boolean))] as string[];
  const emailMap: Record<string, string> = {};
  await Promise.all(
    adminIds.map(async (id) => {
      const { data } = await db.auth.admin.getUserById(id);
      if (data?.user?.email) emailMap[id] = data.user.email;
    })
  );

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Shield size={22} className="text-purple-500" />
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-sm text-gray-500">Ultimele 200 de acțiuni administrative</p>
        </div>
      </div>

      {!logs?.length ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Activity size={36} className="mx-auto mb-3 text-gray-300" />
          <p className="text-gray-400">Nicio acțiune înregistrată încă.</p>
          <p className="text-sm text-gray-400 mt-1">
            Acțiunile apar după aplicarea migrației 013_admin_audit_log.sql.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Acțiune</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Admin</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Detalii</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((log) => {
                const meta = ACTION_META[log.action];
                const details = log.details as Record<string, string> | null;
                return (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${meta?.color ?? "text-gray-600 bg-gray-100"}`}>
                        {meta?.icon ?? <Activity size={14} />}
                        {meta?.label ?? log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <User size={13} className="text-gray-400" />
                        {log.admin_id ? (emailMap[log.admin_id] ?? log.admin_id.slice(0, 8) + "…") : "—"}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-500 max-w-xs truncate">
                      {details
                        ? Object.entries(details)
                            .filter(([k]) => k !== "userId")
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(" · ") || (details.email ?? details.userId ?? "—")
                        : "—"}
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString("ro-RO", {
                        day: "numeric", month: "short", year: "numeric",
                        hour: "2-digit", minute: "2-digit",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
