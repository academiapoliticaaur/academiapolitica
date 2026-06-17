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
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Ami & Moti — Platformă educațională pentru copii",
    template: "%s | Ami & Moti",
  },
  description:
    "O platformă educațională prietenoasă pentru copiii din clasele 0–8. Cursuri, lecții, filme și activități interactive cu Ami și Moti.",
  keywords: ["educație", "copii", "cursuri online", "școală", "lecții interactive"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Ami & Moti",
  },
  openGraph: {
    siteName: "Ami & Moti",
    type: "website",
    locale: "ro_RO",
    url: process.env.NEXT_PUBLIC_APP_URL ?? "https://ami-moti.everydai.ro",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Ami & Moti — Platformă educațională" }],
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
