// Google Drive OAuth2 helpers — server-side only

import { createAdminClient } from "@/lib/supabase/admin";

const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";

function getOAuthConfig() {
  return {
    clientId: process.env.GOOGLE_DRIVE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_DRIVE_CLIENT_SECRET!,
    redirectUri: process.env.GOOGLE_DRIVE_REDIRECT_URI!,
  };
}

/** URL pentru autorizare OAuth2 Google */
export function getAuthUrl(): string {
  const { clientId, redirectUri } = getOAuthConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: DRIVE_SCOPE,
    access_type: "offline",
    prompt: "consent",
  });
  return `${GOOGLE_AUTH_URL}?${params.toString()}`;
}

/** Schimbă codul de autorizare cu tokens */
export async function exchangeCodeForTokens(code: string): Promise<{ access_token: string; refresh_token: string }> {
  const { clientId, clientSecret, redirectUri } = getOAuthConfig();
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error(data.error_description ?? "Token exchange failed");
  return data;
}

/** Obține un access_token proaspăt din refresh_token stocat în DB */
export async function getAccessToken(): Promise<string> {
  const db = createAdminClient();
  const { data } = await db.from("admin_settings").select("value").eq("key", "google_drive_refresh_token").single();
  if (!data?.value) throw new Error("Google Drive neconectat. Autorizează din Admin → Settings → Google Drive.");

  const { clientId, clientSecret } = getOAuthConfig();
  const res = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: data.value,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  });
  const tokenData = await res.json();
  if (!tokenData.access_token) throw new Error("Nu s-a putut reînnoi access token-ul Google.");
  return tokenData.access_token;
}

/** Stochează refresh_token în DB */
export async function saveRefreshToken(refreshToken: string): Promise<void> {
  const db = createAdminClient();
  await db.from("admin_settings").upsert({ key: "google_drive_refresh_token", value: refreshToken, updated_at: new Date().toISOString() });
}

/** Verifică dacă Drive e conectat */
export async function isDriveConnected(): Promise<boolean> {
  const db = createAdminClient();
  const { data } = await db.from("admin_settings").select("value").eq("key", "google_drive_refresh_token").single();
  return !!data?.value;
}

/** Asigură ierarhia de foldere Curs → Modul → Lecție și returnează ID-urile */
export async function ensureLessonFolder(params: {
  courseId: string; courseTitle: string;
  moduleId: string; moduleTitle: string;
  lessonId: string; lessonTitle: string;
}): Promise<{ courseFolderId: string; moduleFolderId: string; lessonFolderId: string }> {
  const db = createAdminClient();
  const rootId = await getRootFolder();

  // Course folder
  const { data: course } = await db.from("courses").select("drive_folder_id").eq("id", params.courseId).single();
  let courseFolderId = course?.drive_folder_id ?? null;
  if (!courseFolderId) {
    courseFolderId = await createDriveFolder(params.courseTitle, rootId);
    await db.from("courses").update({ drive_folder_id: courseFolderId }).eq("id", params.courseId);
  }

  // Module folder
  const { data: module_ } = await db.from("modules").select("drive_folder_id").eq("id", params.moduleId).single();
  let moduleFolderId = module_?.drive_folder_id ?? null;
  if (!moduleFolderId) {
    moduleFolderId = await createDriveFolder(params.moduleTitle, courseFolderId);
    await db.from("modules").update({ drive_folder_id: moduleFolderId }).eq("id", params.moduleId);
  }

  // Lesson folder
  const { data: lesson } = await db.from("lessons").select("drive_folder_id").eq("id", params.lessonId).single();
  let lessonFolderId = lesson?.drive_folder_id ?? null;
  if (!lessonFolderId) {
    lessonFolderId = await createDriveFolder(params.lessonTitle, moduleFolderId);
    await db.from("lessons").update({ drive_folder_id: lessonFolderId }).eq("id", params.lessonId);
  }

  return { courseFolderId, moduleFolderId, lessonFolderId };
}

/** Creează un folder în Google Drive și returnează ID-ul */
export async function createDriveFolder(name: string, parentFolderId?: string): Promise<string> {
  const accessToken = await getAccessToken();
  const metadata: Record<string, unknown> = {
    name,
    mimeType: "application/vnd.google-apps.folder",
  };
  if (parentFolderId) metadata.parents = [parentFolderId];

  const res = await fetch("https://www.googleapis.com/drive/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(metadata),
  });
  const data = await res.json();
  if (!data.id) throw new Error(`Nu s-a putut crea folderul: ${data.error?.message ?? "eroare necunoscută"}`);
  return data.id;
}

/** Restricționează (sau permite) copierea/printarea/descărcarea unui fișier Drive
 *  pentru utilizatorii cu acces de tip "vizualizare" — sincronizează bifa "allow_download"
 *  a lecției cu comportamentul real al Google Drive (export=download, print, copy). */
export async function setFileDownloadRestriction(fileId: string, restrict: boolean): Promise<void> {
  const accessToken = await getAccessToken();
  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ copyRequiresWriterPermission: restrict }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({} as { error?: { message?: string } }));
    throw new Error(err.error?.message ?? `Eroare Drive (${res.status})`);
  }
}

/** Obține sau creează folderul rădăcină "Academia Politica AUR — Conținut Cursuri" */
export async function getRootFolder(): Promise<string> {
  const db = createAdminClient();
  const { data: existing } = await db.from("admin_settings").select("value").eq("key", "google_drive_root_folder_id").single();
  if (existing?.value) return existing.value;

  const folderId = await createDriveFolder("Academia Politica AUR — Conținut Cursuri");
  await db.from("admin_settings").upsert({ key: "google_drive_root_folder_id", value: folderId, updated_at: new Date().toISOString() });
  return folderId;
}
