import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus, Users, BookOpen, Archive, CreditCard, AlertTriangle } from "lucide-react";
import { AmiMotiGuide } from "@/components/common/ami-moti-guide";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSubscriptionActive, subscriptionExpiresIn, formatSubscriptionExpiry } from "@/lib/subscription";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Clasele mele — Ami & Moti" };

type ClassRow = {
  id: string;
  name: string;
  grade: string | null;
  school_year: string;
  access_code: string;
  status: string;
  studentCount: number;
  courseCount: number;
};

export default async function ClassesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const db = createAdminClient();

  // Verifică subscripția profesorului (elevi nu pot accesa lecții fără abonament activ al profesorului)
  const { data: profile } = await db
    .from("parent_profiles")
    .select("subscription_plan, subscription_expires_at")
    .eq("user_id", user.id)
    .maybeSingle();

  const hasActiveSubscription = isSubscriptionActive(profile?.subscription_expires_at);
  const daysLeft = subscriptionExpiresIn(profile?.subscription_expires_at);
  const expiringsSoon = hasActiveSubscription && daysLeft !== null && daysLeft <= 7;

  const { data: rawClasses } = await db
    .from("classes")
    .select("id, name, grade, school_year, access_code, status")
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  const classes: ClassRow[] = [];

  if (rawClasses && rawClasses.length > 0) {
    const classIds = rawClasses.map((c) => c.id);

    const { data: students } = await db
      .from("class_students")
      .select("class_id")
      .in("class_id", classIds);

    const { data: courses } = await db
      .from("class_courses")
      .select("class_id")
      .in("class_id", classIds);

    const studentCounts: Record<string, number> = {};
    const courseCounts: Record<string, number> = {};
    (students ?? []).forEach((s) => { studentCounts[s.class_id] = (studentCounts[s.class_id] ?? 0) + 1; });
    (courses ?? []).forEach((c) => { courseCounts[c.class_id] = (courseCounts[c.class_id] ?? 0) + 1; });

    for (const c of rawClasses) {
      classes.push({ ...c, studentCount: studentCounts[c.id] ?? 0, courseCount: courseCounts[c.id] ?? 0 });
    }
  }

  const active = classes.filter((c) => c.status === "active");
  const archived = classes.filter((c) => c.status === "archived");

  return (
    <div className="max-w-4xl">
      {/* Banner abonament — profesorii trebuie să aibă abonament activ pentru ca elevii să acceseze lecțiile */}
      {!hasActiveSubscription && (
        <div className="mb-6 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-start gap-3">
          <CreditCard size={22} className="text-indigo-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-indigo-800">Abonament necesar</p>
            <p className="text-sm text-indigo-700 mt-0.5">
              Elevii din clasele tale nu pot accesa lecțiile fără un abonament activ. Contactează administratorul platformei pentru activare.
            </p>
          </div>
        </div>
      )}
      {expiringsSoon && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle size={22} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800">Abonament expiră în curând</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Abonamentul tău expiră pe <strong>{formatSubscriptionExpiry(profile?.subscription_expires_at)}</strong> ({daysLeft} {daysLeft === 1 ? "zi" : "zile"} rămase). Contactează administratorul pentru reînnoire.
            </p>
          </div>
        </div>
      )}

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Clasele mele</h1>
          <p className="text-gray-500">Gestionează clasele, elevii și cursurile asignate.</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 shrink-0">
          <Link href="/dashboard/classes/new">
            <Plus size={16} />
            Clasă nouă
          </Link>
        </Button>
      </div>

      {classes.length === 0 ? (
        <Card className="border-dashed border-2">
          <CardContent className="p-10 text-center">
            <div className="text-5xl mb-3">🏫</div>
            <p className="font-semibold text-gray-700 mb-2">Nu ai creat nicio clasă încă</p>
            <p className="text-sm text-gray-500 mb-5">
              Creează prima ta clasă, adaugă elevi și asignează cursuri.
            </p>
            <Button asChild className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
              <Link href="/dashboard/classes/new">
                <Plus size={16} />
                Creează prima clasă
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {active.length > 0 && (
            <section>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Active</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {active.map((cls) => <ClassCard key={cls.id} cls={cls} />)}
              </div>
            </section>
          )}
          {archived.length > 0 && (
            <section>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">Arhivate</p>
              <div className="grid sm:grid-cols-2 gap-4">
                {archived.map((cls) => <ClassCard key={cls.id} cls={cls} archived />)}
              </div>
            </section>
          )}
          <AmiMotiGuide
            variant="ami"
            message="Elevii intră la /clasa cu codul clasei, selectează numele din listă și introduc PIN-ul personal. Nu au nevoie de cont sau email — totul e simplu și rapid!"
          />
        </div>
      )}
    </div>
  );
}

function ClassCard({ cls, archived = false }: { cls: ClassRow; archived?: boolean }) {
  return (
    <Link href={`/dashboard/classes/${cls.id}`}>
      <Card className={`hover:shadow-md transition-all border-2 ${archived ? "border-gray-200 opacity-70" : "border-indigo-100 hover:border-indigo-300"}`}>
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <h3 className="font-semibold text-gray-900">{cls.name}</h3>
              <p className="text-xs text-gray-400">{cls.school_year}</p>
            </div>
            <span className="text-xs font-mono bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-lg shrink-0">
              {cls.access_code}
            </span>
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Users size={14} />
              {cls.studentCount} elevi
            </span>
            <span className="flex items-center gap-1">
              <BookOpen size={14} />
              {cls.courseCount} cursuri
            </span>
            {archived && (
              <span className="flex items-center gap-1 text-gray-400">
                <Archive size={14} />
                Arhivat
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
