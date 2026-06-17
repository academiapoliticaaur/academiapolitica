import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";
import { AcademiaGuide } from "@/components/common/academia-guide";
import { CalendarDays, Clock, User, ExternalLink } from "lucide-react";

export const metadata: Metadata = {
  title: "Webinarii — Academia Politica AUR",
  description: "Webinarii educaționale pentru copii și părinți.",
};

function DateBadge({ iso }: { iso: string }) {
  const d = new Date(iso);
  const day = d.toLocaleDateString("ro-RO", { day: "2-digit" });
  const month = d.toLocaleDateString("ro-RO", { month: "short" }).toUpperCase().replace(".", "");
  const year = d.getFullYear();
  const time = d.toLocaleTimeString("ro-RO", { hour: "2-digit", minute: "2-digit" });
  const isToday = new Date().toDateString() === d.toDateString();
  const isTomorrow =
    new Date(Date.now() + 86400000).toDateString() === d.toDateString();

  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-16 rounded-xl overflow-hidden border border-purple-200 text-center shadow-sm">
        <div className="bg-purple-600 text-white text-xs font-bold py-0.5">{month} {year}</div>
        <div className="bg-white py-1">
          <span className="text-2xl font-black text-gray-900 leading-none">{day}</span>
        </div>
      </div>
      <div className="flex flex-col gap-0.5 pt-1">
        {isToday && (
          <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full w-fit">
            AZI
          </span>
        )}
        {isTomorrow && (
          <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full w-fit">
            MÂINE
          </span>
        )}
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Clock size={13} className="text-gray-400" />
          {time}
        </div>
      </div>
    </div>
  );
}

export default async function WebinarsPage() {
  const supabase = await createClient();
  const { data: webinars } = await supabase
    .from("webinars")
    .select("id, title, description, youtube_id, presenter, audience, scheduled_at, registration_url")
    .eq("status", "published")
    .order("scheduled_at", { ascending: true, nullsFirst: false });

  const now = new Date();
  const upcoming = (webinars ?? []).filter(
    (w) => w.scheduled_at && new Date(w.scheduled_at) > now
  );
  const recordings = (webinars ?? []).filter(
    (w) => !w.scheduled_at || new Date(w.scheduled_at) <= now
  ).filter((w) => w.youtube_id);

  return (
    <div className="container mx-auto max-w-5xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold mb-3">Webinarii</h1>
        <p className="text-gray-500 text-lg">Sesiuni video educaționale pentru copii și părinți</p>
        <div className="mt-6 max-w-lg mx-auto">
          <AcademiaGuide
            variant="tip"
            message="Eu, Moti, te ghidez! Webinariile sunt sesiuni video cu experți — urmărește-le pentru a afla mai multe despre inteligența artificială și lumea digitală."
          />
        </div>
      </div>

      {!webinars?.length ? (
        <div className="text-center py-20 text-gray-400">
          <div className="text-5xl mb-4">🎥</div>
          <p className="text-lg">Webinariile vor fi disponibile în curând.</p>
        </div>
      ) : (
        <div className="space-y-12">

          {/* Webinarii viitoare */}
          {upcoming.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <CalendarDays size={20} className="text-purple-600" />
                <h2 className="text-xl font-bold text-gray-900">Webinarii viitoare</h2>
                <span className="ml-1 text-xs bg-purple-100 text-purple-700 font-semibold px-2 py-0.5 rounded-full">
                  {upcoming.length}
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {upcoming.map((w) => (
                  <div
                    key={w.id}
                    className="bg-white rounded-2xl border-2 border-purple-100 hover:border-purple-300 transition-colors p-5 flex flex-col gap-4"
                  >
                    <DateBadge iso={w.scheduled_at!} />

                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                          {w.audience === "children" ? "Copii" : w.audience === "adult" ? "Părinți" : "Toți"}
                        </span>
                        {w.presenter && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <User size={11} />
                            {w.presenter}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{w.title}</h3>
                      {w.description && (
                        <p className="text-sm text-gray-500 mt-1 leading-relaxed line-clamp-2">{w.description}</p>
                      )}
                    </div>

                    {w.registration_url ? (
                      <a
                        href={w.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors"
                      >
                        <ExternalLink size={15} />
                        Înregistrează-te gratuit
                      </a>
                    ) : (
                      <div className="text-center text-xs text-gray-400 py-2 border border-dashed border-gray-200 rounded-xl">
                        Înregistrarea va fi disponibilă în curând
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Înregistrări video */}
          {recordings.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-5">
                <span className="text-xl">🎥</span>
                <h2 className="text-xl font-bold text-gray-900">
                  {upcoming.length > 0 ? "Înregistrări anterioare" : "Webinarii disponibile"}
                </h2>
              </div>
              <div className="grid gap-8 md:grid-cols-2">
                {recordings.map((w) => (
                  <div key={w.id} className="bg-white rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="aspect-video bg-black">
                      <iframe
                        src={`https://www.youtube.com/embed/${w.youtube_id}`}
                        title={w.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                          {w.audience === "children" ? "Copii" : w.audience === "adult" ? "Părinți" : "Toți"}
                        </span>
                        {w.presenter && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <User size={11} />
                            {w.presenter}
                          </span>
                        )}
                        {w.scheduled_at && (
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <CalendarDays size={11} />
                            {new Date(w.scheduled_at).toLocaleDateString("ro-RO", { day: "numeric", month: "long", year: "numeric" })}
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{w.title}</h3>
                      {w.description && (
                        <p className="text-sm text-gray-500 leading-relaxed">{w.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}
