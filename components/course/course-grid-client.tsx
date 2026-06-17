"use client";

import { useState, useMemo } from "react";
import { Search, X } from "lucide-react";
import { CourseCard } from "@/components/course/course-card";
import { SeriesCard } from "@/components/course/series-card";
import { groupCourses, filterCourses } from "@/lib/utils/course-groups";
import type { Course } from "@/types";

interface CourseGridClientProps {
  courses: Course[];
  initialSearch?: string;
  titleIndex?: Record<string, string[]>;
}

export function CourseGridClient({ courses, initialSearch = "", titleIndex = {} }: CourseGridClientProps) {
  const [query, setQuery] = useState(initialSearch);

  const { groups, contentMatchIds } = useMemo(() => {
    const { filtered, contentMatchIds } = filterCourses(courses, query, titleIndex);
    return { groups: groupCourses<Course>(filtered), contentMatchIds };
  }, [courses, query, titleIndex]);

  return (
    <div>
      {/* Bara de căutare */}
      <div className="relative mb-6">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Caută cursuri, module sau lecții..."
          autoComplete="off"
          className="w-full pl-9 pr-10 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition shadow-sm"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            title="Șterge căutarea"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Rezultate */}
      {groups.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-6xl mb-4">🔍</div>
          <p className="text-gray-500 text-lg">
            Niciun curs găsit pentru <strong>„{query}"</strong>
          </p>
          <button
            onClick={() => setQuery("")}
            className="mt-3 text-blue-500 text-sm hover:underline"
          >
            Șterge filtrul
          </button>
        </div>
      ) : (
        <>
          {query && (
            <p className="text-xs text-gray-400 mb-4">
              {groups.length} {groups.length === 1 ? "rezultat" : "rezultate"} pentru{" "}
              <strong>„{query}"</strong>
            </p>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group) => {
              const isContentMatch = query
                ? group.type === "single"
                  ? contentMatchIds.has(group.course.id)
                  : group.parts.some((p) => contentMatchIds.has(p.id))
                : false;

              return (
                <div
                  key={group.type === "single" ? group.course.id : group.seriesSlug}
                  className="flex flex-col gap-2"
                >
                  {group.type === "single" ? (
                    <CourseCard course={group.course} />
                  ) : (
                    <SeriesCard seriesTitle={group.seriesTitle} parts={group.parts} />
                  )}
                  {isContentMatch && (
                    <div className="flex justify-center">
                      <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2.5 py-0.5 rounded-full">
                        Potrivire în lecții
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
