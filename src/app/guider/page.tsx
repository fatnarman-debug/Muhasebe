import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, BookOpen, Check } from "lucide-react";
import { SiteHeader, SiteFooter, SiteStyles } from "@/components/site/SiteChrome";
import { guider } from "@/lib/guider";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enkeltfaktura.com";

export const metadata: Metadata = {
  title: "Guider om moms, ROT och fakturering",
  description:
    "Genomgångar av de regler som avgör hur fakturan ska se ut: ROT-avdrag, omvänd betalningsskyldighet och momsen på mat. Kontrollerade mot Skatteverket.",
  alternates: { canonical: "/guider" },
  openGraph: {
    type: "website",
    locale: "sv_SE",
    url: `${BASE}/guider`,
    siteName: "EnkeltFaktura",
    title: "Guider om moms, ROT och fakturering",
    description: "Reglerna som avgör hur fakturan ska se ut – förklarade utan paragrafspråk.",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Start", item: BASE },
        { "@type": "ListItem", position: 2, name: "Guider", item: `${BASE}/guider` },
      ],
    },
    {
      "@type": "CollectionPage",
      name: "Guider om moms, ROT och fakturering",
      url: `${BASE}/guider`,
      inLanguage: "sv-SE",
      hasPart: guider.map((g) => ({
        "@type": "Article",
        headline: g.titel,
        url: `${BASE}/guider/${g.slug}`,
      })),
    },
  ],
};

export default function GuiderHubb() {
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
            <span className="text-stone-900">Guider</span>
          </nav>

          <h1 className="font-display text-4xl sm:text-5xl leading-[1.06] max-w-2xl" style={{ color: "#13294B" }}>
            Guider om moms, ROT och fakturering
          </h1>
          <p className="text-lg text-stone-700 mt-5 leading-relaxed max-w-2xl">
            Det som brukar gå fel på en faktura är sällan summan – det är momssatsen, en rad som
            saknas eller ett avdrag som räknats på fel underlag. Här går vi igenom reglerna som
            avgör hur fakturan ska se ut, med källan angiven och datum för när den stämdes av.
          </p>
          <p className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-stone-600 mt-6">
            <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600" aria-hidden="true" /> Kontrollerat mot Skatteverket</span>
            <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600" aria-hidden="true" /> Uppdaterat för 2026</span>
          </p>
        </div>
      </section>

      {/* ───── Guiderna ───── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 pb-8">
        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {guider.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guider/${g.slug}`}
                className="group flex h-full flex-col rounded-2xl border border-stone-200 bg-white p-5 hover:border-stone-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="font-semibold text-stone-900">{g.titel}</h2>
                  <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-teal-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" aria-hidden="true" />
                </div>
                <div className="mt-2.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-800 bg-teal-50 border border-teal-100 rounded-full px-2 py-0.5">
                    <BookOpen className="w-3 h-3" aria-hidden="true" /> {g.etikett}
                  </span>
                </div>
                <p className="text-sm text-stone-700 leading-relaxed mt-3">{g.lead}</p>
                {/*
                  Datumet sist i kortet, dampat. Skattereglerna andras, och den
                  som star med en faktura framfor sig vill veta om texten ar
                  aktuell - men det ar inte det forsta man laser.
                */}
                <p className="text-xs text-stone-500 mt-4 pt-3 border-t border-stone-100">
                  Kontrollerad {g.kontrollerad}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ───── Avslut ───── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-12">
        <div className="rounded-[1.4rem] border border-stone-200 bg-white p-7 sm:p-9 text-center">
          <h2 className="font-display text-2xl sm:text-3xl text-stone-950">Reglerna är inbyggda i programmet</h2>
          <p className="text-stone-700 mt-3 leading-relaxed max-w-xl mx-auto">
            Du behöver inte hålla satserna i huvudet. EnkeltFaktura räknar ROT och RUT på
            arbetskostnaden, håller isär momssatserna per rad och skriver ut texten som krävs när
            momsen inte ska läggas på.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center gap-2 bg-[#13294B] hover:bg-[#1e3a63] text-white font-semibold px-6 py-3.5 rounded-full transition-colors mt-7"
          >
            Testa gratis i 14 dagar <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <SiteFooter anchorBase="/" />
    </div>
  );
}
