import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://ledgerflow.se";

// Privata app-rutter ska inte indexeras — bara marknadssidan (/) och auth.
const DISALLOW = ["/dashboard/", "/yetkili/", "/konsult/", "/admin/", "/api/"];

// AI-sökmotorer & assistenter som uttryckligen tillåts (GEO/AEO).
const AI_BOTS = [
  "GPTBot", "OAI-SearchBot", "ChatGPT-User",      // OpenAI / ChatGPT
  "ClaudeBot", "anthropic-ai", "Claude-Web",        // Anthropic / Claude
  "PerplexityBot", "Perplexity-User",               // Perplexity
  "Google-Extended",                                 // Google Gemini / AI Overviews
  "Applebot-Extended",                               // Apple Intelligence
  "Bytespider", "CCBot", "cohere-ai", "Meta-ExternalAgent", "Amazonbot",
];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: DISALLOW },
      // Uttryckligen tillåt AI-botar att läsa och citera publika sidor
      ...AI_BOTS.map((bot) => ({ userAgent: bot, allow: "/", disallow: DISALLOW })),
    ],
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
