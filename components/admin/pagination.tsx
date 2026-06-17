import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
  extraParams?: Record<string, string>;
}

export function Pagination({ page, totalPages, basePath, extraParams = {} }: PaginationProps) {
  if (totalPages <= 1) return null;

  function buildHref(p: number) {
    const params = new URLSearchParams({ ...extraParams, page: String(p) });
    return `${basePath}?${params.toString()}`;
  }

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2
  );

  return (
    <div className="flex items-center justify-center gap-1 mt-4">
      <Link
        href={buildHref(page - 1)}
        aria-disabled={page <= 1}
        className={`p-2 rounded-lg transition-colors ${page <= 1 ? "pointer-events-none text-gray-300" : "text-gray-500 hover:bg-gray-100"}`}
      >
        <ChevronLeft size={16} />
      </Link>

      {pages.map((p, idx) => {
        const prev = pages[idx - 1];
        return (
          <span key={p} className="flex items-center gap-1">
            {prev && p - prev > 1 && <span className="px-1 text-gray-400 text-sm">…</span>}
            <Link
              href={buildHref(p)}
              className={`min-w-[32px] h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? "bg-indigo-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p}
            </Link>
          </span>
        );
      })}

      <Link
        href={buildHref(page + 1)}
        aria-disabled={page >= totalPages}
        className={`p-2 rounded-lg transition-colors ${page >= totalPages ? "pointer-events-none text-gray-300" : "text-gray-500 hover:bg-gray-100"}`}
      >
        <ChevronRight size={16} />
      </Link>
    </div>
  );
}
