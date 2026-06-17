import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Shield, Star, LayoutDashboard, GraduationCap, Zap, CheckCircle } from "lucide-react";
import { AcademiaGuide } from "@/components/common/academia-guide";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StatsCounter } from "@/components/home/stats-counter";
import { createClient } from "@/lib/supabase/server";
import { getDemoCourses } from "@/lib/db/courses";
import { getHomepageStats } from "@/lib/db/homepage-stats";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Academia Politica AUR — Platformă de formare politică",
  description:
    "Platformă de formare politică și educație civică a Alianței pentru Unirea Românilor. Cursuri pentru membri, formatori și lectori.",
};

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const [demoCourses, stats] = await Promise.all([
    getDemoCourses().catch(() => []),
    getHomepageStats().catch(() => ({ usersCount: 0, lessonsCompleted: 0, certificatesIssued: 0 })),
  ]);

  let parentName: string | undefined;
  let accountType: string | null = null;
  let profileId: string | null = null;
  if (user) {
    const { data } = await supabase
      .from("parent_profiles")
      .select("full_name, account_type")
      .eq("user_id", user.id)
      .single();
    parentName = data?.full_name;
    accountType = data?.account_type ?? (user.user_metadata?.account_type as string | null) ?? null;

    if (accountType === "member") {
      const { data: childData } = await supabase
        .from("child_profiles")
        .select("id")
        .eq("parent_id", user.id)
        .order("created_at")
        .limit(1)
        .single();
      profileId = childData?.id ?? null;
    }
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
  const isAdmin = !!(user && (adminEmails.includes(user.email || "") || user.app_metadata?.role === "admin"));

  return (
    <>
      <Header user={user} parentName={parentName} isAdmin={isAdmin} accountType={accountType} />
      <main className="flex-1">

        {/* Banner principal */}
        <section className="w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/academiapoliticaaur.png"
            alt="Academia Politica AUR — Cunoastem. Intelegem. Actionam pentru Romania!"
            className="w-full h-auto"
          />
        </section>

        {/* Hero instituțional */}
        <section className="py-16 px-4 bg-white border-b">
          <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">

              {/* Stânga — text */}
              <div className="text-center md:text-left">
                <div className="flex justify-center md:justify-start mb-6">
                  <Image
                    src="/logo_academia_politica_titu_maiorescu_transparent.png"
                    alt="Academia Politică Titu Maiorescu"
                    width={180}
                    height={180}
                    style={{ width: 180, height: "auto" }}
                    className="drop-shadow-md"
                  />
                </div>

                <p className="text-lg font-black tracking-[0.2em] text-[#1a2b5e] uppercase mb-1">
                  Titu Maiorescu
                </p>
                <div className="w-16 h-0.5 bg-yellow-500 mb-6" />

                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-snug mb-6">
                  Ești pasionat de politică, administrație publică, legislație,
                  relații internaționale, politică externă sau securitate?
                </h1>

                <p className="text-gray-500 leading-relaxed mb-8">
                  Academia Politică din cadrul Institutului Conservator „Mihai Eminescu" reîncepe
                  modulele de formare, dedicate celor care își doresc să se pregătească pentru o
                  carieră în domeniul public ori să se implice activ în viața comunității și în
                  procesul democratic.
                </p>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-white gap-2" asChild>
                    <Link href="/courses">
                      <BookOpen size={20} />
                      Explorează cursurile
                    </Link>
                  </Button>
                  {!user && (
                    <Button size="lg" variant="outline" className="border-gray-300 text-gray-700" asChild>
                      <Link href="/register">Înscrie-te gratuit</Link>
                    </Button>
                  )}
                  {user && accountType === "member" && profileId && (
                    <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-white gap-2" asChild>
                      <Link href={`/cursant/${profileId}`}>
                        <GraduationCap size={20} />
                        Zona mea de cursuri
                      </Link>
                    </Button>
                  )}
                  {user && (accountType === "formator" || accountType === "lector") && (
                    <Button size="lg" className="bg-indigo-500 hover:bg-indigo-600 text-white gap-2" asChild>
                      <Link href="/dashboard/grupuri">
                        <Users size={20} />
                        Grupurile mele
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* Dreapta — imagine verticală */}
              <div className="flex justify-center">
                <Image
                  src="/academiapoliticavertical.png"
                  alt="Academia Politica AUR"
                  width={420}
                  height={560}
                  style={{ width: "100%", maxWidth: 420, height: "auto" }}
                  className="drop-shadow-xl"
                />
              </div>

            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-6 px-4 bg-white border-b">
          <div className="container mx-auto max-w-3xl">
            <p className="text-center text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">Impactul nostru</p>
            <StatsCounter
              usersCount={stats.usersCount}
              lessonsCompleted={stats.lessonsCompleted}
              certificatesIssued={stats.certificatesIssued}
            />
          </div>
        </section>

        {/* Ce oferă */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Ce oferă platforma?</h2>
            <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
              Cursuri structurate, lecții video, prezentări și materiale de studiu —
              adaptate pentru fiecare tip de utilizator.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: "🎬", title: "Lecții video", desc: "Materiale video clare și bine structurate" },
                { icon: "📋", title: "Prezentări", desc: "Slide-uri și documente interactive" },
                { icon: "📝", title: "Materiale", desc: "Fișe și documente descărcabile" },
                { icon: "🎯", title: "Quiz-uri", desc: "Teste cu feedback și certificare" },
              ].map((f) => (
                <Card key={f.title} className="text-center p-6 hover:shadow-lg hover:border-yellow-300 transition-all h-full">
                  <CardContent className="p-0">
                    <div className="text-4xl mb-3">{f.icon}</div>
                    <h3 className="font-semibold mb-1">{f.title}</h3>
                    <p className="text-sm text-gray-500">{f.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Cursuri demo */}
        {demoCourses.length > 0 && (
          <section className="py-16 px-4 bg-amber-50 border-y border-amber-100">
            <div className="container mx-auto max-w-4xl">
              <p className="text-xs font-bold tracking-widest text-amber-600 uppercase mb-2 text-center">Cursuri demonstrative</p>
              <h2 className="text-2xl font-bold text-center mb-8">Încearcă gratuit, fără cont</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {demoCourses.map((course) => {
                  const firstLesson = course.modules?.[0]?.lessons?.[0];
                  return (
                    <Card key={course.id} className="border-2 border-amber-200 hover:border-amber-400 transition-colors">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-2xl">🎁</span>
                          <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-3 py-1 rounded-full">Gratuit, fără cont</span>
                        </div>
                        <h3 className="text-xl font-bold text-amber-700 mb-2 leading-snug">{course.title}</h3>
                        {course.description && (
                          <p className="text-gray-600 mb-5 line-clamp-2">{course.description}</p>
                        )}
                        {firstLesson ? (
                          <Button className="bg-amber-500 hover:bg-amber-600 text-white w-full" asChild>
                            <Link href={`/demo/${course.slug}/lesson/${firstLesson.id}`}>
                              Explorează cursul demo
                            </Link>
                          </Button>
                        ) : (
                          <Button variant="outline" className="w-full" asChild>
                            <Link href={`/courses/${course.slug}`}>Vezi cursul</Link>
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Tipuri de conturi */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Pentru cine este Academia?</h2>
            <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
              Trei tipuri de conturi, fiecare cu acces adaptat nevoilor sale.
            </p>
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="border-2 border-yellow-200 hover:border-yellow-400 transition-colors">
                <CardContent className="p-8">
                  <div className="text-5xl mb-4">🇷🇴</div>
                  <h3 className="text-xl font-bold text-yellow-700 mb-2">Membru / Simpatizant</h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    Acces imediat la toate cursurile platformei. Cont aprobat automat, fără așteptare.
                  </p>
                  <ul className="space-y-2 mb-6">
                    {["Cursuri complete", "Quiz-uri și certificate", "Progres urmărit", "Acces instant"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle size={14} className="text-yellow-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-white w-full" asChild>
                    <Link href="/register">Înscrie-te gratuit</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-indigo-200 hover:border-indigo-400 transition-colors">
                <CardContent className="p-8">
                  <div className="text-5xl mb-4">🎓</div>
                  <h3 className="text-xl font-bold text-indigo-700 mb-2">Formator</h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    Creează grupuri de formare, asignează cursuri și urmărește progresul participanților.
                  </p>
                  <ul className="space-y-2 mb-6">
                    {["Grupuri proprii", "Acces cursuri formatori", "Rapoarte progres", "Aprobare admin"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle size={14} className="text-indigo-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="bg-indigo-500 hover:bg-indigo-600 text-white w-full" asChild>
                    <Link href="/pentru-formatori">Află mai mult</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
                <CardContent className="p-8">
                  <div className="text-5xl mb-4">📚</div>
                  <h3 className="text-xl font-bold text-purple-700 mb-2">Lector</h3>
                  <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                    Conferențiar sau expert — publică conținut, coordonează formatori și lectori.
                  </p>
                  <ul className="space-y-2 mb-6">
                    {["Cursuri avansate", "Webinare", "Acces extins", "Aprobare admin"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                        <CheckCircle size={14} className="text-purple-500 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button className="bg-purple-500 hover:bg-purple-600 text-white w-full" asChild>
                    <Link href="/pentru-formatori">Află mai mult</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Sistem grupuri */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-sm font-semibold px-3 py-1.5 rounded-full mb-4">
                  <Zap size={14} />
                  Sistem grupuri de formare
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">Grupuri virtuale în câteva minute</h2>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Formatorii pot crea grupuri de formare, adăuga participanți și asigna cursuri.
                  Membrii accesează conținutul prin codul grupului — <strong>fără cont necesar</strong>.
                </p>
                <ul className="space-y-3">
                  {[
                    "Cod grup unic ales de formator",
                    "Participanți adăugați cu nume și cod personal",
                    "Cursuri asignate din catalogul platformei",
                    "Acces prin /grup → cod → nume → cursuri",
                    "XP, quiz-uri și diplomă funcționează identic",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-sm text-gray-700">
                      <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-emerald-50 rounded-2xl border border-emerald-200 p-8">
                <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-4">Flux de acces participant</p>
                <div className="space-y-3">
                  {[
                    { step: "1", text: "Accesează academia-aur.ro/grup" },
                    { step: "2", text: "Introduce codul grupului (ex: Cluj2026)" },
                    { step: "3", text: "Selectează numele din lista grupului" },
                    { step: "4", text: "Accesează cursurile asignate și finalizează lecțiile" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-emerald-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                        {item.step}
                      </span>
                      <p className="text-sm text-gray-700">{item.text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white" asChild>
                    <Link href="/grup">Intră în grup →</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Valori platformă */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-6">Construită pe valori solide</h2>
                <ul className="space-y-4">
                  {[
                    { icon: <Shield size={20} />, text: "Date personale protejate conform GDPR — fără tracking, fără reclame" },
                    { icon: <Users size={20} />, text: "Comunitate de formatori și lectori verificați de administrație" },
                    { icon: <Star size={20} />, text: "Conținut creat și validat de experți înainte de publicare" },
                    { icon: <BookOpen size={20} />, text: "Certificare la absolvire — recunoscută în structurile AUR" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <span className="text-yellow-600 mt-0.5 flex-shrink-0">{item.icon}</span>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-4">
                <AcademiaGuide
                  variant="tip"
                  message="Platforma Academia Politica AUR este construită pentru a forma cetățeni activi și lideri politici responsabili."
                />
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-white w-full" asChild>
                  <Link href="/register">Începe formarea politică</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />

      {isAdmin && (
        <div className="fixed bottom-6 left-6 z-40">
          <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg gap-2">
            <Link href="/admin">
              <LayoutDashboard size={16} />
              Dashboard Admin
            </Link>
          </Button>
        </div>
      )}
    </>
  );
}
