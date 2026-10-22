import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, AlertCircle, Check } from "lucide-react";
import { SiteHeader, SiteFooter, SiteStyles } from "@/components/site/SiteChrome";

/* Omvand betalningsskyldighet. Galler bland annat byggtjanster till foretag
   i byggsektorn - alltsa mitt i var storsta malgrupp - och tjanster till
   foretag i andra EU-lander.

   Allt har ar hamtat fran Skatteverkets sida om omvand betalningsskyldighet
   och sidan om att salja tjanster till andra EU-lander. Listan over
   situationer ar medvetet inte uttommande; bara de fall som faktiskt ror
   dem som anvander tjansten ar med. */

const BASE = "https://enkeltfaktura.com";
const PATH = "/guider/omvand-betalningsskyldighet";
const SENAST_KONTROLLERAD = "22 oktober 2026";

export const metadata: Metadata = {
  title: "Omvänd betalningsskyldighet – när du inte ska lägga på moms",
  description:
    "Byggtjänster till företag i byggsektorn och tjänster till företag i andra EU-länder faktureras utan moms. Så skriver du fakturan rätt.",
  alternates: { canonical: PATH },
  openGraph: {
    title: "Omvänd betalningsskyldighet – när du inte ska lägga på moms",
    description:
      "Två vanliga fall: byggtjänster inom byggsektorn och tjänster till EU-företag. Vad som måste stå på fakturan.",
    url: `${BASE}${PATH}`,
    type: "article",
  },
};

const FRAGOR = [
  {
    q: "Vad betyder omvänd betalningsskyldighet?",
    a: "Att du som säljare inte lägger på någon moms. I stället är det köparen som räknar ut och redovisar momsen i sin egen momsdeklaration. Du fakturerar alltså beloppet utan moms, trots att försäljningen är momspliktig.",
  },
  {
    q: "Vad måste stå på fakturan?",
    a: "Texten ”omvänd betalningsskyldighet” och köparens momsregistreringsnummer. Saknas något av det är fakturan inte komplett, och köparen kan få problem med sin redovisning.",
  },
  {
    q: "Gäller det alla byggföretag?",
    a: "Regeln gäller försäljning av byggtjänster till företag i byggsektorn. Säljer du samma tjänst till en privatperson gäller vanlig moms – och då kan ROT-avdrag bli aktuellt i stället. Det är alltså köparen som avgör vilken regel som gäller, inte arbetet.",
  },
  {
    q: "Vad gäller vid försäljning till ett företag i ett annat EU-land?",
    a: "Säljer du en tjänst enligt huvudregeln till en beskattningsbar person i ett annat EU-land beskattas tjänsten i köparens land. Du fakturerar utan moms, anger omvänd betalningsskyldighet och köparens momsregistreringsnummer.",
  },
  {
    q: "Måste jag lämna periodisk sammanställning?",
    a: "Ja, vid försäljning till företag i andra EU-länder ska du lämna uppgift om köparens momsregistreringsnummer och beloppet i en periodisk sammanställning. Säljer du bara tjänster räcker det med en gång per kvartal – den behöver inte lämnas varje månad.",
  },
  {
    q: "Gäller det även dyr elektronik?",
    a: "Ja, i vissa fall. Omvänd betalningsskyldighet gäller bland annat vid försäljning av mobiltelefoner, spelkonsoler, surfplattor och bärbara datorer när beloppet på fakturan överstiger 100 000 kronor. Det är fakturans belopp som avgör, inte årets samlade försäljning.",
  },
];

const FALL = [
  {
    rubrik: "Byggtjänster inom byggsektorn",
    text: "Säljer du byggtjänster till ett företag i byggsektorn ska du inte lägga på moms. Det här är det vanligaste fallet för hantverkare som jobbar som underentreprenör åt ett annat byggföretag.",
    vem: "Snickare, elektriker, målare, plattsättare, markarbetare och andra som fakturerar en byggfirma i stället för en privatperson.",
  },
  {
    rubrik: "Tjänster till företag i andra EU-länder",
    text: "Säljer du en tjänst enligt huvudregeln till en beskattningsbar person i ett annat EU-land beskattas den i köparens land. Du fakturerar utan moms och lämnar periodisk sammanställning.",
    vem: "Konsulter, utvecklare, designers, översättare och andra som har kunder utanför Sverige men inom EU.",
  },
  {
    rubrik: "Dyrare elektronik",
    text: "Vid försäljning av bland annat mobiltelefoner, spelkonsoler, surfplattor och bärbara datorer gäller omvänd betalningsskyldighet när fakturans belopp överstiger 100 000 kronor.",
    vem: "Den som säljer vidare hårdvara i större poster.",
  },
];

export default function OmvandPage() {
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
      { "@type": "ListItem", position: 3, name: "Omvänd betalningsskyldighet", item: `${BASE}${PATH}` },
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
          <span className="text-stone-900">Omvänd betalningsskyldighet</span>
        </nav>

        <h1 className="font-display text-4xl sm:text-5xl leading-[1.08] text-stone-950">
          Omvänd betalningsskyldighet: när du inte ska lägga på moms
        </h1>
        <p className="text-stone-700 text-lg leading-relaxed mt-5">
          I vissa fall ska säljaren inte ta ut någon moms alls – köparen räknar ut och redovisar
          den själv. Det vanligaste fallet för en hantverkare är inte utlandsförsäljning, utan
          att kunden är ett annat byggföretag.
        </p>
      </section>

      {/* ───── Nar galler det ───── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pb-4">
        <h2 className="font-display text-3xl text-stone-950">Tre fall som berör de flesta</h2>
        <div className="mt-6 space-y-4">
          {FALL.map((f) => (
            <div key={f.rubrik} className="rounded-[1.4rem] border border-stone-200 bg-white p-6 sm:p-7">
              <h3 className="font-semibold text-lg text-stone-900">{f.rubrik}</h3>
              <p className="text-[15px] text-stone-700 leading-relaxed mt-2.5">{f.text}</p>
              <p className="text-sm text-stone-600 leading-relaxed mt-3 pt-3 border-t border-stone-100">
                <span className="font-medium text-stone-700">Vem det gäller: </span>{f.vem}
              </p>
            </div>
          ))}
        </div>
        <p className="text-sm text-stone-600 mt-4">
          Listan är inte fullständig. Omvänd betalningsskyldighet gäller även bland annat guld,
          skrot, batterier och utsläppsrätter.
        </p>
      </section>

      {/* ───── Pa fakturan ───── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pt-10 pb-4">
        <h2 className="font-display text-3xl text-stone-950">Det här måste stå på fakturan</h2>
        <ul className="mt-5 space-y-2.5">
          {[
            "Texten ”omvänd betalningsskyldighet”",
            "Köparens momsregistreringsnummer",
            "Beloppet utan moms – ingen momsrad ska läggas på",
          ].map((p) => (
            <li key={p} className="flex items-start gap-2.5 text-[15px] text-stone-800">
              <Check className="w-4 h-4 text-teal-700 mt-1 shrink-0" aria-hidden="true" />
              <span>{p}</span>
            </li>
          ))}
        </ul>

        <div className="flex items-start gap-3 mt-6 rounded-[1.2rem] bg-amber-50 border border-amber-200 px-5 py-4">
          <AlertCircle className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-[15px] text-amber-900 leading-relaxed">
            Det är <strong>köparen</strong> som avgör vilken regel som gäller, inte arbetet. Samma
            badrumsrenovering faktureras med 25 procent moms och möjligt ROT-avdrag till en
            privatperson – och helt utan moms till ett byggföretag.
          </p>
        </div>
      </section>

      {/* ───── Exempel ───── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pt-10 pb-4">
        <h2 className="font-display text-3xl text-stone-950">Samma arbete, två fakturor</h2>
        <div className="grid gap-4 sm:grid-cols-2 mt-6">
          <div className="rounded-[1.4rem] border border-stone-200 bg-white p-6 font-mono text-sm text-stone-800">
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">Till privatperson</p>
            <div className="space-y-1.5">
              <div className="flex justify-between"><span>Arbete</span><span className="tabular-nums">20 000,00</span></div>
              <div className="flex justify-between"><span>Material</span><span className="tabular-nums">10 000,00</span></div>
              <div className="flex justify-between text-stone-600"><span>Moms 25 %</span><span className="tabular-nums">7 500,00</span></div>
              <div className="flex justify-between text-teal-700"><span>ROT-avdrag</span><span className="tabular-nums">−7 500,00</span></div>
              <div className="flex justify-between border-t border-stone-200 pt-2 mt-2 font-semibold"><span>Att betala</span><span className="tabular-nums">30 000,00</span></div>
            </div>
          </div>

          <div className="rounded-[1.4rem] border border-stone-200 bg-white p-6 font-mono text-sm text-stone-800">
            <p className="font-sans text-xs font-semibold uppercase tracking-wider text-stone-500 mb-3">Till byggföretag</p>
            <div className="space-y-1.5">
              <div className="flex justify-between"><span>Arbete</span><span className="tabular-nums">20 000,00</span></div>
              <div className="flex justify-between"><span>Material</span><span className="tabular-nums">10 000,00</span></div>
              <div className="flex justify-between text-stone-600"><span>Moms</span><span className="tabular-nums">0,00</span></div>
              <div className="flex justify-between border-t border-stone-200 pt-2 mt-2 font-semibold"><span>Att betala</span><span className="tabular-nums">30 000,00</span></div>
              <p className="font-sans text-xs text-stone-600 pt-2.5 leading-relaxed">
                Omvänd betalningsskyldighet.<br />Köparens momsreg.nr: SE…01
              </p>
            </div>
          </div>
        </div>
        <p className="text-stone-700 leading-relaxed mt-5">
          Samma summa att betala, men av helt olika skäl. I det vänstra fallet drar kunden nytta av{" "}
          <Link href="/guider/rot-avdrag-pa-faktura" className="text-[#13294B] underline decoration-stone-300 hover:decoration-[#13294B] underline-offset-2">
            ROT-avdraget
          </Link>
          . I det högra är det köparen som redovisar momsen.
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
            Reglerna är hämtade från{" "}
            <a href="https://www.skatteverket.se/foretag/moms/sarskildamomsregler/omvandbetalningsskyldighet.4.47eb30f51122b1aaad28000258292.html" rel="noopener" className="underline decoration-stone-300 hover:decoration-stone-600 underline-offset-2">
              Skatteverkets sida om omvänd betalningsskyldighet
            </a>{" "}
            och deras information om försäljning av tjänster till andra EU-länder, kontrollerade {SENAST_KONTROLLERAD}.
          </p>
          <p>
            Sidan tar upp de vanligaste fallen, inte alla. Om just din försäljning omfattas är en
            bedömning i det enskilda fallet – fråga Skatteverket eller din redovisningskonsult
            innan du fakturerar utan moms.
          </p>
        </div>
      </section>

      {/* ───── Avslut ───── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 pt-12 pb-20 sm:pb-24 text-center">
        <h2 className="font-display text-3xl sm:text-4xl text-stone-950">
          Fakturera både privatpersoner och företag
        </h2>
        <p className="text-stone-700 mt-4 leading-relaxed max-w-lg mx-auto">
          ROT och RUT för privatkunder, moms per rad för företagskunder.
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
