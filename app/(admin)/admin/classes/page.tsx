import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/admin/guard";
import { Users, BookOpen, Archive } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Clase — Admin" };

async function deleteClassAction(classId: string) {
  "use server";
  await requireAdmin();
  const db = createAdminClient();
  await db.from("classes").delete().eq("id", classId);
  redirect("/admin/classes");
}

export default async function AdminClassesPage() {
  const db = createAdminClient();

  const { data: classes } = await db
    .from("classes")
    .select("id, name, grade, school_year, access_code, status, teacher_id, created_at")
    .order("created_at", { ascending: false });

  if (!classes || classes.length === 0) {
    return (
      <div className="max-w-4xl">
        <h1 className="text-2xl font-bold mb-6">Clase</h1>
        <div className="text-center py-16 bg-white rounded-xl border">
          <div className="text-5xl mb-3">🏫</div>
          <p className="text-gray-500">Nicio clasă creată încă.</p>
        </div>
      </div>
    );
  }

  const classIds = classes.map((c) => c.id);
  const teacherIds = [...new Set(classes.map((c) => c.teacher_id))];

  const [studentsRes, coursesRes, profilesRes, authRes] = await Promise.all([
    db.from("class_students").select("class_id").in("class_id", classIds),
    db.from("class_courses").select("class_id").in("class_id", classIds),
    db.from("parent_profiles").select("user_id, full_name").in("user_id", teacherIds),
    db.auth.admin.listUsers(),
  ]);

  const studentCounts: Record<string, number> = {};
  (studentsRes.data ?? []).forEach((s) => {
    studentCounts[s.class_id] = (studentCounts[s.class_id] ?? 0) + 1;
  });

  const courseCounts: Record<string, number> = {};
  (coursesRes.data ?? []).forEach((c) => {
    courseCounts[c.class_id] = (courseCounts[c.class_id] ?? 0) + 1;
  });

  const teacherNames: Record<string, string> = {};
  const emailMap: Record<string, string> = {};
  (authRes.data?.users ?? []).forEach((u) => { emailMap[u.id] = u.email ?? ""; });
  (profilesRes.data ?? []).forEach((p) => {
    teacherNames[p.user_id] = p.full_name || emailMap[p.user_id] || p.user_id;
  });

  const active = classes.filter((c) => c.status === "active");
  const archived = classes.filter((c) => c.status !== "active");

  return (
    <div className="max-w-5xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Clase</h1>
          <p className="text-gray-500 text-sm">Toate clasele create de formatori.</p>
        </div>
        <span className="text-sm text-gray-400">{classes.length} {classes.length === 1 ? "clasă" : "clase"}</span>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">Clasă</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">Profesor</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">Cod</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">Elevi</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">Cursuri</th>
              <th className="px-5 py-3 text-left font-semibold text-gray-600">Status</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {classes.map((cls) => (
              <tr key={cls.id} className="hover:bg-gray-50">
                <td className="px-5 py-4">
                  <p className="font-medium text-gray-900">{cls.name}</p>
                  <p className="text-xs text-gray-400">{cls.school_year}{cls.grade ? ` · Clasa ${cls.grade}` : ""}</p>
                </td>
                <td className="px-5 py-4 text-gray-500 text-xs">
                  {teacherNames[cls.teacher_id] || "—"}
                </td>
                <td className="px-5 py-4">
                  <span className="font-mono text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-lg">
                    {cls.access_code}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="flex items-center gap-1 text-gray-500">
                    <Users size={14} />
                    {studentCounts[cls.id] ?? 0}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <span className="flex items-center gap-1 text-gray-500">
                    <BookOpen size={14} />
                    {courseCounts[cls.id] ?? 0}
                  </span>
                </td>
                <td className="px-5 py-4">
                  {cls.status === "active" ? (
                    <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full font-medium">Activă</span>
                  ) : (
                    <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium flex items-center gap-1 w-fit">
                      <Archive size={11} />
                      Arhivată
                    </span>
                  )}
                </td>
                <td className="px-5 py-4">
                  <DeleteButton
                    confirmMessage={`Ștergi clasa "${cls.name}"? Se vor șterge toți elevii și progresul din această clasă.`}
                    action={async () => {
                      "use server";
                      await deleteClassAction(cls.id);
                    }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {active.length > 0 && archived.length > 0 && (
        <p className="mt-3 text-xs text-gray-400 text-right">
          {active.length} active · {archived.length} arhivate
        </p>
      )}
    </div>
  );
}
