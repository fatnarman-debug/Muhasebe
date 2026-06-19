import { createClient } from "@/lib/supabase/server";
import { InvoiceList } from "@/components/invoices/InvoiceList";

const isSupabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http");

export default async function InvoicesPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Fakturor</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-400">
          Anslut Supabase för att visa fakturor.
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

  const { data: invoices } = companyIds.length
    ? await supabase
        .from("invoices")
        .select("id, invoice_number, invoice_date, due_date, total, status, ocr_number, customers(id, name), client_companies(name)")
        .in("client_company_id", companyIds)
        .order("invoice_date", { ascending: false })
    : { data: [] };

  return (
    <div className="max-w-7xl mx-auto">
      <InvoiceList invoices={(invoices ?? []) as any} />
    </div>
  );
}
