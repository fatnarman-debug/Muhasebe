import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight, Check, Percent, ScanLine, BellRing, FileText,
  Receipt, Smartphone, Calculator,
} from "lucide-react";
import { SiteHeader, SiteFooter, SiteStyles } from "@/components/site/SiteChrome";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enkeltfaktura.com";
const PATH = "/for/hantverkare";

export const metadata: Metadata = {
  title: "Fakturaprogram för hantverkare – ROT-avdrag automatiskt",
  description:
    "Fakturera med ROT- och RUT-avdrag utan handräkning. Avdraget räknas ut automatiskt enligt 2026 års regler, med OCR, bankgiro och QR-kod på varje faktura. 14 dagar gratis.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "sv_SE",
    url: `${BASE}${PATH}`,
    siteName: "EnkeltFaktura",
    title: "Fakturaprogram för hantverkare – ROT-avdrag automatiskt",
    description:
      "ROT 30 % och RUT 50 % räknas ut automatiskt på fakturan. Byggt för snickare, elektriker, målare och rörmokare.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "EnkeltFaktura för hantverkare" }],
  },
};

/* ── Innehall ───────────────────────────────────────────────────────────── */

const faqs = [
  {
    q: "Hur mycket är ROT-avdraget 2026?",
    a: "ROT-avdraget är 30 procent av arbetskostnaden under 2026, med ett tak på 50 000 kronor per person och år. Under perioden 12 maj–31 december 2025 var avdraget tillfälligt höjt till 50 procent – den nivån gällde för fakturor som kunden betalade inom den perioden. Från och med 1 januari 2026 gäller åter 30 procent.",
  },
  {
    q: "Vad är skillnaden mellan ROT och RUT?",
    a: "ROT gäller reparation, ombyggnad och tillbyggnad och ger 30 procent avdrag på arbetskostnaden. RUT gäller hushållsnära tjänster som städning och trädgårdsarbete och ger 50 procent. De delar ett gemensamt tak på 75 000 kronor per person och år, varav högst 50 000 kronor får vara ROT.",
  },
  {
    q: "Räknas material med i ROT-avdraget?",
    a: "Nej. Avdraget gäller endast arbetskostnaden. Material, resor, maskiner och frakt ger inget avdrag och ska redovisas separat på fakturan. EnkeltFaktura håller isär arbete och material åt dig så att avdraget alltid beräknas på rätt belopp.",
  },
  {
    q: "Måste jag räkna ut ROT-avdraget själv?",
    a: "Nej. Du markerar vilka rader som är arbetskostnad, så räknas avdraget ut automatiskt och visas korrekt på fakturan. Kunden ser direkt vad hen ska betala och du ser vad du ska begära från Skatteverket.",
  },
  {
    q: "Hur vet jag om kunden har kvar utrymme i sitt ROT-tak?",
    a: "Taket är personligt och följer kalenderåret, så det är kunden som ansvarar för att det finns utrymme kvar. Skatteverket avslår begäran om taket är fullt. Därför är det klokt att fråga kunden innan större arbeten och att dokumentera svaret.",
  },
  {
    q: "Kan jag skicka fakturan direkt från mobilen?",
    a: "Ja. EnkeltFaktura fungerar i mobilens webbläsare, så du kan skapa och skicka fakturan direkt från arbetsplatsen när jobbet är klart – utan att åka tillbaka till kontoret.",
  },
];

const features = [
  { icon: Percent, title: "ROT & RUT räknas ut åt dig", desc: "Markera vad som är arbete. Avdraget räknas ut utifrån de arbetskostnader du anger, enligt 2026 års nivåer." },
  { icon: Receipt, title: "Arbete och material separat", desc: "Avdrag gäller bara arbetskostnaden. Raderna hålls isär automatiskt så att underlaget till Skatteverket blir rätt direkt." },
  { icon: FileText, title: "Offert som blir faktura", desc: "Skicka offert på jobbet. När kunden tackar ja omvandlar du den till faktura med ett klick – samma rader, samma avdrag." },
  { icon: ScanLine, title: "OCR, bankgiro & QR", desc: "Varje faktura får maskinläsbar betalrad och QR-kod. Kunden skannar i bankappen och betalar rätt belopp – färre felbetalningar att reda ut." },
  { icon: BellRing, title: "Påminnelser med avgift", desc: "Obetald faktura? Skicka en proffsig påminnelse med påminnelseavgift. Du väljer själv när påminnelsen skickas." },
  { icon: Smartphone, title: "Fakturera från bygget", desc: "Fungerar i mobilen. Skriv fakturan i bilen när jobbet är klart, i stället för på kvällen hemma vid köksbordet." },
];

const yrken = [
  "Snickare", "Elektriker", "Målare", "Rörmokare",
  "Plattsättare", "Golvläggare", "Takläggare", "Murare",
  "Byggföretag", "Trädgårdsanläggare", "Fönsterputsare", "Städföretag",
];

/* Raknat exempel – anvands bade i tabellen och i JSON-LD-svaret. */
const exempel = { arbete: 20000, material: 10000 };
const rotAvdrag = exempel.arbete * 0.3;
const attBetala = exempel.arbete + exempel.material - rotAvdrag;
const kr = (n: number) => n.toLocaleString("sv-SE") + " kr";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Start", item: BASE },
        { "@type": "ListItem", position: 2, name: "För hantverkare", item: `${BASE}${PATH}` },
      ],
    },
    {
      "@type": "WebPage",
      name: "Fakturaprogram för hantverkare",
      url: `${BASE}${PATH}`,
      inLanguage: "sv-SE",
      description:
        "Fakturaprogram med automatiskt ROT- och RUT-avdrag för snickare, elektriker, målare och rörmokare.",
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

/* ── Sida ───────────────────────────────────────────────────────────────── */

export default function HantverkarePage() {
  return (
    <div className="min-h-screen bg-[#faf8f3] text-stone-900 selection:bg-[#13294B]/15 antialiased">
      <SiteStyles />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader anchorBase="/" />

      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_80%_-5%,#e7f6f4_0%,transparent_60%)]" />
        <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-10 sm:pt-14 pb-14">
          {/* Brodsmula */}
          <nav aria-label="Brödsmula" className="text-sm text-stone-600 mb-8">
            <Link href="/" className="hover:text-stone-900">Start</Link>
            <span className="mx-2 text-stone-400" aria-hidden="true">/</span>
            <span className="text-stone-900">För hantverkare</span>
          </nav>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-start">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-3.5 py-1.5">
                <Percent className="w-4 h-4" /> ROT 30 % · RUT 50 % · 2026 års regler
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.4rem] leading-[1.05] mt-5" style={{ color: "#13294B" }}>
                Fakturaprogram för hantverkare
              </h1>
              <p className="text-lg text-stone-700 mt-5 leading-relaxed max-w-xl">
                Markera vad som är arbetskostnad – ROT- och RUT-avdraget räknas ut utifrån de
                uppgifter du anger och hamnar på rätt rad i fakturan. Du slipper räkna för hand.
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-8">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 bg-[#13294B] hover:bg-[#1e3a63] text-white font-semibold px-6 py-3.5 rounded-full transition-colors"
                >
                  Testa gratis i 14 dagar <ArrowRight className="w-4 h-4" />
                </Link>
                <a
                  href="#rakna"
                  className="inline-flex items-center justify-center gap-2 text-stone-700 bg-white border border-stone-200 hover:border-stone-300 font-medium px-6 py-3.5 rounded-full transition-colors"
                >
                  Se räkneexempel
                </a>
              </div>
              <p className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-stone-600 mt-6">
                <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600" /> Inget kreditkort</span>
                <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600" /> 79 kr/mån efter provperioden</span>
              </p>
            </div>

            {/* Snabbsvar – skrivet for att kunna citeras rakt av i AI-sok */}
            <aside className="rounded-[1.4rem] border border-stone-200 bg-white p-7 sm:p-8 shadow-xl shadow-stone-900/[0.06]">
              <h2 className="font-semibold text-stone-900">Så fungerar ROT-avdraget på fakturan</h2>
              <p className="text-[15px] text-stone-700 leading-relaxed mt-3">
                ROT-avdraget är <strong>30 procent av arbetskostnaden inklusive moms</strong> under
                2026, med ett tak på <strong>50 000 kronor per person och år</strong>. RUT-avdraget är{" "}
                <strong>50 procent</strong>. Tillsammans delar de ett tak på{" "}
                <strong>75 000 kronor per person och år</strong>, varav högst 50 000 kronor får vara
                ROT. Avdraget gäller enbart arbete – inte material, resor eller maskiner.
              </p>
              <p className="text-sm text-stone-600 leading-relaxed mt-4 pt-4 border-t border-stone-100">
                Du drar av rotavdraget på fakturan. När arbetet är utfört och kunden har betalat
                sin del begär du utbetalning från Skatteverket.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* ───── Rakneexempel ───── */}
      <section id="rakna" className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-teal-700 mb-3">Räkneexempel</p>
          <h2 className="font-display text-3xl sm:text-4xl text-stone-950">
            Två exempel – med och utan material
          </h2>
          <p className="text-stone-700 mt-4 leading-relaxed">
            ROT-avdraget räknas alltid på <strong>arbetskostnaden</strong>. Material påverkar vad
            kunden betalar totalt, men aldrig avdragets storlek.
          </p>
        </div>

        <div className="mt-10 grid lg:grid-cols-2 gap-6">
          {/* Exempel 1 – bara arbete */}
          <div className="rounded-[1.4rem] border border-stone-200 bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200 bg-stone-50/70">
              <p className="font-semibold text-stone-900">Exempel 1 · Bara arbete</p>
              <p className="text-sm text-stone-700 mt-0.5">Inget material på fakturan</p>
            </div>
            <table className="w-full text-[15px]">
              <caption className="sr-only">ROT-avdrag när fakturan bara innehåller arbetskostnad</caption>
              <tbody className="divide-y divide-stone-100">
                <tr>
                  <th scope="row" className="text-left font-normal text-stone-700 px-6 py-4">Arbetskostnad</th>
                  <td className="text-right font-medium text-stone-900 px-6 py-4 tabular-nums">{kr(exempel.arbete)}</td>
                </tr>
                <tr className="bg-teal-50/60">
                  <th scope="row" className="text-left font-medium text-teal-800 px-6 py-4">
                    ROT-avdrag <span className="font-normal">(30 % av arbetet)</span>
                  </th>
                  <td className="text-right font-semibold text-teal-800 px-6 py-4 tabular-nums">−{kr(rotAvdrag)}</td>
                </tr>
                <tr className="bg-stone-50">
                  <th scope="row" className="text-left font-semibold text-stone-900 px-6 py-5">Kunden betalar</th>
                  <td className="text-right font-bold text-stone-900 px-6 py-5 text-lg tabular-nums">
                    {kr(exempel.arbete - rotAvdrag)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Exempel 2 – arbete + material */}
          <div className="rounded-[1.4rem] border border-stone-200 bg-white overflow-hidden">
            <div className="px-6 py-4 border-b border-stone-200 bg-stone-50/70">
              <p className="font-semibold text-stone-900">Exempel 2 · Arbete + material</p>
              <p className="text-sm text-stone-700 mt-0.5">
                Samma arbete, plus {kr(exempel.material)} i material
              </p>
            </div>
            <table className="w-full text-[15px]">
              <caption className="sr-only">ROT-avdrag när fakturan innehåller både arbete och material</caption>
              <tbody className="divide-y divide-stone-100">
                <tr>
                  <th scope="row" className="text-left font-normal text-stone-700 px-6 py-4">Arbetskostnad</th>
                  <td className="text-right font-medium text-stone-900 px-6 py-4 tabular-nums">{kr(exempel.arbete)}</td>
                </tr>
                <tr>
                  <th scope="row" className="text-left font-normal text-stone-700 px-6 py-4">
                    Material <span className="text-stone-600">(ger inget avdrag)</span>
                  </th>
                  <td className="text-right font-medium text-stone-900 px-6 py-4 tabular-nums">{kr(exempel.material)}</td>
                </tr>
                <tr className="bg-teal-50/60">
                  <th scope="row" className="text-left font-medium text-teal-800 px-6 py-4">
                    ROT-avdrag <span className="font-normal">(30 % av arbetet)</span>
                  </th>
                  <td className="text-right font-semibold text-teal-800 px-6 py-4 tabular-nums">−{kr(rotAvdrag)}</td>
                </tr>
                <tr className="bg-stone-50">
                  <th scope="row" className="text-left font-semibold text-stone-900 px-6 py-5">Kunden betalar</th>
                  <td className="text-right font-bold text-stone-900 px-6 py-5 text-lg tabular-nums">{kr(attBetala)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <p className="text-sm text-stone-700 mt-6">
          I båda fallen är avdraget {kr(rotAvdrag)} – det är den summan du begär från Skatteverket.
          Materialet ändrar bara slutsumman, inte avdraget.
        </p>

        <div className="grid sm:grid-cols-3 gap-4 mt-10">
          {[
            { t: "Avdraget gäller bara arbete", d: "Material, resor, maskiner och frakt räknas inte. Håller du ihop dem på samma rad blir avdraget fel." },
            { t: "Taket är personligt", d: "75 000 kr per person och år för ROT och RUT tillsammans, varav max 50 000 kr ROT. Två ägare i samma bostad har varsitt tak." },
            { t: "ROT-avdraget sänktes 2026", d: "Under perioden 12 maj–31 december 2025 var ROT tillfälligt höjt till 50 %, räknat på när kunden betalade fakturan. Från 1 januari 2026 gäller 30 % igen." },
          ].map((x) => (
            <div key={x.t} className="rounded-2xl border border-stone-200 bg-white p-5">
              <p className="font-semibold text-stone-900">{x.t}</p>
              <p className="text-sm text-stone-700 leading-relaxed mt-1.5">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── Funktioner ───── */}
      <section className="bg-white border-y border-stone-200/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-teal-700 mb-3">Byggt för hur du jobbar</p>
            <h2 className="font-display text-3xl sm:text-4xl text-stone-950">
              Från offert till betalt – utan pappersarbete på kvällen
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {features.map((f) => (
              <div key={f.title} className="rounded-2xl border border-stone-200 p-6">
                <f.icon className="w-6 h-6 text-teal-600" strokeWidth={1.9} />
                <h3 className="font-semibold text-stone-900 mt-4">{f.title}</h3>
                <p className="text-sm text-stone-700 leading-relaxed mt-1.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Yrken ───── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-teal-700 mb-3">Yrken</p>
          <h2 className="font-display text-3xl sm:text-4xl text-stone-950">
            För hantverkare i hela Sverige
          </h2>
          <p className="text-stone-700 mt-4 leading-relaxed">
            Samma flöde oavsett yrke: markera arbetskostnaden, låt avdraget räknas ut och skicka
            fakturan innan du lämnar arbetsplatsen.
          </p>
        </div>
        <ul className="flex flex-wrap gap-2.5 mt-8">
          {yrken.map((y) => (
            <li key={y} className="text-sm font-medium text-stone-700 bg-white border border-stone-200 rounded-full px-4 py-2">
              {y}
            </li>
          ))}
        </ul>
      </section>

      {/* ───── FAQ ───── */}
      <section id="fragor-hantverkare" className="bg-white border-y border-stone-200/70">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <h2 className="font-display text-3xl sm:text-4xl text-stone-950">Vanliga frågor om ROT och fakturering</h2>
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
        <Calculator className="w-10 h-10 text-teal-600 mx-auto" strokeWidth={1.6} />
        <h2 className="font-display text-3xl sm:text-4xl text-stone-950 mt-5">
          Sluta räkna ROT för hand
        </h2>
        <p className="text-stone-700 mt-4 leading-relaxed max-w-lg mx-auto">
          Testa gratis i 14 dagar utan kreditkort. Skicka riktiga fakturor direkt – dina uppgifter
          och fakturor finns kvar om du väljer att fortsätta.
        </p>
        <Link
          href="/auth/register"
          className="inline-flex items-center justify-center gap-2 bg-[#13294B] hover:bg-[#1e3a63] text-white font-semibold px-7 py-4 rounded-full transition-colors mt-8"
        >
          Skapa konto gratis <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-sm text-stone-600 mt-6">
          Vill du förstå pengaflödet?{" "}
          <Link href="/guider/rot-avdrag-pa-faktura" className="underline hover:text-stone-900">Läs guiden om ROT-avdrag på fakturan</Link>
        </p>
      </section>

      <SiteFooter anchorBase="/" />
    </div>
  );
}
