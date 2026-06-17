import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const path = req.nextUrl.searchParams.get("path");
  if (!path) return NextResponse.json({ error: "Missing path" }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const slashIdx = path.indexOf("/");
  if (slashIdx === -1) return NextResponse.json({ error: "Invalid path format" }, { status: 400 });

  const bucket = path.substring(0, slashIdx);
  const filePath = path.substring(slashIdx + 1);

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(filePath, 3600);

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Storage error" }, { status: 500 });
  }

  return NextResponse.json({ url: data.signedUrl });
}
