import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ChatWidget } from "@/components/common/chat-widget";
import { PwaRegister } from "@/components/common/pwa-register";
import { CookieConsent } from "@/components/common/cookie-consent";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#b8860b",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Academia Politica AUR — Platformă de formare politică",
    template: "%s | Academia Politica AUR",
  },
  description:
    "Platformă de formare politică și educație civică a Alianței pentru Unirea Românilor. Cursuri, seminarii și materiale pentru membrii și simpatizanții AUR.",
  keywords: ["politică", "AUR", "formare politică", "educație civică", "cursuri online", "România"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Academia Politica AUR",
  },
  openGraph: {
    siteName: "Academia Politica AUR",
    type: "website",
    locale: "ro_RO",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://academia-aur.ro",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Academia Politica AUR" }],
  },
  twitter: {
    card: "summary_large_image",
  },
  icons: {
    icon: "/icon-192.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased bg-white text-gray-900">
        {children}
        <ChatWidget />
        <PwaRegister />
        <CookieConsent />
      </body>
    </html>
  );
}
