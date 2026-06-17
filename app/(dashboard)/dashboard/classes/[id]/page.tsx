import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { ArrowLeft, Plus, Users, BookOpen, Archive, Pencil, Trash2, Check, X, BarChart2, RefreshCw, Download, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createHash } from "crypto";
import { ImportStudentsButton } from "@/components/dashboard/ImportStudentsButton";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Detalii clasă — Ami & Moti" };

function generatePin(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

function hashStudentPin(pin: string): string {
  return createHash("sha256").update(`ami-moti-elev:${pin}`).digest("hex");
}

function generateStudentCode(name: string): string {
  const words = name.trim().toUpperCase().replace(/[^A-Z\s]/g, "").split(/\s+/).filter(Boolean);
  if (words.length === 0) return "EL";
  if (words.length === 1) return words[0].slice(0, 3);
  return words.map((w) => w[0]).join("").slice(0, 6);
}

async function addStudent(classId: string, formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const display_name = (formData.get("display_name") as string).trim();
  const age_group = formData.get("age_group") as string;
  if (!display_name || !["0-4", "5-8"].includes(age_group))
    redirect(`/dashboard/classes/${classId}?tab=elevi&error=campuri_obligatorii`);

  const db = createAdminClient();
  const { data: cls } = await db.from("classes").select("id").eq("id", classId).eq("teacher_id", user.id).single();
  if (!cls) redirect("/dashboard/classes");

  const { data: existing } = await db.from("class_students").select("student_code").eq("class_id", classId);
  const usedCodes = new Set((existing ?? []).map((s) => s.student_code));
  const base = generateStudentCode(display_name);
  let student_code = base;
  let suffix = 1;
  while (usedCodes.has(student_code)) { student_code = `${base}${suffix}`; suffix++; }

  const pin = generatePin();
  const { data: newStudent } = await db.from("class_students")
    .insert({ class_id: classId, display_name, student_code, age_group, student_pin: hashStudentPin(pin) })
    .select("id").single();
  redirect(`/dashboard/classes/${classId}?tab=elevi&newPin=${pin}&forStudent=${newStudent?.id ?? ""}`);
}

async function updateStudent(classId: string, studentId: string, formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const display_name = (formData.get("display_name") as string).trim();
  const age_group = formData.get("age_group") as string;
  if (!display_name || !["0-4", "5-8"].includes(age_group))
    redirect(`/dashboard/classes/${classId}?tab=elevi&editStudent=${studentId}&error=campuri_obligatorii`);

  const db = createAdminClient();
  const { data: cls } = await db.from("classes").select("id").eq("id", classId).eq("teacher_id", user.id).single();
  if (!cls) redirect("/dashboard/classes");

  await db.from("class_students").update({ display_name, age_group }).eq("id", studentId).eq("class_id", classId);
  redirect(`/dashboard/classes/${classId}?tab=elevi`);
}

async function removeStudent(classId: string, studentId: string) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: cls } = await db.from("classes").select("id").eq("id", classId).eq("teacher_id", user.id).single();
  if (!cls) redirect("/dashboard/classes");

  await db.from("class_students").delete().eq("id", studentId).eq("class_id", classId);
  redirect(`/dashboard/classes/${classId}?tab=elevi`);
}

async function regenerateStudentPin(classId: string, studentId: string) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: cls } = await db.from("classes").select("id").eq("id", classId).eq("teacher_id", user.id).single();
  if (!cls) redirect("/dashboard/classes");

  const newPin = generatePin();
  await db.from("class_students").update({ student_pin: hashStudentPin(newPin) }).eq("id", studentId).eq("class_id", classId);
  redirect(`/dashboard/classes/${classId}?tab=elevi&newPin=${newPin}&forStudent=${studentId}`);
}

async function assignCourse(classId: string, formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const course_id = formData.get("course_id") as string;
  if (!course_id) redirect(`/dashboard/classes/${classId}?tab=cursuri`);

  const db = createAdminClient();
  const { data: cls } = await db.from("classes").select("id").eq("id", classId).eq("teacher_id", user.id).single();
  if (!cls) redirect("/dashboard/classes");

  const { data: existing } = await db.from("class_courses").select("order_index").eq("class_id", classId).order("order_index", { ascending: false }).limit(1);
  const nextOrder = (existing?.[0]?.order_index ?? -1) + 1;
  await db.from("class_courses").upsert({ class_id: classId, course_id, order_index: nextOrder });
  redirect(`/dashboard/classes/${classId}?tab=cursuri`);
}

async function removeCourse(classId: string, courseId: string) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: cls } = await db.from("classes").select("id").eq("id", classId).eq("teacher_id", user.id).single();
  if (!cls) redirect("/dashboard/classes");

  await db.from("class_courses").delete().eq("class_id", classId).eq("course_id", courseId);
  redirect(`/dashboard/classes/${classId}?tab=cursuri`);
}

async function moveCourse(classId: string, courseId: string, direction: "up" | "down") {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  const { data: cls } = await db.from("classes").select("id").eq("id", classId).eq("teacher_id", user.id).single();
  if (!cls) redirect("/dashboard/classes");

  const { data: rows } = await db
    .from("class_courses")
    .select("course_id, order_index")
    .eq("class_id", classId)
    .order("order_index");

  if (!rows || rows.length < 2) redirect(`/dashboard/classes/${classId}?tab=cursuri`);

  const idx = rows.findIndex((r) => r.course_id === courseId);
  if (idx < 0) redirect(`/dashboard/classes/${classId}?tab=cursuri`);

  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= rows.length) redirect(`/dashboard/classes/${classId}?tab=cursuri`);

  const current = rows[idx];
  const neighbor = rows[swapIdx];

  await db.from("class_courses").update({ order_index: neighbor.order_index }).eq("class_id", classId).eq("course_id", current.course_id);
  await db.from("class_courses").update({ order_index: current.order_index }).eq("class_id", classId).eq("course_id", neighbor.course_id);

  redirect(`/dashboard/classes/${classId}?tab=cursuri`);
}

async function archiveClass(classId: string) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();
  await db.from("classes").update({ status: "archived" }).eq("id", classId).eq("teacher_id", user.id);
  redirect("/dashboard/classes");
}

export default async function ClassDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string; error?: string; editStudent?: string; newPin?: string; forStudent?: string }>;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { tab = "elevi", error, editStudent, newPin, forStudent } = await searchParams;

  const db = createAdminClient();

  const { data: cls } = await db.from("classes").select("*").eq("id", id).eq("teacher_id", user.id).single();
  if (!cls) notFound();

  const { data: students } = await db.from("class_students").select("*").eq("class_id", id).order("display_name");

  const { data: classCourseRows } = await db
    .from("class_courses")
    .select("course_id, order_index")
    .eq("class_id", id)
    .order("order_index");

  const assignedIds = (classCourseRows ?? []).map((r) => r.course_id);

  // Fetch course details separately to avoid join issues
  type CourseRow = { id: string; title: string; slug: string; audience: string };
  let assignedCoursesData: CourseRow[] = [];
  if (assignedIds.length > 0) {
    const { data } = await db.from("courses").select("id, title, slug, audience").in("id", assignedIds);
    const byId = Object.fromEntries((data ?? []).map((c) => [c.id, c]));
    assignedCoursesData = assignedIds.map((cid) => byId[cid]).filter(Boolean) as CourseRow[];
  }

  const { data: allCourses } = await db.from("courses").select("id, title, audience").eq("status", "published").order("title");
  const availableCourses = (allCourses ?? []).filter((c) => !assignedIds.includes(c.id));

  // ── Date progres (doar pentru tab-ul progres) ──────────────────────────────
  type CourseProgress = { total: number; lessonIds: string[] };
  type ProgressMap = Record<string, Record<string, { completed: number; lastAt: string | null }>>;

  let courseProgressMeta: Record<string, CourseProgress> = {};
  let progressMap: ProgressMap = {};
  let lastActivityMap: Record<string, string | null> = {};

  if (tab === "progres" && assignedCoursesData.length > 0 && (students ?? []).length > 0) {
    // Lecții publicate per curs
    for (const course of assignedCoursesData) {
      const { data: mods } = await db.from("modules").select("id").eq("course_id", course.id);
      const modIds = (mods ?? []).map((m) => m.id);
      let lessonIds: string[] = [];
      if (modIds.length > 0) {
        const { data: lessons } = await db.from("lessons").select("id")
          .in("module_id", modIds).eq("status", "published");
        lessonIds = (lessons ?? []).map((l) => l.id);
      }
      courseProgressMeta[course.id] = { total: lessonIds.length, lessonIds };
    }

    // Toate înregistrările de progres pentru elevii clasei
    const allLessonIds = Object.values(courseProgressMeta).flatMap((c) => c.lessonIds);
    const studentIds = (students ?? []).map((s) => s.id);

    if (allLessonIds.length > 0 && studentIds.length > 0) {
      const { data: progressRows } = await db
        .from("class_student_progress")
        .select("student_id, lesson_id, completed_at")
        .in("student_id", studentIds)
        .in("lesson_id", allLessonIds)
        .eq("status", "completed");

      // Construiește harta progres: studentId → courseId → { completed, lastAt }
      for (const row of progressRows ?? []) {
        const courseId = Object.entries(courseProgressMeta).find(([, meta]) =>
          meta.lessonIds.includes(row.lesson_id)
        )?.[0];
        if (!courseId) continue;

        if (!progressMap[row.student_id]) progressMap[row.student_id] = {};
        if (!progressMap[row.student_id][courseId]) progressMap[row.student_id][courseId] = { completed: 0, lastAt: null };

        progressMap[row.student_id][courseId].completed += 1;

        const prev = progressMap[row.student_id][courseId].lastAt;
        if (!prev || row.completed_at > prev) progressMap[row.student_id][courseId].lastAt = row.completed_at;

        // Ultima activitate globală per elev
        const prevGlobal = lastActivityMap[row.student_id];
        if (!prevGlobal || row.completed_at > prevGlobal) lastActivityMap[row.student_id] = row.completed_at;
      }
    }
  }

  const addStudentAction = addStudent.bind(null, id);
  const assignCourseAction = assignCourse.bind(null, id);
  const archiveClassAction = archiveClass.bind(null, id);

  const siteUrl = "https://ami-moti.everydai.ro";

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/classes" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft size={16} />
          Clasele mele
        </Link>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold">{cls.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <p className="text-gray-500 text-sm">{cls.school_year}</p>
              <span className="font-mono text-sm bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-lg">
                {cls.access_code}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button asChild variant="outline" size="sm" className="gap-1.5 text-indigo-600 border-indigo-200 hover:bg-indigo-50">
              <Link href={`/dashboard/classes/${id}/edit`}>
                <Pencil size={14} />
                Editează clasa
              </Link>
            </Button>
            {cls.status === "active" && (
              <form action={archiveClassAction}>
                <Button type="submit" variant="outline" size="sm" className="gap-1.5 text-gray-500 border-gray-200">
                  <Archive size={14} />
                  Arhivează
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Tabs — stilizate ca butoane */}
      <div className="flex gap-2 mb-6">
        <Link
          href={`/dashboard/classes/${id}?tab=elevi`}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            tab === "elevi"
              ? "bg-indigo-600 text-white shadow"
              : "bg-white border-2 border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-700"
          }`}
        >
          <Users size={15} />
          Elevi ({students?.length ?? 0})
        </Link>
        <Link
          href={`/dashboard/classes/${id}?tab=cursuri`}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            tab === "cursuri"
              ? "bg-indigo-600 text-white shadow"
              : "bg-white border-2 border-gray-200 text-gray-600 hover:border-indigo-300 hover:text-indigo-700"
          }`}
        >
          <BookOpen size={15} />
          Cursuri ({assignedCoursesData.length})
        </Link>
        <Link
          href={`/dashboard/classes/${id}?tab=progres`}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
            tab === "progres"
              ? "bg-teal-600 text-white shadow"
              : "bg-white border-2 border-gray-200 text-gray-600 hover:border-teal-300 hover:text-teal-700"
          }`}
        >
          <BarChart2 size={15} />
          Progres
        </Link>
      </div>

      {/* Tab: Elevi */}
      {tab === "elevi" && (
        <div className="space-y-5">
          {error === "campuri_obligatorii" && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
              Completează toate câmpurile obligatorii.
            </div>
          )}

          {/* Adaugă elev */}
          <Card>
            <CardContent className="p-5">
              <p className="font-semibold text-sm mb-1">Adaugă elev</p>
              <p className="text-xs text-gray-400 mb-4">Codul se generează automat din iniţialele numelui.</p>
              <form action={addStudentAction} className="flex flex-wrap gap-3 items-end">
                <div className="space-y-1.5 flex-1 min-w-[160px]">
                  <Label htmlFor="display_name" className="text-xs">Nume afișat</Label>
                  <Input id="display_name" name="display_name" placeholder="ex. Andrei Mihai" maxLength={40} required />
                </div>
                <div className="space-y-1.5 min-w-[160px]">
                  <Label htmlFor="age_group" className="text-xs">Grupă de vârstă</Label>
                  <select id="age_group" name="age_group" required className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                    <option value="5-8">5–8 ani (Cls. 1–8)</option>
                    <option value="0-4">0–4 ani (Preșcolar)</option>
                  </select>
                </div>
                <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 h-9">
                  <Plus size={14} />
                  Adaugă
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Import în masă din CSV */}
          <Card>
            <CardContent className="p-5">
              <p className="font-semibold text-sm mb-1">Import în masă din CSV</p>
              <p className="text-xs text-gray-400 mb-4">
                Fișier cu două coloane: <span className="font-mono">Nume Elev</span> și <span className="font-mono">Grupa varsta</span> (0-4 sau 5-8, opțional). Maximum 100 elevi per import.
              </p>
              <ImportStudentsButton classId={id} />
            </CardContent>
          </Card>

          {/* Lista elevi */}
          {students && students.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">{students.length} elevi</p>
              {students.map((s) => {
                const isEditing = editStudent === s.id;
                return (
                  <div key={s.id} className={`bg-white border-2 rounded-xl px-4 py-3 transition-all ${isEditing ? "border-indigo-300" : "border-gray-100"}`}>
                    {isEditing ? (
                      /* Formular editare inline */
                      <form action={updateStudent.bind(null, id, s.id)} className="flex flex-wrap gap-3 items-end">
                        <div className="flex-1 min-w-[140px] space-y-1">
                          <Label className="text-xs">Nume</Label>
                          <Input name="display_name" defaultValue={s.display_name} maxLength={40} required className="h-8 text-sm" />
                        </div>
                        <div className="min-w-[140px] space-y-1">
                          <Label className="text-xs">Grupă</Label>
                          <select name="age_group" defaultValue={s.age_group} className="w-full h-8 px-2 rounded-md border border-input bg-background text-sm">
                            <option value="5-8">5–8 ani</option>
                            <option value="0-4">0–4 ani</option>
                          </select>
                        </div>
                        <div className="flex gap-1">
                          <Button type="submit" size="sm" className="bg-indigo-600 text-white h-8 px-3 gap-1">
                            <Check size={13} /> Salvează
                          </Button>
                          <Button type="button" variant="outline" size="sm" className="h-8 px-3" asChild>
                            <Link href={`/dashboard/classes/${id}?tab=elevi`}><X size={13} /></Link>
                          </Button>
                        </div>
                      </form>
                    ) : (
                      /* Rând normal */
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{s.age_group === "0-4" ? "🌈" : "🚀"}</span>
                          <div>
                            <p className="font-medium text-sm">{s.display_name}</p>
                            <p className="text-xs text-gray-400 font-mono">{s.student_code} · {s.age_group} ani</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          {/* PIN display — arătat o singură dată după generare */}
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-400">PIN:</span>
                            {forStudent === s.id && newPin ? (
                              <span className="font-mono text-sm font-bold tracking-widest bg-green-50 text-green-700 border border-green-300 px-2 py-0.5 rounded-lg" title="Copiați PIN-ul acum — nu va mai fi afișat">
                                {newPin} ✓
                              </span>
                            ) : (
                              <span className="font-mono text-sm text-gray-400 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-lg">
                                ••••
                              </span>
                            )}
                          </div>
                          {/* Regenerate PIN */}
                          <form action={regenerateStudentPin.bind(null, id, s.id)}>
                            <Button
                              type="submit"
                              variant="ghost"
                              size="sm"
                              className="text-gray-400 hover:text-amber-600 h-8 w-8 p-0"
                              title="Generează PIN nou"
                            >
                              <RefreshCw size={13} />
                            </Button>
                          </form>
                          {/* Edit */}
                          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-indigo-600 h-8 w-8 p-0" asChild>
                            <Link href={`/dashboard/classes/${id}?tab=elevi&editStudent=${s.id}`}>
                              <Pencil size={14} />
                            </Link>
                          </Button>
                          {/* Delete */}
                          <form action={removeStudent.bind(null, id, s.id)}>
                            <Button type="submit" variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 h-8 w-8 p-0">
                              <Trash2 size={14} />
                            </Button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">Niciun elev adăugat încă.</p>
          )}

          {/* Info acces elevi */}
          <Card className="bg-indigo-50 border-indigo-200">
            <CardContent className="p-4 text-sm text-indigo-700">
              <p className="font-semibold mb-1">Cum intră elevii?</p>
              <p>
                Accesează <span className="font-mono font-bold">{siteUrl}/clasa</span>, introduc codul{" "}
                <span className="font-mono font-bold">{cls.access_code}</span>, selectează numele, apoi introduc{" "}
                <span className="font-bold">PIN-ul de 4 cifre</span> (vizibil în lista de mai sus).
              </p>
              <p className="text-xs text-indigo-500 mt-1.5">
                Comunică fiecărui elev/părinte PIN-ul individual. Poți regenera PIN-ul oricând cu butonul 🔄.
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab: Cursuri */}
      {tab === "cursuri" && (
        <div className="space-y-5">
          {/* Asignează curs */}
          {availableCourses.length > 0 ? (
            <Card>
              <CardContent className="p-5">
                <p className="font-semibold text-sm mb-1">Adaugă curs la clasă</p>
                <p className="text-xs text-gray-400 mb-4">Elevii vor vedea cursul în zona lor personală.</p>
                <form action={assignCourseAction} className="flex gap-3 items-end flex-wrap">
                  <div className="flex-1 min-w-[200px] space-y-1.5">
                    <Label htmlFor="course_id" className="text-xs">Selectează curs</Label>
                    <select id="course_id" name="course_id" required className="w-full h-9 px-3 rounded-md border border-input bg-background text-sm">
                      {availableCourses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({c.audience === "children" ? "Elevi" : c.audience === "invatator" ? "Învățători" : c.audience === "profesor" ? "Profesori" : "Toți"})
                        </option>
                      ))}
                    </select>
                  </div>
                  <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5 h-9">
                    <Plus size={14} />
                    Adaugă
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-dashed">
              <CardContent className="p-5 text-sm text-gray-400 text-center">
                Toate cursurile disponibile sunt deja asignate acestei clase.
              </CardContent>
            </Card>
          )}

          {/* Cursuri asignate */}
          {assignedCoursesData.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">{assignedCoursesData.length} cursuri asignate</p>
              {assignedCoursesData.map((course, idx) => (
                  <div key={course.id} className="flex items-center justify-between bg-white border-2 border-gray-100 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-3">
                      <BookOpen size={16} className="text-indigo-500" />
                      <div>
                        <p className="font-medium text-sm">{course.title}</p>
                        <p className="text-xs text-gray-400">
                          {course.audience === "children" ? "Elevi" : course.audience === "invatator" ? "Învățători" : course.audience === "profesor" ? "Profesori" : "Toți"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Reordonare */}
                      <form action={moveCourse.bind(null, id, course.id, "up")}>
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          disabled={idx === 0}
                          className="text-gray-400 hover:text-indigo-600 h-8 w-8 p-0 disabled:opacity-20"
                          title="Mută sus"
                        >
                          <ChevronUp size={15} />
                        </Button>
                      </form>
                      <form action={moveCourse.bind(null, id, course.id, "down")}>
                        <Button
                          type="submit"
                          variant="ghost"
                          size="sm"
                          disabled={idx === assignedCoursesData.length - 1}
                          className="text-gray-400 hover:text-indigo-600 h-8 w-8 p-0 disabled:opacity-20"
                          title="Mută jos"
                        >
                          <ChevronDown size={15} />
                        </Button>
                      </form>
                      {/* Ștergere */}
                      <form action={removeCourse.bind(null, id, course.id)}>
                        <Button type="submit" variant="ghost" size="sm" className="text-gray-400 hover:text-red-500 h-8 w-8 p-0">
                          <Trash2 size={14} />
                        </Button>
                      </form>
                    </div>
                  </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-8">
              Niciun curs asignat. Selectează un curs din formularul de mai sus.
            </p>
          )}
        </div>
      )}

      {/* Tab: Progres */}
      {tab === "progres" && (
        <div className="space-y-4">
          {(students ?? []).length > 0 && assignedCoursesData.length > 0 && (
            <div className="flex justify-end">
              <a
                href={`/api/dashboard/classes/${id}/progress-csv`}
                download
                className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-lg transition-colors"
              >
                <Download size={14} />
                Export CSV
              </a>
            </div>
          )}
          {(students ?? []).length === 0 || assignedCoursesData.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border text-gray-400 text-sm">
              {(students ?? []).length === 0
                ? "Adaugă elevi în clasă pentru a vedea progresul."
                : "Asignează cel puțin un curs clasei pentru a vedea progresul."}
            </div>
          ) : (
            <>
              {/* Sumar clasă */}
              {(() => {
                const totalStudents = (students ?? []).length;
                const totalCells = totalStudents * assignedCoursesData.length;
                let completedCells = 0;
                for (const s of students ?? []) {
                  for (const c of assignedCoursesData) {
                    const prog = progressMap[s.id]?.[c.id];
                    const total = courseProgressMeta[c.id]?.total ?? 0;
                    if (total > 0 && prog && prog.completed >= total) completedCells++;
                  }
                }
                const pct = totalCells > 0 ? Math.round((completedCells / totalCells) * 100) : 0;
                const activeStudents = (students ?? []).filter((s) => lastActivityMap[s.id]).length;
                return (
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-teal-50 border border-teal-100 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-teal-700">{pct}%</p>
                      <p className="text-xs text-teal-600 mt-0.5">Rată completare medie</p>
                    </div>
                    <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-indigo-700">{activeStudents}</p>
                      <p className="text-xs text-indigo-600 mt-0.5">Elevi activi</p>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-gray-700">{totalStudents - activeStudents}</p>
                      <p className="text-xs text-gray-500 mt-0.5">Fără activitate</p>
                    </div>
                  </div>
                );
              })()}

              {/* Tabel progres */}
              <div className="bg-white rounded-xl border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left px-4 py-3 font-semibold text-gray-700 w-48">Elev</th>
                        {assignedCoursesData.map((c) => (
                          <th key={c.id} className="text-center px-3 py-3 font-semibold text-gray-700 min-w-[140px]">
                            <span className="block truncate max-w-[140px]" title={c.title}>{c.title}</span>
                            <span className="text-xs font-normal text-gray-400">
                              {courseProgressMeta[c.id]?.total ?? 0} lecții
                            </span>
                          </th>
                        ))}
                        <th className="text-center px-3 py-3 font-semibold text-gray-700 min-w-[110px]">Ultima activitate</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {(students ?? []).map((student) => {
                        const lastAt = lastActivityMap[student.id];
                        const lastAtLabel = lastAt
                          ? (() => {
                              const diff = Math.floor((Date.now() - new Date(lastAt).getTime()) / 86400000);
                              if (diff === 0) return "Azi";
                              if (diff === 1) return "Ieri";
                              if (diff < 7) return `${diff} zile`;
                              if (diff < 30) return `${Math.floor(diff / 7)} săpt.`;
                              return `${Math.floor(diff / 30)} luni`;
                            })()
                          : null;

                        return (
                          <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3">
                              <p className="font-medium text-gray-800">{student.display_name}</p>
                              <p className="text-xs text-gray-400 font-mono">{student.student_code}</p>
                            </td>
                            {assignedCoursesData.map((course) => {
                              const meta = courseProgressMeta[course.id];
                              const prog = progressMap[student.id]?.[course.id];
                              const completed = prog?.completed ?? 0;
                              const total = meta?.total ?? 0;
                              const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                              const isDone = total > 0 && completed >= total;
                              return (
                                <td key={course.id} className="px-3 py-3 text-center">
                                  {total === 0 ? (
                                    <span className="text-xs text-gray-300">—</span>
                                  ) : (
                                    <div className="flex flex-col items-center gap-1">
                                      <div className="w-full bg-gray-100 rounded-full h-2 max-w-[120px]">
                                        <div
                                          className={`h-2 rounded-full transition-all ${isDone ? "bg-teal-500" : "bg-indigo-400"}`}
                                          style={{ width: `${pct}%` }}
                                        />
                                      </div>
                                      <span className={`text-xs font-medium ${isDone ? "text-teal-600" : "text-gray-600"}`}>
                                        {isDone ? "✓ Complet" : `${completed}/${total}`}
                                      </span>
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-3 py-3 text-center">
                              {lastAtLabel ? (
                                <span className="text-xs text-gray-500">{lastAtLabel}</span>
                              ) : (
                                <span className="text-xs text-gray-300">Inactiv</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
