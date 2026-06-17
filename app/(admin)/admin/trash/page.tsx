import { createAdminClient } from "@/lib/supabase/admin";
import { Trash2, RotateCcw, BookOpen, Layers, FileText } from "lucide-react";
import { TrashRestoreButton } from "@/components/admin/trash-restore-button";
import {
  restoreCourse, permanentDeleteCourse,
  restoreModule, permanentDeleteModule,
  restoreLesson, permanentDeleteLesson,
} from "@/lib/actions/admin-delete";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Coș de gunoi — Admin" };

function RelativeTime({ dateStr }: { dateStr: string }) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  const label = days > 0 ? `acum ${days} zile` : hours > 0 ? `acum ${hours} ore` : `acum ${mins} min`;
  return <span className="text-xs text-gray-400">{label}</span>;
}

export default async function TrashPage() {
  const db = createAdminClient();

  const [{ data: deletedCourses }, { data: deletedModules }, { data: deletedLessons }] = await Promise.all([
    db.from("courses").select("id, title, status, deleted_at").not("deleted_at", "is", null).order("deleted_at", { ascending: false }),
    db.from("modules").select("id, title, course_id, deleted_at, courses(title)").not("deleted_at", "is", null).order("deleted_at", { ascending: false }),
    db.from("lessons").select("id, title, lesson_type, module_id, deleted_at, modules(title, course_id, courses(id, title))").not("deleted_at", "is", null).order("deleted_at", { ascending: false }),
  ]);

  const isEmpty = !deletedCourses?.length && !deletedModules?.length && !deletedLessons?.length;

  return (
    <div className="max-w-4xl space-y-8">
      <div>
        <div className="flex items-center gap-3 mb-1">
          <Trash2 size={22} className="text-red-400" />
          <h1 className="text-2xl font-bold">Coș de gunoi</h1>
        </div>
        <p className="text-sm text-gray-500">
          Elementele șterse sunt listate mai jos. Poți restaura sau șterge permanent.
        </p>
      </div>

      {isEmpty ? (
        <div className="bg-white rounded-xl border border-dashed p-16 text-center text-gray-400">
          <Trash2 size={40} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium">Coșul de gunoi este gol.</p>
          <p className="text-sm mt-1">Elementele șterse vor apărea aici.</p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Cursuri șterse */}
          {!!deletedCourses?.length && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <BookOpen size={16} className="text-blue-500" />
                <h2 className="font-semibold text-gray-700">Cursuri ({deletedCourses.length})</h2>
              </div>
              <div className="bg-white rounded-xl border divide-y">
                {deletedCourses.map((course) => (
                  <div key={course.id} className="flex items-center justify-between px-4 py-3 gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{course.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${course.status === "published" ? "bg-teal-100 text-teal-700" : "bg-gray-100 text-gray-500"}`}>
                          {course.status === "published" ? "Publicat" : "Draft"}
                        </span>
                        {course.deleted_at && <RelativeTime dateStr={course.deleted_at} />}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <TrashRestoreButton
                        restoreAction={restoreCourse.bind(null, course.id)}
                        permanentDeleteAction={permanentDeleteCourse.bind(null, course.id)}
                        itemName={course.title}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Module șterse */}
          {!!deletedModules?.length && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Layers size={16} className="text-indigo-500" />
                <h2 className="font-semibold text-gray-700">Module ({deletedModules.length})</h2>
              </div>
              <div className="bg-white rounded-xl border divide-y">
                {deletedModules.map((mod) => {
                  const courseTitle = (mod.courses as { title?: string } | null)?.title ?? "—";
                  const courseId = (mod as { course_id: string }).course_id;
                  return (
                    <div key={mod.id} className="flex items-center justify-between px-4 py-3 gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{mod.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">din cursul: <span className="text-gray-600">{courseTitle}</span></span>
                          {mod.deleted_at && <RelativeTime dateStr={mod.deleted_at} />}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <TrashRestoreButton
                          restoreAction={restoreModule.bind(null, mod.id, courseId)}
                          permanentDeleteAction={permanentDeleteModule.bind(null, mod.id, courseId)}
                          itemName={mod.title}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Lecții șterse */}
          {!!deletedLessons?.length && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-teal-500" />
                <h2 className="font-semibold text-gray-700">Lecții ({deletedLessons.length})</h2>
              </div>
              <div className="bg-white rounded-xl border divide-y">
                {deletedLessons.map((lesson) => {
                  type LessonWithRelations = typeof lesson & {
                    modules: { title: string; course_id: string; courses: { id: string; title: string } | null } | null;
                  };
                  const l = lesson as LessonWithRelations;
                  const moduleTitle = l.modules?.title ?? "—";
                  const courseTitle = l.modules?.courses?.title ?? "—";
                  const courseId = l.modules?.courses?.id ?? l.modules?.course_id ?? "";
                  return (
                    <div key={lesson.id} className="flex items-center justify-between px-4 py-3 gap-4">
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{lesson.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-400">
                            {moduleTitle} · {courseTitle}
                          </span>
                          {lesson.deleted_at && <RelativeTime dateStr={lesson.deleted_at} />}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <TrashRestoreButton
                          restoreAction={restoreLesson.bind(null, lesson.id, courseId)}
                          permanentDeleteAction={permanentDeleteLesson.bind(null, lesson.id, courseId)}
                          itemName={lesson.title}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}
