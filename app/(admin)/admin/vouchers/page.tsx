import { createAdminClient } from "@/lib/supabase/admin";
import { generateVouchers, deleteVoucher } from "@/lib/admin/voucher-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Ticket, Trash2, Plus } from "lucide-react";
import { PLAN_LABELS } from "@/lib/subscription";
import type { SubscriptionPlan } from "@/lib/subscription";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Vouchere — Admin" };

const PLAN_BADGE: Record<string, string> = {
  monthly: "bg-blue-100 text-blue-700",
  quarterly: "bg-indigo-100 text-indigo-700",
  annual: "bg-teal-100 text-teal-700",
};

interface PageProps {
  searchParams: Promise<{ generated?: string }>;
}

export default async function AdminVouchersPage({ searchParams }: PageProps) {
  const { generated } = await searchParams;
  const db = createAdminClient();

  const { data: vouchers } = await db
    .from("vouchers")
    .select("*")
    .order("created_at", { ascending: false });

  // Fetch names for used_by
  const usedByIds = [...new Set((vouchers ?? []).filter((v) => v.used_by).map((v) => v.used_by as string))];
  const nameMap: Record<string, string> = {};
  if (usedByIds.length > 0) {
    const { data: profiles } = await db
      .from("parent_profiles")
      .select("user_id, full_name")
      .in("user_id", usedByIds);
    (profiles ?? []).forEach((p) => { nameMap[p.user_id] = p.full_name; });
  }

  const unused = (vouchers ?? []).filter((v) => !v.used_at).length;
  const used = (vouchers ?? []).filter((v) => v.used_at).length;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Ticket size={22} className="text-violet-600" />
            Vouchere
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {unused} disponibile · {used} folosite
          </p>
        </div>
      </div>

      {generated && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-sm text-emerald-700 font-medium">
          ✓ {generated} {Number(generated) === 1 ? "voucher generat" : "vouchere generate"} cu succes. Codurile apar mai jos.
        </div>
      )}

      {/* Generează vouchere */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Generează vouchere noi</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={generateVouchers} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="plan">Plan abonament</Label>
              <select
                id="plan"
                name="plan"
                required
                className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm"
              >
                <option value="monthly">Lunar (30 zile)</option>
                <option value="quarterly">Trimestrial (90 zile)</option>
                <option value="annual">Anual (365 zile)</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="quantity">Cantitate (max 50)</Label>
              <Input id="quantity" name="quantity" type="number" min="1" max="50" defaultValue="1" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Note (opțional)</Label>
              <Input id="notes" name="notes" placeholder="ex: Ionela Popescu, promoție mai 2026" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="valid_until">Valabil până la (opțional)</Label>
              <Input id="valid_until" name="valid_until" type="date" />
              <p className="text-xs text-gray-400">Data expirare voucher (nu a abonamentului)</p>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit" className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
                <Plus size={15} />
                Generează vouchere
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Tabel vouchere */}
      {(vouchers ?? []).length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center text-gray-400">
          Niciun voucher generat încă.
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Cod</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Plan</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Note</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Valabil până</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
                  <th className="px-4 py-3 text-left font-semibold text-gray-600">Folosit de</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {(vouchers ?? []).map((v) => (
                  <tr key={v.id} className={`hover:bg-gray-50 ${v.used_at ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3">
                      <code className="font-mono text-sm font-bold tracking-widest bg-gray-100 px-2 py-0.5 rounded select-all">
                        {v.code}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PLAN_BADGE[v.plan] ?? "bg-gray-100 text-gray-600"}`}>
                        {PLAN_LABELS[v.plan as SubscriptionPlan]?.split("—")[0].trim() ?? v.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate" title={v.notes ?? ""}>
                      {v.notes ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {v.valid_until
                        ? new Date(v.valid_until).toLocaleDateString("ro-RO")
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {v.used_at ? (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium">
                          Folosit {new Date(v.used_at).toLocaleDateString("ro-RO")}
                        </span>
                      ) : (
                        <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-medium">
                          Disponibil
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {v.used_by ? (nameMap[v.used_by] ?? v.used_by.slice(0, 8) + "…") : "—"}
                    </td>
                    <td className="px-4 py-3">
                      {!v.used_at && (
                        <form action={deleteVoucher.bind(null, v.id)}>
                          <Button
                            type="submit"
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:text-red-500 h-8 w-8 p-0"
                            title="Șterge voucher"
                          >
                            <Trash2 size={14} />
                          </Button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
