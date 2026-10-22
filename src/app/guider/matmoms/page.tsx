import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, AlertCircle } from "lucide-react";
import { SiteHeader, SiteFooter, SiteStyles } from "@/components/site/SiteChrome";

/* Matmomsen sanktes 2026-04-01. Andringen ar farsk och tillfallig, och en
   stor del av det som ligger uppe pa natet anger fortfarande 12 procent.

   Allt pa den har sidan ar hamtat ordagrant fran Skatteverkets egen nyhet
   om sankningen. Satsen for alkoholhaltiga drycker namns INTE dar och
   skrivs darfor inte ut har - gissa inte fram den. */

const BASE = "https://enkeltfaktura.com";
const PATH = "/guider/matmoms";
const SENAST_KONTROLLERAD = "22 oktober 2026";
const KALLA =
  "https://www.skatteverket.se/omoss/pressochmedia/nyheter/2026/nyheter/livsmedelsmomsensankstill6procent.5.70685bee19c85dd5dd0a3f.html";

export const metadata: Metadata = {
  title: "Matmoms 2026 – 6 procent på livsmedel, 12 på servering",
  description:
    "Momsen på livsmedel sänktes till 6 procent den 1 april 2026 och gäller till 31 december 2027. Servering är kvar på 12 procent, hämtmat är 6.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "Matmoms 2026 – 6 procent på livsmedel, 12 på servering",
    description:
      "Samma mat kan ha två olika momssatser beroende på var den äts. Så skiljer du dem åt på fakturan.",
    url: `${BASE}${PATH}`,
    type: "article",
  },
};

const FRAGOR = [
  {
    q: "Vilken moms gäller på livsmedel i dag?",
    a: "6 procent. Skattesatsen på livsmedel sänktes från 12 till 6 procent den 1 april 2026. Sänkningen är tillfällig och gäller till och med den 31 december 2027.",
  },
  {
    q: "Vad gäller för mat som äts på plats?",
    a: "Momsen på restaurangtjänster är 12 procent. Serverar du mat på plats är det alltså 12 procent som gäller, inte 6 – sänkningen avser livsmedel, inte serveringen.",
  },
  {
    q: "Och för hämtmat?",
    a: "Momssatsen för hämtmat är 6 procent. Samma rätt från samma kök kan alltså ha två olika satser beroende på om gästen äter på plats eller tar med sig maten.",
  },
  {
    q: "Hur länge gäller den lägre satsen?",
    a: "Till och med den 31 december 2027. Därefter återgår den om inget nytt beslut fattas – planera inte priser långt efter det datumet utan att kontrollera vad som gäller då.",
  },
  {
    q: "Hur redovisar jag två satser på samma faktura?",
    a: "Varje momssats ska redovisas för sig. Beskattningsunderlaget, satsen och momsbeloppet anges per sats, inte som en klumpsumma. Har en beställning både servering och hämtmat behöver raderna alltså delas.",
  },
];

export default function MatmomsPage() {
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
      { "@type": "ListItem", position: 2, name: "Guider", item: `${BASE}/guider/rot-avdrag-pa-faktura` },
      { "@type": "ListItem", position: 3, name: "Matmoms", item: `${BASE}${PATH}` },
    ],
  };

  return (
    <div className="min-h-dvh bg-[#faf8f3] text-stone-900 antialiased">
      <SiteStyles />
      <SiteHeader anchorBase="/" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brodLd) }} />

      <section className="max-w-3xl mx-auto px-5 sm:px-6 pt-12 sm:pt-16 pb-8">
        <nav aria-label="Brödsmulor" className="text-sm text-stone-600 mb-6">
          <Link href="/" className="hover:text-stone-900 underline decoration-stone-300 underline-offset-2">Start</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-stone-900">Matmoms</span>
        </nav>

        <h1 className="font-display text-4xl sm:text-5xl leading-[1.08] text-stone-950">
          Matmoms 2026: 6 procent på maten, 12 på serveringen
        </h1>
        <p className="text-stone-700 text-lg leading-relaxed mt-5">
          Momsen på livsmedel sänktes den 1 april 2026. Serveringen följde inte med ned, vilket
          betyder att samma rätt från samma kök kan ha två olika momssatser beroende på var
          gästen äter den.
        </p>
      </section>

      {/* ───── Satserna ───── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pb-4">
        <div className="rounded-[1.4rem] border border-stone-200 bg-white overflow-hidden">
          <table className="w-full text-[15px]">
            <caption className="sr-only">Momssatser på mat efter 1 april 2026</caption>
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/60">
                <th scope="col" className="text-left font-semibold text-stone-900 px-5 sm:px-6 py-4">Vad du säljer</th>
                <th scope="col" className="text-right font-semibold text-stone-900 px-5 sm:px-6 py-4 w-28">Moms</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-stone-100">
                <th scope="row" className="text-left font-normal text-stone-800 px-5 sm:px-6 py-4">
                  Livsmedel
                  <span className="block text-sm text-stone-600 mt-0.5">Butik, kiosk, gatukök, obearbetad och färdig mat</span>
                </th>
                <td className="text-right px-5 sm:px-6 py-4 font-semibold text-stone-900 tabular-nums">6 %</td>
              </tr>
              <tr className="border-b border-stone-100">
                <th scope="row" className="text-left font-normal text-stone-800 px-5 sm:px-6 py-4">
                  Hämtmat
                  <span className="block text-sm text-stone-600 mt-0.5">Gästen tar med sig maten</span>
                </th>
                <td className="text-right px-5 sm:px-6 py-4 font-semibold text-stone-900 tabular-nums">6 %</td>
              </tr>
              <tr>
                <th scope="row" className="text-left font-normal text-stone-800 px-5 sm:px-6 py-4">
                  Restaurangtjänster
                  <span className="block text-sm text-stone-600 mt-0.5">Gästen äter på plats</span>
                </th>
                <td className="text-right px-5 sm:px-6 py-4 font-semibold text-stone-900 tabular-nums">12 %</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-start gap-3 mt-5 rounded-[1.2rem] bg-amber-50 border border-amber-200 px-5 py-4">
          <AlertCircle className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-[15px] text-amber-900 leading-relaxed">
            Sänkningen är <strong>tillfällig</strong> och gäller till och med 31 december 2027.
            En stor del av guiderna som ligger uppe anger fortfarande 12 procent på livsmedel –
            de är skrivna före 1 april 2026.
          </p>
        </div>
      </section>

      {/* ───── Pa fakturan ───── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pt-10 pb-4">
        <h2 className="font-display text-3xl text-stone-950">Två satser på samma faktura</h2>
        <p className="text-stone-700 leading-relaxed mt-4">
          Levererar du till ett företag som både vill ha lunch på plats och matlådor att ta med
          sig, har samma beställning två momssatser. Varje sats ska redovisas för sig – underlag,
          sats och momsbelopp per sats, inte en klumpsumma.
        </p>

        <div className="mt-6 rounded-[1.4rem] border border-stone-200 bg-white p-6 sm:p-7 font-mono text-sm text-stone-800 overflow-x-auto">
          <div className="min-w-[22rem] space-y-1.5">
            <div className="flex justify-between"><span>Lunchservering, 20 pers</span><span className="tabular-nums">3 000,00 kr</span></div>
            <div className="flex justify-between text-stone-600"><span className="pl-4">Moms 12 %</span><span className="tabular-nums">360,00 kr</span></div>
            <div className="flex justify-between mt-3"><span>Matlådor för avhämtning, 15 st</span><span className="tabular-nums">1 500,00 kr</span></div>
            <div className="flex justify-between text-stone-600"><span className="pl-4">Moms 6 %</span><span className="tabular-nums">90,00 kr</span></div>
            <div className="flex justify-between border-t border-stone-200 pt-2.5 mt-3 font-semibold text-stone-900">
              <span>Att betala</span><span className="tabular-nums">4 950,00 kr</span>
            </div>
          </div>
        </div>

        <p className="text-stone-700 leading-relaxed mt-5">
          Slår du ihop raderna till &rdquo;Catering 4 500 kr&rdquo; går det inte att se vilken
          moms som hör till vad, och kundens momsavdrag blir svårt att styrka.
        </p>
      </section>

      {/* ───── Fragor ───── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pt-10 pb-4">
        <h2 className="font-display text-3xl text-stone-950">Vanliga frågor</h2>
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

      {/* ───── Kalla ───── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pt-10 pb-4">
        <div className="rounded-2xl border border-stone-200 bg-white/70 p-6 text-sm text-stone-700 leading-relaxed">
          <h2 className="font-semibold text-stone-900 text-[15px] mb-2">Om uppgifterna på sidan</h2>
          <p className="mb-3">
            Satserna och datumen är hämtade ordagrant från{" "}
            <a href={KALLA} rel="noopener" className="underline decoration-stone-300 hover:decoration-stone-600 underline-offset-2">
              Skatteverkets information om sänkningen
            </a>
            , kontrollerade {SENAST_KONTROLLERAD}.
          </p>
          <p>
            Sidan tar upp livsmedel, hämtmat och servering. För drycker, och för gränsfall i din
            egen verksamhet, gäller egna bedömningar – fråga Skatteverket eller din
            redovisningskonsult innan du sätter satsen.
          </p>
        </div>
      </section>

      {/* ───── Avslut ───── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pt-12 pb-20 sm:pb-24 text-center">
        <h2 className="font-display text-3xl sm:text-4xl text-stone-950">
          Moms per rad, inte per faktura
        </h2>
        <p className="text-stone-700 mt-4 leading-relaxed max-w-lg mx-auto">
          Sätt satsen på varje rad för sig – summeringen delas upp automatiskt.
          14 dagar gratis utan kreditkort.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
          <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 bg-[#13294B] hover:bg-[#1e3a63] text-white font-semibold px-7 py-4 rounded-full transition-colors">
            Skapa konto gratis <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <Link href="/priser" className="inline-flex items-center justify-center gap-2 bg-white border border-stone-300 hover:border-stone-500 text-stone-900 font-semibold px-7 py-4 rounded-full transition-colors">
            Se priser
          </Link>
        </div>
      </section>

      <SiteFooter anchorBase="/" />
    </div>
  );
}
