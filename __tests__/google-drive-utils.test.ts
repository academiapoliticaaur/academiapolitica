import { describe, it, expect } from "vitest";
import {
  getGoogleDriveFileId,
  isGoogleDriveUrl,
  getLinkLabel,
  getGoogleDriveEmbedUrl,
} from "@/lib/utils/google-drive";

describe("getGoogleDriveFileId", () => {
  it("extrage ID din URL drive.google.com/file/d/", () => {
    const id = getGoogleDriveFileId("https://drive.google.com/file/d/1abc123XYZ/view");
    expect(id).toBe("1abc123XYZ");
  });

  it("extrage ID din URL drive.google.com/open?id=", () => {
    const id = getGoogleDriveFileId("https://drive.google.com/open?id=fileId_99");
    expect(id).toBe("fileId_99");
  });

  it("extrage ID din URL Google Slides", () => {
    const id = getGoogleDriveFileId("https://docs.google.com/presentation/d/slideId456/edit");
    expect(id).toBe("slideId456");
  });

  it("extrage ID din URL Google Docs", () => {
    const id = getGoogleDriveFileId("https://docs.google.com/document/d/docId789/edit");
    expect(id).toBe("docId789");
  });

  it("returnează null pentru URL ne-Drive", () => {
    expect(getGoogleDriveFileId("https://youtube.com/watch?v=abc")).toBeNull();
    expect(getGoogleDriveFileId("https://example.com")).toBeNull();
    expect(getGoogleDriveFileId("")).toBeNull();
  });
});

describe("isGoogleDriveUrl", () => {
  it("recunoaște URL-uri drive.google.com", () => {
    expect(isGoogleDriveUrl("https://drive.google.com/file/d/abc")).toBe(true);
  });

  it("recunoaște URL-uri docs.google.com", () => {
    expect(isGoogleDriveUrl("https://docs.google.com/presentation/d/abc")).toBe(true);
  });

  it("respinge URL-uri ne-Drive", () => {
    expect(isGoogleDriveUrl("https://youtube.com/watch?v=abc")).toBe(false);
    expect(isGoogleDriveUrl("https://example.com/file")).toBe(false);
  });
});

describe("getLinkLabel", () => {
  it("returnează YouTube pentru youtube.com", () => {
    expect(getLinkLabel("https://www.youtube.com/watch?v=abc")).toBe("YouTube");
  });

  it("returnează YouTube pentru youtu.be", () => {
    expect(getLinkLabel("https://youtu.be/abc123")).toBe("YouTube");
  });

  it("returnează Google Slides pentru docs.google.com/presentation", () => {
    expect(getLinkLabel("https://docs.google.com/presentation/d/abc")).toBe("Google Slides");
  });

  it("returnează Google Docs pentru docs.google.com/document", () => {
    expect(getLinkLabel("https://docs.google.com/document/d/abc")).toBe("Google Docs");
  });

  it("returnează Google Drive pentru drive.google.com", () => {
    expect(getLinkLabel("https://drive.google.com/file/d/abc")).toBe("Google Drive");
  });

  it("returnează Link extern pentru alte URL-uri", () => {
    expect(getLinkLabel("https://example.com/file.pdf")).toBe("Link extern");
  });
});

describe("getGoogleDriveEmbedUrl", () => {
  const FILE_ID = "abc123";

  it("generează embed URL pentru Google Slides", () => {
    const url = getGoogleDriveEmbedUrl(
      FILE_ID,
      "https://docs.google.com/presentation/d/abc123/edit"
    );
    expect(url).toContain("docs.google.com/presentation/d/abc123/embed");
  });

  it("generează embed URL pentru Google Docs", () => {
    const url = getGoogleDriveEmbedUrl(
      FILE_ID,
      "https://docs.google.com/document/d/abc123/edit"
    );
    expect(url).toContain("docs.google.com/document/d/abc123/preview");
  });

  it("generează embed URL Drive pentru fișiere generice", () => {
    const url = getGoogleDriveEmbedUrl(FILE_ID, "https://drive.google.com/file/d/abc123/view");
    expect(url).toBe(`https://drive.google.com/file/d/${FILE_ID}/preview`);
  });

  it("generează embed URL Drive dacă originalUrl lipsește", () => {
    const url = getGoogleDriveEmbedUrl(FILE_ID);
    expect(url).toBe(`https://drive.google.com/file/d/${FILE_ID}/preview`);
  });
});
