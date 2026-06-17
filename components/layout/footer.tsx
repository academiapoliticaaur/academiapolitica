import Link from "next/link";
import Image from "next/image";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          <div>
            <div className="mb-3">
              <Image src="/logo_academia_politica_titu_maiorescu_transparent.png" alt="Academia Politica AUR" width={48} height={48} style={{ width: "auto", height: 48 }} />
            </div>
            <p className="text-sm text-gray-500">
              Platformă de formare politică și educație civică a Alianței pentru Unirea Românilor.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-3">Navigare</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/courses" className="hover:text-yellow-600">Cursuri</Link></li>
              <li><Link href="/webinars" className="hover:text-yellow-600">Webinarii</Link></li>
              <li><Link href="/register" className="hover:text-yellow-600">Înscrie-te</Link></li>
              <li><Link href="/login" className="hover:text-yellow-600">Intră în cont</Link></li>
              <li>
                <Link href="/instaleaza" className="hover:text-yellow-600 inline-flex items-center gap-1">
                  📱 Instalează aplicația
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-sm text-gray-700 mb-3">Legal</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><Link href="/termeni" className="hover:text-yellow-600">Termeni și condiții</Link></li>
              <li><Link href="/confidentialitate" className="hover:text-yellow-600">Politica de confidențialitate</Link></li>
              <li>
                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                  Conținut validat de specialiști
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t text-center text-xs text-gray-400">
          © {new Date().getFullYear()} Academia Politica AUR · Toate drepturile rezervate
        </div>
      </div>
    </footer>
  );
}
