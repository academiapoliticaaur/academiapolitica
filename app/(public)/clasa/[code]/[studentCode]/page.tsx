import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import { AmiMotiGuide } from "@/components/common/ami-moti-guide";
import { WeeklyClassTop } from "@/components/gamification/WeeklyClassTop";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Zona mea — Ami & Moti" };

export default async function StudentZonePage({
  params,
}: {
  params: Promise<{ code: string; studentCode: string }>;
}) {
  const { code, studentCode } = await params;
  const db = createAdminClient();

  const { data: cls } = await db
    .from("classes")
    .select("id, name, school_year, status")
    .eq("access_code", code.toUpperCase())
    .single();

  if (!cls || cls.status !== "active") notFound();

  const { data: student } = await db
    .from("class_students")
    .select("id, display_name, age_group")
    .eq("class_id", cls.id)
    .eq("student_code", studentCode.toUpperCase())
    .single();

  if (!student) notFound();

  // Fetch course IDs assigned to this class
  const { data: classCourseRows } = await db
    .from("class_courses")
    .select("course_id, order_index")
    .eq("class_id", cls.id)
    .order("order_index");

  const courseIds = (classCourseRows ?? []).map((r) => r.course_id);

  // Fetch course details separately
  type Course = { id: string; title: string; slug: string; description: string | null };
  let courses: Course[] = [];
  if (courseIds.length > 0) {
    const { data } = await db
      .from("courses")
      .select("id, title, slug, description")
      .in("id", courseIds);
    // Keep original order from class_courses
    const byId = Object.fromEntries((data ?? []).map((c) => [c.id, c]));
    courses = courseIds.map((id) => byId[id]).filter(Boolean) as Course[];
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mt-2 mb-8">
          <Link
            href={`/clasa/${code.toUpperCase()}`}
            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
          >
            <ArrowLeft size={16} />
            Înapoi la clasă
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="text-6xl mb-3">
            {student.age_group === "0-4" ? "🌈" : "🚀"}
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
            Bun venit, {student.display_name}!
          </h1>
          <p className="text-gray-500 text-sm">{cls.name} · {cls.school_year}</p>
        </div>

        <WeeklyClassTop currentClassId={cls.id} />

        {courses.length > 0 ? (
          <div className="space-y-4">
            <p className="text-xs font-bold tracking-widest text-gray-400 uppercase">Cursurile tale</p>
            {courses.map((course) => (
              <Link key={course.id} href={`/clasa/${code.toUpperCase()}/${studentCode.toUpperCase()}/course/${course.slug}`}>
                <Card className="border-2 border-indigo-100 hover:border-indigo-400 hover:shadow-md transition-all group">
                  <CardContent className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-200 transition-colors">
                      <BookOpen size={22} className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700 truncate">{course.title}</h3>
                      {course.description && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">{course.description}</p>
                      )}
                    </div>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
                      Intră
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border-2 border-dashed border-indigo-200">
            <div className="text-5xl mb-3">📚</div>
            <p className="font-semibold text-gray-600">Niciun curs asignat încă</p>
            <p className="text-sm text-gray-400 mt-1">Profesorul tău va adăuga cursuri în curând.</p>
          </div>
        )}

        <div className="mt-8">
          <AmiMotiGuide
            variant="ami"
            message="Apasă pe un curs pentru a începe să înveți. Mult succes!"
          />
        </div>
      </div>
    </div>
  );
}
