import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import Link from "next/link";
import { GraduationCap, BookOpen, Lock, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { groupCourses } from "@/lib/utils/course-groups";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Resurse Cadre Didactice — Academia Politica AUR" };

type Course = { id: string; title: string; slug: string; description: string | null; audience: string; age_group: string; estimated_duration: number | null; series_slug: string | null; series_order: number | null; series_title: string | null };

export default async function CadreDIdacticePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let accountType: string | null = null;
  let isApproved = false;

  if (user) {
    const { data: profile } = await supabase
      .from("parent_profiles")
      .select("account_type, approved")
      .eq("user_id", user.id)
      .single();
    accountType = profile?.account_type ?? null;
    isApproved = profile?.approved ?? false;
  }

  const isTeacher = accountType === "formator" || accountType === "lector";
  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
  const isAdmin = user ? (adminEmails.includes(user.email || "") || user.app_metadata?.role === "admin") : false;

  const db = createAdminClient();

  const [{ data: formatorCourses }, { data: profesorCourses }] = await Promise.all([
    db.from("courses").select("id, title, slug, description, audience, age_group, estimated_duration, series_slug, series_order, series_title")
      .eq("status", "published").eq("audience", "formator").is("deleted_at", null).order("order_index"),
    db.from("courses").select("id, title, slug, description, audience, age_group, estimated_duration, series_slug, series_order, series_title")
      .eq("status", "published").eq("audience", "lector").is("deleted_at", null).order("order_index"),
  ]);

  const canSeeFormator = isAdmin || (isApproved && accountType === "formator");
  const canSeeProfesor = isAdmin || (isApproved && accountType === "lector");
  const isLoggedIn = !!user;

  // Un cont de tip învățător/profesor vede DOAR secțiunea propriului rol —
  // cealaltă nu îl privește (ex: un învățător 0-4 nu trebuie să vadă "Resurse Profesori Gimnaziu").
  // Vizitatorii, părinții și adminii văd ambele secțiuni (pagină de prezentare / oversight).
  const showFormatorSection = isAdmin || accountType !== "lector";
  const showProfesorSection = isAdmin || accountType !== "formator";

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <GraduationCap size={32} className="text-indigo-500" />
          <h1 className="text-3xl font-bold">Resurse pentru Cadre Didactice</h1>
        </div>
        <p className="text-gray-600 text-lg">
          Materiale educaționale dedicate învățătorilor și profesorilor de gimnaziu pentru predarea competențelor digitale.
        </p>
      </div>

      {/* Mesaj pentru vizitatori nelogați */}
      {!isLoggedIn && (
        <div className="mb-8 bg-indigo-50 border border-indigo-200 rounded-2xl p-6 flex items-start gap-4">
          <Lock size={24} className="text-indigo-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-indigo-800 mb-1">Acces rezervat cadrelor didactice</p>
            <p className="text-indigo-700 text-sm mb-4">
              Creează un cont selectând tipul <strong>Formator</strong> sau <strong>Profesor gimnaziu</strong> pentru a accesa resursele specifice rolului tău.
            </p>
            <div className="flex gap-3">
              <Button asChild size="sm" className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700">
                <Link href="/register">Creează cont</Link>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href="/login">Intră în cont</Link>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Mesaj pentru conturi neaprobate */}
      {isLoggedIn && isTeacher && !isApproved && (
        <div className="mb-8 bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center gap-3">
          <span className="text-2xl">⏳</span>
          <p className="text-amber-800 text-sm">
            <span className="font-semibold">Cont în așteptare.</span>{" "}
            Resursele vor fi disponibile după aprobarea contului de către administrator.
          </p>
        </div>
      )}

      {/* Mesaj pentru părinți logați care nu sunt formatori */}
      {isLoggedIn && !isTeacher && !isAdmin && (
        <div className="mb-8 bg-gray-50 border border-gray-200 rounded-2xl p-5 flex items-center gap-3">
          <GraduationCap size={20} className="text-gray-400 shrink-0" />
          <p className="text-gray-600 text-sm">
            Această secțiune este destinată cadrelor didactice. Dacă ești învățător sau profesor, creează un cont nou cu tipul corespunzător.
          </p>
        </div>
      )}

      {/* Categoria Formatori — ascunsă pentru conturile de Profesor (nu îi privește) */}
      {showFormatorSection && (
      <section className="mb-12">
        <div className="flex items-center gap-3 mb-5">
          <span className="text-2xl">🌈</span>
          <div>
            <h2 className="text-xl font-bold">Resurse Formatori — Clasele 0–4</h2>
            <p className="text-sm text-gray-500">Materiale pentru predarea AI literacy în ciclul primar</p>
          </div>
        </div>

        {!formatorCourses?.length ? (
          <div className="bg-white rounded-xl border border-dashed p-8 text-center text-gray-400">
            Cursurile pentru învățători sunt în pregătire. Revino curând!
          </div>
        ) : canSeeFormator ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupCourses(formatorCourses as Course[]).map((group) =>
              group.type === "single" ? (
                <Link key={group.course.id} href={`/courses/${group.course.slug}`} className="bg-white rounded-xl border hover:border-indigo-300 hover:shadow-md transition-all p-5 group">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={16} className="text-indigo-400" />
                    <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">Formator</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">{group.course.title}</h3>
                  {group.course.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{group.course.description}</p>}
                  {group.course.estimated_duration && <p className="text-xs text-gray-400 mt-2">{group.course.estimated_duration} min</p>}
                </Link>
              ) : (
                <div key={group.seriesSlug} className="bg-white rounded-xl border hover:border-indigo-300 hover:shadow-md transition-all p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers size={16} className="text-indigo-400" />
                    <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">Formator</span>
                    <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full">{group.parts.length} părți</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{group.seriesTitle}</h3>
                  <div className="flex flex-col gap-1 mt-2">
                    {group.parts.map((p, i) => (
                      <Link key={p.id} href={`/courses/${p.slug}`} className="flex items-center justify-between text-sm px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 transition-colors">
                        <span>Partea {i + 1}</span>
                        <span className="text-gray-400 text-xs">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border p-8 text-center">
            <Lock size={24} className="mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500 text-sm">{formatorCourses.length} cursuri disponibile pentru Formatori.</p>
            {!isLoggedIn && <p className="text-xs text-gray-400 mt-1">Creează un cont de Formator pentru acces.</p>}
            {isLoggedIn && !isTeacher && <p className="text-xs text-gray-400 mt-1">Acces rezervat conturilor de tip Formator.</p>}
          </div>
        )}
      </section>
      )}

      {/* Categoria Profesori — ascunsă pentru conturile de Formator (nu îi privește) */}
      {showProfesorSection && (
      <section>
        <div className="flex items-center gap-3 mb-5">
          <span className="text-2xl">🚀</span>
          <div>
            <h2 className="text-xl font-bold">Resurse Profesori Gimnaziu — Clasele 5–8</h2>
            <p className="text-sm text-gray-500">Materiale pentru predarea AI literacy în ciclul gimnazial</p>
          </div>
        </div>

        {!profesorCourses?.length ? (
          <div className="bg-white rounded-xl border border-dashed p-8 text-center text-gray-400">
            Cursurile pentru profesori sunt în pregătire. Revino curând!
          </div>
        ) : canSeeProfesor ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupCourses(profesorCourses as Course[]).map((group) =>
              group.type === "single" ? (
                <Link key={group.course.id} href={`/courses/${group.course.slug}`} className="bg-white rounded-xl border hover:border-purple-300 hover:shadow-md transition-all p-5 group">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen size={16} className="text-purple-400" />
                    <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full">Profesor gimnaziu</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">{group.course.title}</h3>
                  {group.course.description && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{group.course.description}</p>}
                  {group.course.estimated_duration && <p className="text-xs text-gray-400 mt-2">{group.course.estimated_duration} min</p>}
                </Link>
              ) : (
                <div key={group.seriesSlug} className="bg-white rounded-xl border hover:border-purple-300 hover:shadow-md transition-all p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <Layers size={16} className="text-purple-400" />
                    <span className="text-xs text-purple-600 font-medium bg-purple-50 px-2 py-0.5 rounded-full">Profesor gimnaziu</span>
                    <span className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-full">{group.parts.length} părți</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{group.seriesTitle}</h3>
                  <div className="flex flex-col gap-1 mt-2">
                    {group.parts.map((p, i) => (
                      <Link key={p.id} href={`/courses/${p.slug}`} className="flex items-center justify-between text-sm px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-purple-50 hover:text-purple-700 transition-colors">
                        <span>Partea {i + 1}</span>
                        <span className="text-gray-400 text-xs">→</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-xl border p-8 text-center">
            <Lock size={24} className="mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500 text-sm">{profesorCourses.length} cursuri disponibile pentru Profesori de gimnaziu.</p>
            {!isLoggedIn && <p className="text-xs text-gray-400 mt-1">Creează un cont de Profesor pentru acces.</p>}
            {isLoggedIn && !isTeacher && <p className="text-xs text-gray-400 mt-1">Acces rezervat conturilor de tip Profesor gimnaziu.</p>}
          </div>
        )}
      </section>
      )}
    </div>
  );
}
