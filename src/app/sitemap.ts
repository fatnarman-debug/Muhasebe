import type { MetadataRoute } from "next";
import { yrkeSlugs } from "@/lib/yrken";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enkeltfaktura.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },

    // Hubbsida for hantverkare
    { url: `${BASE}/for/hantverkare`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },

    // Yrkessidor – kommer automatiskt fran src/lib/yrken.ts
    ...yrkeSlugs.map((slug) => ({
      url: `${BASE}/for/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),

    { url: `${BASE}/auth/register`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/auth/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/integritetspolicy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/anvandarvillkor`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/gdpr`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
