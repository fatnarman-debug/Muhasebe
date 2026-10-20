import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowRight, Check, Percent, ScanLine, BellRing, FileText,
  Receipt, Smartphone, ShieldCheck,
} from "lucide-react";
import { SiteHeader, SiteFooter, SiteStyles } from "@/components/site/SiteChrome";
import { yrken, getYrke, type Yrke } from "@/lib/yrken";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enkeltfaktura.com";

export function generateStaticParams() {
  return yrken.map((y) => ({ yrke: y.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ yrke: string }> }): Promise<Metadata> {
  const { yrke } = await params;
  const y = getYrke(yrke);
  if (!y) return {};
  const title = `Fakturaprogram för ${y.namn}`;
  return {
    title,
    description: y.meta,
    alternates: { canonical: `/for/${y.slug}` },
    openGraph: {
      type: "article",
      locale: "sv_SE",
      url: `${BASE}/for/${y.slug}`,
      siteName: "EnkeltFaktura",
      title,
      description: y.meta,
    },
  };
}

/* ── Avdragsregler 2026 (Skatteverket) ──────────────────────────────────── */

const REGLER = {
  rot: {
    etikett: "ROT 30 %",
    procent: 0.3,
    rubrik: "Så fungerar ROT-avdraget på fakturan",
    text: "ROT-avdraget är 30 procent av arbetskostnaden inklusive moms under 2026, med ett tak på 50 000 kronor per person och år. Avdraget gäller enbart arbete – inte material, resor eller maskiner. Du drar av rotavdraget på fakturan. När arbetet är utfört och kunden har betalat sin del begär du utbetalning från Skatteverket.",
    exempel: { arbete: 20000, material: 10000 },
  },
  rut: {
    etikett: "RUT 50 %",
    procent: 0.5,
    rubrik: "Så fungerar RUT-avdraget på fakturan",
    text: "RUT-avdraget är 50 procent av arbetskostnaden inklusive moms. ROT och RUT delar ett gemensamt tak på högst 75 000 kronor per person och år, inom det gemensamma taket. Avdraget gäller bara arbete – material och växter ger inget avdrag. Du drar av rutavdraget på fakturan och begär utbetalning när kunden har betalat sin del.",
    exempel: { arbete: 8000, material: 2000 },
  },
} as const;

const kr = (n: number) => n.toLocaleString("sv-SE") + " kr";

/* ── Gemensamma funktioner, med avdragsraden bara nar den ar relevant ───── */

function funktionerFor(y: Yrke) {
  const bas = [
    { icon: FileText, title: "Offert som blir faktura", desc: "Skicka offert på jobbet. När kunden tackar ja omvandlar du den till faktura med ett klick – samma rader, samma priser." },
    { icon: Receipt, title: "Tydliga rader", desc: "Separata rader för arbete, material och utlägg. Kunden ser vad hen betalar för, och du slipper frågor i efterhand." },
    { icon: ScanLine, title: "OCR, bankgiro & QR", desc: "Varje faktura får en maskinläsbar betalrad och en QR-kod. Kunden skannar i bankappen och betalar rätt belopp." },
    { icon: BellRing, title: "Påminnelser med avgift", desc: "Obetald faktura? Skicka en proffsig påminnelse med påminnelseavgift när du själv vill." },
    { icon: Smartphone, title: "Fungerar i mobilen", desc: "Skriv och skicka fakturan direkt efter jobbet i stället för på kvällen vid köksbordet." },
  ];
  if (y.avdrag) {
    bas.unshift({
      icon: Percent,
      title: `${REGLER[y.avdrag].etikett} räknas ut åt dig`,
      desc: "Markera vad som är arbetskostnad. Avdraget räknas ut utifrån de arbetskostnader och uppgifter du anger, enligt 2026 års nivåer.",
    });
  } else {
    bas.unshift({
      icon: ShieldCheck,
      title: "F-skatt och moms på plats",
      desc: "Fakturan fylls i med dina företagsuppgifter: momsregistreringsnummer, uppgift om godkännande för F-skatt, momssats och betalningsvillkor.",
    });
  }
  return bas;
}

/* ── Sida ───────────────────────────────────────────────────────────────── */

export default async function YrkePage({ params }: { params: Promise<{ yrke: string }> }) {
  const { yrke } = await params;
  const y = getYrke(yrke);
  if (!y) notFound();

  const regel = y.avdrag ? REGLER[y.avdrag] : null;
  const avdrag = regel ? regel.exempel.arbete * regel.procent : 0;
  const funktioner = funktionerFor(y);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Start", item: BASE },
          { "@type": "ListItem", position: 2, name: "För hantverkare", item: `${BASE}/for/hantverkare` },
          { "@type": "ListItem", position: 3, name: `För ${y.namn}`, item: `${BASE}/for/${y.slug}` },
        ],
      },
      {
        "@type": "WebPage",
        name: `Fakturaprogram för ${y.namn}`,
        url: `${BASE}/for/${y.slug}`,
        inLanguage: "sv-SE",
        description: y.meta,
      },
      {
        "@type": "FAQPage",
        mainEntity: y.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
    ],
  };

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
            <Link href="/for/hantverkare" className="hover:text-stone-900">För vem</Link>
            <span className="mx-2 text-stone-400" aria-hidden="true">/</span>
            <span className="text-stone-900 capitalize">{y.namn}</span>
          </nav>

          <div className="grid lg:grid-cols-[1.05fr_0.95fr] gap-12 lg:gap-16 items-start">
            <div>
              <p className="inline-flex items-center gap-2 text-sm font-semibold text-teal-700 bg-teal-50 border border-teal-100 rounded-full px-3.5 py-1.5">
                {regel ? (
                  <><Percent className="w-4 h-4" /> {regel.etikett} · 2026 års regler</>
                ) : (
                  <><ShieldCheck className="w-4 h-4" /> F-skatt · moms · påminnelser</>
                )}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.3rem] leading-[1.06] mt-5 first-letter:capitalize" style={{ color: "#13294B" }}>
                Fakturaprogram för {y.namn}
              </h1>
              <p className="text-lg text-stone-700 mt-5 leading-relaxed max-w-xl">{y.lead}</p>

              <div className="flex flex-wrap items-center gap-3 mt-8">
                <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 bg-[#13294B] hover:bg-[#1e3a63] text-white font-semibold px-6 py-3.5 rounded-full transition-colors">
                  Testa gratis i 14 dagar <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="#rader" className="inline-flex items-center justify-center gap-2 text-stone-700 bg-white border border-stone-200 hover:border-stone-300 font-medium px-6 py-3.5 rounded-full transition-colors">
                  Se en typisk faktura
                </a>
              </div>
              <p className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-stone-600 mt-6">
                <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600" /> Inget kreditkort</span>
                <span className="inline-flex items-center gap-1.5"><Check className="w-4 h-4 text-teal-600" /> 79 kr/mån efter provperioden</span>
              </p>
            </div>

            {/* Hogerkolumn: avdragsregel ELLER yrkets fakturarader */}
            <aside className="rounded-[1.4rem] border border-stone-200 bg-white p-7 sm:p-8 shadow-xl shadow-stone-900/[0.06]">
              {regel ? (
                <>
                  <h2 className="font-semibold text-stone-900">{regel.rubrik}</h2>
                  <p className="text-[15px] text-stone-700 leading-relaxed mt-3">{regel.text}</p>
                  <div className="mt-5 pt-5 border-t border-stone-100">
                    <p className="text-sm font-semibold text-stone-900 mb-3">Räkneexempel</p>
                    <dl className="text-[15px] space-y-2">
                      <div className="flex justify-between gap-4">
                        <dt className="text-stone-700">Arbetskostnad inklusive moms</dt>
                        <dd className="font-medium tabular-nums">{kr(regel.exempel.arbete)}</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-teal-800">{regel.etikett} av arbetet</dt>
                        <dd className="font-semibold text-teal-800 tabular-nums">−{kr(avdrag)}</dd>
                      </div>
                      <div className="flex justify-between gap-4 pt-2 border-t border-stone-100">
                        <dt className="font-semibold text-stone-900">Kunden betalar</dt>
                        <dd className="font-bold text-stone-900 tabular-nums">{kr(regel.exempel.arbete - avdrag)}</dd>
                      </div>
                    </dl>
                    <p className="text-sm text-stone-600 mt-3">
                      Exemplet gäller enbart arbete. Lägger du till {kr(regel.exempel.material)} i material
                      betalar kunden {kr(regel.exempel.arbete + regel.exempel.material - avdrag)} – avdraget
                      är fortfarande {kr(avdrag)}.
                    </p>
                    <p className="text-sm text-stone-600 mt-2">
                      Exemplet förutsätter att kunden har rätt till avdraget och tillräckligt
                      utrymme kvar.
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="font-semibold text-stone-900">Vad som måste stå på fakturan</h2>
                  <p className="text-[15px] text-stone-700 leading-relaxed mt-3">
                    En fullständig momsfaktura ska bland annat innehålla fakturadatum, ett unikt
                    löpnummer, säljarens momsregistreringsnummer, säljarens och köparens namn och
                    adress samt uppgifter om vad som sålts, pris och moms. Ange även
                    betalningsvillkor och, om du är godkänd för F-skatt, uppgiften &rdquo;Godkänd för
                    F-skatt&rdquo;. Särskilda regler gäller bland annat vid momsfri försäljning och
                    omvänd betalningsskyldighet.
                  </p>
                  <p className="text-sm text-stone-600 leading-relaxed mt-4 pt-4 border-t border-stone-100">
                    Allt detta fylls i automatiskt när du lagt in ditt företag en gång. Du behöver aldrig
                    komma ihåg vilket nummer som står på tur.
                  </p>
                </>
              )}
            </aside>
          </div>
        </div>
      </section>

      {/* ───── Typiska fakturarader ───── */}
      <section id="rader" className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
        <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 lg:gap-14 items-start">
          <div>
            <p className="text-sm font-semibold text-teal-700 mb-3">Typisk faktura</p>
            <h2 className="font-display text-3xl sm:text-4xl text-stone-950">
              Raderna du faktiskt använder
            </h2>
            <p className="text-stone-700 mt-4 leading-relaxed">
              {regel
                ? `Spara dem som artiklar en gång – sedan väljer du bara rad och antal. Arbetsraderna är markerade som arbetskostnad, så ${regel.etikett.split(" ")[0]}-avdraget hamnar rätt varje gång.`
                : "Spara dem som artiklar en gång – sedan väljer du bara rad och antal. Samma priser varje gång, utan att leta i gamla fakturor."}
            </p>
          </div>
          <ul className="rounded-[1.4rem] border border-stone-200 bg-white divide-y divide-stone-100 overflow-hidden">
            {y.fakturarader.map((r) => (
              <li key={r} className="flex items-center gap-3 px-6 py-4 text-[15px] text-stone-800">
                <Check className="w-4 h-4 text-teal-600 shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ───── Utmaningar ───── */}
      <section className="bg-white border-y border-stone-200/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <div className="max-w-xl">
            <p className="text-sm font-semibold text-teal-700 mb-3">Vanliga problem</p>
            <h2 className="font-display text-3xl sm:text-4xl text-stone-950">
              Det som brukar gå fel
            </h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 mt-12">
            {y.utmaningar.map((u) => (
              <div key={u.t} className="rounded-2xl border border-stone-200 p-6">
                <p className="font-semibold text-stone-900">{u.t}</p>
                <p className="text-sm text-stone-700 leading-relaxed mt-2">{u.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Funktioner ───── */}
      <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
        <div className="max-w-xl">
          <p className="text-sm font-semibold text-teal-700 mb-3">Funktioner</p>
          <h2 className="font-display text-3xl sm:text-4xl text-stone-950">Från jobb till betalt</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
          {funktioner.map((f) => (
            <div key={f.title} className="rounded-2xl border border-stone-200 bg-white p-6">
              <f.icon className="w-6 h-6 text-teal-600" strokeWidth={1.9} />
              <h3 className="font-semibold text-stone-900 mt-4">{f.title}</h3>
              <p className="text-sm text-stone-700 leading-relaxed mt-1.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── FAQ ───── */}
      <section className="bg-white border-y border-stone-200/70">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 py-16 sm:py-20">
          <h2 className="font-display text-3xl sm:text-4xl text-stone-950">Vanliga frågor</h2>
          <div className="mt-10 divide-y divide-stone-200">
            {y.faq.map((f) => (
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

      {/* ───── Relaterade yrken ───── */}
      {y.relaterade.length > 0 && (
        <section className="max-w-6xl mx-auto px-5 sm:px-6 py-16">
          <h2 className="font-display text-2xl text-stone-950">Andra yrken</h2>
          <ul className="flex flex-wrap gap-2.5 mt-5">
            {y.relaterade
              .map((s) => yrken.find((o) => o.slug === s))
              .filter((o): o is Yrke => Boolean(o))
              .map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/for/${o.slug}`}
                    className="inline-block text-sm font-medium text-stone-700 bg-white border border-stone-200 hover:border-stone-300 rounded-full px-4 py-2 transition-colors first-letter:capitalize"
                  >
                    {o.namn}
                  </Link>
                </li>
              ))}
            <li>
              <Link href="/for/hantverkare" className="inline-block text-sm font-medium text-teal-700 bg-teal-50 border border-teal-100 hover:border-teal-200 rounded-full px-4 py-2 transition-colors">
                Alla hantverkare
              </Link>
            </li>
          </ul>
        </section>
      )}

      {/* ───── CTA ───── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-6 pb-20 sm:pb-24 text-center">
        <h2 className="font-display text-3xl sm:text-4xl text-stone-950">
          Testa med din nästa faktura
        </h2>
        <p className="text-stone-700 mt-4 leading-relaxed max-w-lg mx-auto">
          14 dagar gratis utan kreditkort. Skicka riktiga fakturor direkt – dina uppgifter och
          fakturor finns kvar om du väljer att fortsätta.
        </p>
        <Link href="/auth/register" className="inline-flex items-center justify-center gap-2 bg-[#13294B] hover:bg-[#1e3a63] text-white font-semibold px-7 py-4 rounded-full transition-colors mt-8">
          Skapa konto gratis <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <SiteFooter anchorBase="/" />
    </div>
  );
}
