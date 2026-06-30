import Link from "next/link";
import {
  ArrowRight, Check, FileText, Receipt, Percent, QrCode, LayoutTemplate, Mail,
  BellRing, Lock, Users, UserRound, ScanLine, Clock, Heart, X,
} from "lucide-react";
import { Brandmark } from "@/components/Brandmark";

/* ─────────────────────────  Innehåll (svenska)  ─────────────────────────
   Primär målgrupp: egenföretagare (enskild firma) och enmans­byråer /
   redovisningskonsulter. Större byråer nämns sekundärt.                    */

const personas = [
  {
    icon: UserRound,
    tag: "Egenföretagare",
    title: "Du som driver eget",
    desc: "Enskild firma eller eget AB. Fyll i ditt företag en gång – fakturera sedan på under en minut. Inga krångliga termer, ingen bokföringsexamen.",
    points: ["Faktura & offert på 60 sekunder", "ROT/RUT räknas ut automatiskt", "PDF & e-post direkt till kunden"],
    cta: "Skapa konto gratis", href: "/auth/register",
    primary: true,
  },
  {
    icon: Users,
    tag: "Konsult & enmansbyrå",
    title: "Du som sköter andras fakturor",
    desc: "Håll alla dina kunder samlade på ett ställe. Rätt mall och rätt uppgifter varje gång – snabbt att fakturera åt flera, utan att blanda ihop något.",
    points: ["Alla kunder på ett ställe", "Rätt mall per kund", "Utkast, redigering & utskick"],
    cta: "Kom igång", href: "/auth/register",
    primary: false,
  },
];

const features = [
  { icon: FileText, title: "Fakturor & offerter", desc: "Samma smidiga flöde. Skapa en offert och omvandla den till faktura med ett klick när kunden tackar ja." },
  { icon: Percent, title: "ROT- & RUT-avdrag", desc: "Avdraget beräknas automatiskt och visas korrekt på fakturan – enligt Skatteverkets regler." },
  { icon: ScanLine, title: "OCR & bankgiro", desc: "Maskinläsbar betalrad längst ner och en QR-kod. Kunden skannar i bankappen och betalar rätt belopp direkt." },
  { icon: LayoutTemplate, title: "10+ proffsiga mallar", desc: "Klassiska och moderna mallar. Välj en gång per företag – sedan ser varje faktura lika prydlig ut." },
  { icon: Mail, title: "PDF & e-post", desc: "Ladda ner som PDF eller skicka direkt till kundens inkorg med fakturan bifogad." },
  { icon: BellRing, title: "Påminnelser", desc: "Skicka en proffsig betalningspåminnelse med påminnelseavgift med ett klick. Du väljer själv när – så ingen kund påminns i onödan." },
  { icon: Receipt, title: "Kreditfaktura", desc: "Behöver du ångra en skickad faktura? Skapa en korrekt kreditfaktura med ett klick, enligt bokföringslagen." },
  { icon: Lock, title: "Tryggt & GDPR", desc: "All data lagras inom EU och säkerhetskopior krypteras (AES-256). Byggt med svensk integritet i åtanke." },
];

const usList = [
  "Obegränsade fakturor & offerter",
  "Ingen kundgräns",
  "ROT/RUT räknas ut automatiskt",
  "OCR, bankgiro & QR-kod ingår",
  "Kreditfaktura enligt bokföringslagen",
  "Inga avgifter per skickad faktura",
  "Svenskt – byggt för svenska regler",
];
const themList = [
  "Ofta begränsat antal eller avgift per faktura",
  "Gratisnivå ofta max ~5 kunder",
  "ROT/RUT som tillval eller saknas",
  "E-faktura/QR ibland mot extra kostnad",
  "Kredithantering ofta krånglig",
  "Dolda avgifter, t.ex. ~3 kr per e-faktura",
  "Ofta en översatt utlandsmall",
];

const steps = [
  { n: "01", title: "Skapa konto", desc: "Gratis på 30 sekunder. Inget kreditkort." },
  { n: "02", title: "Lägg in ditt företag", desc: "Logotyp, bankgiro och fakturamall – en gång." },
  { n: "03", title: "Skapa faktura eller offert", desc: "Välj kund, fyll i rader, klart." },
  { n: "04", title: "Skicka & få betalt", desc: "PDF, e-post och OCR – kunden betalar enkelt." },
];

const plans = [
  {
    name: "Egen", price: "79", period: "kr/mån", note: "För egenföretagare", yearly: "790 kr/år · 2 mån gratis",
    features: ["Obegränsade fakturor & offerter", "ROT/RUT-avdrag", "10+ mallar", "E-post & påminnelser", "OCR, bankgiro & kreditfaktura"],
    cta: "Testa gratis", highlight: true,
  },
  {
    name: "Byrå", price: "299", period: "kr/mån", note: "För redovisningsbyråer", yearly: "2 990 kr/år · 2 mån gratis",
    features: ["Allt i Egen", "Flera konsulter", "Tilldela kunder", "Roller & behörigheter", "Krypterad backup & support"],
    cta: "Kom igång", highlight: false,
  },
];

const trustChips = ["Bankgiro", "OCR-referens", "ROT/RUT", "F-skatt", "Kreditfaktura", "GDPR · EU-data"];

const faqs = [
  { q: "Är Enkelfaktura gratis att börja med?", a: "Du provar allt gratis i 14 dagar utan kreditkort och kan skicka riktiga fakturor direkt. När provperioden tar slut väljer du en plan för att fortsätta – allt ditt material finns kvar." },
  { q: "Passar det mig som är egenföretagare?", a: "Absolut – det är just dig vi har byggt det för. Driver du enskild firma eller eget AB skapar du din första faktura på under en minut, utan att kunna något om bokföring." },
  { q: "Stödjer ni ROT- och RUT-avdrag?", a: "Ja. När du markerar arbetskostnad räknas ROT- eller RUT-avdraget ut automatiskt och visas korrekt på fakturan enligt Skatteverkets regler." },
  { q: "Kan kunden betala via OCR och bankgiro?", a: "Ja. Varje faktura får en maskinläsbar betalrad (optisk rad, typ 41) längst ner och en QR-kod som kunden kan skanna i sin bankapp för att betala rätt belopp." },
  { q: "Hur gör jag om jag behöver makulera en faktura?", a: "En skickad faktura får inte raderas enligt bokföringslagen. I stället skapar du en kreditfaktura med ett klick – den upphäver originalet med negativa belopp och behåller en obruten nummerserie." },
  { q: "Var lagras min data?", a: "All data lagras inom EU (Supabase, regionen West EU / Irland) och säkerhetskopior krypteras med AES-256. Enkelfaktura är byggt med GDPR i åtanke." },
  { q: "Funkar det även för en redovisningsbyrå?", a: "Ja. Är ni flera kan byråplanen bjuda in konsulter, tilldela kunder och styra behörigheter i tre nivåer – varje konsult ser bara sina egna kunder." },
  { q: "Finns det bindningstid?", a: "Nej. Alla planer börjar gratis och du kan säga upp när du vill. Inga bindningstider, inga dolda avgifter." },
];

/* ─────────────────────────  JSON-LD (SEO)  ───────────────────────── */
const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enkelfaktura.se";
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    { "@type": "Organization", name: "Enkelfaktura", url: BASE, description: "Fakturering för svenska egenföretagare och redovisningskonsulter." },
    { "@type": "WebSite", name: "Enkelfaktura", url: BASE, inLanguage: "sv-SE" },
    {
      "@type": "SoftwareApplication",
      name: "Enkelfaktura",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      inLanguage: "sv-SE",
      url: BASE,
      offers: { "@type": "Offer", price: "0", priceCurrency: "SEK" },
      description: "Skapa fakturor och offerter, ROT/RUT, OCR & bankgiro, kreditfaktura, PDF och e-post – på svenska, för egenföretagare.",
    },
    { "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) },
  ],
};

/* ─────────────────────────  Sida  ───────────────────────── */

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#faf8f3] text-stone-900 selection:bg-[#13294B]/15 antialiased">
      <style>{`
        html { scroll-behavior: smooth; }
        .font-display { font-family: var(--font-display), Georgia, "Times New Roman", serif; letter-spacing: -0.015em; }
        section[id] { scroll-margin-top: 84px; }
        @keyframes ef-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
        .ef-rise { animation: ef-rise .8s cubic-bezier(.16,1,.3,1) both; }
        @media (prefers-reduced-motion: reduce) { .ef-rise { animation: none; } html { scroll-behavior: auto; } }
      `}</style>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* ───── Nav ───── */}
      <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-[#faf8f3]/85 backdrop-blur-md">
        <nav className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Brandmark className="w-8 h-8" />
            <span className="text-lg font-bold tracking-tight" style={{ color: "#13294B" }}>Enkelfaktura</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-stone-500">
            <a href="#for-vem" className="hover:text-stone-900 transition-colors">För vem</a>
            <a href="#funktioner" className="hover:text-stone-900 transition-colors">Funktioner</a>
            <a href="#priser" className="hover:text-stone-900 transition-colors">Priser</a>
            <a href="#fragor" className="hover:text-stone-900 transition-colors">Vanliga frågor</a>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/auth/login" className="text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors hidden sm:block">
              Logga in
            </Link>
            <Link href="/auth/register" className="inline-flex items-center gap-1.5 bg-[#13294B] hover:bg-[#1e3a63] text-white text-sm font-semibold px-4 py-2 rounded-full transition-colors">
              Kom igång gratis
            </Link>
          </div>
        </nav>
      </header>

      {/* ───── Hero ───── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(70%_55%_at_80%_-5%,#e7f6f4_0%,transparent_60%)]" />
        <div className="max-w-6xl mx-auto px-5 sm:px-6 pt-16 sm:pt-20 lg:pt-28 pb-14 grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-center">
          {/* Vänster: budskap */}
          <div>
            <div className="ef-rise inline-flex items-center gap-2 text-xs font-semibold text-teal-800 bg-teal-100/70 border border-teal-200/80 px-3 py-1.5 rounded-full">
              <Heart className="w-3.5 h-3.5" strokeWidth={2.4} />
              Gjort för dig som driver eget
            </div>
            <h1 className="ef-rise font-display text-[2.6rem] leading-[1.04] sm:text-6xl text-stone-950 mt-6">
              Fakturering så enkel
              <br />att du faktiskt <span className="text-teal-700">gör den klar.</span>
            </h1>
            <p className="ef-rise text-lg text-stone-600 leading-relaxed mt-6 max-w-lg" style={{ animationDelay: "120ms" }}>
              Fakturor, offerter, ROT/RUT och påminnelser i ett lugnt och tydligt verktyg.
              Byggt för egenföretagare och redovisningskonsulter – på svenska, enligt svenska regler.
            </p>
            <div className="ef-rise flex flex-col sm:flex-row gap-3 mt-8" style={{ animationDelay: "180ms" }}>
              <Link href="/auth/register" className="group inline-flex items-center justify-center gap-2 bg-[#13294B] hover:bg-[#1e3a63] text-white font-semibold px-6 py-3.5 rounded-full shadow-sm shadow-[#13294B]/20 transition-colors">
                Skapa konto gratis
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
              <a href="#sa-funkar" className="inline-flex items-center justify-center gap-2 text-stone-700 bg-white border border-stone-200 hover:border-stone-300 font-medium px-6 py-3.5 rounded-full transition-colors">
                Se hur det fungerar
              </a>
            </div>
            <p className="ef-rise flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-stone-500 mt-6" style={{ animationDelay: "220ms" }}>
              <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600" /> Inget kreditkort</span>
              <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600" /> Gratis att börja</span>
              <span className="inline-flex items-center gap-1.5"><Clock className="w-4 h-4 text-teal-600" /> Igång på 5 minuter</span>
            </p>
          </div>

          {/* Höger: faktura-mockup (ingen stockbild – byggd i kod) */}
          <div className="ef-rise relative" style={{ animationDelay: "150ms" }}>
            <div className="absolute -inset-6 -z-10 bg-gradient-to-tr from-teal-100/50 via-teal-100/40 to-transparent rounded-[2.5rem] blur-2xl" />
            <div className="rounded-[1.6rem] border border-stone-200 bg-white shadow-2xl shadow-stone-900/[0.07] overflow-hidden rotate-[0.6deg]">
              <div className="flex items-center justify-between px-6 pt-6">
                <div>
                  <Brandmark className="w-9 h-9 mb-2" />
                  <p className="text-[11px] text-stone-400 leading-tight">Storgatan 1, 111 20 Stockholm<br />Org.nr 556123-4567</p>
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl text-stone-900">Faktura</p>
                  <p className="text-xs text-stone-400">FAK-0042</p>
                </div>
              </div>
              <div className="mx-6 mt-5 rounded-2xl bg-stone-50 px-4 py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-stone-400">Att betala</p>
                  <p className="font-display text-xl text-stone-900">18 750,00 kr</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wide text-stone-400">Förfaller</p>
                  <p className="text-sm font-semibold text-stone-700">2026-07-25</p>
                </div>
                <div className="w-12 h-12 rounded-xl bg-white border border-stone-200 grid place-items-center text-stone-300">
                  <QrCode className="w-7 h-7" />
                </div>
              </div>
              <div className="px-6 py-4 space-y-2.5">
                {[["Webbutveckling, 15 tim", "15 000 kr"], ["Hosting & drift", "1 200 kr"], ["Moms 25 %", "2 550 kr"]].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between text-sm">
                    <span className="text-stone-500">{k}</span>
                    <span className="font-medium text-stone-800 tabular-nums" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{v}</span>
                  </div>
                ))}
              </div>
              <div className="px-6 py-3 border-t border-dashed border-stone-200 flex items-center gap-2 text-[11px] text-stone-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                <ScanLine className="w-4 h-4 text-stone-300" /> # 42 00018750 06 &gt; 5050-1234#41#
              </div>
            </div>
            {/* liten flytande badge */}
            <div className="absolute -left-3 sm:-left-5 bottom-10 hidden sm:flex items-center gap-2 bg-white border border-stone-200 shadow-lg shadow-stone-900/5 rounded-2xl px-3 py-2 -rotate-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 grid place-items-center"><Check className="w-4 h-4" /></span>
              <div className="leading-tight">
                <p className="text-xs font-semibold text-stone-800">Skickad &amp; betald</p>
                <p className="text-[10px] text-stone-400">via OCR · bankgiro</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust-rad */}
        <div className="border-y border-stone-200/70 bg-white/50">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 py-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <span className="text-xs font-medium text-stone-400 mr-1">Anpassat för svensk fakturering:</span>
            {trustChips.map((c) => (
              <span key={c} className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 bg-white border border-stone-200 px-2.5 py-1 rounded-full">
                <Check className="w-3 h-3 text-teal-600" /> {c}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───── För vem ───── */}
      <section id="for-vem" className="max-w-6xl mx-auto px-5 sm:px-6 py-20 sm:py-24">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-teal-700 mb-3">För vem</p>
          <h2 className="font-display text-4xl text-stone-950">Gjort för dig som driver eget</h2>
          <p className="text-stone-500 text-lg mt-3">Inte en översatt mall för storbolag. Enkelfaktura är gjort för enmansföretag och små byråer – det som faktiskt behövs, inget mer.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5 mt-12">
          {personas.map((s) => (
            <Link key={s.tag} href={s.href}
              className={`group/seg flex flex-col rounded-[1.4rem] p-7 sm:p-8 transition-all ${
                s.primary
                  ? "bg-[#13294B] text-white shadow-xl shadow-stone-900/10 hover:shadow-2xl hover:shadow-stone-900/15"
                  : "bg-white border border-stone-200 hover:border-stone-300 hover:shadow-lg hover:shadow-stone-900/5"
              }`}>
              <span className={`w-12 h-12 rounded-2xl grid place-items-center mb-5 transition-colors ${
                s.primary ? "bg-white/10 text-teal-300" : "bg-teal-50 text-teal-700 group-hover/seg:bg-teal-100"
              }`}>
                <s.icon className="w-5 h-5" strokeWidth={1.8} />
              </span>
              <p className={`text-xs font-semibold uppercase tracking-wide ${s.primary ? "text-teal-300" : "text-teal-700"}`}>{s.tag}</p>
              <h3 className={`font-display text-2xl mt-1.5 ${s.primary ? "text-white" : "text-stone-900"}`}>{s.title}</h3>
              <p className={`text-sm leading-relaxed mt-2.5 ${s.primary ? "text-stone-300" : "text-stone-500"}`}>{s.desc}</p>
              <ul className="mt-6 space-y-2.5">
                {s.points.map((p) => (
                  <li key={p} className={`flex items-start gap-2 text-sm ${s.primary ? "text-stone-200" : "text-stone-700"}`}>
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${s.primary ? "text-teal-300" : "text-teal-600"}`} /> {p}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-7">
                <span className={`inline-flex items-center gap-1.5 text-sm font-semibold ${s.primary ? "text-white" : "text-teal-700"}`}>
                  {s.cta}
                  <ArrowRight className="w-4 h-4 group-hover/seg:translate-x-0.5 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
        {/* Sekundär: större byrå */}
        <div className="mt-5 rounded-[1.4rem] border border-stone-200 bg-white px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
          <p className="text-sm text-stone-600 flex-1">
            <span className="font-semibold text-stone-900">Driver du en större redovisningsbyrå?</span>{" "}
            Bjud in konsulter, tilldela kunder och styr behörigheter i tre nivåer – Enkelfaktura skalar med er.
          </p>
          <Link href="/auth/register" className="inline-flex items-center gap-1.5 text-sm font-semibold text-teal-700 hover:text-teal-800 shrink-0">
            Skapa byråkonto <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ───── Funktioner ───── */}
      <section id="funktioner" className="bg-white border-y border-stone-200/70 py-20 sm:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-teal-700 mb-3">Funktioner</p>
            <h2 className="font-display text-4xl text-stone-950">Allt du behöver för att få betalt</h2>
            <p className="text-stone-500 text-lg mt-3">Inga moduler att köpa till. Allt som tar dig från jobb till betalning finns med från start.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
            {features.map((f) => (
              <div key={f.title} className="bg-[#faf8f3] rounded-[1.2rem] border border-stone-200/80 p-6 hover:border-stone-300 hover:bg-white transition-colors">
                <span className="w-11 h-11 rounded-xl bg-[#13294B] text-white grid place-items-center mb-4">
                  <f.icon className="w-5 h-5" strokeWidth={1.8} />
                </span>
                <h3 className="font-semibold text-stone-900">{f.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed mt-1.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Jämförelse / Varför ───── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-6 py-20 sm:py-24">
        <div className="text-center max-w-xl mx-auto">
          <p className="text-sm font-semibold text-teal-700 mb-3">Varför Enkelfaktura</p>
          <h2 className="font-display text-4xl text-stone-950">Samma jobb – utan krånglet</h2>
          <p className="text-stone-500 text-lg mt-3">Många fakturaprogram gömmer gränser och avgifter. Vi gör tvärtom – allt ingår, inga överraskningar.</p>
        </div>
        <div className="grid md:grid-cols-2 gap-5 mt-12 items-start">
          {/* Enkelfaktura */}
          <div className="rounded-[1.4rem] p-7 sm:p-8 text-white shadow-xl shadow-[#13294B]/10" style={{ background: "#13294B" }}>
            <div className="flex items-center gap-2.5 mb-6">
              <Brandmark className="w-8 h-8" />
              <span className="font-display text-lg">Enkelfaktura</span>
            </div>
            <ul className="space-y-3.5">
              {usList.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 w-5 h-5 rounded-full grid place-items-center shrink-0" style={{ background: "#15A39A" }}>
                    <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                  </span>
                  <span className="text-stone-100">{t}</span>
                </li>
              ))}
            </ul>
          </div>
          {/* Vanliga program */}
          <div className="rounded-[1.4rem] p-7 sm:p-8 bg-white border border-stone-200">
            <p className="font-display text-lg text-stone-400 mb-6">Vanliga fakturaprogram</p>
            <ul className="space-y-3.5">
              {themList.map((t) => (
                <li key={t} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 w-5 h-5 rounded-full grid place-items-center shrink-0 bg-stone-100">
                    <X className="w-3.5 h-3.5 text-stone-400" strokeWidth={3} />
                  </span>
                  <span className="text-stone-500">{t}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="text-center text-xs text-stone-400 mt-6">Jämförelsen avser vanligt förekommande villkor hos andra fakturaprogram och kan variera.</p>
      </section>

      {/* ───── Så funkar det ───── */}
      <section id="sa-funkar" className="max-w-6xl mx-auto px-5 sm:px-6 py-20 sm:py-24">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-teal-700 mb-3">Så funkar det</p>
          <h2 className="font-display text-4xl text-stone-950">Från konto till betalt – fyra steg</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-x-8 gap-y-10 mt-14">
          {steps.map((s, i) => (
            <div key={s.n} className="relative">
              {i < steps.length - 1 && <div className="hidden md:block absolute top-4 left-14 right-0 h-px bg-stone-200" />}
              <div className="font-display text-5xl text-teal-300 leading-none select-none relative">{s.n}</div>
              <h3 className="font-semibold text-stone-900 mt-4">{s.title}</h3>
              <p className="text-sm text-stone-500 leading-relaxed mt-1.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── Varför / trust-band ───── */}
      <section className="bg-[#13294B] text-white py-16 sm:py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 grid md:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl">Svensk fakturering, utan krångel</h2>
            <p className="text-stone-300 mt-4 leading-relaxed max-w-md">
              Vi har byggt Enkelfaktura för svensk verklighet – inte en översatt mall. Bankgiro, OCR,
              ROT/RUT, kreditfaktura och GDPR finns inbyggt från dag ett.
            </p>
            <Link href="/auth/register" className="inline-flex items-center gap-2 mt-7 bg-white text-stone-900 font-semibold px-5 py-3 rounded-full hover:bg-stone-100 transition-colors">
              Skapa konto gratis <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: Check, t: "Svenska regler inbyggt", d: "ROT/RUT, moms & OCR" },
              { icon: Clock, t: "Klart på minuter", d: "Faktura, offert, kunder" },
              { icon: Lock, t: "Tryggt & GDPR", d: "Krypterat, EU-lagrat" },
            ].map((x) => (
              <div key={x.t} className="rounded-[1.2rem] bg-white/5 border border-white/10 p-5">
                <x.icon className="w-6 h-6 text-teal-300" strokeWidth={1.9} />
                <p className="font-semibold mt-3">{x.t}</p>
                <p className="text-sm text-stone-400 mt-0.5">{x.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Priser ───── */}
      <section id="priser" className="max-w-6xl mx-auto px-5 sm:px-6 py-20 sm:py-24">
        <div className="text-center max-w-xl mx-auto">
          <p className="text-sm font-semibold text-teal-700 mb-3">Priser</p>
          <h2 className="font-display text-4xl text-stone-950">Prova gratis i 14 dagar.</h2>
          <p className="text-stone-500 text-lg mt-3">Full tillgång direkt – inget kreditkort. Inga bindningstider, säg upp när du vill.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 mt-12 max-w-2xl mx-auto items-start">
          {plans.map((p) => (
            <div key={p.name} className={`relative rounded-[1.4rem] p-7 ${p.highlight ? "border-2 border-[#13294B] shadow-xl shadow-[#13294B]/10 bg-white md:-mt-3 md:mb-3" : "border border-stone-200 bg-white"}`}>
              {p.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[11px] font-bold uppercase tracking-wide bg-[#13294B] text-white px-3 py-1 rounded-full">
                  Populärast
                </span>
              )}
              <p className="text-sm font-semibold text-stone-900">{p.name}</p>
              <p className="text-xs text-stone-400 mt-0.5">{p.note}</p>
              <div className="flex items-baseline gap-1 mt-4">
                <span className="font-display text-4xl text-stone-950">{p.price}</span>
                <span className="text-sm text-stone-400">{p.period}</span>
              </div>
              <p className="text-xs font-medium text-teal-700 mt-1.5 min-h-4">{p.yearly ? `eller ${p.yearly}` : ""}</p>
              <ul className="space-y-2.5 mt-5 mb-7">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-stone-600">
                    <Check className="w-4 h-4 text-teal-600 mt-0.5 shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register"
                className={`block text-center text-sm font-semibold py-2.5 rounded-full transition-colors ${
                  p.highlight ? "bg-[#13294B] hover:bg-[#1e3a63] text-white" : "border border-stone-200 hover:bg-stone-50 text-stone-800"
                }`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
        <p className="text-center text-xs text-stone-400 mt-6">Priser exkl. moms. Betala per månad eller år – med årsbetalning får du 2 månader gratis. Alla konton börjar med 14 dagars gratis prova-på, inget kreditkort krävs.</p>
      </section>

      {/* ───── FAQ ───── */}
      <section id="fragor" className="bg-white border-y border-stone-200/70 py-20 sm:py-24">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-teal-700 mb-3">Vanliga frågor</p>
            <h2 className="font-display text-4xl text-stone-950">Allt du undrar över</h2>
          </div>
          <div className="space-y-3">
            {faqs.map((f) => (
              <details key={f.q} className="group bg-[#faf8f3] rounded-2xl border border-stone-200/80 px-5 open:bg-white open:shadow-sm transition-colors">
                <summary className="flex items-center justify-between gap-4 cursor-pointer py-4 font-semibold text-stone-900 list-none">
                  {f.q}
                  <span className="text-stone-400 group-open:rotate-45 transition-transform text-xl leading-none shrink-0">+</span>
                </summary>
                <p className="text-sm text-stone-500 leading-relaxed pb-5 -mt-1">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Slut-CTA ───── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-20 sm:py-24 text-center">
        <h2 className="font-display text-4xl sm:text-5xl text-stone-950">Redo att skicka din första faktura?</h2>
        <p className="text-stone-500 text-lg mt-4 max-w-md mx-auto">Skapa ett konto gratis idag. Du kan fakturera om fem minuter.</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <Link href="/auth/register" className="group inline-flex items-center justify-center gap-2 bg-[#13294B] hover:bg-[#1e3a63] text-white font-semibold px-7 py-4 rounded-full shadow-sm shadow-[#13294B]/20 transition-colors text-base">
            Skapa konto gratis <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link href="/auth/login" className="inline-flex items-center justify-center text-stone-700 bg-white border border-stone-200 hover:border-stone-300 font-medium px-7 py-4 rounded-full transition-colors">
            Logga in
          </Link>
        </div>
        <p className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-sm text-stone-400 mt-6">
          <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600" /> 14 dagar gratis</span>
          <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600" /> Inget kreditkort</span>
          <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600" /> Ingen bindningstid</span>
        </p>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t border-stone-200/70 bg-[#faf8f3]">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-14 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <Brandmark className="w-8 h-8" />
              <span className="text-lg font-bold tracking-tight" style={{ color: "#13294B" }}>Enkelfaktura</span>
            </div>
            <p className="text-sm text-stone-400 mt-3 leading-relaxed">Fakturering &amp; offert för svenska egenföretagare. Byggt i Sverige, för svenska regler.</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">Produkt</p>
            <ul className="space-y-2 text-sm text-stone-500">
              <li><a href="#funktioner" className="hover:text-stone-900">Funktioner</a></li>
              <li><a href="#priser" className="hover:text-stone-900">Priser</a></li>
              <li><a href="#fragor" className="hover:text-stone-900">Vanliga frågor</a></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">Kom igång</p>
            <ul className="space-y-2 text-sm text-stone-500">
              <li><Link href="/auth/register" className="hover:text-stone-900">Skapa konto</Link></li>
              <li><Link href="/auth/login" className="hover:text-stone-900">Logga in</Link></li>
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-400 mb-3">Juridik</p>
            <ul className="space-y-2 text-sm text-stone-500">
              <li><Link href="/integritetspolicy" className="hover:text-stone-900">Integritetspolicy</Link></li>
              <li><Link href="/anvandarvillkor" className="hover:text-stone-900">Användarvillkor</Link></li>
              <li><Link href="/gdpr" className="hover:text-stone-900">GDPR</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-200/70">
          <div className="max-w-6xl mx-auto px-5 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-stone-400">
            <span>© 2026 Enkelfaktura. Alla rättigheter förbehållna.</span>
            <span>Byggt i Sverige · för svenska företag</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
