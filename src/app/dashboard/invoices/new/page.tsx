import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";

export default async function NewInvoicePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: companies } = await supabase
    .from("client_companies")
    .select("id, name, invoice_prefix, next_invoice_number, payment_terms_days, default_vat_rate")
    .eq("user_id", user!.id)
    .eq("is_active", true)
    .order("name");

  if (!companies?.length) redirect("/dashboard/clients/new");

  // Load customers for each company
  const companyIds = companies.map((c) => c.id);
  const { data: customers } = await supabase
    .from("customers")
    .select("id, name, client_company_id, payment_terms_days")
    .in("client_company_id", companyIds)
    .eq("is_active", true)
    .order("name");

  const companiesWithCustomers = companies.map((c) => ({
    ...c,
    customers: customers?.filter((cu) => cu.client_company_id === c.id) ?? [],
  }));

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ny faktura</h1>
        <p className="text-gray-500 text-sm mt-1">Fyll i uppgifterna nedan och spara eller skicka direkt</p>
      </div>
      <InvoiceForm clientCompanies={companiesWithCustomers} />
    </div>
  );
}
