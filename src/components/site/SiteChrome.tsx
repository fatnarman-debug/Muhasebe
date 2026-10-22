import Link from "next/link";
import { Brandmark } from "@/components/Brandmark";
import { CookieSettingsButton } from "@/components/CookieSettingsButton";

/* Delad header/footer for alla publika sidor.
   Navigationen pekar pa riktiga sidor, inte ankare – ankarlankar fungerar
   bara pa startsidan och skickar bort besokaren fran undersidor.
   `anchorBase="/"` behalls for de fa lankar som fortfarande ar ankare
   (#priser och #fragor bor pa startsidan tills de far egna sidor).      */

const NAV = [
  { href: "/for", label: "För vem" },
  { href: "/#funktioner", label: "Funktioner", anchor: true },
  { href: "/#priser", label: "Priser", anchor: true },
  { href: "/#fragor", label: "Vanliga frågor", anchor: true },
];

/** Yrken som visas i sidfoten. Hall listan kort – hela listan finns pa /for. */
const FOOTER_YRKEN = [
  { href: "/for/hantverkare", label: "Hantverkare" },
  { href: "/for/elektriker", label: "Elektriker" },
  { href: "/for/frisor", label: "Frisörer" },
  { href: "/for/konsult", label: "Konsulter" },
];

export function SiteHeader({ anchorBase = "" }: { anchorBase?: string }) {
  return (
    <header className="sticky top-0 z-50 border-b border-stone-200/70 bg-[#faf8f3]/85 backdrop-blur-md">
      <nav className="max-w-6xl mx-auto px-5 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <Brandmark className="w-8 h-8" />
          <span className="text-lg font-bold tracking-tight" style={{ color: "#13294B" }}>EnkeltFaktura</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-stone-500">
          {NAV.map((n) =>
            n.anchor ? (
              <a key={n.label} href={anchorBase ? n.href : n.href.slice(1)} className="hover:text-stone-900 transition-colors">
                {n.label}
              </a>
            ) : (
              <Link key={n.label} href={n.href} className="hover:text-stone-900 transition-colors">
                {n.label}
              </Link>
            )
          )}
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
  );
}

export function SiteFooter({ anchorBase = "" }: { anchorBase?: string }) {
  const a = (hash: string) => (anchorBase ? `${anchorBase}${hash}` : hash);
  return (
    <footer className="border-t border-stone-200/70 bg-[#faf8f3]">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 py-14 grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <Brandmark className="w-8 h-8" />
            <span className="text-lg font-bold tracking-tight" style={{ color: "#13294B" }}>EnkeltFaktura</span>
          </div>
          <p className="text-sm text-stone-600 mt-3 leading-relaxed max-w-xs">
            Fakturering &amp; offert för svenska egenföretagare. Byggt i Sverige, för svenska regler.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-600 mb-3">Produkt</p>
          <ul className="space-y-2 text-sm text-stone-500">
            <li><a href={a("#funktioner")} className="hover:text-stone-900">Funktioner</a></li>
            <li><a href={a("#priser")} className="hover:text-stone-900">Priser</a></li>
            <li><a href={a("#fragor")} className="hover:text-stone-900">Vanliga frågor</a></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-600 mb-3">För vem</p>
          <ul className="space-y-2 text-sm text-stone-500">
            {FOOTER_YRKEN.map((y) => (
              <li key={y.href}><Link href={y.href} className="hover:text-stone-900">{y.label}</Link></li>
            ))}
            <li>
              <Link href="/for" className="font-medium text-teal-700 hover:text-teal-800">
                Alla yrken →
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-600 mb-3">Konto &amp; juridik</p>
          <ul className="space-y-2 text-sm text-stone-500">
            <li><Link href="/priser" className="hover:text-stone-900">Priser</Link></li>
            <li><Link href="/auth/register" className="hover:text-stone-900">Skapa konto</Link></li>
            <li><Link href="/auth/login" className="hover:text-stone-900">Logga in</Link></li>
            <li><Link href="/integritetspolicy" className="hover:text-stone-900">Integritetspolicy</Link></li>
            <li><Link href="/anvandarvillkor" className="hover:text-stone-900">Användarvillkor</Link></li>
            <li><Link href="/gdpr" className="hover:text-stone-900">GDPR</Link></li>
            <li><CookieSettingsButton className="hover:text-stone-900 text-left" /></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-stone-200/70">
        <div className="max-w-6xl mx-auto px-5 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-sm text-stone-600">
          <span>© 2026 EnkeltFaktura. Alla rättigheter förbehållna.</span>
          <span>Byggt i Sverige · för svenska företag</span>
        </div>
      </div>
    </footer>
  );
}

/** Delade stilar (typsnitt + rise-animation) som landningssidan definierar. */
export function SiteStyles() {
  return (
    <style>{`
      html { scroll-behavior: smooth; }
      .font-display { font-family: var(--font-display), Georgia, "Times New Roman", serif; letter-spacing: -0.015em; }
      section[id] { scroll-margin-top: 84px; }
      @keyframes ef-rise { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: none; } }
      .ef-rise { animation: ef-rise .8s cubic-bezier(.16,1,.3,1) both; }
      @media (prefers-reduced-motion: reduce) { .ef-rise { animation: none; } html { scroll-behavior: auto; } }
    `}</style>
  );
}
