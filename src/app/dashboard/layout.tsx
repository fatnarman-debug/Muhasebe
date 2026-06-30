"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getAccess } from "@/lib/subscription";
import { TrialBanner } from "@/components/TrialBanner";

const M = ({ name, fill = false, size = 20 }: { name: string; fill?: boolean; size?: number }) => (
  <span className="material-symbols-outlined select-none leading-none"
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0},'wght' 400,'GRAD' 0,'opsz' ${size}`, fontSize: size }}>
    {name}
  </span>
);

const NAV = [
  { href: "/dashboard",           label: "Översikt",      icon: "dashboard",    exact: true },
  { href: "/dashboard/clients",   label: "Mitt företag",  icon: "storefront" },
  { href: "/dashboard/customers", label: "Kunder",        icon: "group" },
  { href: "/dashboard/invoices",  label: "Fakturor",      icon: "receipt_long" },
  { href: "/dashboard/teklifler", label: "Offerter",      icon: "description" },
  { href: "/dashboard/settings",  label: "Inställningar",  icon: "settings" },
];

function Sidebar({ name, email, open, onClose }: { name: string; email: string | null; open: boolean; onClose: () => void }) {
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
    <aside className={`h-screen w-60 fixed left-0 top-0 z-50 flex flex-col transition-transform duration-200 md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
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
              Egenföretagare
            </div>
          </div>
        </div>
      </div>

      {/* Info chip */}
      <div style={{ margin: "12px 10px 0", background: "#f9fafb", border: "1px solid #f3f4f6", borderRadius: 10, padding: "10px 12px" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#111827", lineHeight: 1.2 }} className="truncate">{name || "Mitt konto"}</p>
        {email && <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 2 }} className="truncate">{email}</p>}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto" style={{ padding: "12px 10px" }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", padding: "8px 10px 6px" }}>
          Meny
        </p>
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              className="flex items-center gap-2.5 rounded-lg transition-colors mb-0.5 relative"
              style={{ padding: "9px 12px", background: active ? "#f3f4f6" : "transparent", color: active ? "#111827" : "#6b7280", fontWeight: active ? 600 : 400 }}
              onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "#f9fafb"; }}
              onMouseLeave={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
              {active && <span style={{ position: "absolute", left: 10, width: 3, height: 20, background: "#111827", borderRadius: 9999 }} />}
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
        <button onClick={handleLogout} className="flex items-center gap-2.5 rounded-lg w-full text-left transition-colors"
          style={{ padding: "9px 12px", color: "#6b7280", background: "none", border: "none", cursor: "pointer", marginTop: 2 }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#fef2f2"; (e.currentTarget as HTMLElement).style.color = "#dc2626"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ""; (e.currentTarget as HTMLElement).style.color = "#6b7280"; }}>
          <M name="logout" size={18} />
          <span style={{ fontSize: 14 }}>Logga ut</span>
        </button>
      </div>
    </aside>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState<string | null>(null);
  const [trial, setTrial] = useState<{ trialing: boolean; daysLeft: number | null }>({ trialing: false, daysLeft: null });

  useEffect(() => {
    async function checkAuth() {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) { router.replace("/auth/login"); return; }
        // Yanlış panele gelen kullanıcıyı kendi paneline yönlendir
        const role = user.user_metadata?.role;
        if (role === "byraansvarig") { router.replace("/yetkili"); return; }
        if (role === "konsult") { router.replace("/konsult"); return; }

        // Prenumeration / provperiod: ingen åtkomst → betalvägg
        const { data: profile } = await supabase
          .from("profiles").select("subscription_status, trial_ends_at").eq("id", user.id).maybeSingle();
        // Fail-open: gå bara till betalvägg om profilen faktiskt lästes och saknar åtkomst.
        if (profile) {
          const access = getAccess(profile);
          if (!access.hasAccess) { router.replace("/uppgradera"); return; }
          setTrial({ trialing: access.trialing, daysLeft: access.daysLeft });
        }

        setName(user.user_metadata?.full_name || user.email || "");
        setEmail(user.email ?? null);
        setChecking(false);

        // Privat ilk kurulum: hiç şirket yoksa onboarding sihirbazına (engellemeyen yönlendirme)
        const { count } = await supabase
          .from("client_companies")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id);
        if ((count ?? 0) === 0 && window.location.pathname !== "/dashboard/onboarding") {
          router.replace("/dashboard/onboarding");
        }
      } catch {
        router.replace("/auth/login");
      }
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
    <div className="min-h-screen" style={{ background: "#f8f9fb", color: "#111827", fontFamily: "Inter, sans-serif" }}>
      {menuOpen && <div className="fixed inset-0 z-40 bg-black/40 md:hidden" onClick={() => setMenuOpen(false)} />}
      <Sidebar name={name} email={email} open={menuOpen} onClose={() => setMenuOpen(false)} />
      <div className="md:ml-60 min-h-screen flex flex-col">
        {trial.trialing && trial.daysLeft != null && <TrialBanner daysLeft={trial.daysLeft} />}
        {/* Mobil menü-rad */}
        <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 bg-white" style={{ borderBottom: "1px solid #e5e7eb" }}>
          <button onClick={() => setMenuOpen(true)} aria-label="Öppna meny" className="p-1.5 -ml-1.5 rounded-lg text-slate-700 hover:bg-slate-100">
            <M name="menu" size={24} />
          </button>
          <span style={{ fontWeight: 800, fontSize: 15 }}>Enkelfaktura</span>
        </div>
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 pt-6 pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
