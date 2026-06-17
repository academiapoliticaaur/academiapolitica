import { Suspense } from "react";
import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CourseGridClient } from "@/components/course/course-grid-client";
import { getPublishedCourses, getDemoCourses, getPublishedCourseLessonTitles } from "@/lib/db/courses";
import { createClient } from "@/lib/supabase/server";
import type { AgeGroup } from "@/types";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Cursuri disponibile" };

type SortOption = "alpha" | "newest";

interface PageProps {
  searchParams: Promise<{ group?: string; type?: string; demo?: string; sort?: string }>;
}

const TYPE_INFO: Record<string, { icon: string; title: string; headline: string; description: string; details: string[] }> = {
  video: {
    icon: "🎬",
    title: "Lecții video",
    headline: "Învață prin film educațional",
    description:
      "Lecțiile video sunt create special pentru a capta atenția copiilor și a explica conceptele complexe într-un mod vizual, clar și atractiv. Fiecare video este însoțit de activități și materiale de consolidare.",
    details: [
      "Durate adaptate grupei de vârstă (5–15 minute)",
      "Limbaj simplu, animații și exemple din viața de zi cu zi",
      "Compatibil cu YouTube și Google Drive",
      "Progresul se salvează automat în contul copilului",
    ],
  },
  presentation: {
    icon: "📋",
    title: "Prezentări interactive",
    headline: "Slide-uri colorate și structurate",
    description:
      "Prezentările sunt create în Google Slides și integrate direct în platformă. Sunt ideale pentru recapitulare, lecturi ghidate sau pentru copiii care preferă să citească și să exploreze în ritmul lor.",
    details: [
      "Vizualizare direct în browser, fără download",
      "Design colorat și adaptat fiecărei grupe de vârstă",
      "Funcționează pe orice dispozitiv (tabletă, telefon, PC)",
      "Posibilitate de descărcare dacă este activată de profesor",
    ],
  },
  worksheet: {
    icon: "📝",
    title: "Activități și fișe de lucru",
    headline: "Exersează și consolidează cunoștințele",
    description:
      "Fișele de lucru sunt documente PDF descărcabile, create de echipa noastră de educatori. Pot fi tipărite sau completate digital, oferind copilului o activitate practică după fiecare lecție.",
    details: [
      "Descărcabile în format PDF",
      "Activități practice legate de lecția curentă",
      "Adaptate pentru grupele 0–4 și 5–8",
      "Pot fi tipărite sau completate pe tabletă cu stylus",
    ],
  },
  quiz: {
    icon: "🎯",
    title: "Quiz-uri interactive",
    headline: "Testează ce ai învățat în mod jucăuș",
    description:
      "Quiz-urile sunt integrate direct în fluxul lecției și oferă feedback imediat, pozitiv și încurajator. Nu există note — scopul este să ajute copilul să înțeleagă și să repete, nu să îl streseze.",
    details: [
      "Răspunsuri multiple cu feedback vizual imediat",
      "Fără note sau penalizări — focus pe înțelegere",
      "Progresul se salvează și poate fi revizuit de părinte",
      "Gamificat: puncte, steluțe și mesaje de encouragement",
    ],
  },
};

async function CourseList({ ageGroup, sort }: { ageGroup?: AgeGroup; sort?: SortOption }) {
  const [courses, titleIndex] = await Promise.all([
    getPublishedCourses(ageGroup),
    getPublishedCourseLessonTitles(),
  ]);

  if (courses.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-gray-500 text-lg">Cursurile sunt în pregătire. Revino curând!</p>
        <p className="text-gray-400 text-sm mt-2">Ami și Moti lucrează la conținut nou pentru tine.</p>
      </div>
    );
  }

  const sorted = sort === "newest"
    ? [...courses].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    : courses;

  return <CourseGridClient courses={sorted} titleIndex={titleIndex} />;
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  // Pagină descriptivă pentru tip de conținut (video, presentation, worksheet, quiz)
  if (params.type && TYPE_INFO[params.type]) {
    const info = TYPE_INFO[params.type];
    return (
      <div className="container mx-auto max-w-3xl px-4 py-16">
        <nav className="text-sm text-gray-400 mb-8">
          <Link href="/courses" className="hover:text-blue-500">Cursuri</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{info.title}</span>
        </nav>

        <div className="text-center mb-12">
          <div className="text-7xl mb-4">{info.icon}</div>
          <h1 className="text-3xl font-extrabold text-gray-900 mb-3">{info.title}</h1>
          <p className="text-xl text-blue-600 font-medium mb-6">{info.headline}</p>
          <p className="text-gray-600 leading-relaxed text-lg">{info.description}</p>
        </div>

        <div className="bg-blue-50 rounded-2xl p-8 mb-10">
          <h2 className="font-bold text-gray-800 mb-4">Ce include?</h2>
          <ul className="space-y-3">
            {info.details.map((d, i) => (
              <li key={i} className="flex items-start gap-3 text-gray-700">
                <span className="text-blue-400 mt-0.5 shrink-0">✓</span>
                {d}
              </li>
            ))}
          </ul>
        </div>

        {/* Navigare între tipuri de conținut */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { key: "video", icon: "🎬", label: "Lecții video" },
            { key: "presentation", icon: "📋", label: "Prezentări" },
            { key: "worksheet", icon: "📝", label: "Activități" },
            { key: "quiz", icon: "🎯", label: "Quiz-uri" },
          ].map((t) => (
            <Link
              key={t.key}
              href={`/courses?type=${t.key}`}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                t.key === params.type
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-300 hover:border-gray-500"
              }`}
            >
              {t.icon} {t.label}
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <Button className="bg-blue-100 hover:bg-blue-200 text-blue-700" size="lg" asChild>
            <Link href="/courses">← Toate cursurile</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/register">Creează cont gratuit</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Detectează tipul de cont pentru filtrare automată
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  let forcedAgeGroup: AgeGroup | undefined;
  let teacherAccountType: "invatator" | "profesor" | undefined;

  if (user) {
    const { data: profile } = await supabase
      .from("parent_profiles")
      .select("account_type, approved")
      .eq("user_id", user.id)
      .single();

    if (profile?.approved) {
      if (profile.account_type === "invatator") { forcedAgeGroup = "0-4"; teacherAccountType = "invatator"; }
      if (profile.account_type === "profesor") { forcedAgeGroup = "5-8"; teacherAccountType = "profesor"; }
    }
  }

  const isDemo = params.demo === "1";
  const groupFilter = forcedAgeGroup ?? (params.group as AgeGroup | undefined);
  const validGroup =
    groupFilter === "0-4" || groupFilter === "5-8" ? groupFilter : undefined;
  const sortOption: SortOption = params.sort === "newest" ? "newest" : "alpha";

  const demoCourses = await getDemoCourses().catch(() => []);

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Cursuri disponibile 📚</h1>
        <p className="text-gray-500">
          Alege grupa potrivită și începe să explorezi împreună cu Ami și Moti.
        </p>
      </div>

      {/* Secțiune cursuri demonstrative */}
      {demoCourses.length > 0 && (
        <div className={isDemo ? "mb-4" : "mb-10"}>
          {!isDemo && <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">Cursuri demonstrative</p>}
          <div className="grid md:grid-cols-2 gap-6">
            {demoCourses.map((course) => {
              const firstLesson = course.modules?.[0]?.lessons?.[0];
              return (
                <Card key={course.id} className="border-2 border-amber-200 hover:border-amber-400 transition-colors">
                  <CardContent className="p-8">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-2xl">🎁</span>
                      <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-3 py-1 rounded-full">Gratuit, fără cont</span>
                    </div>
                    <h3 className="text-xl font-bold text-amber-700 mb-2 leading-snug">{course.title}</h3>
                    {course.description && (
                      <p className="text-gray-600 mb-5 line-clamp-2">{course.description}</p>
                    )}
                    {firstLesson ? (
                      <Button className="bg-amber-500 hover:bg-amber-600 text-white w-full" asChild>
                        <Link href={`/demo/${course.slug}/lesson/${firstLesson.id}`}>Explorează cursul demo</Link>
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/courses/${course.slug}`}>Vezi cursul</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Banner cadre didactice */}
      {teacherAccountType && (
        <div className="mb-8 bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-3">
            <GraduationCap size={22} className="text-indigo-500 shrink-0 mt-0.5" />
            <p className="text-indigo-800 text-sm">
              <span className="font-semibold">Cursurile de mai jos sunt pentru elevii tăi.</span>{" "}
              Ghidurile și resursele tale de pregătire ca {teacherAccountType === "invatator" ? "învățător" : "profesor"} sunt într-o secțiune dedicată.
            </p>
          </div>
          <Button asChild size="sm" className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 shrink-0">
            <Link href="/cadre-didactice">Vezi resursele mele de pregătire →</Link>
          </Button>
        </div>
      )}

      {/* Filtre grupă vârstă + Demo */}
      {!forcedAgeGroup && (
        <div className="flex flex-wrap gap-3 mb-8">
          <Link
            href={sortOption === "newest" ? "/courses?sort=newest" : "/courses"}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${!validGroup && !isDemo ? "bg-blue-100 text-blue-700 border-blue-300" : "bg-white text-gray-600 border-gray-200 hover:border-blue-300"}`}
          >
            Toate grupele
          </Link>
          <Link
            href={`/courses?group=0-4${sortOption === "newest" ? "&sort=newest" : ""}`}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${validGroup === "0-4" && !isDemo ? "bg-teal-500 text-white border-teal-500" : "bg-white text-gray-600 border-gray-200 hover:border-teal-300"}`}
          >
            🌱 Clasele 0–4
          </Link>
          <Link
            href={`/courses?group=5-8${sortOption === "newest" ? "&sort=newest" : ""}`}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${validGroup === "5-8" && !isDemo ? "bg-indigo-500 text-white border-indigo-500" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"}`}
          >
            🔬 Clasele 5–8
          </Link>
          {demoCourses.length > 0 && (
            <Link
              href="/courses?demo=1"
              className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${isDemo ? "bg-amber-500 text-white border-amber-500" : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"}`}
            >
              🎁 Demo gratuit
            </Link>
          )}

          {/* Separator + sortare */}
          <span className="self-center w-px h-5 bg-gray-200" />
          <Link
            href={validGroup ? `/courses?group=${validGroup}` : "/courses"}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${sortOption === "alpha" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
          >
            A–Z
          </Link>
          <Link
            href={validGroup ? `/courses?group=${validGroup}&sort=newest` : "/courses?sort=newest"}
            className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${sortOption === "newest" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"}`}
          >
            Noi întâi
          </Link>
        </div>
      )}

      {forcedAgeGroup && (
        <div className="mb-8 flex items-center gap-2">
          <span className={`px-4 py-2 rounded-full text-sm font-medium border ${
            forcedAgeGroup === "0-4" ? "bg-teal-500 text-white border-teal-500" : "bg-indigo-500 text-white border-indigo-500"
          }`}>
            {forcedAgeGroup === "0-4" ? "🌱 Clasele 0–4" : "🔬 Clasele 5–8"}
          </span>
          <span className="text-xs text-gray-400">Cursuri filtrate pentru grupa ta</span>
        </div>
      )}

      {!isDemo && (
        <Suspense
          fallback={
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          }
        >
          <CourseList ageGroup={validGroup} sort={sortOption} />
        </Suspense>
      )}
    </div>
  );
}
