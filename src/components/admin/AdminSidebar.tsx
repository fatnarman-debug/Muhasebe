"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Shield, LayoutDashboard, Users, Building2, FileText, Mail, AlertTriangle, Settings, LogOut, Tag, ScrollText, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/admin", label: "Genel Bakış", icon: LayoutDashboard, exact: true },
  { href: "/admin/buros", label: "Bürolar", icon: Building2 },
  { href: "/admin/users", label: "Kullanıcılar", icon: Users },
  { href: "/admin/companies", label: "Şirketler", icon: Building2 },
  { href: "/admin/invoices", label: "Faturalar", icon: FileText },
  { href: "/admin/plans", label: "Plan Yönetimi", icon: Tag },
  { href: "/admin/email-logs", label: "E-posta Logları", icon: Mail },
  { href: "/admin/errors", label: "Hata Logları", icon: AlertTriangle },
  { href: "/admin/logs", label: "İşlem Günlüğü", icon: ScrollText },
  { href: "/admin/settings", label: "Ayarlar", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobil topbar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 h-14 px-4 bg-slate-950 text-white">
        <button onClick={() => setOpen(true)} aria-label="Meny" className="p-1.5 -ml-1.5 rounded-lg hover:bg-slate-800">
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-bold text-sm">Enkelfaktura <span className="text-red-500">Admin</span></span>
      </div>
      {open && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setOpen(false)} />}
      <aside className={cn(
        "fixed left-0 top-0 h-screen w-60 z-50 bg-slate-950 flex flex-col transition-transform duration-200 md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}>
      <div className="h-16 flex items-center px-5 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-tight">Enkelfaktura</div>
            <div className="text-red-500 font-bold text-[10px] uppercase tracking-widest leading-tight">Super Admin</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active ? "bg-red-600 text-white" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 pb-4 border-t border-slate-800 pt-3">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </button>
      </div>
      </aside>
    </>
  );
}
