import type { MetadataRoute } from "next";
import { yrkeSlugs } from "@/lib/yrken";
import { guider } from "@/lib/guider";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enkeltfaktura.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },

    // Hubbsidor
    { url: `${BASE}/priser`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/for`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/for/enskild-firma`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${BASE}/for/hantverkare`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },

    // Yrkessidor – kommer automatiskt fran src/lib/yrken.ts
    ...yrkeSlugs.map((slug) => ({
      url: `${BASE}/for/${slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),

    // Guider – listan kommer fran src/lib/guider.ts, samma kalla som /guider
    { url: `${BASE}/guider`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    ...guider.map((g) => ({
      url: `${BASE}/guider/${g.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),

    // Inloggning och registrering ligger inte har. De ar satta till noindex i
    // src/app/auth/layout.tsx, och en sida som bade lamnas in i sitemapen och
    // sager noindex rapporteras av Google som ett fel.
    { url: `${BASE}/integritetspolicy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/anvandarvillkor`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/gdpr`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
