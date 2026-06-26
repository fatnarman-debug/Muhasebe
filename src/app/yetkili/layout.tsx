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
  { href: "/yetkili",               label: "Genel Bakış",   icon: "dashboard",        exact: true },
  { href: "/yetkili/muhasebeciler", label: "Muhasebeciler", icon: "group" },
  { href: "/yetkili/musteriler",    label: "Müşteriler",    icon: "badge" },
  { href: "/yetkili/ayarlar",       label: "Ayarlar",       icon: "settings" },
];

function Sidebar({ email }: { email?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function handleLogout() {
    const { createClient } = await import("@/lib/supabase/client");
    await createClient().auth.signOut();
    router.push("/auth/login");
  }

  return (
    <aside className="h-screen w-60 fixed left-0 top-0 z-50 flex flex-col"
      style={{ background: "#ffffff", borderRight: "1px solid #e5e7eb" }}>

      {/* Logo */}
      <div style={{ padding: "20px 20px 16px", borderBottom: "1px solid #f3f4f6" }}>
        <div className="flex items-center gap-3">
          <div style={{ width: 36, height: 36, borderRadius: 9, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <M name="storefront" fill size={18} />
          </div>
          <div>
            <div style={{ color: "#111827", fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em" }}>LedgerFlow</div>
            <div style={{ color: "#9ca3af", fontSize: 10, letterSpacing: "0.1em", fontWeight: 600, textTransform: "uppercase" }}>
              Dükkan Yetkilisi
            </div>
          </div>
        </div>
      </div>

      {/* Yetkili info chip */}
      {email && (
        <div style={{ margin: "12px 10px 0", background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: 10, padding: "10px 12px" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", lineHeight: 1.2 }} className="truncate">{email}</p>
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }}>Büro Yetkilisi</p>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: "12px 10px" }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 10px 6px" }}>
          Menü
        </p>
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-2.5 rounded-lg transition-colors mb-0.5 relative"
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
          <span style={{ fontSize: 14 }}>Yardım Merkezi</span>
        </a>
        <button onClick={handleLogout} className="flex items-center gap-2.5 rounded-lg w-full text-left transition-colors"
          style={{ padding: "9px 12px", color: "#6b7280", background: "none", border: "none", cursor: "pointer", marginTop: 2 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fef2f2"; (e.currentTarget as HTMLElement).style.color = "#dc2626"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}>
          <M name="logout" size={18} />
          <span style={{ fontSize: 14 }}>Oturumu Kapat</span>
        </button>
      </div>
    </aside>
  );
}

export default function YetkiliLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState<string | undefined>(undefined);

  useEffect(() => {
    async function checkAuth() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) { router.replace("/auth/login"); return; }
        // Yanlış panele gelen kullanıcıyı kendi paneline yönlendir
        const role = user.user_metadata?.role;
        if (role === "konsult") { router.replace("/konsult"); return; }
        if (role === "privat")  { router.replace("/dashboard"); return; }
        const { data: dukkan } = await supabase.from("muhasebe_dukkanlar").select("id").eq("user_id", user.id).maybeSingle();
        if (!dukkan) { router.replace("/auth/login"); return; }
        setEmail(user.email ?? undefined);
        setChecking(false);
      } catch { router.replace("/auth/login"); }
    }
    checkAuth();
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#f8f9fb" }}>
        <div style={{ width: 30, height: 30, borderRadius: "50%", border: "3px solid #e5e7eb", borderTopColor: "#111827", animation: "spin 0.7s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#f8f9fb", color: "#111827", fontFamily: "Inter, sans-serif" }}>
      <Sidebar email={email} />
      <div className="flex-1 ml-60 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
