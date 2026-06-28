import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ledgerflow.se";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: `${BASE}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/auth/register`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/auth/login`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/integritetspolicy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/anvandarvillkor`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/gdpr`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];
}
