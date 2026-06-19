"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, User } from "lucide-react";
import type { Profile } from "@/types/database";

interface TopBarProps {
  profile: Profile | null;
}

export function TopBar({ profile }: TopBarProps) {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  }

  const initials = profile?.full_name
    ? profile.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shrink-0">
      <div />
      <DropdownMenu>
        <DropdownMenuTrigger className="flex items-center gap-2 h-9 px-3 rounded-md hover:bg-gray-100 transition-colors outline-none">
          <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-700 max-w-[140px] truncate">
            {profile?.full_name ?? "Användare"}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem className="text-xs text-gray-400" disabled>
            {profile?.email}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <User className="w-4 h-4 mr-2" /> Mitt konto
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
            <LogOut className="w-4 h-4 mr-2" /> Logga ut
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
