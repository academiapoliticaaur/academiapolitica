"use client";

import { useTransition } from "react";
import { Globe, FileEdit, Loader2, ChevronsUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setLessonStatus, setCourseStatus, publishAllLessons } from "@/lib/admin/actions";

export function PublishLessonButton({
  lessonId,
  courseId,
  currentStatus,
}: {
  lessonId: string;
  courseId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();
  const isPublished = currentStatus === "published";

  return (
    <Button
      size="sm"
      className={`gap-1 h-7 px-2 text-xs ${
        isPublished
          ? "bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300"
          : "bg-teal-500 hover:bg-teal-600 text-white"
      }`}
      disabled={isPending}
      onClick={() =>
        startTransition(() =>
          setLessonStatus(lessonId, courseId, isPublished ? "draft" : "published")
        )
      }
    >
      {isPending ? (
        <Loader2 size={12} className="animate-spin" />
      ) : isPublished ? (
        <FileEdit size={12} />
      ) : (
        <Globe size={12} />
      )}
      {isPublished ? "Draft" : "Publică"}
    </Button>
  );
}

export function PublishCourseButton({
  courseId,
  currentStatus,
}: {
  courseId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();
  const isPublished = currentStatus === "published";

  return (
    <Button
      className={`gap-2 ${
        isPublished
          ? "bg-amber-100 hover:bg-amber-200 text-amber-700 border border-amber-300"
          : "bg-teal-500 hover:bg-teal-600 text-white"
      }`}
      disabled={isPending}
      onClick={() =>
        startTransition(() =>
          setCourseStatus(courseId, isPublished ? "draft" : "published")
        )
      }
    >
      {isPending ? (
        <Loader2 size={16} className="animate-spin" />
      ) : isPublished ? (
        <FileEdit size={16} />
      ) : (
        <Globe size={16} />
      )}
      {isPending
        ? isPublished
          ? "Se trece în draft..."
          : "Se publică..."
        : isPublished
        ? "Trece în Draft"
        : "Publică cursul"}
    </Button>
  );
}

export function StatusToggleBadge({
  courseId,
  currentStatus,
}: {
  courseId: string;
  currentStatus: string;
}) {
  const [isPending, startTransition] = useTransition();
  const isPublished = currentStatus === "published";

  return (
    <button
      disabled={isPending}
      onClick={() =>
        startTransition(() =>
          setCourseStatus(courseId, isPublished ? "draft" : "published")
        )
      }
      title={isPublished ? "Click pentru a trece în Draft" : "Click pentru a publica"}
      className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium transition-all cursor-pointer disabled:opacity-60 hover:scale-105 active:scale-95 ${
        isPending
          ? "bg-gray-100 text-gray-500"
          : isPublished
          ? "bg-teal-100 text-teal-700 hover:bg-amber-100 hover:text-amber-700"
          : "bg-sky-100 text-sky-700 hover:bg-teal-100 hover:text-teal-700"
      }`}
    >
      {isPending ? (
        <Loader2 size={11} className="animate-spin" />
      ) : isPublished ? (
        <Globe size={11} />
      ) : (
        <FileEdit size={11} />
      )}
      {isPending ? "..." : isPublished ? "Publicat" : "Draft"}
    </button>
  );
}

export function PublishAllLessonsButton({ courseId }: { courseId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      size="sm"
      className="gap-1.5 bg-teal-100 hover:bg-teal-200 text-teal-700 border border-teal-300"
      disabled={isPending}
      onClick={() => startTransition(() => publishAllLessons(courseId))}
    >
      {isPending ? <Loader2 size={14} className="animate-spin" /> : <ChevronsUp size={14} />}
      {isPending ? "Se publică..." : "Publică toate lecțiile"}
    </Button>
  );
}
