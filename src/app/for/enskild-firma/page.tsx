import type { Metadata } from "next";
import Link from "next/link";
import { Check, ArrowRight, AlertCircle } from "lucide-react";
import { SiteHeader, SiteFooter, SiteStyles } from "@/components/site/SiteChrome";

/* Sida for foretagsformen, inte for ett yrke - darfor en egen statisk sida
   och inte en post i yrken.ts. Den statiska rutten gar fore /for/[yrke].

   Omsattningsgransen for momsbefrielse hojdes till 120 000 kr den
   1 januari 2025. Aldre guider anger fortfarande 80 000 kr. Kontrollera om
   siffran nar SENAST_KONTROLLERAD ar aldre an ett halvar. */

const BASE = "https://enkeltfaktura.com";
const PATH = "/for/enskild-firma";
const SENAST_KONTROLLERAD = "22 oktober 2026";

const MOMSGRANS = 120_000;

export const metadata: Metadata = {
  title: "Fakturera som enskild firma – vad måste stå på fakturan?",
  description:
    "Momsgränsen är 120 000 kr sedan 2025, inte 80 000. Vad som måste stå på fakturan, varför F-skatt hör hemma där och hur ROT/RUT redovisas.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "Fakturera som enskild firma",
    description:
      "Momsgräns, F-skatt, obligatoriska uppgifter och ROT/RUT – det som faktiskt skiljer fakturering i enskild firma.",
    url: `${BASE}${PATH}`,
    type: "article",
  },
};

const OBLIGATORISKT = [
  "Fakturadatum och ett löpnummer i obruten serie",
  "Ditt namn och din adress, och kundens namn och adress",
  "Ditt organisationsnummer – i enskild firma är det ditt personnummer",
  "Ditt momsregistreringsnummer, om du är momsregistrerad",
  "Vad du har sålt, och i vilken omfattning",
  "Datum för leverans eller utfört arbete, om det skiljer sig från fakturadatumet",
  "Beskattningsunderlag per momssats, momssatsen och momsbeloppet",
  "Skäl till att moms inte tas ut, när så är fallet",
];

const FRAGOR = [
  {
    q: "Måste jag vara momsregistrerad som enskild firma?",
    a: "Inte om omsättningen håller sig under 120 000 kronor under beskattningsåret, och inte heller har överstigit den gränsen något av de två föregående åren. Gränsen höjdes från 80 000 till 120 000 kronor den 1 januari 2025 – flera guider på nätet anger fortfarande det gamla beloppet. Momsbefrielsen är frivillig; du kan välja att registrera dig ändå, till exempel för att få dra av ingående moms på inköp.",
  },
  {
    q: "Vad står som organisationsnummer på fakturan?",
    a: "I enskild firma är företagets organisationsnummer detsamma som ditt personnummer. Det är alltså ditt personnummer som står på fakturan. Vill du inte ha det synligt på varje faktura är aktiebolag den form som ger ett separat organisationsnummer.",
  },
  {
    q: "Vad händer om jag inte har F-skatt?",
    a: "Då är den som betalar dig skyldig att göra skatteavdrag med 30 procent på ersättningen för arbete och betala in det till Skatteverket. Du får alltså ut mindre, och köparen får ett administrativt merarbete. Det är därför de flesta företagskunder frågar efter F-skatt innan de anlitar dig – och därför ”Godkänd för F-skatt” bör stå på fakturan.",
  },
  {
    q: "Vilken moms ska jag ta ut?",
    a: "25 procent är huvudregeln. 12 procent gäller bland annat livsmedel, restaurang och hotell. 6 procent gäller bland annat böcker, persontransport och entré till kulturevenemang. Säljer du flera saker med olika satser ska varje sats redovisas för sig på fakturan.",
  },
  {
    q: "Hur länge måste jag spara mina fakturor?",
    a: "I sju år. Tiden räknas från utgången av det kalenderår då räkenskapsåret avslutades, inte från fakturadatumet. En faktura från 2026 ska alltså sparas till och med 2033. Digitalt material sparas digitalt.",
  },
  {
    q: "Kan jag ta ut ränta när kunden betalar för sent?",
    a: "Ja. Enligt räntelagen är dröjsmålsräntan Riksbankens referensränta plus åtta procentenheter. Referensräntan är 2,00 procent för perioden 1 juli–31 december 2026, vilket ger 10 procent. Skriv ”dröjsmålsränta enligt räntelagen” på fakturan i stället för en fast siffra – då följer den automatiskt med när räntan ändras.",
  },
];

export default function EnskildFirmaPage() {
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
      { "@type": "ListItem", position: 2, name: "För vem", item: `${BASE}/for` },
      { "@type": "ListItem", position: 3, name: "Enskild firma", item: `${BASE}${PATH}` },
    ],
  };

  return (
    <div className="min-h-dvh bg-[#faf8f3] text-stone-900 antialiased">
      <SiteStyles />
      <SiteHeader anchorBase="/" />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brodLd) }} />

      <section className="max-w-3xl mx-auto px-5 sm:px-6 pt-12 sm:pt-16 pb-10">
        <nav aria-label="Brödsmulor" className="text-sm text-stone-600 mb-6">
          <Link href="/" className="hover:text-stone-900 underline decoration-stone-300 underline-offset-2">Start</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <Link href="/for" className="hover:text-stone-900 underline decoration-stone-300 underline-offset-2">För vem</Link>
          <span className="mx-2" aria-hidden="true">/</span>
          <span className="text-stone-900">Enskild firma</span>
        </nav>

        <h1 className="font-display text-4xl sm:text-5xl leading-[1.08] text-stone-950">
          Fakturera som enskild firma
        </h1>
        <p className="text-stone-700 text-lg leading-relaxed mt-5">
          Själva fakturan ser likadan ut som i ett aktiebolag, men tre saker skiljer sig:
          ditt organisationsnummer är ditt personnummer, du kan slippa moms helt om
          omsättningen är tillräckligt liten, och saknar du F-skatt drar köparen av skatt
          innan du får betalt.
        </p>
      </section>

      {/* ───── Momsgransen ───── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pb-4">
        <div className="rounded-[1.4rem] border border-stone-200 bg-white p-7 sm:p-8">
          <h2 className="font-display text-2xl text-stone-950">
            Momsgränsen är {MOMSGRANS.toLocaleString("sv-SE")} kronor
          </h2>
          <p className="text-stone-700 leading-relaxed mt-4">
            Håller sig omsättningen under {MOMSGRANS.toLocaleString("sv-SE")} kronor under
            beskattningsåret behöver du inte registrera dig för moms. Villkoret är att du inte
            heller har passerat gränsen något av de två föregående åren.
          </p>

          <div className="flex items-start gap-3 mt-5 rounded-[1.2rem] bg-amber-50 border border-amber-200 px-5 py-4">
            <AlertCircle className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-[15px] text-amber-900 leading-relaxed">
              Gränsen höjdes från 80 000 till {MOMSGRANS.toLocaleString("sv-SE")} kronor den
              1 januari 2025. Flera guider som fortfarande ligger uppe anger det gamla beloppet.
              Räknar du på 80 000 kan du registrera dig i onödan.
            </p>
          </div>

          <p className="text-stone-700 leading-relaxed mt-5">
            Momsbefrielsen är frivillig. Köper du in mycket material kan det löna sig att
            registrera sig ändå, eftersom du då får dra av momsen på inköpen. Är kunderna
            privatpersoner och inköpen små är det oftast enklare att stå utanför.
          </p>
        </div>
      </section>

      {/* ───── F-skatt ───── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pt-10 pb-4">
        <h2 className="font-display text-3xl text-stone-950">F-skatt avgör vad du får ut</h2>
        <p className="text-stone-700 leading-relaxed mt-4">
          Saknar du godkännande för F-skatt är den som betalar dig skyldig att göra skatteavdrag
          med <strong>30 procent</strong> på ersättningen för arbete och betala in beloppet till
          Skatteverket. Du får alltså ut mindre, och köparen får ett merarbete den inte bad om.
        </p>
        <p className="text-stone-700 leading-relaxed mt-4">
          Det är därför de flesta företagskunder frågar efter F-skatt innan de anlitar dig, och
          därför meningen <em>&rdquo;Godkänd för F-skatt&rdquo;</em> hör hemma på fakturan. ROT- och
          RUT-avdrag förutsätter dessutom att utföraren har F-skatt.
        </p>
      </section>

      {/* ───── Obligatoriska uppgifter ───── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pt-10 pb-4">
        <h2 className="font-display text-3xl text-stone-950">Det här måste stå på fakturan</h2>
        <p className="text-stone-700 leading-relaxed mt-4">
          Innehållet är inte valfritt. Saknas uppgifter kan kunden neka att betala, och en
          företagskund kan få problem med sitt momsavdrag.
        </p>
        <ul className="mt-6 space-y-2.5">
          {OBLIGATORISKT.map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-[15px] text-stone-800">
              <Check className="w-4 h-4 text-teal-700 mt-1 shrink-0" aria-hidden="true" />
              <span>{p}</span>
            </li>
          ))}
        </ul>
        <p className="text-stone-700 leading-relaxed mt-6">
          Löpnumren ska gå i obruten serie. Raderar du en påbörjad faktura och hoppar över dess
          nummer uppstår ett glapp som måste kunna förklaras.
        </p>
      </section>

      {/* ───── ROT/RUT ───── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pt-10 pb-4">
        <h2 className="font-display text-3xl text-stone-950">Säljer du till privatpersoner?</h2>
        <p className="text-stone-700 leading-relaxed mt-4">
          Då kan arbetet ge ROT- eller RUT-avdrag – 30 procent respektive 50 procent av
          arbetskostnaden inklusive moms. Avdraget gäller bara arbete. Material, resor,
          maskinhyra och bortforsling ger inget avdrag och ska ligga på egna rader.
        </p>
        <p className="text-stone-700 leading-relaxed mt-4">
          Vad som räknas som avdragsgillt arbete skiljer sig mellan yrken.{" "}
          <Link href="/guider/rot-avdrag-pa-faktura" className="text-[#13294B] underline decoration-stone-300 hover:decoration-[#13294B] underline-offset-2">
            Guiden om ROT på fakturan
          </Link>{" "}
          går igenom hur avdraget redovisas, och{" "}
          <Link href="/for" className="text-[#13294B] underline decoration-stone-300 hover:decoration-[#13294B] underline-offset-2">
            yrkessidorna
          </Link>{" "}
          tar upp gränsdragningarna i varje bransch – till exempel att{" "}
          <Link href="/for/markarbetare" className="text-[#13294B] underline decoration-stone-300 hover:decoration-[#13294B] underline-offset-2">
            grävmaskinen aldrig räknas som arbetskostnad
          </Link>{" "}
          eller att{" "}
          <Link href="/for/stadfirma" className="text-[#13294B] underline decoration-stone-300 hover:decoration-[#13294B] underline-offset-2">
            trapphusstädning inte ger RUT
          </Link>.
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
            Belopp och regler är hämtade från{" "}
            <a href="https://www.skatteverket.se" rel="noopener" className="underline decoration-stone-300 hover:decoration-stone-600 underline-offset-2">Skatteverket</a>{" "}
            och{" "}
            <a href="https://www.riksbank.se" rel="noopener" className="underline decoration-stone-300 hover:decoration-stone-600 underline-offset-2">Riksbanken</a>,
            kontrollerade {SENAST_KONTROLLERAD}.
          </p>
          <p>
            Sidan beskriver vanliga fall och ersätter inte besked från Skatteverket eller din
            redovisningskonsult. Vid tveksamhet om din egen situation – fråga innan du fakturerar.
          </p>
        </div>
      </section>

      {/* ───── Avslut ───── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pt-12 pb-20 sm:pb-24 text-center">
        <h2 className="font-display text-3xl sm:text-4xl text-stone-950">
          Fakturor som uppfyller kraven, utan mallpyssel
        </h2>
        <p className="text-stone-700 mt-4 leading-relaxed max-w-lg mx-auto">
          Obrutna löpnummer, moms per rad och ROT/RUT uträknat på arbetskostnaden.
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
