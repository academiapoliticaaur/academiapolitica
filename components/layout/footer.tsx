import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div>
            <div className="flex items-center gap-2 font-bold text-lg mb-3">
              <span className="text-2xl">🌟</span>
              <span className="text-blue-500">Ami</span>
              <span className="text-gray-400">&amp;</span>
              <span className="text-teal-500">Moti</span>
            </div>
            <p className="text-sm text-gray-500">
              O platformă educațională realizată cu drag, pentru copiii din clasele 0–8 ce se pregătesc pentru viață.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-3">Navigare</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/courses" className="hover:text-blue-500">Cursuri</Link></li>
              <li><Link href="/register" className="hover:text-blue-500">Creează cont</Link></li>
              <li><Link href="/login" className="hover:text-blue-500">Intră în cont</Link></li>
              <li>
                <Link href="/instaleaza" className="hover:text-teal-600 inline-flex items-center gap-1">
                  📱 Instalează aplicația
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/termeni" className="hover:text-blue-500">Termeni și condiții</Link></li>
              <li><Link href="/confidentialitate" className="hover:text-blue-500">Politica de confidențialitate</Link></li>
              <li>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                  Conținut AI validat de oameni
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Platforma Ami &amp; Moti · Toate drepturile rezervate
        </div>
      </div>
    </footer>
  );
}
