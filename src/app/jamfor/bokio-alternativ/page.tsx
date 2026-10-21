import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, ExternalLink, AlertCircle } from "lucide-react";
import { SiteHeader, SiteFooter, SiteStyles } from "@/components/site/SiteChrome";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enkeltfaktura.com";
const PATH = "/jamfor/bokio-alternativ";

/* Priser kontrollerade mot bokio.se/priser 2026-10-20.
   Konkurrentpriser andras – kontrollera om mot kallan innan sidan uppdateras,
   och flytta fram KONTROLLERAD. En felaktig prisuppgift om en konkurrent ar
   bade ett trovardighets- och ett rattsligt problem. */
const KONTROLLERAD = "21 oktober 2026";

export const metadata: Metadata = {
  title: "Bokio-alternativ 2026 – vad kostar det att fakturera?",
  description:
    "I Bokio Basic kostar fakturering 89 kr/mån extra. Jämför vad du faktiskt betalar för att fakturera – och när Bokio ändå är rätt val.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "sv_SE",
    url: `${BASE}${PATH}`,
    siteName: "EnkeltFaktura",
    title: "Bokio-alternativ 2026 – vad kostar det att fakturera?",
    description: "Vad kostar det att fakturera i Bokio 2026? Och när är ett renodlat fakturaprogram billigare?",
  },
};

const faqs = [
  {
    q: "Vad kostar Bokio i dag?",
    a: "Bokios prislista innehåller betalda abonnemang och en kostnadsfri provperiod på 14 dagar. Billigaste planen Basic kostar 269 kronor i månaden vid årsbetalning. Kontrollera alltid aktuellt pris hos Bokio innan du bestämmer dig.",
  },
  {
    q: "Ingår fakturering i Bokios grundplan?",
    a: "I Bokio Basic är fakturering ett tillägg som kostar 89 kronor i månaden utöver planen. I Premium ingår fakturering. För den som väljer Basic blir alltså den faktiska månadskostnaden plan plus tillägg, inte bara planens pris.",
  },
  {
    q: "Är EnkeltFaktura ett bokföringsprogram?",
    a: "Nej. EnkeltFaktura gör fakturor och offerter – inte löpande bokföring, momsdeklaration eller bokslut. Behöver du bokföring i samma system är Bokio eller Fortnox rätt val. Behöver du bara fakturera är ett renodlat fakturaprogram både enklare och billigare.",
  },
  {
    q: "Kan jag flytta mina kunduppgifter från Bokio?",
    a: "Kunduppgifter som namn, organisationsnummer och adress lägger du in i EnkeltFaktura när du skapar kunden. Historiska fakturor behöver du spara enligt bokföringslagen – exportera dem från Bokio innan du avslutar ditt konto där, oavsett vilket program du byter till.",
  },
  {
    q: "Vad händer med fakturanumreringen när jag byter?",
    a: "Du anger själv vilket nummer serien ska börja på. Fortsätter du din gamla serie anger du nästa lediga fakturanummer. Varje faktura ska ha ett unikt löpnummer, men numreringen behöver inte ligga i en enda serie.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Start", item: BASE },
        { "@type": "ListItem", position: 2, name: "Jämför", item: `${BASE}/jamfor` },
        { "@type": "ListItem", position: 3, name: "Bokio-alternativ", item: `${BASE}${PATH}` },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ],
};

const kr = (n: number) => n.toLocaleString("sv-SE") + " kr";
const BOKIO_BAS = 269;
const BOKIO_FAKTURA = 89;
const BOKIO_TOTALT = BOKIO_BAS + BOKIO_FAKTURA;
const EF = 79;
const SKILLNAD_AR = (BOKIO_TOTALT - EF) * 12;

export default function BokioAlternativ() {
  return (
    <div className="min-h-screen bg-[#faf8f3] text-stone-900 selection:bg-[#13294B]/15 antialiased">
      <SiteStyles />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader anchorBase="/" />

      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_80%_-5%,#e7f6f4_0%,transparent_60%)]" />
        <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14 pb-14">
          <nav aria-label="Brödsmula" className="text-sm text-stone-600 mb-8">
            <Link href="/" className="hover:text-stone-900">Start</Link>
            <span className="mx-2 text-stone-400" aria-hidden="true">/</span>
            <span className="text-stone-900">Bokio-alternativ</span>
          </nav>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-start">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.2rem] leading-[1.07]" style={{ color: "#13294B" }}>
                Bokio-alternativ: vad kostar det att fakturera?
              </h1>
              <p className="text-lg text-stone-700 mt-5 leading-relaxed max-w-xl">
                Bokios aktuella prislista innehåller betalda abonnemang och en kostnadsfri
                provperiod på 14 dagar. Många som framför allt vill skicka fakturor upptäcker
                dessutom att fakturering är ett separat tillägg i den billigaste planen.
              </p>
              <p className="text-stone-700 mt-4 leading-relaxed max-w-xl">
                Den här sidan räknar på vad det faktiskt kostar, och är lika tydlig med när Bokio
                ändå är det bättre valet.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-8">
                <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 bg-[#13294B] hover:bg-[#1e3a63] text-white font-semibold px-6 py-3.5 rounded-full transition-colors">
                  Testa gratis i 14 dagar <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#kostnad" className="inline-flex items-center justify-center gap-2 text-stone-700 bg-white border border-stone-200 hover:border-stone-300 font-medium px-6 py-3.5 rounded-full transition-colors">
                  Se kostnaden
                </a>
              </div>
            </div>

            {/* Snabbsvar – skrivet for att citeras rakt av */}
            <aside className="rounded-[1.4rem] border border-stone-200 bg-white p-7 sm:p-8 shadow-xl shadow-stone-900/[0.06]">
              <h2 className="font-semibold text-stone-900">Kort svar</h2>
              <p className="text-[15px] text-stone-700 leading-relaxed mt-3">
                Bokios billigaste plan Basic kostar <strong>{kr(BOKIO_BAS)}/mån</strong> vid
                årsbetalning, och fakturering är där ett tillägg på{" "}
                <strong>{kr(BOKIO_FAKTURA)}/mån</strong>. Den som vill fakturera i Basic landar
                alltså på omkring <strong>{kr(BOKIO_TOTALT)}/mån</strong>. Fakturering ingår i
                Premium. EnkeltFaktura kostar <strong>{kr(EF)}/mån</strong> med fakturering
                inkluderad, men gör inte löpande bokföring.
              </p>
              <p className="text-sm text-stone-600 mt-4 pt-4 border-t border-stone-100">
                Priser hämtade från bokio.se {KONTROLLERAD}. Kontrollera alltid aktuellt pris hos
                källan innan du bestämmer dig.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* ───── Kostnadsjamforelse ───── */}
      <section id="kostnad" className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-teal-700 mb-3">Vad det kostar att fakturera</p>
          <h2 className="font-display text-3xl sm:text-4xl text-stone-950">
            Priset på planen är inte hela priset
          </h2>
        </div>

        <div className="mt-10 rounded-[1.4rem] border border-stone-200 bg-white overflow-hidden">
          <table className="w-full text-[15px]">
            <caption className="sr-only">Månadskostnad för att skicka fakturor</caption>
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th scope="col" className="text-left font-semibold text-stone-900 px-6 py-4">Kostnad per månad</th>
                <th scope="col" className="text-right font-semibold text-stone-900 px-6 py-4">Bokio Basic<br /><span className="font-normal text-stone-600 text-sm">+ fakturering</span></th>
                <th scope="col" className="text-right font-semibold text-stone-900 px-6 py-4">EnkeltFaktura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <th scope="row" className="text-left font-normal text-stone-700 px-6 py-4">Grundplan</th>
                <td className="text-right px-6 py-4 tabular-nums">{kr(BOKIO_BAS)} <span className="text-stone-600 text-sm">Basic</span></td>
                <td className="text-right px-6 py-4 tabular-nums">{kr(EF)} <span className="text-stone-600 text-sm">Egen</span></td>
              </tr>
              <tr>
                <th scope="row" className="text-left font-normal text-stone-700 px-6 py-4">Fakturering</th>
                <td className="text-right px-6 py-4 tabular-nums">+{kr(BOKIO_FAKTURA)} <span className="text-stone-600 text-sm">tillägg</span></td>
                <td className="text-right px-6 py-4 text-teal-700 font-medium">Ingår</td>
              </tr>
              <tr className="bg-stone-50">
                <th scope="row" className="text-left font-semibold text-stone-900 px-6 py-5">För att skicka fakturor</th>
                <td className="text-right font-bold text-stone-900 px-6 py-5 text-lg tabular-nums">{kr(BOKIO_TOTALT)}</td>
                <td className="text-right font-bold text-stone-900 px-6 py-5 text-lg tabular-nums">{kr(EF)}</td>
              </tr>
            </tbody>
          </table>
          <div className="px-6 py-4 border-t border-dashed border-stone-200 text-sm text-stone-700 flex flex-wrap items-center gap-x-2 gap-y-1">
            <span>Skillnad: <strong>{kr(SKILLNAD_AR)}</strong> per år. Priser kontrollerade {KONTROLLERAD} –</span>
            <a href="https://www.bokio.se/priser/" target="_blank" rel="noopener nofollow" className="inline-flex items-center gap-1 underline hover:text-stone-900">
              se Bokios prissida <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        <p className="text-sm text-stone-700 mt-5 max-w-2xl leading-relaxed">
          Basic vid årsbetalning; EnkeltFaktura Egen vid månadsbetalning. Priser exklusive moms.
          Jämförelsen gäller den som vill skicka fakturor – Bokio har fler funktioner i de dyrare
          planerna, och fakturering ingår i Premium. Kontrollera vilka funktioner och avgifter som
          ingår i den plan du jämför.
        </p>
      </section>

      {/* ───── Nar Bokio ar ratt val ───── */}
      <section className="bg-white border-y border-stone-200/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-teal-700 mb-3">Ärligt talat</p>
            <h2 className="font-display text-3xl sm:text-4xl text-stone-950">
              När Bokio är rätt val – och när vi är det
            </h2>
            <p className="text-stone-700 mt-4 leading-relaxed">
              Det här är inte samma sorts produkt. Bokio är ett bokföringsprogram med fakturering
              som tillägg. EnkeltFaktura är ett fakturaprogram, punkt. Vilket som är rätt beror
              helt på vad du behöver.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-12">
            <div className="rounded-[1.4rem] border border-stone-200 p-7">
              <h3 className="font-semibold text-stone-900 text-lg">Välj Bokio om du</h3>
              <ul className="mt-5 space-y-3">
                {[
                  "behöver löpande bokföring i samma system",
                  "ska göra momsdeklaration och bokslut själv",
                  "vill ha automatisk överföring av banktransaktioner",
                  "driver aktiebolag med fler rapporteringskrav",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[15px] text-stone-700">
                    <Check className="w-4 h-4 text-stone-500 mt-1 shrink-0" aria-hidden="true" /> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.4rem] border-2 border-teal-200 bg-teal-50/30 p-7">
              <h3 className="font-semibold text-stone-900 text-lg">Välj EnkeltFaktura om du</h3>
              <ul className="mt-5 space-y-3">
                {[
                  "framför allt behöver skicka fakturor och offerter",
                  "jobbar med ROT eller RUT och vill slippa räkna för hand",
                  "redan har en redovisningskonsult som sköter bokföringen",
                  "vill betala för fakturering, inte för moduler du inte använder",
                ].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-[15px] text-stone-800">
                    <Check className="w-4 h-4 text-teal-600 mt-1 shrink-0" aria-hidden="true" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5 flex items-start gap-3 max-w-3xl">
            <AlertCircle className="w-5 h-5 text-stone-500 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-sm text-stone-700 leading-relaxed">
              Behöver du både bokföring och fakturering i ett och samma system är EnkeltFaktura
              inte rätt verktyg. Vi gör inte löpande bokföring, momsdeklaration eller bokslut – och
              tänker inte låtsas något annat för att vinna en jämförelse.
            </p>
          </div>
        </div>
      </section>

      {/* ───── Byta ───── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-teal-700 mb-3">Byta program</p>
          <h2 className="font-display text-3xl sm:text-4xl text-stone-950">Så gör du bytet rätt</h2>
        </div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {[
            { n: "01", t: "Exportera din historik", d: "Ladda ner tidigare fakturor och underlag från Bokio innan du avslutar kontot. Enligt bokföringslagen ska materialet sparas i sju år." },
            { n: "02", t: "Lägg in företaget", d: "Logotyp, bankgiro, momssats och fakturamall – en gång, sedan följer de med på varje faktura." },
            { n: "03", t: "Fortsätt nummerserien", d: "Fortsätter du samma serie anger du nästa lediga fakturanummer. Varje faktura ska ha ett unikt löpnummer." },
            { n: "04", t: "Säg upp i rätt ordning", d: "Avsluta först när exporten är klar och första fakturan gått ut från det nya systemet." },
          ].map((s) => (
            <li key={s.n} className="rounded-2xl border border-stone-200 bg-white p-5">
              <div aria-hidden="true" className="font-display text-4xl text-teal-600 leading-none">{s.n}</div>
              <p className="font-semibold text-stone-900 mt-3">{s.t}</p>
              <p className="text-sm text-stone-700 leading-relaxed mt-1.5">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ───── FAQ ───── */}
      <section className="bg-white border-y border-stone-200/70">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <h2 className="font-display text-3xl sm:text-4xl text-stone-950">Vanliga frågor</h2>
          <div className="mt-10 divide-y divide-stone-200">
            {faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex items-start justify-between gap-4 cursor-pointer list-none font-semibold text-stone-900">
                  {f.q}
                  <span className="shrink-0 text-stone-400 transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="text-[15px] text-stone-700 leading-relaxed mt-3">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-6 py-16 sm:py-24 text-center">
        <h2 className="font-display text-3xl sm:text-4xl text-stone-950">Testa innan du bestämmer dig</h2>
        <p className="text-stone-700 mt-4 leading-relaxed max-w-lg mx-auto">
          14 dagar gratis utan kreditkort. Skicka en riktig faktura och se om det räcker för dig –
          behåll Bokio under tiden om du vill jämföra sida vid sida.
        </p>
        <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 bg-[#13294B] hover:bg-[#1e3a63] text-white font-semibold px-7 py-4 rounded-full transition-colors mt-8">
          Skapa konto gratis <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-sm text-stone-600 mt-6">
          Jobbar du med ROT eller RUT?{" "}
          <Link href="/for/hantverkare" className="underline hover:text-stone-900">Se hur avdraget räknas ut</Link>
        </p>
      </section>

      <SiteFooter anchorBase="/" />
    </div>
  );
}
