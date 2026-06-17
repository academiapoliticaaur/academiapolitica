import Link from "next/link";
import Image from "next/image";
import { Layers } from "lucide-react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import type { Course } from "@/types";

interface SeriesCardProps {
  seriesTitle: string;
  parts: Course[];
}

export function SeriesCard({ seriesTitle, parts }: SeriesCardProps) {
  const first = parts[0];
  const ageLabel = first.age_group === "0-4" ? "Clasele 0–4" : "Clasele 5–8";
  const ageBg = first.age_group === "0-4"
    ? "bg-teal-100 text-teal-700"
    : "bg-indigo-100 text-indigo-700";

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group h-full flex flex-col">
      {/* Imagine din prima parte */}
      <div className="relative h-44 bg-gradient-to-br from-blue-100 to-sky-50 overflow-hidden">
        {first.cover_image ? (
          <Image
            src={first.cover_image}
            alt={seriesTitle}
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
        <div className="absolute top-3 left-3 flex items-center gap-1.5">
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${ageBg}`}>
            {ageLabel}
          </span>
          <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 text-purple-700 flex items-center gap-1">
            <Layers size={10} />
            {parts.length} părți
          </span>
        </div>
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-bold text-lg leading-tight mb-1 group-hover:text-blue-500 transition-colors">
          {seriesTitle}
        </h3>
        {first.description && (
          <p className="text-sm text-gray-500 line-clamp-2 mb-3">{first.description}</p>
        )}

        {/* Lista de părți */}
        <div className="mt-auto pt-3 flex flex-col gap-1">
          {parts.map((part, i) => (
            <Link
              key={part.id}
              href={`/courses/${part.slug}`}
              className="flex items-center justify-between text-sm px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-blue-50 hover:text-blue-700 transition-colors group/part"
            >
              <span className="font-medium">Partea {i + 1}</span>
              <span className="text-xs text-gray-400 group-hover/part:text-blue-500">→</span>
            </Link>
          ))}
        </div>
      </CardContent>

      <CardFooter className="px-4 pb-4 pt-0">
        <Link
          href={`/courses/${first.slug}`}
          className="w-full text-center py-2 px-4 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-medium transition-colors"
        >
          Începe de la Partea 1
        </Link>
      </CardFooter>
    </Card>
  );
}
