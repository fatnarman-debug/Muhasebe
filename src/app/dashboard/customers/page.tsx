import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Plus, Users, Mail, Phone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http");

export default async function CustomersPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Kunder</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          Anslut Supabase för att visa kunder.
        </div>
      </div>
    );
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: companies } = await supabase
    .from("client_companies")
    .select("id")
    .eq("user_id", user!.id);

  const companyIds = companies?.map((c) => c.id) ?? [];

  const { data: customers } = companyIds.length
    ? await supabase
        .from("customers")
        .select("*, client_companies(name)")
        .in("client_company_id", companyIds)
        .order("name")
    : { data: [] };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Kunder</h1>
          <p className="text-gray-500 text-sm mt-1">{customers?.length ?? 0} kunder</p>
        </div>
        <Link href="/dashboard/customers/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Ny kund
          </Button>
        </Link>
      </div>

      {!customers?.length ? (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Inga kunder ännu</h3>
          <p className="text-gray-500 text-sm mb-6">
            Lägg till kunder som du fakturerar för dina klientföretag.
          </p>
          {companyIds.length === 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 inline-block">
                Du måste skapa ett klientföretag först.
              </p>
              <div>
                <Link href="/dashboard/clients/new">
                  <Button variant="outline" className="gap-2 mt-2">
                    <Building2 className="w-4 h-4" /> Skapa klientföretag
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <Link href="/dashboard/customers/new">
              <Button className="gap-2"><Plus className="w-4 h-4" /> Lägg till första kunden</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Namn</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Typ</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Klientföretag</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kontakt</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Ort</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {customers.map((customer) => {
                const company = customer.client_companies as unknown as { name: string } | null;
                return (
                  <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <Link href={`/dashboard/customers/${customer.id}`} className="font-medium text-gray-900 hover:text-blue-600">
                        {customer.name}
                      </Link>
                      {customer.org_no && <p className="text-xs text-gray-400">Org.nr: {customer.org_no}</p>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        customer.customer_type === "company"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-purple-50 text-purple-700"
                      }`}>
                        {customer.customer_type === "company" ? "Företag" : "Privatperson"}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{company?.name ?? "—"}</td>
                    <td className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        {customer.email && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Mail className="w-3 h-3" /> {customer.email}
                          </div>
                        )}
                        {customer.phone && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <Phone className="w-3 h-3" /> {customer.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-gray-500">{customer.city}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
