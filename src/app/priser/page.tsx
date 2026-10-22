import type { Metadata } from "next";
import Link from "next/link";
import { Check, Minus, ArrowRight } from "lucide-react";
import { SiteHeader, SiteFooter, SiteStyles } from "@/components/site/SiteChrome";

/* Priser pa egen sida. Priserna fanns tidigare bara inbakade pa startsidan,
   vilket gor dem osynliga for den som soker direkt pa pris. Siffrorna maste
   halla ihop med plans[] i src/app/page.tsx - andras den ena ska den andra
   andras samtidigt. */

const BASE = "https://enkeltfaktura.com";
const PATH = "/priser";

export const metadata: Metadata = {
  title: "Priser – fakturaprogram från 79 kr/mån",
  description:
    "79 kr/mån för egenföretagare med obegränsat antal fakturor och ROT/RUT-avdrag uträknat automatiskt. 14 dagars fri provperiod, ingen bindningstid.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "Priser – fakturaprogram från 79 kr/mån",
    description:
      "Obegränsat antal fakturor, ROT/RUT automatiskt, ingen bindningstid. 14 dagar gratis utan kreditkort.",
    url: `${BASE}${PATH}`,
    type: "website",
  },
};

const PLANER = [
  {
    namn: "Egen",
    pris: 79,
    arspris: 790,
    note: "För dig som driver eget",
    beskrivning:
      "Allt du behöver för att fakturera din egen verksamhet, utan tak på antalet fakturor.",
    ingar: [
      "Obegränsat antal fakturor och offerter",
      "ROT- och RUT-avdrag uträknat automatiskt",
      "Bankgiro, OCR-referens och QR för bankappen",
      "Kreditfaktura med hänvisning till originalet",
      "Påminnelser via e-post",
      "10+ fakturamallar med din logotyp",
      "Export av dina uppgifter",
    ],
    cta: "Prova 14 dagar gratis",
    primar: true,
  },
  {
    namn: "Byrå",
    pris: 299,
    arspris: 2990,
    note: "För redovisningsbyråer",
    beskrivning:
      "För dig som fakturerar åt flera klientföretag och behöver hålla isär vem som ser vad.",
    ingar: [
      "Allt i Egen",
      "Flera konsulter i samma konto",
      "Tilldela klientföretag per konsult",
      "Roller och behörigheter",
      "Krypterad säkerhetskopiering",
      "Prioriterad support",
    ],
    cta: "Kom igång",
    primar: false,
  },
];

const JAMFORELSE: { rad: string; egen: boolean | string; byra: boolean | string }[] = [
  { rad: "Antal fakturor per månad", egen: "Obegränsat", byra: "Obegränsat" },
  { rad: "Offerter", egen: true, byra: true },
  { rad: "ROT- och RUT-avdrag", egen: true, byra: true },
  { rad: "Moms per rad (25, 12, 6 %)", egen: true, byra: true },
  { rad: "Bankgiro, OCR och QR-kod", egen: true, byra: true },
  { rad: "Kreditfaktura", egen: true, byra: true },
  { rad: "Påminnelser", egen: true, byra: true },
  { rad: "Antal klientföretag", egen: "Ett", byra: "Flera" },
  { rad: "Flera användare", egen: false, byra: true },
  { rad: "Roller och behörigheter", egen: false, byra: true },
];

const FRAGOR = [
  {
    q: "Vad kostar det att komma igång?",
    a: "Ingenting. Provperioden är 14 dagar och kräver inget kreditkort. Du kan skicka riktiga fakturor under tiden – de försvinner inte om du väljer att fortsätta.",
  },
  {
    q: "Finns det någon gräns för antalet fakturor?",
    a: "Nej. Både Egen och Byrå har obegränsat antal fakturor och offerter. Priset ändras inte för att du fakturerar mer en månad.",
  },
  {
    q: "Räknar programmet ut ROT- och RUT-avdrag?",
    a: "Ja. Du markerar vilka rader som är arbete, väljer ROT eller RUT, och avdraget räknas ut på arbetskostnaden inklusive moms – 30 procent för ROT, 50 procent för RUT. Avdraget hamnar på fakturan och i betalningsreferensen, så kunden betalar rätt belopp direkt i bankappen.",
  },
  {
    q: "Är priserna med eller utan moms?",
    a: "Utan moms. Är du momsregistrerad drar du av momsen som ingående moms på vanligt sätt.",
  },
  {
    q: "Finns det bindningstid?",
    a: "Nej. Du säger upp när du vill och betalar inte för tid efter uppsägningen. Vid årsbetalning får du två månader gratis jämfört med månadsbetalning.",
  },
  {
    q: "Vad händer med mina fakturor om jag slutar?",
    a: "Du kan ladda ner dina uppgifter som fil när som helst, också innan du avslutar. Fakturor är räkenskapsinformation och ska enligt bokföringslagen sparas i sju år räknat från utgången av det kalenderår då räkenskapsåret avslutades – ta därför ut dem innan du avslutar kontot.",
  },
];

function kr(n: number) {
  return n.toLocaleString("sv-SE");
}

export default function PriserPage() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FRAGOR.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const brodLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Start", item: BASE },
      { "@type": "ListItem", position: 2, name: "Priser", item: `${BASE}${PATH}` },
    ],
  };

  return (
    <div className="min-h-dvh bg-[#faf8f3] text-stone-900 antialiased">
      <SiteStyles />
      <SiteHeader anchorBase="/" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brodLd) }} />

      {/* ───── Rubrik ───── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-6 pt-12 sm:pt-16 pb-10">
        <nav aria-label="Brödsmulor" className="text-sm text-stone-600 mb-6">
          <Link href="/" className="hover:text-stone-900 underline decoration-stone-300 underline-offset-2">Start</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-stone-900">Priser</span>
        </nav>

        <h1 className="font-display text-4xl sm:text-5xl leading-[1.08] text-stone-950 max-w-2xl">
          Ett pris, obegränsat antal fakturor
        </h1>
        <p className="text-stone-700 text-lg leading-relaxed mt-5 max-w-2xl">
          Ingen avgift per faktura och inget tak som gör att en bra månad kostar mer. ROT- och
          RUT-avdraget räknas ut automatiskt – det är inbyggt, inte något du behöver räkna
          själv vid sidan om.
        </p>
      </section>

      {/* ───── Planer ───── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-6 pb-4">
        <div className="grid gap-5 md:grid-cols-2">
          {PLANER.map((p) => (
            <div
              key={p.namn}
              className={`flex flex-col rounded-[1.4rem] p-7 sm:p-8 border ${
                p.primar
                  ? "bg-white border-stone-300 shadow-xl shadow-stone-900/[0.07]"
                  : "bg-white/70 border-stone-200"
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 className="font-display text-2xl text-stone-950">{p.namn}</h2>
                {p.primar && (
                  <span className="text-xs font-semibold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 rounded-full px-3 py-1">
                    Vanligast
                  </span>
                )}
              </div>
              <p className="text-sm text-stone-600 mt-1">{p.note}</p>

              <p className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-5xl text-stone-950 tabular-nums">{kr(p.pris)}</span>
                <span className="text-stone-600">kr/mån</span>
              </p>
              <p className="text-sm text-stone-600 mt-1.5 tabular-nums">
                eller {kr(p.arspris)} kr/år — två månader gratis
              </p>

              <p className="text-[15px] text-stone-700 leading-relaxed mt-5">{p.beskrivning}</p>

              <ul className="mt-6 space-y-2.5 flex-1">
                {p.ingar.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-[15px] text-stone-800">
                    <Check className="w-4 h-4 text-teal-700 mt-1 shrink-0" aria-hidden="true" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/auth/register"
                className={`inline-flex items-center justify-center gap-2 font-semibold px-6 py-3.5 rounded-full transition-colors mt-8 ${
                  p.primar
                    ? "bg-[#13294B] hover:bg-[#1e3a63] text-white"
                    : "bg-white border border-stone-300 hover:border-stone-500 text-stone-900"
                }`}
              >
                {p.cta} <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-stone-600 mt-6">
          Priser exklusive moms. 14 dagars fri provperiod utan kreditkort. Ingen bindningstid.
        </p>
      </section>

      {/* ───── Jamforelse ───── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pt-14 pb-4">
        <h2 className="font-display text-3xl text-stone-950">Vad skiljer planerna åt?</h2>
        <p className="text-stone-700 mt-3 leading-relaxed">
          Faktureringen är densamma i båda. Skillnaden är hur många som ska arbeta i kontot.
        </p>

        <div className="mt-6 rounded-[1.4rem] border border-stone-200 bg-white overflow-x-auto">
          <table className="w-full text-[15px]">
            <caption className="sr-only">Jämförelse mellan planerna Egen och Byrå</caption>
            <thead>
              <tr className="border-b border-stone-200">
                <th scope="col" className="text-left font-semibold text-stone-900 px-5 sm:px-6 py-4">Funktion</th>
                <th scope="col" className="text-right font-semibold text-stone-900 px-4 py-4 w-32">Egen</th>
                <th scope="col" className="text-right font-semibold text-stone-900 px-5 sm:px-6 py-4 w-32">Byrå</th>
              </tr>
            </thead>
            <tbody>
              {JAMFORELSE.map((r) => (
                <tr key={r.rad} className="border-b border-stone-100 last:border-0">
                  <th scope="row" className="text-left font-normal text-stone-800 px-5 sm:px-6 py-3.5">{r.rad}</th>
                  {[r.egen, r.byra].map((v, i) => (
                    <td key={i} className={`text-right px-4 py-3.5 ${i === 1 ? "sm:px-6" : ""}`}>
                      {typeof v === "string" ? (
                        <span className="text-stone-800">{v}</span>
                      ) : v ? (
                        <>
                          <Check className="w-4 h-4 text-teal-700 inline-block" aria-hidden="true" />
                          <span className="sr-only">Ingår</span>
                        </>
                      ) : (
                        <>
                          <Minus className="w-4 h-4 text-stone-400 inline-block" aria-hidden="true" />
                          <span className="sr-only">Ingår inte</span>
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ───── Fragor ───── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pt-14 pb-4">
        <h2 className="font-display text-3xl text-stone-950">Vanliga frågor om priset</h2>
        <div className="mt-6 space-y-3">
          {FRAGOR.map((f) => (
            <details key={f.q} className="group rounded-[1.2rem] border border-stone-200 bg-white px-6 py-5">
              <summary className="flex items-start justify-between gap-4 cursor-pointer list-none font-semibold text-stone-900">
                {f.q}
                <span className="text-stone-400 transition-transform group-open:rotate-45 shrink-0 text-xl leading-none" aria-hidden="true">+</span>
              </summary>
              <p className="text-[15px] text-stone-700 leading-relaxed mt-3">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ───── Avslut ───── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pt-14 pb-20 sm:pb-24 text-center">
        <h2 className="font-display text-3xl sm:text-4xl text-stone-950">
          Testa med din nästa faktura
        </h2>
        <p className="text-stone-700 mt-4 leading-relaxed max-w-lg mx-auto">
          14 dagar gratis utan kreditkort. Dina uppgifter och fakturor finns kvar om du
          väljer att fortsätta.
        </p>
        <Link
          href="/auth/register"
          className="inline-flex items-center justify-center gap-2 bg-[#13294B] hover:bg-[#1e3a63] text-white font-semibold px-7 py-4 rounded-full transition-colors mt-8"
        >
          Skapa konto gratis <ArrowRight className="w-4 h-4" aria-hidden="true" />
        </Link>
      </section>

      <SiteFooter anchorBase="/" />
    </div>
  );
}
