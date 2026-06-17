import Link from "next/link";
import Image from "next/image";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-amber-50 to-white flex flex-col">
      <header className="p-4">
        <Link href="/" className="flex items-center w-fit">
          <Image src="/logo_academia_politica_titu_maiorescu_transparent.png" alt="Academia Politica AUR" width={48} height={48} style={{ width: "auto", height: 48 }} />
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      <footer className="p-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Academia Politica AUR
      </footer>
    </div>
  );
}
