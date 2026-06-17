import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Shield, Users, BookOpen, CheckCircle, GraduationCap, Scale, Globe, Building2 } from "lucide-react";
import { AcademiaGuide } from "@/components/common/academia-guide";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Despre noi — Academia Politica AUR",
  description: "Academia Politica din cadrul Institutului Conservator Mihai Eminescu — platforma de formare politica si educatie civica pentru membri, formatori si lectori AUR.",
};

export default function DesprePage() {
  return (
    <div className="bg-white flex-1">

      {/* Hero */}
      <section className="bg-gradient-to-br from-yellow-50 via-amber-50 to-white py-20 px-4 border-b border-yellow-100">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/logo_academia_politica_titu_maiorescu_transparent.png"
              alt="Academia Politica Titu Maiorescu"
              width={160}
              height={160}
              style={{ width: 160, height: "auto" }}
              className="drop-shadow-md"
            />
          </div>
          <div className="inline-flex items-center gap-2 bg-yellow-100 text-yellow-800 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            Institutul Conservator &bdquo;Mihai Eminescu&rdquo;
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Despre{" "}
            <span className="text-yellow-600">Academia</span>{" "}
            <span className="text-[#1a2b5e]">Politică AUR</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Platformă de formare politică și educație civică dedicată celor care doresc să se
            pregătească pentru o carieră în domeniul public sau să se implice activ în procesul
            democratic românesc.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-white" asChild>
              <Link href="/courses">Explorează cursurile</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Înscrie-te gratuit</Link>
            </Button>
          </div>
          <div className="mt-8 max-w-xl mx-auto">
            <AcademiaGuide
              variant="mission"
              message="Academia Politică AUR formează cetățeni activi și lideri responsabili — prin cunoaștere, înțelegere și acțiune pentru România."
            />
          </div>
        </div>
      </section>

      {/* Misiunea */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Misiunea noastră</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Credem că România are nevoie de oameni pregătiți, integri și dedicați —
              în administrație, în parlament, în comunitate. Academia Politică AUR oferă
              instrumentele necesare pentru această formare.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 mt-8">
            {[
              {
                icon: "📚",
                title: "Cunoaștem",
                desc: "Doctrine, instituții, legislație, relații internaționale — fundamentele necesare oricărui om politic.",
              },
              {
                icon: "🧭",
                title: "Înțelegem",
                desc: "Contextul geopolitic, mecanismele democratice și responsabilitățile cetățeanului activ.",
              },
              {
                icon: "🇷🇴",
                title: "Acționăm pentru România",
                desc: "Formare orientată spre practică — pentru aleși locali, activiști și lideri comunitari.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center p-6 rounded-2xl border bg-gray-50">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modulele de formare */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Modulele de formare</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                icon: BookOpen,
                number: "I",
                title: "Formare Politică",
                color: "yellow",
                items: ["Ideologii și familii doctrinare", "Organizarea și funcționarea statului", "Conduită și comunicare politică", "Doctrină conservatoare"],
                status: "available",
              },
              {
                icon: Building2,
                number: "II",
                title: "Instituții și Administrație Publică",
                color: "blue",
                items: ["Administrația publică din România", "Primarul și consiliul local", "Finanțe publice locale", "Etică și integritate"],
                status: "available",
              },
              {
                icon: Scale,
                number: "III",
                title: "Legislație și Activitate Parlamentară",
                color: "gray",
                items: ["Procesul legislativ", "Activitatea parlamentară", "Inițiativa legislativă", "Controlul parlamentar"],
                status: "coming-soon",
              },
              {
                icon: Globe,
                number: "IV",
                title: "Politică Externă, Securitate și Relații Internaționale",
                color: "indigo",
                items: ["America și lumea", "Instituțiile de securitate", "Europa: securitate și politici", "Orientul Mijlociu"],
                status: "available",
              },
            ].map((mod) => {
              const Icon = mod.icon;
              const isComingSoon = mod.status === "coming-soon";
              return (
                <div key={mod.number} className={`rounded-2xl border-2 p-6 bg-white ${isComingSoon ? "opacity-60 border-gray-200" : mod.color === "yellow" ? "border-yellow-200" : mod.color === "blue" ? "border-blue-200" : "border-indigo-200"}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${mod.color === "yellow" ? "bg-yellow-100" : mod.color === "blue" ? "bg-blue-100" : mod.color === "gray" ? "bg-gray-100" : "bg-indigo-100"}`}>
                      <Icon size={20} className={mod.color === "yellow" ? "text-yellow-600" : mod.color === "blue" ? "text-blue-600" : mod.color === "gray" ? "text-gray-400" : "text-indigo-600"} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Modulul {mod.number}</span>
                      {isComingSoon && <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Coming Soon</span>}
                      <h3 className="font-bold text-gray-900 text-sm leading-tight">{mod.title}</h3>
                    </div>
                  </div>
                  <ul className="space-y-1.5">
                    {mod.items.map((item) => (
                      <li key={item} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle size={13} className={`flex-shrink-0 ${isComingSoon ? "text-gray-300" : mod.color === "yellow" ? "text-yellow-500" : mod.color === "blue" ? "text-blue-500" : "text-indigo-500"}`} />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
          <div className="text-center mt-8">
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-white" asChild>
              <Link href="/preturi">Vezi prețurile modulelor →</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Cum funcționează */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Cum funcționează platforma?</h2>
          <div className="grid md:grid-cols-2 gap-12">

            {/* Pentru membri */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                  <Users size={20} className="text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-yellow-800">Pentru membri / simpatizanți</h3>
              </div>
              <div className="space-y-4">
                {[
                  { step: "1", text: "Creezi un cont gratuit cu email și parolă" },
                  { step: "2", text: "Accesul la cursuri se activează imediat — fără aprobare" },
                  { step: "3", text: "Parcurgi modulele în ritmul tău, cu quiz-uri și progres urmărit" },
                  { step: "4", text: "La absolvire primești certificat digital descărcabil" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-yellow-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <p className="text-gray-700 text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pentru formatori */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <GraduationCap size={20} className="text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-indigo-800">Pentru formatori / lectori</h3>
              </div>
              <div className="space-y-4">
                {[
                  { step: "1", text: "Te înregistrezi ca Formator sau Lector" },
                  { step: "2", text: "Contul este aprobat de administrator — primești email de confirmare" },
                  { step: "3", text: "Creezi un grup virtual cu cod unic de acces pentru participanți" },
                  { step: "4", text: "Participanții intră pe /grup cu codul grupului, fără cont propriu" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-indigo-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <p className="text-gray-700 text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tipuri de lecții */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Ce tipuri de materiale există?</h2>
          <p className="text-center text-gray-500 mb-12">Fiecare curs poate conține video, prezentări, fișe de lucru, quiz-uri sau o combinație.</p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🎬", title: "Video", desc: "Prelegeri și materiale video structurate." },
              { icon: "📋", title: "Prezentare", desc: "Slide-uri și documente PDF vizualizate direct în pagină." },
              { icon: "📝", title: "Fișă de lucru", desc: "Documente descărcabile pentru studiu individual." },
              { icon: "🎯", title: "Quiz", desc: "Test interactiv cu feedback imediat și scor minim 80%." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border p-6 text-center hover:shadow-md transition-shadow bg-white">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gamificare */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Progres și certificare</h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            Parcursul de formare este urmărit automat — cu XP, insigne și diplomă la absolvire.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "⭐", value: "10 XP", label: "pentru fiecare lecție completată" },
              { icon: "🏅", value: "50 XP", label: "bonus la completarea unui curs" },
              { icon: "🏆", value: "100 XP", label: "bonus la completarea modulului" },
              { icon: "🎓", value: "Certificat", label: "digital și printabil la absolvire" },
            ].map((item) => (
              <div key={item.label} className="bg-yellow-50 rounded-2xl border border-yellow-200 p-6 text-center">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-2xl font-extrabold text-yellow-700 mb-1">{item.value}</div>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Confidențialitate */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-14 h-14 rounded-full bg-yellow-100 flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-yellow-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Siguranța datelor tale</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Platforma respectă GDPR și colectează strict datele necesare funcționării.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: "🚫", title: "Fără reclame", desc: "Nu există reclame și nu vindem datele utilizatorilor." },
              { icon: "🔒", title: "Date minimale", desc: "Colectăm doar: nume, email, progres lecții. Nimic altceva." },
              { icon: "🛡️", title: "Fără tracking extern", desc: "Nu urmărim comportamentul în afara platformei." },
              { icon: "✅", title: "Conținut validat", desc: "Toate materialele sunt verificate înainte de publicare." },
              { icon: "🔐", title: "Autentificare securizată", desc: "Supabase Auth cu PKCE. Admin cu 2FA obligatoriu." },
              { icon: "📊", title: "Transparență", desc: "Politica de confidențialitate completă disponibilă oricând." },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 p-5 bg-white rounded-xl border">
                <span className="text-2xl flex-shrink-0">{item.icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack */}
      <section className="py-12 px-4 bg-white border-t">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Construit cu tehnologii moderne</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
            {["Next.js 16 (App Router)", "Supabase Auth + PostgreSQL", "Vercel (hosting)", "Tailwind CSS v4", "AI: Groq / Llama 3", "Email: Resend"].map((tech) => (
              <span key={tech} className="px-3 py-1.5 bg-gray-50 border rounded-full text-gray-600">{tech}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-4 bg-gradient-to-br from-[#1a2b5e] to-[#0f1a3d] text-white">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-4xl mb-4">🏛️</div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Gata să începi?</h2>
          <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
            Înscrie-te gratuit și accesează imediat cursurile de formare politică ale Academiei.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold" asChild>
              <Link href="/register">Înscrie-te gratuit</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/courses">Vezi cursurile</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm text-white/50 italic">
            „Cunoaștem. Înțelegem. Acționăm pentru România!"
          </p>
        </div>
      </section>

    </div>
  );
}
