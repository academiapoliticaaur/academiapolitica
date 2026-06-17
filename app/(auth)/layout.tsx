import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-sky-50 to-teal-50 flex flex-col">
      <header className="p-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl w-fit">
          <span className="text-2xl">🌟</span>
          <span className="text-blue-500">Ami</span>
          <span className="text-gray-400">&amp;</span>
          <span className="text-teal-500">Moti</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center p-4">
        {children}
      </main>
      <footer className="p-4 text-center text-xs text-gray-400">
        © {new Date().getFullYear()} Platforma Ami &amp; Moti
      </footer>
    </div>
  );
}
