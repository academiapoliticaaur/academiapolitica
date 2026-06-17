import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAccessToken, setFileDownloadRestriction } from "@/lib/google-drive";

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Neautorizat" }, { status: 401 });

  const adminEmails = (process.env.ADMIN_EMAILS || "").split(",").map(e => e.trim()).filter(Boolean);
  const isAdmin = adminEmails.includes(user.email ?? "") || user.app_metadata?.role === "admin";
  if (!isAdmin) return NextResponse.json({ error: "Acces interzis" }, { status: 403 });

  const { fileId, lessonId, field } = await req.json() as {
    fileId: string;
    lessonId: string;
    field: "presentation_url" | "worksheet_url" | "video_url";
  };

  const allowedFields = ["presentation_url", "worksheet_url", "video_url"];
  if (!fileId || !lessonId || !allowedFields.includes(field)) {
    return NextResponse.json({ error: "fileId, lessonId și field valid sunt obligatorii" }, { status: 400 });
  }

  try {
    const accessToken = await getAccessToken();

    const permRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: "reader", type: "anyone" }),
      }
    );

    if (!permRes.ok) {
      const err = await permRes.text();
      return NextResponse.json({ error: `Eroare permisiune Drive: ${err}` }, { status: 502 });
    }

    const db = createAdminClient();

    // Sincronizează restricția de copiere/printare/descărcare cu bifa "allow_download" a lecției
    const { data: lessonRow } = await db.from("lessons").select("allow_download").eq("id", lessonId).single();
    try {
      await setFileDownloadRestriction(fileId, !(lessonRow?.allow_download ?? false));
    } catch (e) {
      console.error("Eroare sincronizare restricție descărcare Drive:", e);
    }

    const url = `https://drive.google.com/file/d/${fileId}/view`;

    const { error: dbErr } = await db
      .from("lessons")
      .update({ [field]: url })
      .eq("id", lessonId);

    if (dbErr) {
      return NextResponse.json({ error: `Eroare salvare DB: ${dbErr.message}` }, { status: 500 });
    }

    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Eroare server" },
      { status: 500 }
    );
  }
}
