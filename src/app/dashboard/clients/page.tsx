import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Building2, Phone, Mail, CheckCircle2, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const { q } = await searchParams;

  let query = supabase
    .from("client_companies")
    .select("*")
    .eq("user_id", user!.id)
    .order("name");

  if (q) {
    // Sanera sökterm — ta bort PostgREST-tecken (,()* m.m.) för att undvika filterinjektion
    const safe = q.replace(/[^\p{L}\p{N}\s-]/gu, "").trim().slice(0, 60);
    if (safe) query = query.or(`name.ilike.%${safe}%,org_no.ilike.%${safe}%`);
  }

  const { data: clients } = await query;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mitt företag</h1>
          <p className="text-gray-500 text-sm mt-1">{clients?.length ?? 0} företag</p>
        </div>
        <Link href="/dashboard/clients/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Lägg till företag
          </Button>
        </Link>
      </div>

      {/* Search */}
      <form method="GET" className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          name="q"
          defaultValue={q}
          placeholder="Sök efter företagsnamn eller org-nummer..."
          className="w-full h-10 pl-10 pr-10 rounded-lg border border-gray-200 bg-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        {q && (
          <Link href="/dashboard/clients" className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </Link>
        )}
      </form>

      {!clients?.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Inget företag ännu</h3>
          <p className="text-gray-500 text-sm mb-6">
            Lägg till ditt företag som du fakturerar från.
          </p>
          <Link href="/dashboard/clients/new">
            <Button className="gap-2"><Plus className="w-4 h-4" /> Lägg till företag</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/dashboard/clients/${client.id}`}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-sm hover:border-blue-200 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-blue-600" />
                </div>
                {client.f_skatt && (
                  <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                    <CheckCircle2 className="w-3 h-3" /> F-skatt
                  </span>
                )}
              </div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {client.name}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 mb-3">Org.nr: {client.org_no}</p>
              <div className="space-y-1">
                {client.email && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Mail className="w-3 h-3" /> {client.email}
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Phone className="w-3 h-3" /> {client.phone}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
