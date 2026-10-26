import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, AlertCircle, ExternalLink, CreditCard } from "lucide-react";
import { SiteHeader, SiteFooter, SiteStyles } from "@/components/site/SiteChrome";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enkeltfaktura.com";
const PATH = "/guider/rut-avdrag-pa-faktura";

/* Skattefakta verifierade mot skatteverket.se 2026-10-26:
   safungerarrutavdraget + gerarbetetratttillrutavdrag.
   Kontrollera om innan sidan uppdateras – reglerna andras arligen. */
const UPPDATERAD = "26 oktober 2026";

export const metadata: Metadata = {
  title: "RUT-avdrag på fakturan 2026 – guide för dig som utför arbetet",
  description:
    "RUT är 50 procent av arbetskostnaden. Så drar du av det på fakturan, varför kunden aldrig får betala kontant och vilka rader som faller utanför avdraget.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "sv_SE",
    url: `${BASE}${PATH}`,
    siteName: "EnkeltFaktura",
    title: "RUT-avdrag på fakturan 2026 – guide för dig som utför arbetet",
    description: "50 procent av arbetskostnaden, kravet på elektronisk betalning och gränsfallen rad för rad.",
  },
};

const faqs = [
  {
    q: "Vad händer om kunden betalar kontant?",
    a: "Då finns ingen rätt till rutavdrag. Sedan 1 januari 2020 krävs elektronisk betalning för rutavdrag, alltså en betalning som är spårbar – swish, bankgiro, kortbetalning eller överföring. Tar du emot kontanter för ett rutjobb har du dragit av ett belopp på fakturan som du inte kan begära ut från Skatteverket. Det är du som utförare som sitter med förlusten.",
  },
  {
    q: "Hur mycket RUT kan en kund använda på ett år?",
    a: "Rot- och rutavdrag räknas ihop till högst 75 000 kronor per person och år, och av den summan får högst 50 000 kronor vara rotavdrag. Rut har alltså inget eget lägre tak – en kund utan rotjobb kan använda hela 75 000 kronor på rutarbete. Det skiljer rut från rot, som alltid stannar vid 50 000.",
  },
  {
    q: "Ger fönsterputsning rutavdrag även utvändigt?",
    a: "Fönsterputsning ligger under enklare städning, som ger rutavdrag. Arbetet ska utföras i eller i nära anslutning till kundens bostad, så putsning av bostadens fönster räknas – både in- och utsida av samma fönster är del av samma arbete. Lift, maskinhyra och framkörning ger däremot inget avdrag och ska ligga på egna rader.",
  },
  {
    q: "Varför får jag inte avdrag för plantering i trädgården?",
    a: "Skatteverket skiljer på att underhålla en trädgård och att anlägga den. Att klippa gräs, häckar, rosor och buskar eller kratta löv ger rutavdrag. Att plantera eller omplantera blommor, växter och träd gör det inte, och forsling av trädgårdsavfall ligger också utanför. Fakturerar du en vårstädning får underhållsarbetet och planteringen inte ligga på samma rad.",
  },
  {
    q: "Ger flyttjänster rutavdrag?",
    a: "Arbetet med att flytta kundens bohag mellan hens bostäder ger rutavdrag, liksom packarbetet i anslutning till flytten. Flyttbil, drivmedel, flyttkartonger och magasinhyra ger inget avdrag. På en flyttfaktura är det alltså vanligt att bara en del av beloppet är avdragsgrundande – dela upp raderna innan du räknar.",
  },
  {
    q: "Vilket år hör avdraget till?",
    a: "Det är datumet då kunden betalar för arbetet som styr vilket beskattningsår rutavdraget hamnar på, inte fakturadatumet. En faktura du skickar i december men som betalas i januari belastar nästa års utrymme hos kunden.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Start", item: BASE },
        { "@type": "ListItem", position: 2, name: "Guider", item: `${BASE}/guider` },
        { "@type": "ListItem", position: 3, name: "RUT-avdrag på fakturan", item: `${BASE}${PATH}` },
      ],
    },
    {
      "@type": "Article",
      headline: "RUT-avdrag på fakturan 2026 – guide för dig som utför arbetet",
      inLanguage: "sv-SE",
      datePublished: "2026-10-26",
      dateModified: "2026-10-26",
      author: { "@type": "Organization", name: "EnkeltFaktura" },
      publisher: { "@type": "Organization", name: "EnkeltFaktura" },
      mainEntityOfPage: `${BASE}${PATH}`,
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

/* Gransfallen, parvis. Den vanstra kolumnen ar det kunden tror att hen kopte,
   den hogra det som faktiskt inte far ligga pa samma rad. Paren ar hamtade ur
   Skatteverkets lista over rutarbeten - inte ur vad branschen brukar tro. */
const gransfall = [
  {
    omrade: "Städning",
    ger: "Dammsuga, damma, diska, putsa fönster, torka av altanen, städa skåp, kyl och frys",
    gerInte: "Kemtvätt, hemstajling, städning efter ett byggjobb",
  },
  {
    omrade: "Trädgård",
    ger: "Klippa gräs, häckar, rosor och buskar, kratta löv, fälla och beskära träd",
    gerInte: "Plantera eller omplantera blommor, växter och träd, forsla bort trädgårdsavfall",
  },
  {
    omrade: "Flytt",
    ger: "Flytta bohaget mellan kundens bostäder, packa och packa upp i anslutning till flytten",
    gerInte: "Flyttbil, drivmedel, flyttkartonger, magasinhyra",
  },
  {
    omrade: "Tvätt",
    ger: "Tvätta, stryka och laga kläder, sängkläder, gardiner och avtagbar soffklädsel",
    gerInte: "Kemtvätt",
  },
];

export default function RutGuide() {
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
            <Link href="/guider" className="hover:text-stone-900">Guider</Link>
            <span className="mx-2 text-stone-400" aria-hidden="true">/</span>
            <span className="text-stone-900">RUT-avdrag på fakturan</span>
          </nav>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-start">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl leading-[1.07]" style={{ color: "#13294B" }}>
                RUT-avdrag på fakturan
              </h1>
              <p className="text-lg text-stone-700 mt-5 leading-relaxed max-w-xl">
                Rut är enklare än rot på procenten och svårare på gränserna. Det som fäller en
                rutfaktura är sällan räknefelet – det är en rad som inte hör dit, eller en kund som
                lagt kontanter på köksbordet.
              </p>
              <p className="text-sm text-stone-600 mt-5">Uppdaterad {UPPDATERAD}</p>
            </div>

            {/* Snabbsvar – skrivet for att citeras rakt av */}
            <aside className="rounded-[1.4rem] border border-stone-200 bg-white p-7 sm:p-8 shadow-xl shadow-stone-900/[0.06]">
              <h2 className="font-semibold text-stone-900">Kort svar</h2>
              <p className="text-[15px] text-stone-700 leading-relaxed mt-3">
                RUT-avdraget är <strong>50 procent av arbetskostnaden inklusive moms</strong>. Rot och
                rut delar ett tak på <strong>75 000 kronor per person och år</strong>, och eftersom
                högst 50 000 av det får vara rot kan en kund utan rotjobb lägga{" "}
                <strong>hela 75 000 på rut</strong>. Arbetet ska utföras i eller i nära anslutning
                till kundens bostad, och <strong>kunden måste betala elektroniskt</strong> – annars
                finns ingen avdragsrätt.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* ───── Elektronisk betalning ───── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-14 items-start">
          <div>
            <p className="text-sm font-semibold text-teal-700 mb-3">Det som kostar pengar</p>
            <h2 className="font-display text-3xl sm:text-4xl text-stone-950">
              Kontant betalning raderar avdraget
            </h2>
            <p className="text-stone-700 mt-5 leading-relaxed">
              Rut har ett villkor som rot-guider sällan nämner: betalningen måste vara elektroniskt
              spårbar. Swish, bankgiro, kort eller överföring går bra. Kontanter gör det inte – och
              villkoret gäller oavsett hur korrekt resten av fakturan är.
            </p>
            <p className="text-stone-700 mt-4 leading-relaxed">
              Konsekvensen landar på dig. Du har redan dragit av halva arbetskostnaden på fakturan,
              men Skatteverket betalar inte ut den mot en kontant betalning. Kunden har betalat sin
              halva och gått vidare.
            </p>
          </div>

          <div className="rounded-[1.4rem] border-2 border-amber-200 bg-amber-50/50 p-7">
            <CreditCard className="w-6 h-6 text-amber-700" aria-hidden="true" />
            <blockquote className="mt-4">
              <p className="text-[15px] text-stone-800 leading-relaxed italic">
                &ldquo;Från och med 1 januari 2020 är det krav på elektronisk betalning för rätt
                till rutavdrag.&rdquo;
              </p>
              <footer className="text-sm text-stone-600 mt-3">
                <a
                  href="https://www.skatteverket.se/privat/fastigheterochbostad/rotarbeteochrutarbete/safungerarrutavdraget.4.d5e04db14b6fef2c866097.html"
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-1 underline hover:text-stone-900"
                >
                  Skatteverket <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                </a>
              </footer>
            </blockquote>
            <p className="text-sm text-stone-800 leading-relaxed mt-5 pt-5 border-t border-amber-200/70">
              Praktiskt: skriv betalsättet i avtalet och skicka fakturan med OCR-rad eller QR-kod i
              stället för att be om betalning på plats. Då blir den spårbara betalningen det enkla
              alternativet för kunden.
            </p>
          </div>
        </div>
      </section>

      {/* ───── Gransfallen ───── */}
      <section className="bg-white border-y border-stone-200/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-teal-700 mb-3">Gränsfallen</p>
            <h2 className="font-display text-3xl sm:text-4xl text-stone-950">
              Samma jobb, två rader
            </h2>
            <p className="text-stone-700 mt-4 leading-relaxed">
              De flesta rutjobb innehåller något som inte ger avdrag. Problemet uppstår när det
              hamnar på samma rad som arbetet – då är hela raden fel underlag.
            </p>
          </div>

          <div className="mt-10 overflow-x-auto">
            <table className="w-full text-[15px] min-w-[44rem] border-separate border-spacing-y-2">
              <caption className="sr-only">
                Arbeten som ger respektive inte ger rutavdrag, per område
              </caption>
              <thead>
                <tr className="text-left text-sm text-stone-600">
                  <th scope="col" className="font-semibold px-5 pb-2 w-32">Område</th>
                  <th scope="col" className="font-semibold px-5 pb-2">Ger rutavdrag</th>
                  <th scope="col" className="font-semibold px-5 pb-2">Egen rad, utan avdrag</th>
                </tr>
              </thead>
              <tbody>
                {gransfall.map((g) => (
                  <tr key={g.omrade} className="align-top">
                    <th scope="row" className="text-left font-semibold text-stone-900 px-5 py-4 rounded-l-2xl bg-stone-50 border-y border-l border-stone-200">
                      {g.omrade}
                    </th>
                    <td className="px-5 py-4 text-stone-800 bg-teal-50/40 border-y border-teal-100">
                      {g.ger}
                    </td>
                    <td className="px-5 py-4 text-stone-700 rounded-r-2xl bg-stone-50 border-y border-r border-stone-200">
                      {g.gerInte}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-stone-600 mt-6 max-w-3xl leading-relaxed">
            Listan är ett urval. Skatteverket har en fullständig genomgång av{" "}
            <a
              href="https://www.skatteverket.se/foretag/skatterochavdrag/rotochrut/gerarbetetratttillrutavdrag.4.2ef18e6a125660db8b080001531.html"
              target="_blank"
              rel="noopener"
              className="underline hover:text-stone-900"
            >
              vilka arbeten som ger rutavdrag
            </a>
            , indelad i fjorton kategorier – från barnpassning och it-tjänster till snöskottning och
            tillsyn. Är ett jobb ett gränsfall är det den listan som gäller, inte branschpraxis.
          </p>
        </div>
      </section>

      {/* ───── Taket ───── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-teal-700 mb-3">Taket 2026</p>
          <h2 className="font-display text-3xl sm:text-4xl text-stone-950">
            Rut får använda hela utrymmet
          </h2>
        </div>
        <div className="mt-8 rounded-[1.4rem] border border-stone-200 bg-white overflow-hidden max-w-3xl">
          <table className="w-full text-[15px]">
            <caption className="sr-only">Rot- och rutavdragets nivåer och tak 2026</caption>
            <tbody className="divide-y divide-stone-100">
              {[
                ["RUT", "50 % av arbetskostnaden", "upp till hela 75 000 kr"],
                ["ROT", "30 % av arbetskostnaden", "max 50 000 kr av taket"],
                ["Gemensamt tak", "ROT + RUT tillsammans", "75 000 kr/person/år"],
              ].map(([a, b, c]) => (
                <tr key={a}>
                  <th scope="row" className="text-left font-semibold text-stone-900 px-6 py-4 w-36">{a}</th>
                  <td className="px-6 py-4 text-stone-700">{b}</td>
                  <td className="px-6 py-4 text-right text-stone-900 font-medium tabular-nums">{c}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-stone-700 mt-5 max-w-3xl leading-relaxed">
          Asymmetrin är värd att förstå innan ett större jobb: en kund som inte har något rotjobb på
          året kan lägga hela 75 000 kronor på rutarbete, medan rotavdraget aldrig kommer över
          50 000. För en städ- eller trädgårdsfirma med återkommande kunder är det utrymmet sällan
          den begränsande faktorn – men fråga ändå, särskilt sent på året.
        </p>
      </section>

      {/* ───── Uppgifterna ───── */}
      <section className="bg-white border-y border-stone-200/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-teal-700 mb-3">Begäran om utbetalning</p>
            <h2 className="font-display text-3xl sm:text-4xl text-stone-950">
              Uppgifterna du behöver ha sparat
            </h2>
            <p className="text-stone-700 mt-4 leading-relaxed">
              Begäran görs elektroniskt, tidigast när arbetet är utfört och kunden har betalat sin
              del, och ska vara inne senast <strong>31 januari året efter betalningsåret</strong>.
            </p>
          </div>

          <ul className="grid sm:grid-cols-2 gap-x-10 gap-y-3 mt-8 max-w-4xl text-[15px] text-stone-800">
            {[
              "Kundens personnummer",
              "Faktiskt antal arbetade timmar för respektive arbete",
              "Vilken typ av rutarbete som utförts",
              "Arbetskostnad totalt, inklusive moms",
              "Debiterad materialkostnad",
              "Övrig kostnad – resor, maskiner, administration",
              "Belopp kunden har betalat, efter rutavdrag",
              "Begärt belopp, alltså rutavdraget",
            ].map((t) => (
              <li key={t} className="flex gap-2.5 border-b border-stone-100 pb-3">
                <span className="text-teal-700 shrink-0" aria-hidden="true">✓</span> {t}
              </li>
            ))}
          </ul>

          <div className="mt-8 rounded-2xl border border-stone-200 bg-stone-50 p-5 flex items-start gap-3 max-w-3xl">
            <AlertCircle className="w-5 h-5 text-stone-600 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-sm text-stone-800 leading-relaxed">
              Timmarna är den post som oftast saknas i efterhand. Ett fast pris på &rdquo;vårstädning
              utvändigt&rdquo; säger ingenting om antalet arbetade timmar – och det är ändå den
              uppgiften som ska lämnas. Skriv ned timmarna när jobbet görs, inte i januari.
            </p>
          </div>
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
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

        <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-5 text-sm text-stone-700 leading-relaxed">
          Den här guiden är skriven som vägledning, inte som skatterådgivning. Reglerna ändras och
          enskilda fall kan skilja sig åt – kontrollera alltid mot{" "}
          <a href="https://www.skatteverket.se/" target="_blank" rel="noopener" className="underline hover:text-stone-900">Skatteverket</a>{" "}
          vid osäkerhet. Uppgifterna på sidan kontrollerades {UPPDATERAD}.
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="bg-white border-t border-stone-200/70">
        <div className="max-w-5xl mx-auto px-5 sm:px-6 py-16 sm:py-24 text-center">
          <h2 className="font-display text-3xl sm:text-4xl text-stone-950">Håll raderna isär automatiskt</h2>
          <p className="text-stone-700 mt-4 leading-relaxed max-w-lg mx-auto">
            Markera vilka rader som är arbetskostnad – rutavdraget räknas på dem och bara dem.
            Material, framkörning och maskinhyra ligger kvar orörda. 14 dagar gratis utan kreditkort.
          </p>
          <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 bg-[#13294B] hover:bg-[#1e3a63] text-white font-semibold px-7 py-4 rounded-full transition-colors mt-8">
            Skapa konto gratis <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
          <p className="text-sm text-stone-600 mt-6">
            Gör du även rotarbeten?{" "}
            <Link href="/guider/rot-avdrag-pa-faktura" className="underline hover:text-stone-900">
              Läs guiden om ROT-avdrag på fakturan
            </Link>
          </p>
        </div>
      </section>

      <SiteFooter anchorBase="/" />
    </div>
  );
}
