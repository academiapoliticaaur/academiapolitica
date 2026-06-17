export function isStoragePath(url: string): boolean {
  return !url.startsWith("http");
}

export async function resolveStorageUrl(path: string): Promise<string> {
  const res = await fetch(`/api/lesson-asset?path=${encodeURIComponent(path)}`);
  if (!res.ok) throw new Error("Nu s-a putut genera URL-ul pentru fișier");
  const { url, error } = await res.json();
  if (error) throw new Error(error);
  return url;
}
