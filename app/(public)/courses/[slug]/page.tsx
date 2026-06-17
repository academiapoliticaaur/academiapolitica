import { notFound } from "next/navigation";
import Link from "next/link";
import { Clock, BookOpen, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgeGroupBadge } from "@/components/course/age-group-badge";
import { AmiMotiGuide } from "@/components/common/ami-moti-guide";
import { getCourseBySlug } from "@/lib/db/courses";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Curs negăsit" };

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://ami-moti-edu-platform.vercel.app";
  const courseUrl = `${appUrl}/courses/${slug}`;
  const description = course.description || `Curs educațional pentru copii — ${course.age_group === "0-4" ? "clasele 0–4" : "clasele 5–8"}. Platformă Ami și Moti.`;

  return {
    title: course.title,
    description,
    openGraph: {
      title: course.title,
      description,
      url: courseUrl,
      type: "website",
      siteName: "Ami & Moti",
      images: [
        {
          url: `${appUrl}/og-default.png`,
          width: 1200,
          height: 630,
          alt: course.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: course.title,
      description,
    },
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const totalLessons = course.modules?.reduce(
    (acc, m) => acc + (m.lessons?.length || 0),
    0
  ) ?? 0;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/courses" className="hover:text-blue-500">Cursuri</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{course.title}</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <AgeGroupBadge ageGroup={course.age_group} className="mb-4" />
        <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
        <p className="text-gray-600 text-lg leading-relaxed mb-6">{course.description}</p>

        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          {course.estimated_duration && (
            <span className="flex items-center gap-1.5">
              <Clock size={16} />
              {course.estimated_duration} minute
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <BookOpen size={16} />
            {totalLessons} lecții
          </span>
        </div>
      </div>

      <AmiMotiGuide
        variant="mission"
        message={`Acest curs este gândit special pentru ${course.age_group === "0-4" ? "clasele 0–4" : "clasele 5–8"}. Vei descoperi lucruri noi și interesante pas cu pas!`}
        className="mb-8"
      />

      {/* Structura cursului */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-6">Structura cursului</h2>
        {course.modules && course.modules.length > 0 ? (
          <div className="space-y-4">
            {course.modules.map((module, moduleIndex) => (
              <div key={module.id} className="border rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-5 py-4 flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {moduleIndex + 1}
                  </span>
                  <div>
                    <h3 className="font-semibold">{module.title}</h3>
                    {module.description && (
                      <p className="text-sm text-gray-500">{module.description}</p>
                    )}
                  </div>
                </div>

                {module.lessons && module.lessons.length > 0 && (
                  <ul className="divide-y">
                    {module.lessons.map((lesson, lessonIndex) => (
                      <li key={lesson.id}>
                        {user ? (
                          <Link
                            href={`/dashboard/preview/${course.id}/lesson/${lesson.id}`}
                            className="px-5 py-3 flex items-center gap-3 hover:bg-blue-50 transition-colors group"
                          >
                            <span className="text-gray-300 text-sm w-5 text-center">
                              {moduleIndex + 1}.{lessonIndex + 1}
                            </span>
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700 transition-colors">{lesson.title}</span>
                              {lesson.lesson_type && (
                                <span className="ml-2 text-xs text-gray-400">
                                  {lesson.lesson_type === "video" ? "🎬" :
                                   lesson.lesson_type === "presentation" ? "📋" :
                                   lesson.lesson_type === "quiz" ? "🎯" : "📝"}
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">Previzualizează →</span>
                          </Link>
                        ) : !!(course as typeof course & { is_demo?: boolean }).is_demo ? (
                          <Link
                            href={`/demo/${course.slug}/lesson/${lesson.id}`}
                            className="px-5 py-3 flex items-center gap-3 hover:bg-amber-50 transition-colors group"
                          >
                            <span className="text-gray-300 text-sm w-5 text-center">
                              {moduleIndex + 1}.{lessonIndex + 1}
                            </span>
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-700 group-hover:text-amber-700 transition-colors">{lesson.title}</span>
                              {lesson.lesson_type && (
                                <span className="ml-2 text-xs text-gray-400">
                                  {lesson.lesson_type === "video" ? "🎬" :
                                   lesson.lesson_type === "presentation" ? "📋" :
                                   lesson.lesson_type === "quiz" ? "🎯" : "📝"}
                                </span>
                              )}
                            </div>
                            <span className="text-xs bg-amber-100 text-amber-600 px-2 py-0.5 rounded-full font-medium">Demo gratuit →</span>
                          </Link>
                        ) : (
                          <div className="px-5 py-3 flex items-center gap-3">
                            <span className="text-gray-300 text-sm w-5 text-center">
                              {moduleIndex + 1}.{lessonIndex + 1}
                            </span>
                            <div className="flex-1">
                              <span className="text-sm font-medium text-gray-700">{lesson.title}</span>
                              {lesson.lesson_type && (
                                <span className="ml-2 text-xs text-gray-400">
                                  {lesson.lesson_type === "video" ? "🎬" :
                                   lesson.lesson_type === "presentation" ? "📋" :
                                   lesson.lesson_type === "quiz" ? "🎯" : "📝"}
                                </span>
                              )}
                            </div>
                            <Lock size={14} className="text-gray-300" />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400">Modulele sunt în pregătire.</p>
        )}
      </div>

      {/* CTA */}
      <div className="bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-8 text-center">
        {user ? (
          <>
            <p className="text-lg font-semibold mb-2">Ești autentificat!</p>
            <p className="text-gray-600 mb-4">Poți previzualiza conținutul sau alege profilul copilului pentru a începe.</p>
            <div className="flex flex-wrap justify-center gap-3">
              {course.modules?.[0]?.lessons?.[0] && (
                <Button className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2" size="lg" asChild>
                  <Link href={`/dashboard/preview/${course.id}/lesson/${course.modules[0].lessons[0].id}`}>
                    👁️ Previzualizează lecțiile
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="lg" asChild>
                <Link href="/dashboard">Mergi la Dashboard</Link>
              </Button>
            </div>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold mb-2">Vrei să accesezi lecțiile?</p>
            <p className="text-gray-600 mb-4">Creează un cont de părinte gratuit și adaugă profilul copilului.</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button className="bg-blue-100 hover:bg-blue-200 text-blue-700" size="lg" asChild>
                <Link href="/register">Creează cont gratuit</Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/login">Am deja cont</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
