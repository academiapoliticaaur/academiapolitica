import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { deleteWebinar, toggleWebinarStatus } from "@/lib/admin/webinar-actions";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Webinarii" };

export default async function AdminWebinarsPage() {
  const supabase = createAdminClient();
  const { data: webinars } = await supabase
    .from("webinars")
    .select("id, title, presenter, audience, status, youtube_id, created_at")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Webinarii</h1>
          <p className="text-sm text-gray-500 mt-1">{webinars?.length ?? 0} webinarii totale</p>
        </div>
        <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
          <Link href="/admin/webinars/new">
            <Plus size={16} />
            Webinar nou
          </Link>
        </Button>
      </div>

      {!webinars?.length ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <p className="text-gray-400 mb-4">Niciun webinar adăugat încă.</p>
          <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
            <Link href="/admin/webinars/new"><Plus size={16} />Adaugă primul webinar</Link>
          </Button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Titlu</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Prezentator</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Audiență</th>
                <th className="px-5 py-3 text-left font-semibold text-gray-600">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {webinars.map((w) => (
                <tr key={w.id} className="hover:bg-gray-50">
                  <td className="px-5 py-4 font-medium text-gray-900">{w.title}</td>
                  <td className="px-5 py-4 text-gray-500">{w.presenter ?? "—"}</td>
                  <td className="px-5 py-4">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                      {w.audience === "children" ? "Copii" : w.audience === "adult" ? "Adulți" : "Toți"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      w.status === "published"
                        ? "bg-teal-100 text-teal-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {w.status === "published" ? "Publicat" : "Draft"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <form action={async () => {
                        "use server";
                        await toggleWebinarStatus(w.id, w.status);
                      }}>
                        <Button type="submit" size="sm" variant="outline" className="gap-1.5 text-xs">
                          {w.status === "published" ? <><EyeOff size={12} />Retrage</> : <><Eye size={12} />Publică</>}
                        </Button>
                      </form>
                      <Button asChild size="sm" className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-1.5">
                        <Link href={`/admin/webinars/${w.id}/edit`}>
                          <Pencil size={12} />
                          Editează
                        </Link>
                      </Button>
                      <form action={async () => {
                        "use server";
                        await deleteWebinar(w.id);
                      }}>
                        <Button type="submit" size="sm" variant="outline" className="text-red-500 hover:text-red-700 border-red-200 gap-1.5">
                          <Trash2 size={12} />
                        </Button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
