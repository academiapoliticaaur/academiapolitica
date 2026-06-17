import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoEmbed } from "@/components/lesson/video-embed";
import { PresentationViewer } from "@/components/lesson/presentation-viewer";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { lessonId } = await params;
  const db = createAdminClient();
  const { data } = await db.from("lessons").select("title").eq("id", lessonId).single();
  return { title: data?.title ? `${data.title} — Demo Ami & Moti` : "Lecție demo" };
}

export default async function DemoLessonPage({ params }: PageProps) {
  const { courseSlug, lessonId } = await params;
  const db = createAdminClient();

  // Verifică că lecția aparține unui curs demo publicat
  const { data: course } = await db
    .from("courses")
    .select(`id, title, slug, is_demo, modules(id, title, order_index, lessons(id, title, order_index, lesson_type))`)
    .eq("slug", courseSlug)
    .eq("status", "published")
    .eq("is_demo", true)
    .order("order_index", { referencedTable: "modules" })
    .order("order_index", { referencedTable: "modules.lessons" })
    .single();

  if (!course) notFound();

  const { data: lesson } = await db
    .from("lessons")
    .select("id, title, description, lesson_type, video_url, presentation_url, worksheet_url, allow_download, ai_generated")
    .eq("id", lessonId)
    .single();

  if (!lesson) notFound();

  // Construiește lista plată de lecții pentru nav prev/next
  type NavLesson = { id: string; title: string; moduleTitle: string };
  const allLessons: NavLesson[] = (course.modules ?? []).flatMap((m) =>
    (m.lessons ?? []).map((l) => ({ id: l.id, title: l.title, moduleTitle: m.title }))
  );

  const currentIdx = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIdx > 0 ? allLessons[currentIdx - 1] : null;
  const nextLesson = currentIdx < allLessons.length - 1 ? allLessons[currentIdx + 1] : null;

  const lessonTypeIcon: Record<string, string> = {
    video: "🎬", presentation: "📋", worksheet: "📝", quiz: "🎯", mixed: "📚",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top bar */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between gap-4 sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Button variant="ghost" size="sm" asChild className="shrink-0">
            <Link href={`/courses/${courseSlug}`}>
              <ArrowLeft size={16} className="mr-1" />
              {course.title}
            </Link>
          </Button>
          <span className="text-gray-300 hidden sm:block">|</span>
          <span className="text-sm font-medium text-gray-700 truncate hidden sm:block">{lesson.title}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-1 rounded-full">
            Demo gratuit
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* AI badge */}
        {lesson.ai_generated && (
          <div className="mb-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-700">
            ℹ️ Acest conținut a fost creat cu ajutorul AI și validat de echipa noastră.
          </div>
        )}

        {/* Lesson title */}
        <div className="mb-6">
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">
            {lessonTypeIcon[lesson.lesson_type] ?? "📚"} Lecție demo
          </p>
          <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-gray-600 mt-2 leading-relaxed">{lesson.description}</p>
          )}
        </div>

        {/* Conținut */}
        {lesson.video_url && (
          <div className="mb-6 rounded-xl overflow-hidden shadow">
            <VideoEmbed videoUrl={lesson.video_url} title={lesson.title} />
          </div>
        )}

        {lesson.presentation_url && (
          <div className="mb-6">
            <PresentationViewer
              presentationUrl={lesson.presentation_url}
              title={lesson.title}
              allowDownload={lesson.allow_download}
            />
          </div>
        )}

        {lesson.worksheet_url && (
          <div className="mb-6 p-5 bg-white rounded-xl border">
            <p className="font-semibold mb-3">📝 Fișă de lucru</p>
            {lesson.allow_download ? (
              <a
                href={lesson.worksheet_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:underline text-sm font-medium"
              >
                ⬇️ Descarcă fișa de lucru
              </a>
            ) : (
              <p className="text-sm text-gray-500">Fișa de lucru este disponibilă după înregistrare.</p>
            )}
          </div>
        )}

        {lesson.lesson_type === "quiz" && (
          <div className="mb-6 p-6 bg-white rounded-xl border text-center">
            <div className="text-4xl mb-3">🎯</div>
            <p className="font-semibold text-gray-800 mb-2">Quiz disponibil după înregistrare</p>
            <p className="text-sm text-gray-500 mb-4">
              Creează un cont gratuit pentru a rezolva quiz-urile și a salva progresul.
            </p>
            <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700">
              <Link href="/register">Creează cont gratuit</Link>
            </Button>
          </div>
        )}

        {/* Nav prev/next */}
        <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t">
          {prevLesson ? (
            <Button variant="outline" asChild className="gap-2">
              <Link href={`/demo/${courseSlug}/lesson/${prevLesson.id}`}>
                <ArrowLeft size={16} />
                <span className="hidden sm:inline truncate max-w-[160px]">{prevLesson.title}</span>
                <span className="sm:hidden">Anterior</span>
              </Link>
            </Button>
          ) : <div />}

          {nextLesson ? (
            <Button className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2" asChild>
              <Link href={`/demo/${courseSlug}/lesson/${nextLesson.id}`}>
                <span className="hidden sm:inline truncate max-w-[160px]">{nextLesson.title}</span>
                <span className="sm:hidden">Următor</span>
                <ArrowRight size={16} />
              </Link>
            </Button>
          ) : <div />}
        </div>

        {/* CTA register */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-sky-50 rounded-2xl p-8 text-center border border-blue-100">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Lock size={18} className="text-blue-400" />
            <p className="text-lg font-semibold text-gray-800">Vrei să urmărești progresul?</p>
          </div>
          <p className="text-gray-600 mb-5 text-sm">
            Creează un cont gratuit de părinte, adaugă profilul copilului și
            toate lecțiile se salvează automat.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button className="bg-blue-500 hover:bg-blue-600 text-white" size="lg" asChild>
              <Link href="/register">Creează cont gratuit</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Am deja cont</Link>
            </Button>
          </div>
        </div>

        {/* Cuprins lateral mini */}
        <div className="mt-8 p-5 bg-white rounded-xl border">
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-3">
            Lecțiile din acest curs demo
          </p>
          <ul className="space-y-1">
            {allLessons.map((l, i) => (
              <li key={l.id}>
                <Link
                  href={`/demo/${courseSlug}/lesson/${l.id}`}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    l.id === lessonId
                      ? "bg-blue-100 text-blue-700 font-semibold"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-gray-400 text-xs w-5 text-right shrink-0">{i + 1}.</span>
                  <span className="truncate">{l.title}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
