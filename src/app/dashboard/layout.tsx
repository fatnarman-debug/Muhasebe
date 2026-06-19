import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";

const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http");

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  let profile = null;

  if (!isSupabaseConfigured) {
    // Dev mode: Supabase not yet configured — show layout without auth check
  } else {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect("/auth/login");

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <TopBar profile={profile} />
        {!isSupabaseConfigured && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2 text-xs text-amber-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            Supabase inte konfigurerad — uppdatera <code className="font-mono bg-amber-100 px-1 rounded">.env.local</code> med din Supabase URL och anon-nyckel.
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
