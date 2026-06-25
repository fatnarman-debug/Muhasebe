"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, UserCheck, Settings, LogOut, Building2 } from "lucide-react";

const NAV = [
  { href: "/yetkili",               label: "Genel Bakış",   icon: LayoutDashboard, exact: true },
  { href: "/yetkili/muhasebeciler", label: "Muhasebeciler", icon: Users },
  { href: "/yetkili/musteriler",    label: "Müşteriler",    icon: UserCheck },
  { href: "/yetkili/ayarlar",       label: "Ayarlar",       icon: Settings },
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
    <aside
      style={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)", boxShadow: "4px 0 12px rgba(30,60,114,0.15)" }}
      className="w-[280px] h-screen flex flex-col shrink-0 fixed left-0 top-0 z-50 overflow-y-auto"
    >
      <div className="h-16 flex items-center px-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl" style={{ background: "rgba(255,255,255,0.15)" }}>
            💰
          </div>
          <div>
            <div className="text-white font-bold text-base leading-tight">LedgerFlow</div>
            <div className="text-white/50 text-[10px] uppercase tracking-widest leading-tight font-semibold">Dükkan Yetkilisi</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={active ? { background: "rgba(255,255,255,0.2)" } : undefined}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                active ? "text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
              }`}
            >
              <item.icon className="w-[18px] h-[18px] shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {email && (
        <div className="mx-3 mb-1 rounded-lg px-3 py-2.5" style={{ background: "rgba(255,255,255,0.08)" }}>
          <div className="text-white text-xs font-semibold truncate">{email}</div>
          <div className="text-white/55 text-[10px] uppercase tracking-wide font-semibold mt-0.5">Büro Yetkilisi</div>
        </div>
      )}
      <div className="px-3 pb-5 pt-3 border-t border-white/10 space-y-1">
        <a href="#" className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white transition-all">
          <svg className="w-[18px] h-[18px] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          Yardım Merkezi
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white transition-all w-full text-left"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          Oturumu Kapat
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
      <div className="flex h-screen items-center justify-center" style={{ background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)" }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-white/40 border-t-white animate-spin" />
          <p className="text-white/60 text-sm">Yükleniyor…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ background: "#f5f7fa" }}>
      <Sidebar email={email} />
      <div className="flex-1 ml-[280px] flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
}
