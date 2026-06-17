import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { AcademiaGuide } from "@/components/common/academia-guide";
import { StudentList } from "./student-list";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Selectează elevul — Academia Politica AUR" };

export default async function ClassStudentsPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const db = createAdminClient();

  const { data: cls } = await db
    .from("classes")
    .select("id, name, grade, school_year, status")
    .eq("access_code", code.toUpperCase())
    .single();

  if (!cls || cls.status !== "active") notFound();

  const { data: rawStudents } = await db
    .from("class_students")
    .select("id, display_name, student_code, age_group, student_pin")
    .eq("class_id", cls.id)
    .order("display_name");

  // Nu trimitem PIN-ul la client — doar dacă există sau nu
  const students = (rawStudents ?? []).map(({ student_pin, ...s }) => ({
    ...s,
    has_pin: Boolean(student_pin),
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 p-4">
      <div className="max-w-md mx-auto">
        <Link
          href="/grup"
          className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 mb-6 mt-2"
        >
          <ArrowLeft size={16} />
          Alt cod de clasă
        </Link>

        <div className="text-center mb-8">
          <div className="text-5xl mb-3">👋</div>
          <h1 className="text-2xl font-extrabold text-gray-900 mb-1">{cls.name}</h1>
          <p className="text-gray-500 text-sm">{cls.school_year}</p>
        </div>

        <p className="text-sm font-semibold text-gray-500 mb-3 text-center">
          Selectează-ți numele din listă
        </p>

        {students.length > 0 ? (
          <StudentList students={students} classCode={code.toUpperCase()} />
        ) : (
          <div className="text-center py-10 text-gray-400">
            <p>Niciun elev în această clasă momentan.</p>
            <p className="text-sm mt-1">Contactează profesorul tău.</p>
          </div>
        )}

        <div className="mt-8">
          <AcademiaGuide
            variant="tip"
            message="Apasă pe numele tău! Dacă nu te găsești, profesorul tău trebuie să te adauge în clasă."
          />
        </div>
      </div>
    </div>
  );
}
