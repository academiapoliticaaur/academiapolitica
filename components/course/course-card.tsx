import Link from "next/link";
import Image from "next/image";
import { Clock, BookOpen } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Course } from "@/types";

interface CourseCardProps {
  course: Course;
  showProgress?: boolean;
  progressPercentage?: number;
  href?: string;
}

export function CourseCard({ course, progressPercentage, href }: CourseCardProps) {
  const ageLabel = course.age_group === "0-4" ? "Clasele 0–4" : "Clasele 5–8";
  const ageBg = course.age_group === "0-4"
    ? "bg-teal-100 text-teal-700"
    : "bg-indigo-100 text-indigo-700";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group h-full flex flex-col">
      <div className="relative h-44 bg-gradient-to-br from-blue-100 to-sky-50 overflow-hidden">
        {course.cover_image ? (
          <Image
            src={course.cover_image}
            alt={course.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 bg-white p-[10%]">
            <div className="relative w-full h-full overflow-hidden rounded-lg">
              <Image src="/Hello.png" alt="" fill className="object-cover" />
            </div>
          </div>
        )}
        <div className="absolute top-3 left-3">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ageBg}`}>
            {ageLabel}
          </span>
        </div>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-blue-500 transition-colors">
          {course.title}
        </h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">
          {course.description}
        </p>

        <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-3">
          {course.estimated_duration && (
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {course.estimated_duration} min
            </span>
          )}
          <span className="flex items-center gap-1">
            <BookOpen size={12} />
            Curs complet
          </span>
        </div>

        {progressPercentage !== undefined && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Progres</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0">
        <Button
          className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700"
          asChild
        >
          <Link href={href ?? `/courses/${course.slug}`}>
            {progressPercentage && progressPercentage > 0 ? "Continuă cursul" : "Descoperă cursul"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
