import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-white">
      <div className="text-8xl mb-6 animate-bounce">🔍</div>
      <h1 className="text-6xl font-black text-gray-800 mb-2">404</h1>
      <p className="text-xl font-semibold text-gray-700 mb-3">Pagina nu a fost găsită</p>
      <p className="text-gray-500 max-w-sm mb-8">
        Academia Politica AUR au căutat peste tot, dar nu au găsit ce cauți tu. Poate ai urmat un link vechi?
      </p>
      <div className="flex gap-3">
        <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700">
          <Link href="/">Înapoi acasă</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/courses">Explorează cursuri</Link>
        </Button>
      </div>
    </div>
  );
}
