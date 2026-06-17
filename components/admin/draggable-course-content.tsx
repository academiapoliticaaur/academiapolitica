"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  arrayMove,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit, Plus, HardDrive, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PublishLessonButton } from "@/components/admin/publish-buttons";
import { DeleteButton } from "@/components/admin/delete-button";
import { ImportQuizButton } from "@/components/admin/import-quiz-button";
import { deleteLesson, deleteModule } from "@/lib/actions/admin-delete";
import { reorderModules, reorderLessons } from "@/lib/admin/actions";

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
  order_index: number;
  lessons?: Lesson[];
  drive_folder_id?: string | null;
}

// --- SortableLesson ---

function SortableLesson({
  lesson,
  lessonIndex,
  moduleIndex,
  moduleId,
  courseId,
}: {
  lesson: Lesson;
  lessonIndex: number;
  moduleIndex: number;
  moduleId: string;
  courseId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="px-5 py-3 flex items-center gap-3 bg-white">
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none"
        title="Trage pentru reordonare"
        type="button"
      >
        <GripVertical size={16} />
      </button>
      <span className="text-gray-300 text-sm w-8 flex-shrink-0">
        {moduleIndex + 1}.{lessonIndex + 1}
      </span>
      <span className="flex-1 text-sm font-medium truncate min-w-0" title={lesson.title}>
        {lesson.title}
      </span>
      <span className="text-xs text-gray-400">{lesson.lesson_type}</span>
      <span className={`text-xs px-2 py-0.5 rounded-full ${
        lesson.status === "published" ? "bg-teal-100 text-teal-700" :
        lesson.status === "reviewed" ? "bg-indigo-100 text-indigo-700" :
        "bg-sky-100 text-sky-700"
      }`}>
        {lesson.status === "published" ? "✅ Publicat" : lesson.status === "reviewed" ? "🔍 Verificat" : "📝 Draft"}
      </span>
      <PublishLessonButton lessonId={lesson.id} courseId={courseId} currentStatus={lesson.status ?? "draft"} />
      <Button size="sm" asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700">
        <Link href={`/admin/courses/${courseId}/modules/${moduleId}/lessons/${lesson.id}`}>
          <Edit size={14} />
        </Link>
      </Button>
      <DeleteButton
        action={deleteLesson.bind(null, lesson.id, courseId)}
        confirmMessage={`Ștergi lecția "${lesson.title}"? Această acțiune este ireversibilă.`}
      />
    </li>
  );
}

// --- LessonsList (separate DnD context per module) ---

function LessonsList({
  lessons,
  moduleIndex,
  moduleId,
  courseId,
}: {
  lessons: Lesson[];
  moduleIndex: number;
  moduleId: string;
  courseId: string;
}) {
  const [items, setItems] = useState(lessons);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = items.findIndex((l) => l.id === active.id);
    const newIndex = items.findIndex((l) => l.id === over.id);
    const newItems = arrayMove(items, oldIndex, newIndex);
    setItems(newItems);

    startTransition(() => {
      reorderLessons(moduleId, newItems.map((l) => l.id), courseId);
    });
  }

  if (items.length === 0) {
    return (
      <p className="px-5 py-4 text-sm text-gray-400">
        Nicio lecție.{" "}
        <Link href={`/admin/courses/${courseId}/modules/${moduleId}/lessons`} className="text-blue-500 hover:underline">
          Adaugă prima lecție.
        </Link>
      </p>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((l) => l.id)} strategy={verticalListSortingStrategy}>
        <ul className="divide-y">
          {items.map((lesson, lIdx) => (
            <SortableLesson
              key={lesson.id}
              lesson={lesson}
              lessonIndex={lIdx}
              moduleIndex={moduleIndex}
              moduleId={moduleId}
              courseId={courseId}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

// --- SortableModule ---

function SortableModule({
  module,
  moduleIndex,
  courseId,
}: {
  module: Module;
  moduleIndex: number;
  courseId: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: module.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white rounded-xl border overflow-hidden">
      <div className="flex items-center justify-between bg-gray-50 px-5 py-4 border-b">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500 touch-none"
            title="Trage pentru reordonare"
            type="button"
          >
            <GripVertical size={16} />
          </button>
          <h3 className="font-semibold flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 text-xs font-bold flex items-center justify-center">
              {moduleIndex + 1}
            </span>
            {module.title}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {module.drive_folder_id && (
            <Button asChild size="sm" className="bg-green-100 hover:bg-green-200 text-green-700 gap-1.5">
              <a href={`https://drive.google.com/drive/folders/${module.drive_folder_id}`} target="_blank" rel="noreferrer">
                <HardDrive size={14} />
                <ExternalLink size={12} />
              </a>
            </Button>
          )}
          <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
            <Link href={`/admin/courses/${courseId}/modules/${module.id}`}>
              <Edit size={14} />
              Editează modul
            </Link>
          </Button>
          <ImportQuizButton
            moduleId={module.id}
            courseId={courseId}
            existingLessonIds={(module.lessons ?? []).map((l) => l.id)}
          />
          <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
            <Link href={`/admin/courses/${courseId}/modules/${module.id}/lessons`}>
              <Plus size={14} />
              Adaugă lecție
            </Link>
          </Button>
          <DeleteButton
            action={deleteModule.bind(null, module.id, courseId)}
            confirmMessage={`Ștergi modulul "${module.title}"${(module.lessons?.length ?? 0) > 0 ? ` și cele ${module.lessons!.length} lecții din el` : ""}? Această acțiune este ireversibilă.`}
          />
        </div>
      </div>

      <LessonsList
        lessons={module.lessons ?? []}
        moduleIndex={moduleIndex}
        moduleId={module.id}
        courseId={courseId}
      />
    </div>
  );
}

// --- DraggableCourseContent (main export) ---

export function DraggableCourseContent({
  initialModules,
  courseId,
}: {
  initialModules: Module[];
  courseId: string;
}) {
  const [modules, setModules] = useState(initialModules);
  const [, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = modules.findIndex((m) => m.id === active.id);
    const newIndex = modules.findIndex((m) => m.id === over.id);
    const newModules = arrayMove(modules, oldIndex, newIndex);
    setModules(newModules);

    startTransition(() => {
      reorderModules(courseId, newModules.map((m) => m.id));
    });
  }

  if (modules.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border">
        <p className="text-gray-500 mb-4">Niciun modul. Adaugă primul modul.</p>
        <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700">
          <Link href={`/admin/courses/${courseId}/modules`}>Adaugă modul</Link>
        </Button>
      </div>
    );
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={modules.map((m) => m.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {modules.map((module, mIdx) => (
            <SortableModule
              key={module.id}
              module={module}
              moduleIndex={mIdx}
              courseId={courseId}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
