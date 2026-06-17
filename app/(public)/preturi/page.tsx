import Link from "next/link";
import { CheckCircle2, Star, Sparkles, Clock } from "lucide-react";
import { AcademiaGuide } from "@/components/common/academia-guide";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prețuri — Academia Politica AUR",
  description: "Planuri de abonament pentru platforma educațională Academia Politica AUR. Începe cu 7 zile gratuite.",
};

const PLANS = [
  {
    id: "monthly",
    name: "Lunar",
    price: 29,
    period: "lună",
    total: null,
    savings: null,
    badge: null,
    features: [
      "Acces la toate cursurile",
      "Urmărire progres copii",
      "Certificate de absolvire",
      "Suport prin email",
    ],
  },
  {
    id: "quarterly",
    name: "Trimestrial",
    price: 24,
    period: "lună",
    total: 72,
    savings: "Economisești 15 lei",
    badge: null,
    features: [
      "Toate beneficiile planului Lunar",
      "Facturat la 72 lei / 3 luni",
      "Prioritate la suport",
      "Acces anticipat la cursuri noi",
    ],
  },
  {
    id: "annual",
    name: "Anual",
    price: 19,
    period: "lună",
    total: 228,
    savings: "Economisești 120 lei / an",
    badge: "Recomandat",
    features: [
      "Toate beneficiile planului Trimestrial",
      "Facturat la 228 lei / an",
      "Suport prioritar dedicat",
      "Toate cursurile viitoare incluse",
    ],
  },
];

export default function PreturiPage() {
  return (
    <div className="bg-gradient-to-b from-blue-50 via-white to-white min-h-screen">
      {/* Hero */}
      <section className="container mx-auto px-4 pt-16 pb-10 text-center">
        <div className="inline-flex items-center gap-2 bg-teal-100 text-teal-700 text-sm font-medium px-4 py-2 rounded-full mb-6">
          <Clock size={15} />
          7 zile gratuite pentru conturi noi
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          Prețuri simple și transparente
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Alege planul potrivit pentru familia ta. Toate planurile includ acces complet la platforma
          Ami &amp; Moti — fără surprize.
        </p>
      </section>

      {/* Cards */}
      <section className="container mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {PLANS.map((plan) => {
            const isRecommended = plan.badge === "Recomandat";
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 p-7 flex flex-col ${
                  isRecommended
                    ? "border-blue-500 bg-white shadow-xl shadow-blue-100"
                    : "border-gray-200 bg-white shadow-md"
                }`}
              >
                {isRecommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-blue-500 text-white text-xs font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                      <Star size={12} fill="white" />
                      Recomandat
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h2 className="text-lg font-bold text-gray-900">{plan.name}</h2>
                  {plan.savings && (
                    <span className="text-xs font-medium text-teal-600 bg-teal-50 px-2 py-0.5 rounded-full">
                      {plan.savings}
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-lg font-semibold text-gray-500 mb-1">lei</span>
                    <span className="text-sm text-gray-400 mb-1.5">/ {plan.period}</span>
                  </div>
                  {plan.total && (
                    <p className="text-xs text-gray-400 mt-1">
                      Facturat la {plan.total} lei
                    </p>
                  )}
                </div>

                <ul className="flex flex-col gap-2.5 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <CheckCircle2 size={16} className="text-teal-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  className={`w-full font-semibold ${
                    isRecommended
                      ? "bg-blue-500 hover:bg-blue-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-800"
                  }`}
                >
                  <Link href="/register">Încearcă gratuit 7 zile</Link>
                </Button>
              </div>
            );
          })}
        </div>

        {/* Trial notice */}
        <div className="max-w-2xl mx-auto mt-10 bg-teal-50 border border-teal-200 rounded-xl p-6 text-center">
          <Sparkles size={22} className="mx-auto mb-3 text-teal-500" />
          <h3 className="font-semibold text-gray-800 mb-1">7 zile gratuite — fără card de credit</h3>
          <p className="text-sm text-gray-500">
            La înregistrare primești automat acces complet timp de 7 zile. După trial, contactează
            adminul platformei pentru a activa un plan plătit.
          </p>
        </div>
      </section>

      {/* Mesaj ghid */}
      <section className="container mx-auto px-4 pb-6 max-w-2xl">
        <AcademiaGuide
          variant="info"
          message="Eu, Ami, garantez că primele 7 zile sunt complet gratuite — fără card, fără surprize! Încearcă platforma cu copilul tău și dacă îți place, ne întoarcem împreună cu un abonament. 😊"
        />
      </section>

      {/* FAQ */}
      <section className="container mx-auto px-4 pb-20 max-w-2xl">
        <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">Întrebări frecvente</h2>
        <div className="space-y-4">
          {[
            {
              q: "Pot anula oricând?",
              a: "Da, abonamentul nu se reînnoiește automat. La expirare, accesul la conținut premium se oprește, dar datele de progres sunt păstrate.",
            },
            {
              q: "Câți copii pot adăuga la un cont?",
              a: "Poți adăuga oricâți copii dorești în contul de familie — fiecare cu propriul profil și progres separat.",
            },
            {
              q: "Cum plătesc abonamentul?",
              a: "În prezent, activarea planului se face manual de echipa Academia Politica AUR după confirmarea plății. Contactează-ne prin pagina de ajutor.",
            },
            {
              q: "Ce se întâmplă cu progresul copilului dacă abonamentul expiră?",
              a: "Progresul și certificatele sunt păstrate. Accesul la conținut nou este restricționat până la reactivarea abonamentului.",
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
