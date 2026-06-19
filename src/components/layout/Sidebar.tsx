"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  FileText, Building2, Users, Package, BarChart3, Settings, LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Översikt", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/clients", label: "Klientföretag", icon: Building2 },
  { href: "/dashboard/customers", label: "Kunder", icon: Users },
  { href: "/dashboard/invoices", label: "Fakturor", icon: FileText },
  { href: "/dashboard/articles", label: "Artiklar", icon: Package },
  { href: "/dashboard/reports", label: "Rapporter", icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string, exact?: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-gray-900 text-lg">Faktura</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map((item) => {
          const active = isActive(item.href, item.exact);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}
            >
              <item.icon className={cn("w-4 h-4 shrink-0", active ? "text-blue-600" : "text-gray-400")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 border-t border-gray-200 pt-3">
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <Settings className="w-4 h-4 text-gray-400" />
          Inställningar
        </Link>
      </div>
    </aside>
  );
}
