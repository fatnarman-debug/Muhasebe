"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

const M = ({ name, fill = false, size = 20 }: { name: string; fill?: boolean; size?: number }) => (
  <span className="material-symbols-outlined select-none leading-none"
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0},'wght' 400,'GRAD' 0,'opsz' ${size}`, fontSize: size }}>
    {name}
  </span>
);

const NAV = [
  { href: "/konsult",        label: "Översikt",   icon: "dashboard",    exact: true },
  { href: "/konsult/kunder", label: "Mina kunder", icon: "group" },
  { href: "/konsult/fakturor", label: "Fakturor",  icon: "receipt_long" },
];

export default function KonsultLayout({ children }: { children: React.ReactNode }) {
  const router   = useRouter();
  const pathname = usePathname();

  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [konsult, setKonsult] = useState<{ name: string; kod: string | null; email: string | null }>({ name: "Konsult", kod: null, email: null });

  useEffect(() => {
    (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) { router.replace("/auth/login"); return; }
        // Byråansvarig hör hemma i /yetkili
        if (user.user_metadata?.role === "byraansvarig") { router.replace("/yetkili"); return; }

        const res = await fetch("/api/konsult/me");
        const json = await res.json().catch(() => null);
        const k = json?.konsult;
        setKonsult({
          name: k?.full_name || user.user_metadata?.full_name || user.email || "Konsult",
          kod: k?.benzersiz_kod ?? user.user_metadata?.benzersiz_kod ?? null,
          email: user.email ?? null,
        });
        setChecking(false);
      } catch {
        router.replace("/auth/login");
      }
    })();
  }, [router]);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function logout() {
    try {
      const { createClient } = await import("@/lib/supabase/client");
      await createClient().auth.signOut();
    } catch {}
    router.push("/auth/login");
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f9fb" }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#111827", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ background: "#f8f9fb", color: "#111827", fontFamily: "Inter, sans-serif" }} className="min-h-screen">

      {menuOpen && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMenuOpen(false)} />}

      {/* Sidebar */}
      <aside className={`h-screen w-60 fixed left-0 top-0 z-50 flex flex-col transition-transform duration-200 md:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ background: "#ffffff", borderRight: "1px solid #e5e7eb" }}>

        {/* Logo */}
        <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #f3f4f6" }}>
          <div className="flex items-center gap-3">
            <div style={{ width: 36, height: 36, borderRadius: 9, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
              <M name="account_balance" fill size={18} />
            </div>
            <div>
              <div style={{ color: "#111827", fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}>Enkelfaktura</div>
              <div style={{ color: "#9ca3af", fontSize: 10, letterSpacing: "0.1em", fontWeight: 600, textTransform: "uppercase" }}>
                Konsultpanel
              </div>
            </div>
          </div>
        </div>

        {/* Konsult info chip */}
        <div style={{ margin: "12px 10px 0", background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: 10, padding: "10px 12px" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", lineHeight: 1.2 }}>{konsult.name}</p>
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Redovisningskonsult</p>
          {konsult.email && <p style={{ fontSize: 10, color: "#c0c4cc", marginTop: 1 }}>{konsult.email}</p>}
          {konsult.kod && (
            <code style={{ display: "inline-block", marginTop: 6, fontSize: 10, fontWeight: 700, color: "#4338ca", fontFamily: "'JetBrains Mono', monospace", background: "#eef2ff", padding: "2px 7px", borderRadius: 5 }}>
              {konsult.kod}
            </code>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto" style={{ padding: "12px 10px" }}>
          <p style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 10px 6px" }}>
            Meny
          </p>
          {NAV.map(item => {
            const active = isActive(item.href, item.exact);
            return (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 rounded-lg transition-colors mb-0.5"
                style={{ padding: "9px 12px", background: active ? "#f3f4f6" : "transparent", color: active ? "#111827" : "#6b7280", fontWeight: active ? 600 : 400 }}
                onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
                onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                {active && (
                  <span style={{ position: "absolute", left: 10, width: 3, height: 20, background: "#111827", borderRadius: 9999 }} />
                )}
                <M name={item.icon} fill={active} size={18} />
                <span style={{ fontSize: 14 }}>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ borderTop: "1px solid #f3f4f6", padding: "10px" }}>
          <a href="#" className="flex items-center gap-2.5 rounded-lg transition-colors"
            style={{ padding: "9px 12px", color: "#6b7280" }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#f9fafb"; (e.currentTarget as HTMLElement).style.color = "#111827"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}>
            <M name="help_outline" size={18} />
            <span style={{ fontSize: 14 }}>Hjälpcenter</span>
          </a>
          <button onClick={logout} className="flex items-center gap-2.5 rounded-lg w-full text-left transition-colors"
            style={{ padding: "9px 12px", color: "#6b7280", background: "none", border: "none", cursor: "pointer", marginTop: 2 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fef2f2"; (e.currentTarget as HTMLElement).style.color = "#dc2626"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}>
            <M name="logout" size={18} />
            <span style={{ fontSize: 14 }}>Logga ut</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="md:ml-60 min-h-screen flex flex-col">
        {/* Mobil menü-rad */}
        <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 bg-white" style={{ borderBottom: "1px solid #e5e7eb" }}>
          <button onClick={() => setMenuOpen(true)} aria-label="Öppna meny" className="p-1.5 -ml-1.5 rounded-lg text-slate-700 hover:bg-slate-100">
            <M name="menu" size={24} />
          </button>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Enkelfaktura</span>
        </div>
        {children}
      </main>
    </div>
  );
}
