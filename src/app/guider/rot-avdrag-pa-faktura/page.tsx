import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, AlertCircle, ExternalLink } from "lucide-react";
import { SiteHeader, SiteFooter, SiteStyles } from "@/components/site/SiteChrome";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enkeltfaktura.com";
const PATH = "/guider/rot-avdrag-pa-faktura";

/* Skattefakta verifierade mot skatteverket.se 2026-10-20.
   Uppgiftskraven och momshanteringen tillagda och verifierade 2026-10-26 mot
   safungerarrotavdraget (foretag) och FAQ:n om fakturans utformning.
   Kontrollera om innan sidan uppdateras – reglerna andras arligen. */
const UPPDATERAD = "26 oktober 2026";

export const metadata: Metadata = {
  title: "ROT-avdrag på fakturan 2026 – guide för dig som utför arbetet",
  description:
    "Så fakturerar du med ROT-avdrag 2026: vad som räknas som arbete, när du får begära pengarna från Skatteverket och varför betaldatumet avgör vilket år avdraget hör till.",
  alternates: { canonical: PATH },
  openGraph: {
    type: "article",
    locale: "sv_SE",
    url: `${BASE}${PATH}`,
    siteName: "EnkeltFaktura",
    title: "ROT-avdrag på fakturan 2026 – guide för dig som utför arbetet",
    description: "Pengaflödet steg för steg: faktura, kundens betalning, ansökan till Skatteverket.",
  },
};

const faqs = [
  {
    q: "Vilka uppgifter ska lämnas i begäran om utbetalning?",
    a: "Företaget ska lämna faktiskt antal arbetade timmar för respektive arbete, debiterad materialkostnad, övrig kostnad som resor, maskiner och administration, arbetskostnaden totalt inklusive moms, det belopp kunden har betalat efter rotavdrag samt det begärda beloppet. Timmarna är den uppgift som oftast saknas i efterhand – ett fast pris säger ingenting om antalet timmar, men timmarna ska ändå lämnas.",
  },
  {
    q: "Räknas rotavdraget på arbetskostnaden med eller utan moms?",
    a: "Med moms. Rotavdraget är 30 procent av arbetskostnaden inklusive moms, och i begäran om utbetalning redovisas arbetskostnad, kundens betalning och begärt belopp inklusive moms. Själva avdraget ändrar däremot inte din utgående moms: momsen beräknas på hela arbetskostnaden, oavsett att kunden bara betalar 70 procent av den och Skatteverket resten.",
  },
  {
    q: "Ska fakturan visa beloppen med eller utan moms?",
    a: "Båda. Skatteverket anger att fakturan ska visa fakturans totala belopp exklusive och inklusive moms, samt momsens storlek och procentsats. Dessutom ska fördelningen av kostnaden på arbete respektive material och övriga kostnader framgå, tillsammans med skattereduktionens storlek.",
  },
  {
    q: "När får jag pengarna från Skatteverket?",
    a: "Först när arbetet är utfört och kunden har betalat sin del får du ansöka om utbetalning. Ansökan ska göras senast den 31 januari året efter betalningsåret. Du ligger alltså ute med avdragsbeloppet från det att fakturan skickas till dess att kunden betalar och ansökan går igenom.",
  },
  {
    q: "Vilket år hör avdraget till om jobbet görs i december och betalas i januari?",
    a: "Det är betalningsdatumet som avgör vilket beskattningsår avdraget tillhör, inte när arbetet utfördes. Ett jobb som görs i december men betalas i januari belastar alltså nästa års tak för kunden. Det kan vara avgörande för en kund som redan fyllt årets utrymme.",
  },
  {
    q: "Ger resekostnader och framkörning ROT-avdrag?",
    a: "Nej. Skatteverket anger uttryckligen: \"Material och andra kostnader, som resekostnader, ger däremot inte rätt till avdrag.\" Framkörning, transport, maskinhyra och bortforsling ska faktureras som egna rader utan avdrag.",
  },
  {
    q: "Vad händer om kundens tak redan är fullt?",
    a: "Skatteverket medger inte avdraget om utrymmet är slut. Kom överens i avtalet om hur betalningen ska hanteras i det läget – vem som får stå för beloppet beror bland annat på avtalet och orsaken till avslaget. Fråga kunden om kvarvarande utrymme innan större jobb, och dokumentera svaret.",
  },
  {
    q: "Kan två personer i samma hushåll dela på ett jobb?",
    a: "Två delägare kan dela på avdraget om båda uppfyller villkoren och har skatte- och avdragsutrymme kvar. Ange hur avdraget ska fördelas mellan dem. Avdraget kan tillsammans aldrig överstiga 30 procent av den avdragsgrundande arbetskostnaden.",
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
        { "@type": "ListItem", position: 3, name: "ROT-avdrag på fakturan", item: `${BASE}${PATH}` },
      ],
    },
    {
      "@type": "Article",
      headline: "ROT-avdrag på fakturan 2026 – guide för dig som utför arbetet",
      inLanguage: "sv-SE",
      datePublished: "2026-10-20",
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

const steg = [
  { n: "01", t: "Dela fakturan i arbete och material", d: "Avdraget räknas bara på arbetskostnaden. Material, framkörning, maskinhyra och bortforsling ska ligga på egna rader utan avdrag." },
  { n: "02", t: "Dra av rotavdraget direkt", d: "Kunden betalar bara sin andel – 70 procent av arbetskostnaden vid ROT. Det är det som kallas fakturamodellen." },
  { n: "03", t: "Vänta på kundens betalning", d: "Du får inte ansöka innan kunden betalat. Fram till dess ligger du ute med avdragsbeloppet." },
  { n: "04", t: "Ansök om utbetalning", d: "När arbetet är utfört och kunden har betalat sin del kan du begära utbetalning. Ansök senast den 31 januari året efter betalningsåret. Betalningsdatumet avgör vilket beskattningsår avdraget hör till." },
];

export default function RotGuide() {
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
            <span className="text-stone-900">ROT-avdrag på fakturan</span>
          </nav>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-start">
            <div>
              <h1 className="font-display text-4xl sm:text-5xl leading-[1.07]" style={{ color: "#13294B" }}>
                ROT-avdrag på fakturan
              </h1>
              <p className="text-lg text-stone-700 mt-5 leading-relaxed max-w-xl">
                De flesta guider förklarar ROT från kundens håll. Den här är skriven för dig som
                utför arbetet och ska få betalt – med fokus på pengaflödet: när du fakturerar, när
                kunden betalar och när Skatteverket betalar dig.
              </p>
              <p className="text-sm text-stone-600 mt-5">Uppdaterad {UPPDATERAD}</p>
            </div>

            {/* Snabbsvar – skrivet for att citeras rakt av */}
            <aside className="rounded-[1.4rem] border border-stone-200 bg-white p-7 sm:p-8 shadow-xl shadow-stone-900/[0.06]">
              <h2 className="font-semibold text-stone-900">Kort svar</h2>
              <p className="text-[15px] text-stone-700 leading-relaxed mt-3">
                ROT-avdraget är <strong>30 procent av arbetskostnaden inklusive moms</strong> under
                2026, med ett tak på <strong>50 000 kronor per person och år</strong>. Du drar av rotavdraget på
                fakturan och begär utbetalning från Skatteverket – men först{" "}
                <strong>efter att kunden har betalat sin del</strong>. Avdraget gäller bara arbete, aldrig
                material eller resor.
              </p>
            </aside>
          </div>
        </div>
      </section>

      {/* ───── Pengaflodet ───── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-teal-700 mb-3">Pengaflödet</p>
          <h2 className="font-display text-3xl sm:text-4xl text-stone-950">Fyra steg från jobb till betalt</h2>
        </div>
        <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-10">
          {steg.map((s) => (
            <li key={s.n} className="rounded-2xl border border-stone-200 bg-white p-5">
              <div aria-hidden="true" className="font-display text-4xl text-teal-600 leading-none">{s.n}</div>
              <p className="font-semibold text-stone-900 mt-3">{s.t}</p>
              <p className="text-sm text-stone-700 leading-relaxed mt-1.5">{s.d}</p>
            </li>
          ))}
        </ol>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/60 p-5 flex items-start gap-3 max-w-3xl">
          <AlertCircle className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" aria-hidden="true" />
          <p className="text-sm text-stone-800 leading-relaxed">
            <strong>Det här är kassaflödesrisken:</strong> du drar av beloppet på fakturan direkt,
            men får det inte från Skatteverket förrän kunden betalat och ansökan gått igenom. Vid
            ett stort badrumsjobb kan det handla om tiotusentals kronor du ligger ute med. Räkna
            med det när du planerar likviditeten – särskilt om flera stora jobb ligger nära varandra.
          </p>
        </div>
      </section>

      {/* ───── Vad som raknas ───── */}
      <section className="bg-white border-y border-stone-200/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-teal-700 mb-3">Vad som räknas</p>
            <h2 className="font-display text-3xl sm:text-4xl text-stone-950">Bara arbete – inget annat</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-10 max-w-4xl">
            <div className="rounded-[1.4rem] border-2 border-teal-200 bg-teal-50/30 p-6">
              <h3 className="font-semibold text-stone-900">Ger avdrag</h3>
              <ul className="mt-4 space-y-2 text-[15px] text-stone-800">
                {["Arbetskostnad för godkända rotarbeten", "Reparation och underhåll", "Om- och tillbyggnad", "Rivning som ingår i arbetet", "Felsökning i samband med en reparation"].map((t) => (
                  <li key={t} className="flex gap-2.5"><span className="text-teal-700" aria-hidden="true">✓</span> {t}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-[1.4rem] border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-900">Ger inget avdrag</h3>
              <ul className="mt-4 space-y-2 text-[15px] text-stone-700">
                {["Material och varor", "Resor och framkörning", "Maskinhyra", "Bortforsling och deponi", "Arbete som inte omfattas av rotreglerna"].map((t) => (
                  <li key={t} className="flex gap-2.5"><span className="text-stone-400" aria-hidden="true">✕</span> {t}</li>
                ))}
              </ul>
            </div>
          </div>

          <blockquote className="mt-8 max-w-3xl border-l-4 border-stone-300 pl-5 py-1">
            <p className="text-[15px] text-stone-800 leading-relaxed italic">
              &ldquo;Material och andra kostnader, som resekostnader, ger däremot inte rätt till avdrag.&rdquo;
            </p>
            <footer className="text-sm text-stone-600 mt-2">
              <a href="https://www.skatteverket.se/privat/fastigheterochbostad/rotochrutarbete.4.2e56d4ba1202f95012080002966.html" target="_blank" rel="noopener" className="inline-flex items-center gap-1 underline hover:text-stone-900">
                Skatteverket <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
              </a>
            </footer>
          </blockquote>
        </div>
      </section>

      {/* ───── Nivaer ───── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-teal-700 mb-3">Nivåer och tak 2026</p>
          <h2 className="font-display text-3xl sm:text-4xl text-stone-950">Siffrorna du behöver</h2>
        </div>
        <div className="mt-8 rounded-[1.4rem] border border-stone-200 bg-white overflow-hidden max-w-3xl">
          <table className="w-full text-[15px]">
            <caption className="sr-only">ROT- och RUT-avdragets nivåer och tak 2026</caption>
            <tbody className="divide-y divide-stone-100">
              {[
                ["ROT", "30 % av arbetskostnaden", "max 50 000 kr/person/år"],
                ["RUT", "50 % av arbetskostnaden", "inom det gemensamma taket"],
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
          Under perioden <strong>12 maj – 31 december 2025</strong> var ROT tillfälligt höjt till
          50 procent. Den nivån gällde för fakturor som kunden <strong>betalade</strong> inom den
          perioden. Från 1 januari 2026 gäller 30 procent igen – räkna om offerter som är äldre än så.
        </p>
      </section>

      {/* ───── Uppgifterna ───── */}
      <section className="bg-white border-y border-stone-200/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-teal-700 mb-3">Rotuppgifter</p>
            <h2 className="font-display text-3xl sm:text-4xl text-stone-950">
              Uppgifterna som ska lämnas
            </h2>
            <p className="text-stone-700 mt-4 leading-relaxed">
              Rotavdrag är två uppgiftskrav, inte ett: fakturan har sin obligatoriska innehålls&shy;lista,
              och begäran om utbetalning har en annan. Den som bara fyller i det ena får avslag på
              det andra.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mt-10 max-w-4xl">
            <div className="rounded-[1.4rem] border border-stone-200 p-6">
              <h3 className="font-semibold text-stone-900">På fakturan</h3>
              <ul className="mt-4 space-y-2.5 text-[15px] text-stone-800">
                {[
                  "Vem som har utfört arbetet, och att utföraren har F-skatt",
                  "Kundens personnummer",
                  "Vilken typ av arbete som har utförts",
                  "Var arbetet är utfört och under vilken tidsperiod",
                  "Fastighetsbeteckning – eller föreningens organisationsnummer och lägenhetsnummer",
                  "Fördelningen av kostnaden på arbete respektive material och övriga kostnader",
                  "Totalbeloppet exklusive och inklusive moms, samt momsens storlek och procentsats",
                  "Skattereduktionens storlek",
                ].map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <span className="text-teal-700 shrink-0" aria-hidden="true">✓</span> {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-[1.4rem] border-2 border-teal-200 bg-teal-50/30 p-6">
              <h3 className="font-semibold text-stone-900">I begäran om utbetalning</h3>
              <ul className="mt-4 space-y-2.5 text-[15px] text-stone-800">
                {[
                  "Faktiskt antal arbetade timmar för respektive arbete",
                  "Debiterad materialkostnad",
                  "Övrig kostnad – resor, maskiner, administration",
                  "Arbetskostnad totalt, inklusive moms",
                  "Belopp kunden har betalat, efter rotavdrag",
                  "Begärt belopp, alltså rotavdraget",
                ].map((t) => (
                  <li key={t} className="flex gap-2.5">
                    <span className="text-teal-700 shrink-0" aria-hidden="true">✓</span> {t}
                  </li>
                ))}
              </ul>
              <p className="text-sm text-stone-700 leading-relaxed mt-5 pt-5 border-t border-teal-200/70">
                Timmarna är den post som försvinner först. Ett fast pris på ett badrum säger
                ingenting om antalet arbetade timmar – och det är ändå den uppgiften Skatteverket
                begär. Anteckna timmarna medan jobbet pågår.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ───── ROT och momsen ───── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-14 items-start">
          <div>
            <p className="text-sm font-semibold text-teal-700 mb-3">ROT och momsen</p>
            <h2 className="font-display text-3xl sm:text-4xl text-stone-950">
              Avdraget sänker inte momsen
            </h2>
            <p className="text-stone-700 mt-5 leading-relaxed">
              Det vanligaste missförståndet är att rotavdraget skulle minska den moms du redovisar.
              Det gör det inte. Arbetskostnaden är densamma – kunden betalar 70 procent av den och
              Skatteverket 30 procent. Den utgående momsen beräknas på hela arbetskostnaden.
            </p>
            <p className="text-stone-700 mt-4 leading-relaxed">
              Därför anges beloppen inklusive moms i begäran om utbetalning, medan fakturan ska visa
              totalbeloppet både exklusive och inklusive moms tillsammans med momssatsen. Räknar du
              i stället 30 procent på arbetskostnaden exklusive moms blir avdraget för lågt, och
              kunden betalar mer än hen skulle.
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-stone-200 bg-white p-7">
            <h3 className="font-semibold text-stone-900">Räkneexempel</h3>
            <p className="text-sm text-stone-600 mt-1">Arbetskostnad 25 000 kr inklusive moms</p>
            <dl className="mt-5 space-y-3 text-[15px]">
              {[
                ["Arbetskostnad inklusive moms", "25 000 kr"],
                ["Varav moms, 25 %", "5 000 kr"],
                ["Rotavdrag, 30 % av 25 000 kr", "−7 500 kr"],
                ["Kunden betalar", "17 500 kr"],
                ["Du begär från Skatteverket", "7 500 kr"],
              ].map(([k, v], i, arr) => (
                <div
                  key={k}
                  className={`flex justify-between gap-4 ${i === arr.length - 1 ? "pt-3 border-t border-stone-200 font-semibold text-stone-900" : "text-stone-700"}`}
                >
                  <dt>{k}</dt>
                  <dd className="tabular-nums font-medium">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="text-sm text-stone-700 leading-relaxed mt-5 pt-5 border-t border-stone-100">
              Momsen du redovisar är 5 000 kronor – beräknad på 25 000, inte på de 17 500 kunden
              betalade. Exemplet utgår från 25 procent moms på byggtjänster till privatperson.
            </p>
          </div>
        </div>
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

          <div className="mt-10 rounded-2xl border border-stone-200 bg-stone-50 p-5 text-sm text-stone-700 leading-relaxed">
            Den här guiden är skriven som vägledning, inte som skatterådgivning. Reglerna ändras och
            enskilda fall kan skilja sig åt – kontrollera alltid mot{" "}
            <a href="https://www.skatteverket.se/" target="_blank" rel="noopener" className="underline hover:text-stone-900">Skatteverket</a>{" "}
            vid osäkerhet. Uppgifterna på sidan kontrollerades {UPPDATERAD}.
          </div>
        </div>
      </section>

      {/* ───── CTA ───── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-6 py-16 sm:py-24 text-center">
        <h2 className="font-display text-3xl sm:text-4xl text-stone-950">Slipp räkna ROT för hand</h2>
        <p className="text-stone-700 mt-4 leading-relaxed max-w-lg mx-auto">
          Markera vad som är arbetskostnad – avdraget räknas ut och hamnar rätt på fakturan.
          14 dagar gratis utan kreditkort.
        </p>
        <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 bg-[#13294B] hover:bg-[#1e3a63] text-white font-semibold px-7 py-4 rounded-full transition-colors mt-8">
          Skapa konto gratis <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-sm text-stone-600 mt-6">
          <Link href="/for/hantverkare" className="underline hover:text-stone-900">Se hur det fungerar för hantverkare</Link>
          <span className="mx-2.5 text-stone-400" aria-hidden="true">·</span>
          <Link href="/guider/rut-avdrag-pa-faktura" className="underline hover:text-stone-900">Guiden om RUT-avdrag</Link>
        </p>
      </section>

      <SiteFooter anchorBase="/" />
    </div>
  );
}
