"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { Menu, X, BookOpen, LogIn, LogOut, User, ChevronDown, LayoutDashboard, Star, HelpCircle, GraduationCap, School, Users, CreditCard, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  user?: { email?: string } | null;
  parentName?: string;
  isAdmin?: boolean;
  accountType?: string | null;
}

export function Header({ user, parentName, isAdmin, accountType }: HeaderProps) {
  const pathname = usePathname();
  const isGroupZone = pathname?.startsWith("/grup") ?? false;
  const isTeacher = accountType === "formator" || accountType === "lector";
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isGroupZone) {
    return (
      <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="container mx-auto flex h-16 items-center px-4">
          <Link href="/" className="flex items-center">
            <Image src="/logo_academia_politica_titu_maiorescu_transparent.png" alt="Academia Politica AUR" width={44} height={44} style={{ width: "auto", height: 44 }} />
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center shrink-0">
          <Image src="/logo_academia_politica_titu_maiorescu_transparent.png" alt="Academia Politica AUR" width={44} height={44} style={{ width: "auto", height: 44 }} />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/despre" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-yellow-700 border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 hover:border-yellow-400 transition-all">
            <Star size={15} />
            Despre noi
          </Link>
          <Link href="/courses" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-blue-600 border border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all">
            <BookOpen size={15} />
            Cursuri
          </Link>
          {(!user || isTeacher) && (
            <Link
              href={isTeacher ? "/formatori" : "/pentru-formatori"}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
                isTeacher
                  ? "text-indigo-700 border-indigo-300 bg-indigo-50 hover:bg-indigo-100"
                  : "text-indigo-600 border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400"
              }`}
            >
              <GraduationCap size={15} />
              Formatori
            </Link>
          )}
          {isTeacher && (
            <Link href="/dashboard/grupuri" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-indigo-700 border border-indigo-300 bg-indigo-100 hover:bg-indigo-200 transition-all">
              <Users size={15} />
              Grupurile mele
            </Link>
          )}
          <Link href="/grup" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-emerald-600 border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:border-emerald-400 transition-all">
            <School size={15} />
            Intră în grup
          </Link>
          {isAdmin && (
            <Link href="/admin" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-purple-600 border border-purple-200 bg-purple-50 hover:bg-purple-100 hover:border-purple-400 transition-all">
              <LayoutDashboard size={15} />
              Admin
            </Link>
          )}
          {user && !isAdmin && (
            <Link href={isTeacher ? "/dashboard/grupuri" : "/dashboard"} className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 hover:border-indigo-400 transition-all">
              <LayoutDashboard size={15} />
              Dashboard
            </Link>
          )}
          {!user && (
            <Link href="/preturi" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-violet-600 border border-violet-200 bg-violet-50 hover:bg-violet-100 hover:border-violet-400 transition-all">
              <CreditCard size={15} />
              Prețuri
            </Link>
          )}
          <Link href="/help" className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold text-gray-600 border border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-400 transition-all">
            <HelpCircle size={15} />
            Ajutor
          </Link>
        </nav>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <User size={16} />
                {parentName || user.email?.split("@")[0]}
                <ChevronDown size={14} className={`transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl border bg-white shadow-lg py-1 z-50">
                  <Link
                    href="/dashboard"
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <hr className="my-1" />
                  <form action="/logout" method="post">
                    <button
                      type="submit"
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <LogOut size={14} />
                      Deconectare
                    </button>
                  </form>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login" className="gap-2">
                  <LogIn size={16} />
                  Intră în cont
                </Link>
              </Button>
              <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white" asChild>
                <Link href="/register">Înscrie-te</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Meniu"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-white px-4 py-4 flex flex-col gap-4">
          <Link href="/despre" className="text-base font-medium text-yellow-700 flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <Star size={18} />
            Despre noi
          </Link>
          <Link href="/courses" className="text-base font-medium flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <BookOpen size={18} />
            Cursuri
          </Link>
          {(!user || isTeacher) && (
            <Link href={isTeacher ? "/formatori" : "/pentru-formatori"} className="text-base font-medium text-indigo-600 flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <GraduationCap size={18} />
              Formatori
            </Link>
          )}
          {isTeacher && (
            <Link href="/dashboard/grupuri" className="text-base font-medium text-indigo-700 font-semibold flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <Users size={18} />
              Grupurile mele
            </Link>
          )}
          <Link href="/grup" className="text-base font-medium text-emerald-600 flex items-center gap-2" onClick={() => setMobileOpen(false)}>
            <School size={18} />
            Intră în grup
          </Link>
          {user ? (
            <>
              {isAdmin && (
                <Link href="/admin" className="text-base font-medium text-purple-600 flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard size={18} />
                  Dashboard Admin
                </Link>
              )}
              {!isAdmin && (
                <Link href={isTeacher ? "/dashboard/grupuri" : "/dashboard"} className="text-base font-medium text-indigo-600 flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard size={18} />
                  Dashboard
                </Link>
              )}
              <Link href="/help" className="text-base font-medium text-gray-600 flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <HelpCircle size={18} />
                Ajutor
              </Link>
              <form action="/logout" method="post">
                <button type="submit" className="text-base font-medium text-red-600 flex items-center gap-2">
                  <LogOut size={18} />
                  Deconectare
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="text-base font-medium" onClick={() => setMobileOpen(false)}>
                Intră în cont
              </Link>
              <Link href="/preturi" className="text-base font-medium text-violet-600 flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <CreditCard size={18} />
                Prețuri
              </Link>
              <Link href="/help" className="text-base font-medium text-gray-600 flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <HelpCircle size={18} />
                Ajutor
              </Link>
              <Link href="/instaleaza" className="text-base font-medium text-yellow-700 flex items-center gap-2" onClick={() => setMobileOpen(false)}>
                <Smartphone size={18} />
                Instalează app
              </Link>
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white w-full" asChild>
                <Link href="/register" onClick={() => setMobileOpen(false)}>Înscrie-te</Link>
              </Button>
            </>
          )}
        </div>
      )}
    </header>
  );
}
