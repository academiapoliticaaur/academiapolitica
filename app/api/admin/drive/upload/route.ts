export const runtime = "nodejs";
export const maxDuration = 300;

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAccessToken } from "@/lib/google-drive";

// Upload în două faze, ambele proxiate server-to-server (browser → server Ami&Moti → Google),
// pentru a evita atât limita Vercel de ~4.5MB/request, cât și CORS-ul unui upload direct browser → Google:
//   - phase=init  → creează sesiunea de upload resumable la Google Drive, returnează uploadUrl
//   - phase=chunk → transmite UN segment din fișier (Content-Range) către sesiunea Google
export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean);
  const isAdmin = adminEmails.includes(user.email ?? "") || user.app_metadata?.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Acces interzis" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const phase = searchParams.get("phase");

  try {
    const accessToken = await getAccessToken();

    if (phase === "init") {
      const fileName = searchParams.get("fileName");
      const mimeType = searchParams.get("mimeType") || "application/octet-stream";
      const folderId = searchParams.get("folderId");
      const fileSize = searchParams.get("fileSize");

      if (!fileName || !folderId || !fileSize) {
        return NextResponse.json({ error: "fileName, folderId și fileSize sunt obligatorii" }, { status: 400 });
      }

      const sessionRes = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "X-Upload-Content-Type": mimeType,
          "X-Upload-Content-Length": fileSize,
        },
        body: JSON.stringify({ name: fileName, parents: [folderId] }),
      });

      if (!sessionRes.ok) {
        const err = await sessionRes.text();
        return NextResponse.json({ error: `Google Drive error: ${err}` }, { status: 502 });
      }

      const uploadUrl = sessionRes.headers.get("Location");
      if (!uploadUrl) {
        return NextResponse.json({ error: "Google Drive nu a returnat URL de upload" }, { status: 502 });
      }

      return NextResponse.json({ uploadUrl });
    }

    if (phase === "chunk") {
      const uploadUrl = searchParams.get("uploadUrl");
      const start = searchParams.get("start");
      const end = searchParams.get("end");
      const total = searchParams.get("total");

      if (!uploadUrl || start === null || end === null || !total || !req.body) {
        return NextResponse.json({ error: "Parametri lipsă pentru segmentul de upload" }, { status: 400 });
      }

      const chunkSize = Number(end) - Number(start) + 1;

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: {
          "Content-Range": `bytes ${start}-${end}/${total}`,
          "Content-Length": String(chunkSize),
        },
        body: req.body,
        duplex: "half",
      } as RequestInit & { duplex: "half" });

      // 308 Resume Incomplete — Google a primit segmentul, urmează altele
      if (uploadRes.status === 308) {
        return NextResponse.json({ status: "incomplete" });
      }

      if (!uploadRes.ok) {
        const err = await uploadRes.text();
        return NextResponse.json({ error: `Upload eșuat (${uploadRes.status}): ${err}` }, { status: 502 });
      }

      const data = await uploadRes.json() as { id?: string };
      if (!data.id) {
        return NextResponse.json({ error: "Răspuns invalid de la Google Drive" }, { status: 502 });
      }

      return NextResponse.json({ status: "complete", id: data.id });
    }

    return NextResponse.json({ error: "Parametru 'phase' invalid (init|chunk)" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : "Eroare server" }, { status: 500 });
  }
}
