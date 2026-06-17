import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Users, Star, Shield, LayoutDashboard } from "lucide-react";
import { AmiMotiGuide } from "@/components/common/ami-moti-guide";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { StatsCounter } from "@/components/home/stats-counter";
import { createClient } from "@/lib/supabase/server";
import { getDemoCourses } from "@/lib/db/courses";
import { getHomepageStats } from "@/lib/db/homepage-stats";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ami & Moti — Platformă educațională pentru copii",
  description:
    "O platformă educațională prietenoasă pentru copiii din clasele 0–8. Cursuri, lecții, filme și activități interactive cu Ami și Moti.",
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
  let children: { id: string; display_name: string; age_group: string }[] = [];
  if (user) {
    const { data } = await supabase
      .from("parent_profiles")
      .select("full_name, account_type")
      .eq("user_id", user.id)
      .single();
    parentName = data?.full_name;
    accountType = data?.account_type ?? (user.user_metadata?.account_type as string | null) ?? null;

    const { data: childData } = await supabase
      .from("child_profiles")
      .select("id, display_name, age_group")
      .eq("parent_id", user.id)
      .order("created_at");
    children = childData ?? [];
  }

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map((e) => e.trim()).filter(Boolean);
  const isAdmin = !!(user && (adminEmails.includes(user.email || "") || user.app_metadata?.role === "admin"));

  return (
    <>
      <Header user={user} parentName={parentName} isAdmin={isAdmin} accountType={accountType} />
      <main className="flex-1">

        {/* Banner principal */}
        <section className="w-full">
          <Image
            src="/banner-ami-moti.png"
            alt="Ami și Moti se pregătesc pentru viața"
            width={1920}
            height={768}
            className="w-full h-auto"
            priority
          />
        </section>

        {/* Hero */}
        <section className="bg-gradient-to-br from-blue-50 via-sky-50 to-teal-50 py-20 px-4">
          <div className="container mx-auto max-w-5xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-medium px-3 py-1.5 rounded-full mb-6">
                  <Star size={14} className="fill-blue-500 text-blue-500" />
                  Platformă educațională pentru clasele 0–8
                </div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight mb-6 text-gray-900">
                  <span className="text-blue-500">Ami</span>
                  <span className="text-gray-400"> și </span>
                  <span className="text-teal-500">Moti</span>
                  <br />
                  <span className="text-gray-800">se pregătesc pentru viață</span>
                </h1>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Cursuri interactive, lecții vesele și activități creative — toate create cu grijă
                  pentru copiii curioși. Părinții controlează accesul, copiii descoperă lumea.
                </p>
                <div className="flex flex-col sm:flex-row flex-wrap gap-4">
                  <Button size="lg" className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2" asChild>
                    <Link href="/courses">
                      <BookOpen size={20} />
                      Vezi cursurile
                    </Link>
                  </Button>
                  {!user && (
                    <Button size="lg" variant="outline" asChild>
                      <Link href="/register">Creează cont părinte</Link>
                    </Button>
                  )}
                </div>

                {/* Copii înregistrați — vizibil doar părinților autentificați */}
                {user && children.length > 0 && (
                  <div className="mt-6">
                    <p className="text-sm font-semibold text-gray-500 mb-3">Intră direct în zona copilului:</p>
                    <div className="flex flex-wrap gap-2">
                      {children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/child/${child.id}`}
                          className="flex items-center gap-2 px-4 py-2 rounded-full border-2 border-blue-200 bg-white hover:bg-blue-50 hover:border-blue-400 transition-all text-sm font-semibold text-blue-700"
                        >
                          <span>{child.age_group === "0-4" ? "🌈" : "🚀"}</span>
                          {child.display_name}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-4">
                <Image
                  src="/ami-moti-hero.png"
                  alt="Ami și Moti"
                  width={420}
                  height={420}
                  className="w-full max-w-sm drop-shadow-xl"
                  priority
                />
                <AmiMotiGuide
                  variant="ami"
                  message="Bună! Eu sunt Ami și împreună cu Moti te voi ajuta să descoperi lucruri noi și interesante!"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Palmares / Impact counters */}
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

        {/* Features */}
        <section id="despre" className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4">Ce oferă platforma?</h2>
            <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
              Totul la un loc — cursuri structurate, lecții video, prezentări și materiale de lucru,
              adaptate pentru fiecare grupă de vârstă.
            </p>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { icon: "🎬", title: "Lecții video", desc: "Filme educaționale clare și atractive", href: "/courses?type=video" },
                { icon: "📋", title: "Prezentări", desc: "Slide-uri interactive și colorate", href: "/courses?type=presentation" },
                { icon: "📝", title: "Activități", desc: "Fișe de lucru descărcabile", href: "/courses?type=worksheet" },
                { icon: "🎯", title: "Quiz-uri", desc: "Teste prietenoase cu feedback pozitiv", href: "/courses?type=quiz" },
              ].map((f) => (
                <Link key={f.title} href={f.href}>
                  <Card className="text-center p-6 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer group h-full">
                    <CardContent className="p-0">
                      <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{f.icon}</div>
                      <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors">{f.title}</h3>
                      <p className="text-sm text-gray-500">{f.desc}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Age groups */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto max-w-5xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">Pentru toți — elevi și educatori</h2>

            {/* Cursuri demonstrative — vizibile tuturor */}
            {demoCourses.length > 0 && (
              <div className="mb-10">
                <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">Cursuri demonstrative</p>
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
            )}

            {/* Elevi */}
            <div className="mb-10">
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">Elevi</p>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 border-teal-200 hover:border-teal-400 transition-colors">
                  <CardContent className="p-8">
                    <div className="text-5xl mb-4">🌱</div>
                    <h3 className="text-2xl font-bold text-teal-700 mb-2">Clasele 0–4</h3>
                    <p className="text-gray-600 mb-4">
                      Lecții colorate, carduri mari și limbaj simplu. Povești prietenoase despre AI.
                    </p>
                    <Button className="bg-teal-500 hover:bg-teal-600 text-white" asChild>
                      <Link href="/courses?group=0-4">Explorează cursurile</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-indigo-200 hover:border-indigo-400 transition-colors">
                  <CardContent className="p-8">
                    <div className="text-5xl mb-4">🔬</div>
                    <h3 className="text-2xl font-bold text-indigo-700 mb-2">Clasele 5–8</h3>
                    <p className="text-gray-600 mb-4">
                      Structură clară, gamificare și gândire critică. Creativitate și explorare.
                    </p>
                    <Button className="bg-indigo-500 hover:bg-indigo-600 text-white" asChild>
                      <Link href="/courses?group=5-8">Explorează cursurile</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Profesori */}
            <div>
              <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-4">Profesori</p>
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-2 border-emerald-200 hover:border-emerald-400 transition-colors">
                  <CardContent className="p-8">
                    <div className="text-5xl mb-4">🍎</div>
                    <h3 className="text-2xl font-bold text-emerald-700 mb-2">Învățător (cl. 0–4)</h3>
                    <p className="text-gray-600 mb-4">
                      Cursuri dedicate învățătorilor + acces la cursurile elevilor din clasele 0–4.
                    </p>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-white" asChild>
                      <Link href="/cadre-didactice">Explorează cursurile</Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-purple-200 hover:border-purple-400 transition-colors">
                  <CardContent className="p-8">
                    <div className="text-5xl mb-4">🎓</div>
                    <h3 className="text-2xl font-bold text-purple-700 mb-2">Profesor Gimnaziu</h3>
                    <p className="text-gray-600 mb-4">
                      Cursuri pentru profesorii cls. 5–8 + acces la cursurile elevilor de gimnaziu.
                    </p>
                    <Button className="bg-purple-500 hover:bg-purple-600 text-white" asChild>
                      <Link href="/cadre-didactice">Explorează cursurile</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>

          </div>
        </section>

        {/* For parents */}
        <section className="py-16 px-4 bg-white">
          <div className="container mx-auto max-w-4xl">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-6">Concepută cu siguranța copiilor în minte</h2>
                <ul className="space-y-4">
                  {[
                    { icon: <Shield size={20} />, text: "Contul copilului este creat și administrat de părinte" },
                    { icon: <Users size={20} />, text: "Nu colectăm email-uri de la copii" },
                    { icon: <Star size={20} />, text: "Fără reclame, fără conținut nesolicitat" },
                    { icon: <BookOpen size={20} />, text: "Conținut AI validat de educatori înainte de publicare" },
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-700">
                      <span className="text-blue-500 mt-0.5 flex-shrink-0">{item.icon}</span>
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-col gap-4">
                <AmiMotiGuide
                  variant="moti"
                  message="Eu, Moti, am verificat că platforma este sigură! Părinții controlează totul, iar copiii se pot concentra pe învățat."
                />
                <Button size="lg" className="bg-blue-100 hover:bg-blue-200 text-blue-700 w-full" asChild>
                  <Link href="/register">Creează cont de părinte gratuit</Link>
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
