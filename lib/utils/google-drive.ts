const DRIVE_PATTERNS = [
  /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/,
  /drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/,
  /docs\.google\.com\/(?:document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/,
];

export function getGoogleDriveFileId(url: string): string | null {
  for (const pattern of DRIVE_PATTERNS) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function isGoogleDriveUrl(url: string): boolean {
  return url.includes("drive.google.com") || url.includes("docs.google.com");
}

export function getLinkLabel(url: string): string {
  if (url.includes("youtube.com") || url.includes("youtu.be")) return "YouTube";
  if (url.includes("docs.google.com/presentation")) return "Google Slides";
  if (url.includes("docs.google.com/document")) return "Google Docs";
  if (url.includes("drive.google.com") || url.includes("docs.google.com")) return "Google Drive";
  return "Link extern";
}

// Accepts optional original URL to detect Google Slides vs Drive file
export function getGoogleDriveEmbedUrl(fileId: string, originalUrl?: string): string {
  if (originalUrl?.includes("docs.google.com/presentation")) {
    return `https://docs.google.com/presentation/d/${fileId}/embed?start=false&loop=false&delayms=3000`;
  }
  if (originalUrl?.includes("docs.google.com/document")) {
    return `https://docs.google.com/document/d/${fileId}/preview`;
  }
  return `https://drive.google.com/file/d/${fileId}/preview`;
}
