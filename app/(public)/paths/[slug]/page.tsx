import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, Award, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("learning_paths").select("title, description").eq("slug", slug).single();
  if (!data) return { title: "Traseu negăsit" };
  return { title: `${data.title} — Ami & Moti`, description: data.description ?? undefined };
}

export default async function PathDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: path } = await supabase
    .from("learning_paths")
    .select(`
      id, title, description, skill_name, audience, status,
      learning_path_courses(
        order_index,
        course:courses(id, title, slug, description, age_group, estimated_duration,
          modules(id, title, lessons(id))
        )
      )
    `)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!path) notFound();

  const orderedCourses = (path.learning_path_courses as unknown as {
    order_index: number;
    course: {
      id: string; title: string; slug: string; description: string;
      age_group: string; estimated_duration: number | null;
      modules: { id: string; lessons: { id: string }[] }[];
    };
  }[])
    .sort((a, b) => a.order_index - b.order_index)
    .map((lpc) => lpc.course);

  const totalLessons = orderedCourses.reduce(
    (acc, c) => acc + c.modules.reduce((a, m) => a + m.lessons.length, 0), 0
  );

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <nav className="text-sm text-gray-400 mb-6">
        <Link href="/paths" className="hover:text-blue-500">Trasee</Link>
        <span className="mx-2">/</span>
        <span className="text-gray-700">{path.title}</span>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">{path.title}</h1>
        {path.description && (
          <p className="text-gray-600 text-lg leading-relaxed mb-6">{path.description}</p>
        )}
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1.5"><BookOpen size={16} />{orderedCourses.length} cursuri · {totalLessons} lecții</span>
          {path.skill_name && (
            <span className="flex items-center gap-1.5 text-amber-600"><Award size={16} />Diplomă: {path.skill_name}</span>
          )}
        </div>
      </div>

      <div className="space-y-4 mb-10">
        <h2 className="text-xl font-bold">Cursuri incluse</h2>
        {orderedCourses.map((course, idx) => (
          <div key={course.id} className="bg-white rounded-xl border p-5 flex items-start gap-4">
            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm flex items-center justify-center flex-shrink-0">
              {idx + 1}
            </span>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{course.title}</h3>
              {course.description && <p className="text-sm text-gray-500 mt-1">{course.description}</p>}
              <p className="text-xs text-gray-400 mt-2">
                {course.modules.reduce((a, m) => a + m.lessons.length, 0)} lecții
                {course.estimated_duration ? ` · ${course.estimated_duration} min` : ""}
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href={`/courses/${course.slug}`}>Vezi cursul</Link>
            </Button>
          </div>
        ))}
      </div>

      {path.skill_name && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-2xl p-8 text-center">
          <Award className="mx-auto mb-3 text-amber-500" size={40} />
          <h3 className="font-bold text-lg mb-2">Diplomă de certificare</h3>
          <p className="text-gray-600 mb-4">
            Completează toate cursurile din traseu și primești diploma <strong>{path.skill_name}</strong>.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700">
              <Link href="/register">Creează cont gratuit</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Am deja cont</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
