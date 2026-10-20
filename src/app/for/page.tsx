import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Percent, ShieldCheck } from "lucide-react";
import { SiteHeader, SiteFooter, SiteStyles } from "@/components/site/SiteChrome";
import { yrken, kategorier } from "@/lib/yrken";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enkeltfaktura.com";

export const metadata: Metadata = {
  title: "Fakturaprogram för ditt yrke",
  description:
    "Hitta hur fakturering fungerar i just ditt yrke – med ROT, RUT eller utan avdrag. Snickare, elektriker, frisör, fotograf, konsult och fler.",
  alternates: { canonical: "/for" },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: `${BASE}/for`,
    siteName: "EnkeltFaktura",
    title: "Fakturaprogram för ditt yrke",
    description: "Fakturering anpassad efter yrke – ROT, RUT eller utan avdrag.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Start", item: BASE },
        { "@type": "ListItem", position: 2, name: "För vem", item: `${BASE}/for` },
      ],
    },
    {
      "@type": "CollectionPage",
      name: "Fakturaprogram för ditt yrke",
      url: `${BASE}/for`,
      inLanguage: "sv-SE",
      hasPart: yrken.map((y) => ({
        "@type": "WebPage",
        name: `Fakturaprogram för ${y.namn}`,
        url: `${BASE}/for/${y.slug}`,
      })),
    },
  ],
};

function AvdragsMarke({ avdrag }: { avdrag: "rot" | "rut" | null }) {
  if (!avdrag) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-stone-600 bg-stone-100 rounded-full px-2 py-0.5">
        <ShieldCheck className="w-3 h-3" aria-hidden="true" /> Utan ROT/RUT-avdrag
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-100 rounded-full px-2 py-0.5">
      <Percent className="w-3 h-3" aria-hidden="true" />
      {avdrag === "rot" ? "ROT 30 %" : "RUT 50 %"}
    </span>
  );
}

export default function ForHubb() {
  return (
    <div className="min-h-screen bg-[#faf8f3] text-stone-900 selection:bg-[#13294B]/15 antialiased">
      <SiteStyles />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader anchorBase="/" />

      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_80%_-5%,#e7f6f4_0%,transparent_60%)]" />
        <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14 pb-12">
          <nav aria-label="Brödsmula" className="text-sm text-stone-600 mb-8">
            <Link href="/" className="hover:text-stone-900">Start</Link>
            <span className="mx-2 text-stone-400" aria-hidden="true">/</span>
            <span className="text-stone-900">För vem</span>
          </nav>

          <h1 className="font-display text-4xl sm:text-5xl leading-[1.06] max-w-2xl" style={{ color: "#13294B" }}>
            Fakturaprogram för ditt yrke
          </h1>
          <p className="text-lg text-stone-700 mt-5 leading-relaxed max-w-2xl">
            Fakturering ser olika ut beroende på vad du gör. En snickare ska hålla isär arbete och
            material för ROT-avdraget. En fotograf kan fakturera förskott och ersättning för nyttjanderätt. Välj ditt
            yrke så visar vi hur det fungerar i praktiken.
          </p>
          <p className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-stone-600 mt-6">
            <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600" /> 14 dagar gratis</span>
            <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600" /> Inget kreditkort</span>
            <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600" /> 79 kr/mån därefter</span>
          </p>
        </div>
      </section>

      {/* ───── Yrken per kategori ───── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 pb-8">
        {kategorier.map((kat) => {
          const lista = yrken.filter((y) => y.kategori === kat.id);
          if (lista.length === 0) return null;
          return (
            <div key={kat.id} className="py-10 border-t border-stone-200/70 first:border-t-0 first:pt-0">
              <div className="max-w-xl">
                <h2 className="font-display text-2xl sm:text-3xl text-stone-950">{kat.namn}</h2>
                <p className="text-stone-700 mt-2 leading-relaxed">{kat.ingress}</p>
              </div>
              <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-7">
                {lista.map((y) => (
                  <li key={y.slug}>
                    <Link
                      href={`/for/${y.slug}`}
                      className="group block h-full rounded-2xl border border-stone-200 bg-white p-5 hover:border-stone-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="font-semibold text-stone-900 first-letter:capitalize">{y.namn}</h3>
                        <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" aria-hidden="true" />
                      </div>
                      <div className="mt-2.5">
                        <AvdragsMarke avdrag={y.avdrag} />
                      </div>
                      <p className="text-sm text-stone-700 leading-relaxed mt-3 line-clamp-3">{y.lead}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>

      {/* ───── Saknas ditt yrke ───── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-12">
        <div className="rounded-[1.4rem] border border-stone-200 bg-white p-7 sm:p-9 text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-stone-950">Saknas ditt yrke?</h2>
          <p className="text-stone-700 mt-3 leading-relaxed max-w-xl mx-auto">
            Fler yrkessidor är på väg. Under tiden fungerar EnkeltFaktura likadant oavsett vad du gör –
            med eller utan ROT och RUT. Skapa ett konto och testa med din nästa faktura.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 bg-[#13294B] hover:bg-[#1e3a63] text-white font-semibold px-6 py-3.5 rounded-full transition-colors mt-7"
          >
            Testa gratis i 14 dagar <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <SiteFooter anchorBase="/" />
    </div>
  );
}
