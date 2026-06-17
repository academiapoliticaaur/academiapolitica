import Link from "next/link";
import { CheckCircle2, Clock, GraduationCap, BookOpen, Building2, Scale, Globe } from "lucide-react";
import { AcademiaGuide } from "@/components/common/academia-guide";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prețuri — Academia Politica AUR",
  description: "Module de formare politică și educație civică. 300 LEI per modul. Reducere 50% pentru studenți până în 27 de ani.",
};

const MODULES = [
  {
    id: "modul-i",
    number: "I",
    icon: BookOpen,
    title: "Formare Politică",
    price: 300,
    status: "available",
    color: "yellow",
    courses: [
      "Ideologii și familii doctrinare",
      "Organizarea și funcționarea statului",
      "Conduită și comunicare politică",
      "Istorie și geopolitică",
      "Doctrină conservatoare",
      "📂 Materiale auxiliare",
    ],
    slug: "modulul-i-formare-politica",
  },
  {
    id: "modul-ii",
    number: "II",
    icon: Building2,
    title: "Instituții și Administrație Publică",
    price: 300,
    status: "available",
    color: "blue",
    courses: [
      "Administrația publică din România. Noțiuni de bază",
      "Primarul și consiliul local. Rol, atribuții, responsabilități",
      "Finanțele publice locale. Buget. Taxe și impozite",
      "Achiziții publice. Noțiuni de bază",
      "Etică și integritate. Conflicte de interese. Anticorupție",
    ],
    slug: "modulul-ii-institutii-administratie-publica",
  },
  {
    id: "modul-iii",
    number: "III",
    icon: Scale,
    title: "Legislație și Activitate Parlamentară",
    price: 300,
    status: "coming-soon",
    color: "gray",
    courses: [
      "Procesul legislativ",
      "Activitatea parlamentară",
      "Inițiativa legislativă",
      "Controlul parlamentar",
      "Regulamentele parlamentare",
    ],
    slug: null,
  },
  {
    id: "modul-iv",
    number: "IV",
    icon: Globe,
    title: "Politică Externă, Securitate și Relații Internaționale",
    price: 300,
    status: "available",
    color: "indigo",
    courses: [
      "America și lumea",
      "Instituțiile de securitate în lumea contemporană",
      "Europa: securitate și politici",
      "Instituții și securitate națională",
      "Orientul Mijlociu: securitate și politică externă",
    ],
    slug: "modulul-iv-politica-externa-securitate-relatii-internationale",
  },
];

const colorMap: Record<string, { border: string; bg: string; badge: string; btn: string; icon: string; num: string }> = {
  yellow: {
    border: "border-yellow-300",
    bg: "bg-yellow-50",
    badge: "bg-yellow-100 text-yellow-800",
    btn: "bg-yellow-500 hover:bg-yellow-600 text-white",
    icon: "text-yellow-600",
    num: "bg-yellow-500 text-white",
  },
  blue: {
    border: "border-blue-300",
    bg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-800",
    btn: "bg-blue-600 hover:bg-blue-700 text-white",
    icon: "text-blue-600",
    num: "bg-blue-600 text-white",
  },
  gray: {
    border: "border-gray-200",
    bg: "bg-gray-50",
    badge: "bg-gray-100 text-gray-500",
    btn: "bg-gray-200 text-gray-400 cursor-not-allowed",
    icon: "text-gray-400",
    num: "bg-gray-300 text-gray-600",
  },
  indigo: {
    border: "border-indigo-300",
    bg: "bg-indigo-50",
    badge: "bg-indigo-100 text-indigo-800",
    btn: "bg-indigo-600 hover:bg-indigo-700 text-white",
    icon: "text-indigo-600",
    num: "bg-indigo-600 text-white",
  },
};

export default function PreturiPage() {
  return (
    <div className="bg-gradient-to-b from-yellow-50 via-white to-white min-h-screen">

      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 text-sm font-semibold px-4 py-2 rounded-full mb-6">
          <GraduationCap size={15} />
          Reducere 50% pentru studenți până în 27 de ani
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Module de formare politică
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-4">
          Fiecare modul poate fi achiziționat independent. Accesul este pe termen nelimitat
          după plată — fără abonament, fără surprize.
        </p>
        <div className="inline-flex items-center gap-2 bg-navy-900 text-gray-700 text-sm font-medium px-4 py-2 rounded-full border border-gray-200">
          <span className="font-bold text-yellow-700">300 LEI / modul</span>
          <span className="text-gray-400">·</span>
          <span>150 LEI pentru studenți</span>
        </div>
      </section>

      {/* Module cards */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {MODULES.map((mod) => {
            const c = colorMap[mod.color];
            const Icon = mod.icon;
            const isComingSoon = mod.status === "coming-soon";
            return (
              <div
                key={mod.id}
                className={`relative rounded-2xl border-2 p-7 flex flex-col bg-white ${c.border} ${isComingSoon ? "opacity-70" : ""}`}
              >
                {isComingSoon && (
                  <div className="absolute -top-3.5 left-6">
                    <span className="inline-flex items-center gap-1.5 bg-gray-500 text-white text-xs font-bold px-4 py-1.5 rounded-full">
                      <Clock size={11} />
                      Coming Soon
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4 mb-5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${c.bg} flex-shrink-0`}>
                    <Icon size={24} className={c.icon} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-black px-2.5 py-0.5 rounded-full ${c.num}`}>
                        MOD. {mod.number}
                      </span>
                      {!isComingSoon && (
                        <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                          Disponibil
                        </span>
                      )}
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 leading-tight">{mod.title}</h2>
                  </div>
                </div>

                {/* Preț */}
                <div className={`rounded-xl p-4 mb-5 ${c.bg}`}>
                  <div className="flex items-end gap-3">
                    <div>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-black text-gray-900">{mod.price}</span>
                        <span className="text-lg font-bold text-gray-500 mb-0.5">LEI</span>
                      </div>
                      <p className="text-xs text-gray-500">acces nelimitat</p>
                    </div>
                    <div className="border-l border-gray-300 pl-3 ml-1">
                      <div className="flex items-end gap-1">
                        <span className="text-2xl font-black text-green-700">{mod.price / 2}</span>
                        <span className="text-sm font-bold text-green-600 mb-0.5">LEI</span>
                      </div>
                      <p className="text-xs text-green-700 font-semibold">studenți ≤27 ani</p>
                    </div>
                  </div>
                </div>

                {/* Cursuri */}
                <ul className="flex flex-col gap-2 mb-6 flex-1">
                  {mod.courses.map((course) => (
                    <li key={course} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={15} className={`${c.icon} mt-0.5 shrink-0 ${isComingSoon ? "text-gray-400" : ""}`} />
                      {course}
                    </li>
                  ))}
                </ul>

                {isComingSoon ? (
                  <Button disabled className="w-full bg-gray-100 text-gray-400 cursor-not-allowed">
                    În pregătire
                  </Button>
                ) : (
                  <Button asChild className={`w-full font-semibold ${c.btn}`}>
                    <Link href="/register">Înscrie-te pentru acces</Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Bundle */}
        <div className="max-w-5xl mx-auto mt-8">
          <div className="bg-gradient-to-r from-yellow-900 via-gray-900 to-blue-900 rounded-2xl p-8 text-white text-center">
            <div className="text-3xl mb-3">🏛️</div>
            <h3 className="text-2xl font-black mb-2">Pachet complet — toate 4 modulele</h3>
            <p className="text-yellow-200 mb-4">Acces la întregul curriculum Academia Politica AUR</p>
            <div className="flex items-center justify-center gap-6 mb-6">
              <div>
                <div className="text-4xl font-black">900 <span className="text-2xl">LEI</span></div>
                <p className="text-xs text-gray-300">în loc de 1200 LEI</p>
              </div>
              <div className="border-l border-white/30 pl-6">
                <div className="text-3xl font-black text-green-400">450 <span className="text-xl">LEI</span></div>
                <p className="text-xs text-green-300">pentru studenți ≤27 ani</p>
              </div>
            </div>
            <Button asChild className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold px-8">
              <Link href="/register">Înscrie-te pentru pachetul complet</Link>
            </Button>
          </div>
        </div>

        {/* Ghid */}
        <div className="max-w-2xl mx-auto mt-10">
          <AcademiaGuide
            variant="info"
            message="Plata se face după înregistrarea contului. Contactează echipa Academia Politica AUR pentru confirmare și activarea accesului la modulul ales."
          />
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 pb-20 max-w-2xl">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Întrebări frecvente</h2>
        <div className="space-y-4">
          {[
            {
              q: "Cum dovedesc că sunt student pentru reducere?",
              a: "La înregistrare sau prin email către echipa Academia Politica AUR, trimiți o copie a carnetului de student sau a legitimației valabile.",
            },
            {
              q: "Pot achiziționa modulele separat?",
              a: "Da, fiecare modul se poate achiziționa independent. Accesul este pe termen nelimitat după plată.",
            },
            {
              q: "Cum plătesc?",
              a: "Activarea accesului se face manual de echipa Academia Politica AUR după confirmarea plății. Contactează-ne prin pagina de ajutor.",
            },
            {
              q: "Modulul III (Legislație) când va fi disponibil?",
              a: "Modulul III este în curs de pregătire. Te poți înregistra acum și vei fi notificat când devine disponibil.",
            },
            {
              q: "Există certificat la absolvire?",
              a: "Da, la finalizarea fiecărui modul primești un certificat digital descărcabil și printabil, emis de Academia Politica AUR.",
            },
          ].map((item) => (
            <div key={item.q} className="bg-white rounded-xl border p-5">
              <p className="font-semibold text-gray-800 mb-1">{item.q}</p>
              <p className="text-sm text-gray-500">{item.a}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <p className="text-gray-500 mb-4">Ai alte întrebări?</p>
          <Button variant="outline" asChild>
            <Link href="/help">Pagina de ajutor</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
