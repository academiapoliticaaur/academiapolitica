import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isDriveConnected } from "@/lib/google-drive";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Google Drive — Admin" };

export default async function GoogleDriveSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; error?: string }>;
}) {
  const { success, error } = await searchParams;
  const connected = await isDriveConnected();

  const errorMessages: Record<string, string> = {
    auth_denied: "Autorizarea a fost refuzată. Încearcă din nou.",
    no_refresh_token: "Google nu a returnat un refresh token. Asigură-te că ai selectat 'Allow' și că aplicația are 'offline access'.",
    token_exchange: "Eroare la schimbul de token. Verifică CLIENT_ID și CLIENT_SECRET în Vercel.",
  };

  return (
    <div className="max-w-lg">
      <Button variant="ghost" size="sm" asChild className="gap-2 -ml-2 mb-6">
        <Link href="/admin">
          <ArrowLeft size={16} />
          Dashboard
        </Link>
      </Button>

      <h1 className="text-2xl font-bold mb-1">Google Drive</h1>
      <p className="text-sm text-gray-500 mb-6">
        Conectează contul Google Drive pentru a selecta fișiere direct din Drive în editorul de lecții.
      </p>

      {/* Status mesaje */}
      {success === "connected" && (
        <div className="mb-4 flex items-center gap-3 bg-teal-50 border border-teal-200 rounded-xl p-4">
          <CheckCircle size={20} className="text-teal-500 shrink-0" />
          <p className="text-teal-800 text-sm font-medium">Google Drive conectat cu succes!</p>
        </div>
      )}
      {error && (
        <div className="mb-4 flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
          <XCircle size={20} className="text-red-500 shrink-0" />
          <p className="text-red-700 text-sm">{errorMessages[error] ?? "Eroare necunoscută."}</p>
        </div>
      )}

      {/* Status conectare */}
      <div className="bg-white rounded-xl border p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${connected ? "bg-teal-500" : "bg-gray-300"}`} />
          <span className="font-medium text-gray-800">
            {connected ? "Conectat la Google Drive" : "Neconectat"}
          </span>
        </div>

        {connected ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Poți selecta fișiere din Drive direct în editorul de lecții. Folderele sunt create automat conform structurii cursurilor.
            </p>
            <div className="flex gap-2">
              <Button asChild variant="outline" size="sm" className="gap-2">
                <a href="/api/admin/drive/auth">
                  <ExternalLink size={14} />
                  Reconectează
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-500">
              Conectează contul <strong>mpandilica@gmail.com</strong> pentru a activa selectarea fișierelor din Google Drive.
            </p>
            <Button asChild className="bg-blue-100 hover:bg-blue-200 text-blue-700 gap-2">
              <a href="/api/admin/drive/auth">
                <ExternalLink size={16} />
                Conectează Google Drive
              </a>
            </Button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-gray-50 rounded-xl border p-4 text-xs text-gray-500 space-y-1">
        <p>📁 Folderul rădăcină: <strong>Academia Politica AUR — Conținut Cursuri</strong></p>
        <p>🔒 Accesibil doar din panoul Admin</p>
        <p>🔄 Token-ul se reînnoiește automat</p>
      </div>
    </div>
  );
}
