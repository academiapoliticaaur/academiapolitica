"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Edit, ArrowUpAZ, ArrowDownAZ, X } from "lucide-react";
import { DeleteButton } from "@/components/admin/delete-button";
import { StatusToggleBadge } from "@/components/admin/publish-buttons";
import { deleteCourse } from "@/lib/actions/admin-delete";

export type CourseRow = {
  id: string;
  title: string;
  slug: string;
  age_group: string;
  audience: string | null;
  status: string;
  is_demo?: boolean;
};

interface AdminCoursesTableProps {
  courses: CourseRow[];
}

export function AdminCoursesTable({ courses }: AdminCoursesTableProps) {
  const [titleQ, setTitleQ] = useState("");
  const [audienceQ, setAudienceQ] = useState("");
  const [statusQ, setStatusQ] = useState("");
  const [sort, setSort] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    return courses
      .filter((c) => !titleQ || c.title.toLowerCase().includes(titleQ.toLowerCase()))
      .filter((c) => !audienceQ || (c.audience ?? "member") === audienceQ)
      .filter((c) => !statusQ || c.status === statusQ)
      .sort((a, b) =>
        sort === "asc"
          ? a.title.localeCompare(b.title, "ro")
          : b.title.localeCompare(a.title, "ro")
      );
  }, [courses, titleQ, audienceQ, statusQ, sort]);

  const hasFilter = titleQ || audienceQ || statusQ;

  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b">
          {/* Rând etichete + sortare */}
          <tr>
            <th className="px-4 pt-3 pb-1 text-left font-semibold text-gray-600 w-[52%]">
              <button
                onClick={() => setSort((s) => (s === "asc" ? "desc" : "asc"))}
                className="inline-flex items-center gap-1.5 hover:text-blue-600 transition-colors"
              >
                Titlu
                {sort === "asc"
                  ? <ArrowUpAZ size={14} className="text-blue-500" />
                  : <ArrowDownAZ size={14} className="text-blue-500" />
                }
              </button>
            </th>
            <th className="px-4 pt-3 pb-1 text-left font-semibold text-gray-600 w-[16%]">Audiență</th>
            <th className="px-4 pt-3 pb-1 text-left font-semibold text-gray-600 w-[16%]">Status</th>
            <th className="px-4 pt-3 pb-1 text-left font-semibold text-gray-600">Acțiuni</th>
          </tr>
          {/* Rând filtre */}
          <tr className="border-t border-gray-100">
            <td className="px-4 py-2">
              <div className="relative">
                <input
                  type="text"
                  value={titleQ}
                  onChange={(e) => setTitleQ(e.target.value)}
                  placeholder="Caută după titlu..."
                  className="w-full pr-7 pl-2.5 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                {titleQ && (
                  <button
                    onClick={() => setTitleQ("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>
            </td>
            <td className="px-4 py-2">
              <select
                value={audienceQ}
                onChange={(e) => setAudienceQ(e.target.value)}
                className="w-full py-1.5 px-2 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              >
                <option value="">Toate</option>
                <option value="member">Membri</option>
                <option value="formator">Formatori</option>
                <option value="lector">Lectori</option>
                <option value="all">Toți</option>
              </select>
            </td>
            <td className="px-4 py-2">
              <select
                value={statusQ}
                onChange={(e) => setStatusQ(e.target.value)}
                className="w-full py-1.5 px-2 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
              >
                <option value="">Toate</option>
                <option value="published">Publicat</option>
                <option value="draft">Draft</option>
              </select>
            </td>
            <td className="px-4 py-2">
              {hasFilter && (
                <button
                  onClick={() => { setTitleQ(""); setAudienceQ(""); setStatusQ(""); }}
                  className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition-colors"
                >
                  <X size={11} />
                  Resetează
                </button>
              )}
            </td>
          </tr>
        </thead>
        <tbody className="divide-y">
          {filtered.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-gray-400 text-sm">
                Niciun curs găsit pentru filtrele selectate.
              </td>
            </tr>
          ) : (
            filtered.map((course) => (
              <tr key={course.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{course.title}</p>
                    {course.is_demo && (
                      <span className="shrink-0 text-[10px] font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Demo</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400">/courses/{course.slug}</p>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    course.audience === "formator" ? "bg-blue-100 text-blue-700"
                    : course.audience === "lector" ? "bg-purple-100 text-purple-700"
                    : "bg-green-100 text-green-700"
                  }`}>
                    {course.audience === "formator" ? "Formatori"
                     : course.audience === "lector" ? "Lectori"
                     : "Membri"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusToggleBadge courseId={course.id} currentStatus={course.status} />
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Button size="sm" asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-1">
                      <Link href={`/admin/courses/${course.id}`}>
                        <Edit size={14} />
                        Editează
                      </Link>
                    </Button>
                    <DeleteButton
                      action={deleteCourse.bind(null, course.id)}
                      confirmMessage={`Ștergi cursul "${course.title}"? Se vor șterge toate modulele și lecțiile. Această acțiune este ireversibilă.`}
                    />
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      {filtered.length > 0 && (
        <div className="px-4 py-2 border-t bg-gray-50 text-xs text-gray-400">
          {filtered.length} {filtered.length === 1 ? "curs" : "cursuri"}
          {hasFilter && ` din ${courses.length} total`}
        </div>
      )}
    </div>
  );
}
