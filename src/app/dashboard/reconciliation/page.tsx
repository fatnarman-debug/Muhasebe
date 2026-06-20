import { createClient } from "@/lib/supabase/server";
import { ReconciliationClient } from "@/components/reconciliation/ReconciliationClient";
import type { Invoice } from "@/types/database";

export default async function ReconciliationPage() {
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
        .select("id, invoice_number, ocr_number, total, status, customers(name)")
        .in("client_company_id", companyIds)
        .in("status", ["sent", "overdue"])
        .order("invoice_date", { ascending: false })
    : { data: [] };

  return (
    <div className="max-w-4xl mx-auto">
      <ReconciliationClient invoices={(invoices ?? []) as any} />
    </div>
  );
}
