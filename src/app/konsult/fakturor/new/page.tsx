import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { AddCustomerInline } from "@/components/konsult/AddCustomerInline";

export const dynamic = "force-dynamic";

export default async function KonsultNewInvoicePage() {
  const supabase = await createClient();

  // RLS: atanan muhasebeci yalnızca kendisine atanmış firmaları görür
  const { data: companies } = await supabase
    .from("client_companies")
    .select("id, name, invoice_prefix, next_invoice_number, payment_terms_days, default_vat_rate")
    .eq("is_active", true)
    .order("name");

  const companyList = companies ?? [];

  const companyIds = companyList.map((c) => c.id);
  const { data: customers } = companyIds.length
    ? await supabase
        .from("customers")
        .select("id, name, client_company_id, payment_terms_days")
        .in("client_company_id", companyIds)
        .eq("is_active", true)
        .order("name")
    : { data: [] };

  const companiesWithCustomers = companyList.map((c) => ({
    ...c,
    customers: (customers ?? []).filter((cu) => cu.client_company_id === c.id),
  }));

  return (
    <div style={{ padding: "24px 32px 48px" }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ny faktura</h1>
            <p className="text-gray-500 text-sm mt-1">Skapa en faktura för en av dina tilldelade kunder</p>
          </div>
          <Link href="/konsult/fakturor" className="text-sm text-gray-500 hover:text-gray-800">← Tillbaka</Link>
        </div>

        {companyList.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3">
            Inga tilldelade klientföretag ännu. Din byrå måste tilldela dig minst en kund.
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <AddCustomerInline companies={companyList.map((c) => ({ id: c.id, name: c.name }))} />
            </div>
            <InvoiceForm
              clientCompanies={companiesWithCustomers}
              getRedirectPath={() => "/konsult/fakturor"}
            />
          </>
        )}
      </div>
    </div>
  );
}
