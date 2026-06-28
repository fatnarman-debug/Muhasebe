import Link from "next/link";
import { Receipt } from "lucide-react";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/90 backdrop-blur">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-slate-900 text-white grid place-items-center"><Receipt className="w-4 h-4" /></span>
            <span className="font-bold">LedgerFlow</span>
          </Link>
          <Link href="/" className="text-sm text-slate-500 hover:text-slate-900">← Till startsidan</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">{children}</main>

      <footer className="border-t border-slate-100 mt-12 py-8">
        <div className="max-w-3xl mx-auto px-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-400">
          <Link href="/integritetspolicy" className="hover:text-slate-700">Integritetspolicy</Link>
          <Link href="/anvandarvillkor" className="hover:text-slate-700">Användarvillkor</Link>
          <Link href="/gdpr" className="hover:text-slate-700">GDPR</Link>
          <span className="ml-auto">© 2026 LedgerFlow</span>
        </div>
      </footer>
    </div>
  );
}
