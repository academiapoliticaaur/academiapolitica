import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AdminCoursesTable, type CourseRow } from "@/components/admin/admin-courses-table";
import { ImportModuleButton } from "@/components/admin/import-module-button";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Gestionare cursuri" };

interface PageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function AdminCoursesPage({ searchParams }: PageProps) {
  const { view } = await searchParams;
  const showMembers = view !== "resurse-didactice";
  const showTeacher = view !== "cursuri";
  const pageTitle = view === "cursuri" ? "Cursuri membri AUR"
    : view === "resurse-didactice" ? "Resurse formatori"
    : "Cursuri";

  const supabase = createAdminClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, slug, age_group, audience, status, is_demo")
    .is("deleted_at", null)
    .order("title");

  const allCourses = (courses ?? []) as CourseRow[];

  const memberCourses = allCourses.filter(
    (c) => !c.audience || c.audience === "member" || c.audience === "children" || c.audience === "all"
  );
  const teacherCourses = allCourses.filter(
    (c) => c.audience === "formator" || c.audience === "lector"
  );

  const formatori = teacherCourses.filter((c) => c.audience === "formator");
  const lectori = teacherCourses.filter((c) => c.audience === "lector");

  const isEmpty = allCourses.length === 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{pageTitle}</h1>
        <div className="flex items-center gap-2">
          <ImportModuleButton />
          <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
            <Link href="/admin/courses/new">
              <Plus size={16} />
              Curs nou
            </Link>
          </Button>
        </div>
      </div>

      {isEmpty ? (
        <div className="text-center py-16 bg-white rounded-xl border">
          <div className="text-5xl mb-3">📚</div>
          <p className="text-gray-500 mb-4">Nu există cursuri. Creează primul curs!</p>
          <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700">
            <Link href="/admin/courses/new">Adaugă primul curs</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Secțiunea 1 — Cursuri membri */}
          {showMembers && memberCourses.length > 0 && (
            <section>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">📚</span>
                <div>
                  <h2 className="text-base font-bold text-gray-800">Cursuri membri AUR</h2>
                  <p className="text-xs text-gray-500">Apar la <strong>/cursuri</strong> și sunt accesibile membrilor și simpatizanților</p>
                </div>
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {memberCourses.length} {memberCourses.length === 1 ? "curs" : "cursuri"}
                </span>
              </div>
              <AdminCoursesTable courses={memberCourses} />
            </section>
          )}

          {/* Secțiunea 2 — Resurse formatori / lectori */}
          {showTeacher && (
            <section id="resurse-didactice">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xl">🎓</span>
                <div>
                  <h2 className="text-base font-bold text-gray-800">Resurse formatori</h2>
                  <p className="text-xs text-gray-500">Apar la <strong>/formatori</strong> — pentru formatori și lectori aprobați</p>
                </div>
                <span className="ml-auto text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                  {teacherCourses.length} resurse
                </span>
              </div>

              {teacherCourses.length > 0 ? (
                <div className="space-y-4">
                  {formatori.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-blue-600 mb-2 flex items-center gap-1">
                        🏫 Formatori <span className="font-normal text-gray-400">({formatori.length})</span>
                      </p>
                      <AdminCoursesTable courses={formatori} />
                    </div>
                  )}
                  {lectori.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-purple-600 mb-2 flex items-center gap-1">
                        🎙️ Lectori <span className="font-normal text-gray-400">({lectori.length})</span>
                      </p>
                      <AdminCoursesTable courses={lectori} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-dashed p-6 text-center text-gray-400 text-sm">
                  Nicio resursă pentru formatori.{" "}
                  <Link href="/admin/courses/new" className="text-blue-500 underline">Adaugă una</Link>{" "}
                  sau importă cu{" "}
                  <Link href="/admin/curriculum-import" className="text-blue-500 underline">Import AI</Link>{" "}
                  selectând audiența <em>Formatori / Lectori</em>.
                </div>
              )}
            </section>
          )}
        </div>
      )}
    </div>
  );
}
