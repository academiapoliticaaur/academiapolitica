import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Shield, Users, Star, BookOpen, GraduationCap, Zap, Heart, CheckCircle } from "lucide-react";
import { AmiMotiGuide } from "@/components/common/ami-moti-guide";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Despre platformă — Ami & Moti",
  description: "Platformă educațională românească pentru copiii din clasele 0–8. Cursuri de AI literacy, lecții video, prezentări și quiz-uri interactive.",
};

export default function DesprePage() {
  return (
    <div className="bg-white flex-1">

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-50 via-sky-50 to-teal-50 py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <Star size={14} className="fill-blue-500 text-blue-500" />
            Platformă educațională pentru clasele 0–8
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6 leading-tight">
            Despre{" "}
            <span className="text-blue-500">Ami</span>
            <span className="text-gray-400"> & </span>
            <span className="text-teal-500">Moti</span>
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed mb-8">
            O platformă educațională românească creată pentru a aduce alfabetizarea digitală și AI
            în viața copiilor și a cadrelor didactice din ciclul primar și gimnazial.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-blue-500 hover:bg-blue-600 text-white" asChild>
              <Link href="/courses">Explorează cursurile</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register">Creează cont gratuit</Link>
            </Button>
          </div>
          <div className="mt-8 max-w-xl mx-auto">
            <AmiMotiGuide
              variant="moti"
              message="Eu, Moti, te ghidez! Platforma Ami & Moti a fost creată special pentru copiii din România — să înveți despre AI poate fi o adevărată aventură!"
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
              Credem că fiecare copil din România merită acces la educație de calitate despre
              tehnologie și inteligență artificială — prezentată pe înțelesul lui, în limba română,
              prin personaje prietenoase: <strong className="text-blue-600">Ami</strong> și{" "}
              <strong className="text-teal-600">Moti</strong>.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8 mt-8">
            {[
              {
                icon: "🎯",
                title: "Conținut adaptat pe vârstă",
                desc: "Cursuri separate pentru Clasele 0–4 (limbaj simplu, vizual bogat) și Clasele 5–8 (gândire critică, profunzime).",
              },
              {
                icon: "🤖",
                title: "AI literacy pentru toți",
                desc: "Copiii și cadrele didactice învață ce este inteligența artificială, cum funcționează și cum o pot folosi responsabil.",
              },
              {
                icon: "🇷🇴",
                title: "100% în limba română",
                desc: "Tot conținutul — cursuri, lecții, quiz-uri, diplome — este în limba română, adaptat curriculum-ului național.",
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

      {/* Cum funcționează */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Cum funcționează platforma?</h2>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Pentru părinți */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Users size={20} className="text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-blue-800">Pentru părinți</h3>
              </div>
              <div className="space-y-4">
                {[
                  { step: "1", text: "Creezi un cont de părinte gratuit cu email și parolă" },
                  { step: "2", text: "Adaugi profilurile copiilor tăi (nu colectăm email de la copii)" },
                  { step: "3", text: "Copilul accesează zona lui din contul tău — opțional cu PIN de 4 cifre" },
                  { step: "4", text: "Urmărești progresul și primești raport săptămânal pe email" },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-3">
                    <span className="w-7 h-7 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.step}
                    </span>
                    <p className="text-gray-700 text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pentru cadre didactice */}
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <GraduationCap size={20} className="text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-indigo-800">Pentru cadre didactice</h3>
              </div>
              <div className="space-y-4">
                {[
                  { step: "1", text: "Înregistrezi cont ca Învățător (cls. 0–4) sau Profesor Gimnaziu (cls. 5–8)" },
                  { step: "2", text: "Contul este aprobat de administrator — primești email de confirmare" },
                  { step: "3", text: "Creezi o clasă virtuală cu un cod unic de acces pentru elevi" },
                  { step: "4", text: "Elevii intră pe /clasa cu codul clasei, fără să creeze cont" },
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

      {/* Tipuri conținut */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Ce tipuri de lecții există?</h2>
          <p className="text-center text-gray-500 mb-12">Fiecare lecție poate fi video, prezentare, fișă de lucru, quiz sau o combinație a lor.</p>

          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "🎬", title: "Video", desc: "Filme educaționale clare, gazdate pe YouTube sau Google Drive." },
              { icon: "📋", title: "Prezentare", desc: "Slide-uri PDF sau Google Slides vizualizate direct în pagină." },
              { icon: "📝", title: "Fișă de lucru", desc: "PDF descărcabil pentru activitate individuală sau în grup." },
              { icon: "🎯", title: "Quiz", desc: "Test interactiv — minim 80% pentru a trece la lecția următoare." },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border p-6 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold mb-2">{item.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gamificare */}
      <section className="py-16 px-4 bg-gradient-to-br from-teal-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-4">Gamificare și motivare</h2>
          <p className="text-center text-gray-500 mb-12 max-w-2xl mx-auto">
            Copiii sunt motivați să continue prin XP, insigne și diplome de absolvire.
          </p>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: "⭐", value: "10 XP", label: "pentru fiecare lecție completată" },
              { icon: "🏅", value: "50 XP", label: "bonus la completarea unui modul" },
              { icon: "🏆", value: "100 XP", label: "bonus la completarea cursului" },
              { icon: "🎓", value: "Diplomă", label: "printabilă la absolvire" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-2xl border p-6 text-center shadow-sm">
                <div className="text-3xl mb-2">{item.icon}</div>
                <div className="text-2xl font-extrabold text-teal-600 mb-1">{item.value}</div>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-white rounded-2xl border p-6 text-center">
            <p className="font-semibold text-gray-700 mb-1">
              🔥 Daily streak + 🏅 9 insigne de competență
            </p>
            <p className="text-sm text-gray-500">
              Zilele consecutive de activitate și finalizarea modulelor deblochează insigne speciale.
            </p>
          </div>
        </div>
      </section>

      {/* Sistem clase */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-sm font-semibold px-3 py-1.5 rounded-full mb-4">
                <Zap size={14} />
                Nou — Sistem clase
              </div>
              <h2 className="text-3xl font-bold mb-4">Clasă virtuală în câteva minute</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
                Cadrele didactice pot crea o clasă virtuală, adăuga elevii și asigna cursuri.
                Elevii accesează conținutul prin codul clasei — <strong>fără să creeze cont</strong>.
              </p>
              <ul className="space-y-3">
                {[
                  "Cod clasă unic ales de profesor (4–12 caractere)",
                  "Elevi adăugați cu nume și cod personal",
                  "Cursuri asignate din catalogul platformei",
                  "Elevi accesează /clasa → cod → nume → cursuri",
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
              <p className="text-sm font-bold text-emerald-700 uppercase tracking-wider mb-4">Flux de acces elev</p>
              <div className="space-y-3">
                {[
                  { step: "1", text: "Accesează ami-moti.everydai.ro/clasa" },
                  { step: "2", text: "Introduce codul clasei (ex: CLASA5A)" },
                  { step: "3", text: "Selectează numele din lista clasei" },
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
                  <Link href="/clasa">Intră în clasă →</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Siguranță și confidențialitate */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Shield size={28} className="text-blue-600" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Siguranța și confidențialitatea datelor</h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Platforma este construită cu protecția copiilor ca prioritate principală.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: "🚫",
                title: "Fără email de la copii",
                desc: "Copiii nu creează conturi cu email. Accesul este gestionat de părinte sau profesor.",
              },
              {
                icon: "🔒",
                title: "Fără profiluri publice",
                desc: "Niciun profil de copil nu este vizibil public. Datele sunt accesibile doar de părintele contului.",
              },
              {
                icon: "🛡️",
                title: "Fără reclame sau tracking",
                desc: "Platforma nu conține reclame, nu urmărește comportamentul copilului și nu vinde date.",
              },
              {
                icon: "✅",
                title: "Conținut validat de educatori",
                desc: "Toate lecțiile generate cu AI sunt verificate și aprobate de un educator înainte de publicare.",
              },
              {
                icon: "🔐",
                title: "Autentificare securizată",
                desc: "Supabase Auth cu PKCE flow. Admin cu autentificare în doi pași (2FA TOTP) obligatorie.",
              },
              {
                icon: "📊",
                title: "Date minime",
                desc: "Colectăm doar: nume afișat, grupă vârstă, progres lecții. Nicio informație sensibilă.",
              },
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

      {/* Grupe și audiență */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Cine folosește Ami & Moti?</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[
              {
                icon: "🌱",
                title: "Elevi cls. 0–4",
                color: "teal",
                desc: "Lecții colorate cu limbaj simplu și carduri mari. Povești prietenoase despre AI.",
                href: "/courses?group=0-4",
                cta: "Cursuri 0–4",
              },
              {
                icon: "🔬",
                title: "Elevi cls. 5–8",
                color: "indigo",
                desc: "Conținut structurat, gândire critică, gamificare avansată și explorare.",
                href: "/courses?group=5-8",
                cta: "Cursuri 5–8",
              },
              {
                icon: "🍎",
                title: "Învățători",
                color: "emerald",
                desc: "Resurse didactice pentru predarea AI literacy în clasele primare (0–4).",
                href: "/cadre-didactice",
                cta: "Resurse",
              },
              {
                icon: "🎓",
                title: "Profesori Gim.",
                color: "purple",
                desc: "Materiale pentru competențe digitale și AI în clasele de gimnaziu (5–8).",
                href: "/cadre-didactice",
                cta: "Resurse",
              },
            ].map((item) => (
              <div
                key={item.title}
                className={`rounded-2xl border-2 p-6 text-center border-${item.color}-200 bg-${item.color}-50`}
              >
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className={`font-bold text-${item.color}-800 mb-2`}>{item.title}</h3>
                <p className="text-xs text-gray-600 leading-relaxed mb-4">{item.desc}</p>
                <Link
                  href={item.href}
                  className={`text-xs font-semibold text-${item.color}-700 hover:underline`}
                >
                  {item.cta} →
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech stack — pentru credibilitate */}
      <section className="py-12 px-4 bg-gray-50 border-t">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-6">Construit cu tehnologii moderne și de încredere</p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
            {[
              "Next.js 16 (App Router)",
              "Supabase Auth + PostgreSQL",
              "Vercel (hosting)",
              "Tailwind CSS",
              "AI: Groq / Llama 3",
              "Email: Resend",
            ].map((tech) => (
              <span key={tech} className="px-3 py-1.5 bg-white border rounded-full text-gray-600">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-500 to-teal-500 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <Heart size={40} className="mx-auto mb-4 text-white/80" />
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Gata să începem?</h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Platforma este complet gratuită. Creează-ți contul acum și lasă-ți copilul să descopere lumea AI alături de Ami și Moti.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 font-bold" asChild>
              <Link href="/register">Creează cont gratuit</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/courses">Vezi cursurile</Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/clasa">Intru în clasă</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}
