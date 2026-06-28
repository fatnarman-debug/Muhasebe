import Link from "next/link";
import {
  ArrowRight, Check, FileText, Receipt, Percent, QrCode, LayoutTemplate, Mail,
  BellRing, ShieldCheck, Lock, Building2, UserRound, Sparkles, ScanLine,
} from "lucide-react";

/* ─────────────────────────  Innehåll (svenska)  ───────────────────────── */

const segments = [
  {
    icon: UserRound,
    tag: "Egenföretagare",
    title: "Skicka din första faktura idag",
    desc: "Fyll i ditt företag en gång – fakturera sedan på under en minut. Inga krångliga inställningar, inga konstiga termer.",
    points: ["Faktura & offert på 60 sek", "ROT/RUT räknas ut automatiskt", "PDF & e-post direkt till kund"],
  },
  {
    icon: UserRound,
    tag: "Redovisningskonsult",
    title: "Alla dina kunder på ett ställe",
    desc: "Hantera de kunder du blivit tilldelad, skapa fakturor och offerter åt dem – alltid med rätt mall och rätt uppgifter.",
    points: ["Ser bara dina egna kunder", "Snabb fakturering per kund", "Utkast, redigering & utskick"],
  },
  {
    icon: Building2,
    tag: "Redovisningsbyrå",
    title: "Full kontroll över hela byrån",
    desc: "Bjud in konsulter, tilldela kunder och håll ordning. Roller, behörigheter och krypterad backup ingår.",
    points: ["Roller & behörigheter", "Tilldela kunder till konsulter", "Krypterad backup (AES-256, EU)"],
  },
];

const features = [
  { icon: FileText, title: "Fakturor & offerter", desc: "Samma smidiga flöde. Skapa en offert och omvandla den till faktura med ett klick när kunden tackar ja." },
  { icon: Percent, title: "ROT- & RUT-avdrag", desc: "Avdraget beräknas automatiskt och visas korrekt på fakturan – enligt Skatteverkets regler." },
  { icon: ScanLine, title: "OCR & bankgiro", desc: "Maskinläsbar betalrad längst ner. Kunden skannar i bankappen och betalar rätt belopp direkt." },
  { icon: LayoutTemplate, title: "10+ proffsiga mallar", desc: "Klassiska och moderna mallar. Välj en gång per företag – sedan ser varje faktura likadan och prydlig ut." },
  { icon: Mail, title: "PDF & e-post", desc: "Ladda ner som PDF eller skicka direkt till kundens inkorg med fakturan bifogad." },
  { icon: BellRing, title: "Påminnelser", desc: "Skicka betalningspåminnelse med påminnelseavgift när en faktura förfaller – utan att lyfta ett finger." },
  { icon: ShieldCheck, title: "Roller & säkerhet", desc: "Varje konsult ser bara sina kunder. Tydlig behörighetsstyrning i tre nivåer." },
  { icon: Lock, title: "Krypterad backup", desc: "Säkerhetskopiera hela konton krypterat (AES-256) och lagrat inom EU. Återställ när som helst." },
];

const steps = [
  { n: "01", title: "Skapa konto", desc: "Gratis på 30 sekunder. Inget kreditkort." },
  { n: "02", title: "Lägg in ditt företag", desc: "Logotyp, bankgiro och fakturamall – en gång." },
  { n: "03", title: "Skapa faktura eller offert", desc: "Välj kund, fyll i rader, klart." },
  { n: "04", title: "Skicka & få betalt", desc: "PDF, e-post och OCR – kunden betalar enkelt." },
];

const plans = [
  {
    name: "Gratis", price: "0", period: "kr", note: "För att komma igång",
    features: ["1 företag", "5 kunder", "Fakturor & PDF", "3 mallar"],
    cta: "Kom igång", highlight: false,
  },
  {
    name: "Privat", price: "99", period: "kr/mån", note: "För egenföretagare",
    features: ["Obegränsade fakturor & offerter", "ROT/RUT-avdrag", "10+ mallar", "E-post & påminnelser", "OCR & bankgiro"],
    cta: "Testa gratis", highlight: true,
  },
  {
    name: "Byrå", price: "299", period: "kr/mån", note: "För redovisningsbyråer",
    features: ["Allt i Privat", "Flera konsulter", "Tilldela kunder", "Roller & behörigheter", "Krypterad backup & support"],
    cta: "Kom igång", highlight: false,
  },
];

const trustChips = ["Bankgiro", "OCR-referens", "ROT/RUT", "F-skatt", "E-faktura", "GDPR · EU-data"];

const faqs = [
  { q: "Är LedgerFlow gratis att börja med?", a: "Ja. Du kommer igång helt gratis utan kreditkort och kan skicka riktiga fakturor direkt. Uppgradera först när du behöver mer." },
  { q: "Stödjer ni ROT- och RUT-avdrag?", a: "Ja. När du markerar arbetskostnad räknas ROT- eller RUT-avdraget ut automatiskt och visas korrekt på fakturan enligt Skatteverkets regler." },
  { q: "Kan kunden betala via OCR och bankgiro?", a: "Ja. Varje faktura får en maskinläsbar betalrad (optisk rad, typ 41) längst ner och en QR-kod som kunden kan skanna i sin bankapp för att betala rätt belopp." },
  { q: "Kan jag skicka offerter och omvandla dem till fakturor?", a: "Ja. Skapa en offert med egen nummerserie. När kunden accepterar omvandlar du den till en faktura med ett klick – offerten finns kvar i historiken." },
  { q: "Var lagras min data?", a: "All data lagras inom EU (Supabase, regionen West EU / Irland) och säkerhetskopior krypteras med AES-256. LedgerFlow är byggt med GDPR i åtanke." },
  { q: "Passar det redovisningsbyråer med flera konsulter?", a: "Ja. Byråplanen låter dig bjuda in konsulter, tilldela kunder och styra behörigheter i tre nivåer – varje konsult ser bara sina egna kunder." },
  { q: "Finns det bindningstid?", a: "Nej. Alla planer börjar gratis och du kan säga upp när du vill. Inga bindningstider, inga dolda avgifter." },
];

/* ─────────────────────────  JSON-LD (SEO)  ───────────────────────── */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "LedgerFlow",
      url: "https://ledgerflow.se",
      description: "Faktureringssystem för svenska företag – egenföretagare, konsulter och redovisningsbyråer.",
    },
    {
      "@type": "SoftwareApplication",
      name: "LedgerFlow",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "SEK" },
      description: "Skapa fakturor och offerter, ROT/RUT, OCR & bankgiro, PDF och e-post – på svenska.",
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

/* ─────────────────────────  Sida  ───────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-blue-600/15">
      <style>{`
        html { scroll-behavior: smooth; }
        .font-display { font-family: var(--font-display), Georgia, "Times New Roman", serif; letter-spacing: -0.01em; }
        section[id] { scroll-margin-top: 84px; }
        @keyframes lf-rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }
        .lf-rise { animation: lf-rise .7s cubic-bezier(.16,1,.3,1) both; }
        @media (prefers-reduced-motion: reduce) { .lf-rise { animation: none; } html { scroll-behavior: auto; } }
      `}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ───── Nav ───── */}
      <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-white grid place-items-center">
              <Receipt className="w-4 h-4" strokeWidth={2} />
            </span>
            <span className="font-display text-lg text-slate-900">LedgerFlow</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-slate-500">
            <a href="#funktioner" className="hover:text-slate-900 transition-colors">Funktioner</a>
            <a href="#for-vem" className="hover:text-slate-900 transition-colors">För vem</a>
            <a href="#priser" className="hover:text-slate-900 transition-colors">Priser</a>
            <a href="#fragor" className="hover:text-slate-900 transition-colors">Vanliga frågor</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
              Logga in
            </Link>
            <Link href="/auth/register" className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
              Kom igång gratis
            </Link>
          </div>
        </nav>
      </header>

      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(60%_50%_at_50%_0%,#eff6ff_0%,transparent_70%)]" />
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-16 lg:pt-28 grid lg:grid-cols-2 gap-12 items-center">
          {/* Vänster: budskap */}
          <div>
            <div className="lf-rise inline-flex items-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
              </span>
              Byggt för svenska företag &amp; svensk standard
            </div>
            <h1 className="lf-rise font-display text-[2.7rem] leading-[1.05] sm:text-6xl text-slate-950 mt-6" style={{ animationDelay: "60ms" }}>
              Fakturera proffsigt.<br />
              <span className="text-blue-700">På minuter, inte timmar.</span>
            </h1>
            <p className="lf-rise text-lg text-slate-500 leading-relaxed mt-6 max-w-lg" style={{ animationDelay: "120ms" }}>
              Fakturor, offerter, ROT/RUT och betalningar i ett enkelt verktyg. Från egenföretagare
              till redovisningsbyrå – allt på svenska, enligt svenska regler.
            </p>
            <div className="lf-rise flex flex-col sm:flex-row gap-3 mt-8" style={{ animationDelay: "180ms" }}>
              <Link href="/auth/register" className="group inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-6 py-3.5 rounded-xl shadow-sm shadow-blue-700/20 transition-colors">
                Kom igång gratis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a href="#sa-funkar" className="inline-flex items-center justify-center gap-2 text-slate-700 border border-slate-200 hover:bg-slate-50 font-medium px-6 py-3.5 rounded-xl transition-colors">
                Se hur det fungerar
              </a>
            </div>
            <p className="lf-rise flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-400 mt-5" style={{ animationDelay: "220ms" }}>
              <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-blue-600" /> Inget kreditkort</span>
              <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-blue-600" /> Gratis att börja</span>
              <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-blue-600" /> GDPR &amp; EU-data</span>
            </p>
          </div>

          {/* Höger: faktura-mockup (ingen stockbild – byggd i kod) */}
          <div className="lf-rise relative" style={{ animationDelay: "160ms" }}>
            <div className="absolute -inset-4 -z-10 bg-gradient-to-tr from-blue-100/60 to-transparent rounded-[2rem] blur-2xl" />
            <div className="rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 overflow-hidden">
              <div className="flex items-center justify-between px-6 pt-6">
                <div>
                  <div className="w-9 h-9 rounded-lg bg-slate-900 text-white grid place-items-center mb-2">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">Storgatan 1, 111 20 Stockholm<br />Org.nr 556123-4567</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-slate-900">Faktura</p>
                  <p className="text-xs text-slate-400">FAK-0042</p>
                </div>
              </div>
              <div className="mx-6 mt-5 rounded-xl bg-slate-50 px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">Att betala</p>
                  <p className="font-display text-xl text-slate-900">18 750,00 kr</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wide text-slate-400">Förfaller</p>
                  <p className="text-sm font-semibold text-slate-700">2026-07-25</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-white border border-slate-200 grid place-items-center text-slate-300">
                  <QrCode className="w-7 h-7" />
                </div>
              </div>
              <div className="px-6 py-4 space-y-2.5">
                {[["Webbutveckling, 15 tim", "15 000 kr"], ["Hosting & drift", "1 200 kr"], ["Moms 25 %", "2 550 kr"]].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">{k}</span>
                    <span className="font-medium text-slate-800 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 border-t border-dashed border-slate-200 flex items-center gap-2 text-[11px] text-slate-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <ScanLine className="w-4 h-4 text-slate-300" /> # 42 00018750 06 &gt; 5050-1234#41#
              </div>
            </div>
            {/* liten flytande badge */}
            <div className="absolute -left-4 bottom-8 hidden sm:flex items-center gap-2 bg-white border border-slate-200 shadow-lg rounded-xl px-3 py-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center"><Check className="w-4 h-4" /></span>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-slate-800">Skickad &amp; betald</p>
                <p className="text-[10px] text-slate-400">via OCR · bankgiro</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust-rad */}
        <div className="border-y border-slate-100 bg-slate-50/60">
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span className="text-xs font-medium text-slate-400 mr-2">Anpassat för svensk fakturering:</span>
            {trustChips.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
                <Check className="w-3 h-3 text-blue-600" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───── För vem ───── */}
      <section id="for-vem" className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-blue-700 mb-3">För vem</p>
          <h2 className="font-display text-4xl text-slate-950">Ett verktyg, tre sätt att jobba</h2>
          <p className="text-slate-500 text-lg mt-3">Oavsett om du fakturerar själv eller hanterar hundratals kunder – LedgerFlow växer med dig.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mt-12">
          {segments.map((s) => (
            <div key={s.tag} className="rounded-2xl border border-slate-200 p-7 hover:border-blue-200 hover:shadow-lg hover:shadow-slate-900/5 transition-all">
              <span className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 grid place-items-center mb-5">
                <s.icon className="w-5 h-5" strokeWidth={1.8} />
              </span>
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">{s.tag}</p>
              <h3 className="font-display text-xl text-slate-900 mt-1.5">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mt-2.5">{s.desc}</p>
              <ul className="mt-5 space-y-2">
                {s.points.map((p) => (
                  <li key={p} className="flex items-start gap-2 text-sm text-slate-700">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" /> {p}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* ───── Funktioner (bento) ───── */}
      <section id="funktioner" className="bg-slate-50 border-y border-slate-100 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-blue-700 mb-3">Funktioner</p>
            <h2 className="font-display text-4xl text-slate-950">Allt du behöver för att fakturera</h2>
            <p className="text-slate-500 text-lg mt-3">Inga moduler att köpa till. Allt som får dig betald finns med från start.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {features.map((f) => (
              <div key={f.title} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
                <span className="w-10 h-10 rounded-lg bg-slate-900 text-white grid place-items-center mb-4">
                  <f.icon className="w-5 h-5" strokeWidth={1.8} />
                </span>
                <h3 className="font-semibold text-slate-900">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed mt-1.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Så funkar det ───── */}
      <section id="sa-funkar" className="max-w-6xl mx-auto px-6 py-24">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-blue-700 mb-3">Så funkar det</p>
          <h2 className="font-display text-4xl text-slate-950">Från konto till betalt – fyra steg</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-8 mt-14">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              {i < steps.length - 1 && <div className="hidden md:block absolute top-3 left-12 right-0 h-px bg-slate-200" />}
              <div className="font-display text-5xl text-slate-200 leading-none select-none relative">{s.n}</div>
              <h3 className="font-semibold text-slate-900 mt-4">{s.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed mt-1.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── Varför / trust-band ───── */}
      <section className="bg-slate-900 text-white py-20">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">Därför väljer svenska företag LedgerFlow</h2>
            <p className="text-slate-300 mt-4 leading-relaxed max-w-md">
              Vi har byggt LedgerFlow för svensk verklighet – inte en översatt mall. Bankgiro, OCR,
              ROT/RUT, F-skatt och GDPR finns inbyggt från dag ett.
            </p>
            <Link href="/auth/register" className="inline-flex items-center gap-2 mt-7 bg-white text-slate-900 font-semibold px-5 py-3 rounded-xl hover:bg-slate-100 transition-colors">
              Skapa konto gratis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: ShieldCheck, t: "Svenska regler inbyggt", d: "ROT/RUT, moms & OCR" },
              { icon: Sparkles, t: "Allt i ett", d: "Faktura, offert, kunder" },
              { icon: Lock, t: "Säkert & GDPR", d: "Krypterat, EU-lagrat" },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl bg-white/5 border border-white/10 p-5">
                <x.icon className="w-6 h-6 text-blue-300" strokeWidth={1.8} />
                <p className="font-semibold mt-3">{x.t}</p>
                <p className="text-sm text-slate-400 mt-0.5">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Priser ───── */}
      <section id="priser" className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center max-w-xl mx-auto">
          <p className="text-sm font-semibold text-blue-700 mb-3">Priser</p>
          <h2 className="font-display text-4xl text-slate-950">Börja gratis. Väx när du vill.</h2>
          <p className="text-slate-500 text-lg mt-3">Inga bindningstider, inga dolda avgifter. Säg upp när du vill.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-5 mt-12 max-w-4xl mx-auto items-start">
          {plans.map((p) => (
            <div key={p.name} className={`relative rounded-2xl border p-7 ${p.highlight ? "border-blue-600 shadow-xl shadow-blue-700/10 bg-white md:-mt-3 md:mb-3" : "border-slate-200 bg-white"}`}>
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-wide bg-blue-700 text-white px-3 py-1 rounded-full">
                  Mest populär
                </span>
              )}
              <p className="text-sm font-semibold text-slate-900">{p.name}</p>
              <p className="text-xs text-slate-400 mt-0.5">{p.note}</p>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="font-display text-4xl text-slate-950">{p.price}</span>
                <span className="text-sm text-slate-400">{p.period}</span>
              </div>
              <ul className="space-y-2.5 mt-6 mb-7">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register"
                className={`block text-center text-sm font-semibold py-2.5 rounded-xl transition-colors ${
                  p.highlight ? "bg-blue-700 hover:bg-blue-800 text-white" : "border border-slate-200 hover:bg-slate-50 text-slate-800"
                }`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">Priser exkl. moms. Alla planer börjar gratis – inget kreditkort krävs.</p>
      </section>

      {/* ───── FAQ ───── */}
      <section id="fragor" className="bg-slate-50 border-y border-slate-100 py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-blue-700 mb-3">Vanliga frågor</p>
            <h2 className="font-display text-4xl text-slate-950">Allt du undrar över</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group bg-white rounded-xl border border-slate-200 px-5 open:shadow-sm">
                <summary className="flex items-center justify-between gap-4 cursor-pointer py-4 font-semibold text-slate-900 list-none">
                  {f.q}
                  <span className="text-slate-400 group-open:rotate-45 transition-transform text-xl leading-none shrink-0">+</span>
                </summary>
                <p className="text-sm text-slate-500 leading-relaxed pb-5 -mt-1">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Slut-CTA ───── */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="font-display text-4xl sm:text-5xl text-slate-950">Redo att skicka din första faktura?</h2>
        <p className="text-slate-500 text-lg mt-4 max-w-md mx-auto">Skapa ett konto gratis idag. Du kan fakturera om fem minuter.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/auth/register" className="group inline-flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-7 py-4 rounded-xl shadow-sm shadow-blue-700/20 transition-colors text-base">
            Kom igång gratis <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/auth/login" className="inline-flex items-center justify-center text-slate-700 border border-slate-200 hover:bg-slate-50 font-medium px-7 py-4 rounded-xl transition-colors">
            Logga in
          </Link>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-6xl mx-auto px-6 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-slate-900 text-white grid place-items-center"><Receipt className="w-4 h-4" /></span>
              <span className="font-display text-lg text-slate-900">LedgerFlow</span>
            </div>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">Fakturering &amp; offert för svenska företag. Byggt i Sverige, för svenska regler.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Produkt</p>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#funktioner" className="hover:text-slate-900">Funktioner</a></li>
              <li><a href="#priser" className="hover:text-slate-900">Priser</a></li>
              <li><a href="#fragor" className="hover:text-slate-900">Vanliga frågor</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Kom igång</p>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><Link href="/auth/register" className="hover:text-slate-900">Skapa konto</Link></li>
              <li><Link href="/auth/login" className="hover:text-slate-900">Logga in</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-3">Juridik</p>
            <ul className="space-y-2 text-sm text-slate-500">
              <li><a href="#" className="hover:text-slate-900">Integritetspolicy</a></li>
              <li><a href="#" className="hover:text-slate-900">Användarvillkor</a></li>
              <li><a href="#" className="hover:text-slate-900">GDPR</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-slate-400">
            <span>© 2026 LedgerFlow. Alla rättigheter förbehållna.</span>
            <span>Byggt i Sverige · för svenska företag</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
