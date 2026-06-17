import { notFound } from "next/navigation";
import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus, Edit, HardDrive, ExternalLink } from "lucide-react";
import { PublishCourseButton, PublishAllLessonsButton } from "@/components/admin/publish-buttons";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteCourse } from "@/lib/actions/admin-delete";
import { ensureCourseDriveFolder } from "@/lib/admin/actions";
import { ImportModuleButton } from "@/components/admin/import-module-button";
import { DraggableCourseContent } from "@/components/admin/draggable-course-content";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = { title: "Editare curs" };

interface Lesson {
  id: string;
  title: string;
  lesson_type: string;
  status: string;
  order_index: number;
}

interface Module {
  id: string;
  title: string;
  description?: string;
  order_index: number;
  lessons?: Lesson[];
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: course } = await supabase
    .from("courses")
    .select(`*, modules(*, lessons(*))`)
    .eq("id", id)
    .order("order_index", { referencedTable: "modules" })
    .order("order_index", { referencedTable: "modules.lessons" })
    .single();

  if (!course) notFound();

  type RawModule = Module & { deleted_at?: string | null };
  type RawLesson = Lesson & { deleted_at?: string | null };
  const modules: Module[] = (course.modules ?? [])
    .filter((m: RawModule) => !m.deleted_at)
    .map((m: RawModule) => ({
      ...m,
      lessons: [...((m.lessons ?? []) as RawLesson[])]
        .filter((l) => !l.deleted_at)
        .sort((a, b) => a.order_index - b.order_index),
    }));

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 mb-4">
          <Link href="/admin/courses">
            <ArrowLeft size={16} />
            Înapoi
          </Link>
        </Button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{course.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                course.age_group === "0-4" ? "bg-teal-100 text-teal-700" : "bg-indigo-100 text-indigo-700"
              }`}>
                Clasele {course.age_group}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                course.status === "published" ? "bg-teal-100 text-teal-700" : "bg-sky-100 text-sky-700"
              }`}>
                {course.status === "published" ? "✅ Publicat" : "📝 Draft"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {course.drive_folder_id ? (
              <Button asChild size="sm" className="bg-green-100 hover:bg-green-200 text-green-700 gap-1.5">
                <a href={`https://drive.google.com/drive/folders/${course.drive_folder_id}`} target="_blank" rel="noreferrer">
                  <HardDrive size={14} />
                  Drive
                  <ExternalLink size={12} />
                </a>
              </Button>
            ) : (
              <form action={ensureCourseDriveFolder.bind(null, id, course.title)}>
                <Button type="submit" size="sm" variant="outline" className="gap-1.5 text-gray-500">
                  <HardDrive size={14} />
                  Crează folder Drive
                </Button>
              </form>
            )}
            <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
              <Link href={`/admin/courses/${id}/edit`}>
                <Edit size={14} />
                Editează cursul
              </Link>
            </Button>
            <PublishCourseButton courseId={id} currentStatus={course.status ?? "draft"} />
            <DeleteButton
              action={deleteCourse.bind(null, id)}
              confirmMessage={`Ștergi cursul "${course.title}"? Se vor șterge toate modulele și lecțiile. Această acțiune este ireversibilă.`}
              redirectTo="/admin/courses"
            />
          </div>
        </div>
      </div>

      {/* Module și lecții */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Module și lecții</h2>
          <div className="flex items-center gap-2">
            <PublishAllLessonsButton courseId={id} />
            <ImportModuleButton courseId={id} />
            <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
              <Link href={`/admin/courses/${id}/modules`}>
                <Plus size={16} />
                Adaugă modul
              </Link>
            </Button>
          </div>
        </div>

        <DraggableCourseContent initialModules={modules} courseId={id} />
      </section>
    </div>
  );
}
