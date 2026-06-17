import type { Metadata } from "next";
import Link from "next/link";
import { Smartphone, Monitor, CheckCircle2, Download } from "lucide-react";
import { AcademiaGuide } from "@/components/common/academia-guide";
import { InstallButton } from "@/components/common/install-button";

export const metadata: Metadata = {
  title: "Instalează aplicația – Academia Politica AUR",
  description:
    "Descarcă aplicația Academia Politica AUR pe telefon sau tabletă. Funcționează pe Android și iOS, fără App Store.",
};

const androidSteps = [
  "Deschide site-ul academia-aur.ro în Chrome pe Android.",
  'Apasă meniul din dreapta sus (⋮) și selectează „Adaugă pe ecranul principal".',
  'Apasă „Adaugă" în fereastra de confirmare.',
  "Pictograma apare pe ecranul principal — aplicația este gata!",
];

const iosSteps = [
  "Deschide site-ul academia-aur.ro în Safari pe iPhone sau iPad.",
  'Apasă butonul „Share" (pătrat cu săgeată în sus) din bara de jos.',
  'Derulează în jos și apasă „Adaugă pe ecranul principal".',
  'Apasă „Adaugă" — gata, aplicația este instalată!',
];

const benefits = [
  "Funcționează și fără conexiune (conținut vizitat anterior)",
  "Pornire rapidă ca o aplicație nativă",
  "Nu ocupă spațiu în App Store / Google Play",
  "Actualizări automate — mereu ultima versiune",
];

export default function InstaleazaPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-teal-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Hero */}
        <div className="text-center space-y-3">
          <div className="text-6xl">📱</div>
          <h1 className="text-3xl font-bold text-gray-900">
            Instalează Ami &amp; Moti pe telefon
          </h1>
          <p className="text-gray-500 text-lg">
            Adaugă platforma pe ecranul principal — gratuit, fără App Store.
          </p>
        </div>

        {/* Buton interactiv — se adaptează automat la platformă */}
        <InstallButton />

        {/* Moti guide */}
        <AcademiaGuide
          variant="tip"
          message="Eu, Moti, te ghidez! Instalarea durează mai puțin de un minut și funcționează pe orice telefon sau tabletă. Nu ai nevoie de App Store sau Google Play!"
        />

        {/* Benefits */}
        <div className="bg-white rounded-2xl border border-teal-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-teal-500" />
            De ce să instalezi aplicația?
          </h2>
          <ul className="space-y-2">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-teal-500 mt-0.5 flex-shrink-0">✓</span>
                {b}
              </li>
            ))}
          </ul>
        </div>

        {/* Android */}
        <div className="bg-white rounded-2xl border border-green-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Smartphone size={18} className="text-green-600" />
            Android (Chrome)
          </h2>
          <ol className="space-y-3">
            {androidSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-600">
                <span className="flex-shrink-0 w-6 h-6 bg-green-100 text-green-700 rounded-full flex items-center justify-center font-bold text-xs">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-gray-400">
            Dacă nu apare opțiunea „Adaugă pe ecranul principal", site-ul îți va afișa automat un banner de instalare.
          </p>
        </div>

        {/* iOS */}
        <div className="bg-white rounded-2xl border border-blue-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Smartphone size={18} className="text-blue-500" />
            iPhone / iPad (Safari)
          </h2>
          <ol className="space-y-3">
            {iosSteps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-600">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center font-bold text-xs">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
          <p className="mt-4 text-xs text-gray-400">
            Pe iOS trebuie să folosești Safari — Chrome și alte browsere nu permit instalarea PWA.
          </p>
        </div>

        {/* Desktop */}
        <div className="bg-white rounded-2xl border border-purple-100 p-6 shadow-sm">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Monitor size={18} className="text-purple-500" />
            Calculator / laptop (Chrome / Edge)
          </h2>
          <p className="text-sm text-gray-600">
            În bara de adresă din Chrome sau Edge apare o pictogramă{" "}
            <span className="font-mono bg-gray-100 px-1 rounded">⊕</span> la dreapta.
            Apas-o și selectează „Instalează". Aplicația va porni ca o fereastră separată.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center space-y-3 py-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-teal-700 transition-colors text-sm"
          >
            <Download size={16} />
            Du-te la site și instalează
          </Link>
          <p className="text-xs text-gray-400">
            Sau <Link href="/courses" className="text-teal-600 hover:underline">explorează cursurile</Link> direct din browser.
          </p>
        </div>
      </div>
    </main>
  );
}
