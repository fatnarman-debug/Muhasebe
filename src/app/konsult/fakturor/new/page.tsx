"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";
import { AddCustomerInline } from "@/components/konsult/AddCustomerInline";
import { Loader2 } from "lucide-react";

type Company = {
  id: string;
  name: string;
  invoice_prefix: string | null;
  next_invoice_number: number;
  next_offert_number: number;
  payment_terms_days: number;
  default_vat_rate: number;
  customers: { id: string; name: string; payment_terms_days: number | null }[];
};

export default function KonsultNewInvoicePage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [initialDocType] = useState<"invoice" | "offert">(() =>
    typeof window !== "undefined" && new URLSearchParams(window.location.search).get("type") === "offert" ? "offert" : "invoice"
  );

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const supabase = createClient();
        // RLS: atanan muhasebeci yalnızca kendisine atanmış firmaları görür
        const { data: comps, error: cErr } = await supabase
          .from("client_companies")
          .select("id, name, invoice_prefix, next_invoice_number, next_offert_number, payment_terms_days, default_vat_rate")
          .eq("is_active", true)
          .order("name");
        if (cErr) throw new Error(cErr.message);

        const list = comps ?? [];
        const ids = list.map((c) => c.id);
        let customers: { id: string; name: string; client_company_id: string; payment_terms_days: number | null }[] = [];
        if (ids.length) {
          const { data: cust } = await supabase
            .from("customers")
            .select("id, name, client_company_id, payment_terms_days")
            .in("client_company_id", ids)
            .eq("is_active", true)
            .order("name");
          customers = cust ?? [];
        }

        setCompanies(
          list.map((c) => ({
            ...c,
            customers: customers.filter((cu) => cu.client_company_id === c.id).map(({ id, name, payment_terms_days }) => ({ id, name, payment_terms_days })),
          }))
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kunde inte ladda data");
      } finally {
        setLoading(false);
      }
    })();
  }, [reloadKey]);

  return (
    <div style={{ padding: "24px 32px 48px" }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ny faktura / offert</h1>
            <p className="text-gray-500 text-sm mt-1">Skapa en faktura eller offert för en av dina tilldelade kunder</p>
          </div>
          <Link href="/konsult/fakturor" className="text-sm text-gray-500 hover:text-gray-800">← Tillbaka</Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16 text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
        ) : companies.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-700 text-sm rounded-lg px-4 py-3">
            Inga tilldelade klientföretag ännu. Din byrå måste tilldela dig minst en kund.
          </div>
        ) : (
          <>
            <div className="flex justify-end">
              <AddCustomerInline
                companies={companies.map((c) => ({ id: c.id, name: c.name }))}
                onAdded={() => setReloadKey((k) => k + 1)}
              />
            </div>
            <InvoiceForm
              clientCompanies={companies}
              getRedirectPath={() => "/konsult/fakturor"}
              initialDocType={initialDocType}
            />
          </>
        )}
      </div>
    </div>
  );
}
