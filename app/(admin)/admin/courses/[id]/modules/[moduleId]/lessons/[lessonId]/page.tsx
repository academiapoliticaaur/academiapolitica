import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLessonForEdit } from "@/lib/admin/actions";
import { EditLessonForm } from "./edit-lesson-form";

export default async function EditLessonPage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string; lessonId: string }>;
}) {
  const { id: courseId, moduleId, lessonId } = await params;

  const lesson = await getLessonForEdit(lessonId);
  if (!lesson) notFound();

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 mb-4">
          <Link href={`/admin/courses/${courseId}`}>
            <ArrowLeft size={16} />
            Înapoi la curs
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Editează lecția</h1>
      </div>

      <EditLessonForm lesson={lesson} courseId={courseId} moduleId={moduleId} lessonId={lessonId} />
    </div>
  );
}
