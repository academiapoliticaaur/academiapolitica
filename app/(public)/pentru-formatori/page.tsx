import Link from "next/link";
import { GraduationCap, Users, BarChart2, Upload, BookOpen, CheckCircle, ArrowRight, School, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Platformă educațională pentru formatori — Academia Politica AUR",
  description: "Creează clasa ta virtuală gratuit. Asignează cursuri de AI literacy, urmărește progresul fiecărui elev și acordă diplome digitale. Fără conturi pentru elevi.",
};

const STEPS = [
  {
    icon: "1️⃣",
    title: "Creezi un cont de formator",
    desc: "Înregistrare gratuită în 2 minute. Selectezi tipul Formator (cls. 0–4) sau Profesor (cls. 5–8). Contul se activează după o scurtă aprobare administrativă.",
  },
  {
    icon: "2️⃣",
    title: "Creezi clasa și adaugi elevii",
    desc: "Clasa primește un cod unic. Poți adăuga elevii manual sau prin import CSV (până la 100 elevi odată). Elevii nu au nevoie de email sau cont — intră cu codul clasei + codul personal.",
  },
  {
    icon: "3️⃣",
    title: "Asignezi cursuri și urmărești progresul",
    desc: "Selectezi cursurile din catalogul platformei. Fiecare elev vede cursurile asignate clasei. Tu urmărești cine a parcurs ce lecții și ce scoruri a obținut.",
  },
];

const FEATURES = [
  {
    icon: <School size={22} className="text-indigo-600" />,
    title: "Clasă virtuală cu cod unic",
    desc: "Elevii accesează clasa la /grup/COD-CLASA. Nu necesită cont, email sau parolă.",
  },
  {
    icon: <Upload size={22} className="text-teal-600" />,
    title: "Import CSV rapid",
    desc: "Adaugi toți elevii din registru în câteva secunde. Template descărcabil inclus.",
  },
  {
    icon: <BarChart2 size={22} className="text-blue-600" />,
    title: "Dashboard progres per elev",
    desc: "Vezi exact ce lecții a parcurs fiecare elev, scorul obținut la quiz-uri și data completării.",
  },
  {
    icon: <BookOpen size={22} className="text-purple-600" />,
    title: "Cursuri de AI literacy",
    desc: "Conținut adaptat vârstei, creat de specialiști. Lecții video, prezentări, quiz-uri interactive.",
  },
  {
    icon: <GraduationCap size={22} className="text-amber-600" />,
    title: "Diplome digitale",
    desc: "La finalizarea unui curs, elevul primește o diplomă cu numele său — poate fi tipărită sau distribuită.",
  },
  {
    icon: <Users size={22} className="text-emerald-600" />,
    title: "Mai multe clase",
    desc: "Creezi oricâte clase ai nevoie. Fiecare cu propria listă de elevi și cursuri asignate.",
  },
];

const FAQS = [
  {
    q: "Elevii au nevoie de adresă de email sau cont Supabase?",
    a: "Nu. Elevii accesează clasa cu un cod de clasă + un cod personal scurt (ex: A1, B2). Nicio înregistrare nu este necesară din partea elevului.",
  },
  {
    q: "Este gratuit pentru formatori?",
    a: "Da, accesul pentru formatori este gratuit. Creezi cont, creezi clase, adaugi elevi și asignezi cursuri fără niciun cost.",
  },
  {
    q: "Pot folosi platforma și acasă, pe tabletă sau telefon?",
    a: "Da, platforma este optimizată pentru toate dispozitivele și poate fi instalată ca aplicație (PWA) direct din browser, fără App Store.",
  },
  {
    q: "Cât durează aprobarea contului de formator?",
    a: "De obicei în 24–48 de ore lucrătoare. Primești notificare prin email la aprobare.",
  },
  {
    q: "Pot asigna cursuri diferite la clase diferite?",
    a: "Da. Fiecare clasă are propria listă de cursuri asignate, independentă de celelalte clase.",
  },
];

export default function PentruProfesoriPage() {
  return (
    <div className="min-h-screen">

      {/* ── HERO ── */}
      <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white">
        <div className="container mx-auto max-w-5xl px-4 py-20 sm:py-28">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold tracking-widest uppercase bg-white/20 px-3 py-1 rounded-full">
              Gratuit pentru formatori
            </span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-6 max-w-3xl">
            Aduce AI literacy în clasa ta cu <span className="text-yellow-300">Academia Politica AUR</span>
          </h1>
          <p className="text-indigo-100 text-lg sm:text-xl max-w-2xl mb-8 leading-relaxed">
            Platformă educațională românească pentru cursuri de competențe digitale. Creezi clasa virtuală în 5 minute — elevii intră cu un cod, fără conturi sau email.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-base px-8 gap-2">
              <Link href="/register">
                Creează cont gratuit
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-semibold text-base px-6">
              <Link href="/formatori">
                Vezi resursele didactice
              </Link>
            </Button>
          </div>
          <div className="mt-10 flex flex-wrap gap-6 text-sm text-indigo-200">
            {["Fără cont pentru elevi", "Import CSV în masă", "Diplome digitale", "Funcționează offline (PWA)"].map((f) => (
              <span key={f} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-yellow-300" />
                {f}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CUM FUNCȚIONEAZĂ ── */}
      <section className="bg-white py-20">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Cum funcționează</h2>
            <p className="text-gray-500">Trei pași simpli — de la zero la clasă activă</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            {STEPS.map((step) => (
              <div key={step.title} className="text-center">
                <div className="text-5xl mb-4">{step.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2 text-base">{step.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FUNCȚIONALITĂȚI ── */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3">Tot ce ai nevoie</h2>
            <p className="text-gray-500">Instrumente gândite pentru formatori, nu pentru IT</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl p-6 border shadow-sm">
                <div className="mb-3">{f.icon}</div>
                <h3 className="font-bold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DEMO FLOW ── */}
      <section className="bg-white py-20">
        <div className="container mx-auto max-w-3xl px-4 text-center">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">Cum intră elevii în clasă</h2>
          <p className="text-gray-500 mb-10">Fără înregistrare. Fără email. Fără parolă memorată.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-2">
            {[
              { step: "1", text: "Elevul accesează", sub: "academia-aur.ro/clasa" },
              { step: "→", text: "" , sub: "" },
              { step: "2", text: "Introduce", sub: "Codul clasei" },
              { step: "→", text: "", sub: "" },
              { step: "3", text: "Alege numele său din listă", sub: "sau cod personal" },
              { step: "→", text: "", sub: "" },
              { step: "✓", text: "Intră direct", sub: "în cursuri" },
            ].map((item, i) =>
              item.step === "→" ? (
                <ArrowRight key={i} size={20} className="text-gray-300 hidden sm:block flex-shrink-0" />
              ) : (
                <div key={i} className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-4 text-center min-w-[100px]">
                  <div className="text-2xl font-black text-indigo-600 mb-1">{item.step}</div>
                  <p className="text-xs font-semibold text-gray-700">{item.text}</p>
                  <p className="text-xs text-gray-400">{item.sub}</p>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* ── POTRIVIT PENTRU ── */}
      <section className="bg-gradient-to-r from-indigo-50 to-purple-50 py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <h2 className="text-2xl font-black text-gray-900 text-center mb-8">Potrivit pentru</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: "🌈", title: "Formatori cls. 0–4", desc: "Cursuri de AI literacy și competențe digitale adaptate ciclului primar." },
              { icon: "🚀", title: "Profesori cls. 5–8", desc: "Materiale pentru predarea gândirii computaționale și utilizării responsabile a AI." },
              { icon: "🏫", title: "Afterschool-uri", desc: "Structurezi lecțiile pe clase virtuale, urmărești progresul individual al fiecărui copil." },
              { icon: "📚", title: "Biblioteci și centre edu", desc: "Activezi accesul la cursuri fără nicio infrastructură IT suplimentară." },
            ].map((item) => (
              <div key={item.title} className="bg-white rounded-2xl p-5 border flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="bg-white py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 text-center mb-10">Întrebări frecvente</h2>
          <div className="space-y-4">
            {FAQS.map((faq) => (
              <div key={faq.q} className="bg-gray-50 rounded-2xl p-5 border">
                <p className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                  <span className="text-indigo-500 mt-0.5 flex-shrink-0">Q</span>
                  {faq.q}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed pl-5">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ── */}
      <section className="bg-indigo-700 text-white py-20">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <div className="text-5xl mb-4">🎓</div>
          <h2 className="text-2xl sm:text-3xl font-black mb-4">Gata să pornești?</h2>
          <p className="text-indigo-200 mb-8 text-lg">
            Creezi clasa ta virtuală în mai puțin de 5 minute. Elevii pot intra chiar azi.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold text-base px-8 gap-2">
              <Link href="/register">
                Creează cont gratuit
                <ArrowRight size={18} />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-white/40 text-white hover:bg-white/10 font-semibold text-base px-6">
              <Link href="/grup">
                Vezi cum intră elevii
              </Link>
            </Button>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-indigo-300">
            <span className="flex items-center gap-1.5"><Clock size={14} /> Setup în 5 minute</span>
            <span className="flex items-center gap-1.5"><Shield size={14} /> GDPR compliant</span>
            <span className="flex items-center gap-1.5"><CheckCircle size={14} /> Gratuit pentru formatori</span>
          </div>
        </div>
      </section>

    </div>
  );
}
