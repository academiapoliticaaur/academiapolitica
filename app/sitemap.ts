import type { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://academia-aur.ro";

  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl,                           changeFrequency: "weekly"  as const, priority: 1,   lastModified: now },
    { url: `${baseUrl}/courses`,              changeFrequency: "daily"   as const, priority: 0.9, lastModified: now },
    { url: `${baseUrl}/preturi`,              changeFrequency: "monthly" as const, priority: 0.8, lastModified: now },
    { url: `${baseUrl}/formatori`,      changeFrequency: "weekly"  as const, priority: 0.8, lastModified: now },
    { url: `${baseUrl}/despre`,               changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${baseUrl}/help`,                 changeFrequency: "monthly" as const, priority: 0.7, lastModified: now },
    { url: `${baseUrl}/webinars`,             changeFrequency: "weekly"  as const, priority: 0.7, lastModified: now },
    { url: `${baseUrl}/paths`,                changeFrequency: "weekly"  as const, priority: 0.7, lastModified: now },
    { url: `${baseUrl}/termeni`,              changeFrequency: "yearly"  as const, priority: 0.3, lastModified: now },
    { url: `${baseUrl}/confidentialitate`,    changeFrequency: "yearly"  as const, priority: 0.3, lastModified: now },
  ];

  // Cursuri publicate
  try {
    const db = createAdminClient();
    const { data: courses } = await db
      .from("courses")
      .select("slug, updated_at")
      .eq("status", "published")
      .is("deleted_at", null);

    const courseRoutes: MetadataRoute.Sitemap = (courses ?? []).map((c) => ({
      url: `${baseUrl}/courses/${c.slug}`,
      lastModified: c.updated_at ? new Date(c.updated_at) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...staticRoutes, ...courseRoutes];
  } catch {
    return staticRoutes;
  }
}
