"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { InvoiceEditForm } from "@/components/invoices/InvoiceEditForm";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { ClientCompany, Customer, Invoice, InvoiceLine } from "@/types/database";

export default function KonsultInvoiceEdit() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [data, setData] = useState<{
    invoice: Invoice & { status: string };
    company: ClientCompany;
    customer: Customer;
    lines: InvoiceLine[];
    allCustomers: Pick<Customer, "id" | "name" | "payment_terms_days">[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [blocked, setBlocked] = useState(false);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const { data: invoice } = await supabase
        .from("invoices")
        .select("*, customers(*), client_companies(*), invoice_lines(*)")
        .eq("id", id)
        .maybeSingle();

      if (!invoice) { setLoading(false); return; }
      // Yalnızca taslak (gönderilmemiş) düzenlenebilir
      if (invoice.status !== "draft") { setBlocked(true); setLoading(false); router.replace(`/konsult/fakturor/${id}`); return; }

      const company = invoice.client_companies as unknown as ClientCompany;
      const customer = invoice.customers as unknown as Customer;
      const lines = ((invoice.invoice_lines as unknown as InvoiceLine[]) ?? []).sort((a, b) => a.sort_order - b.sort_order);
      const { data: allCustomers } = await supabase
        .from("customers")
        .select("id, name, payment_terms_days")
        .eq("client_company_id", company.id)
        .order("name");

      setData({ invoice: invoice as unknown as Invoice & { status: string }, company, customer, lines, allCustomers: allCustomers ?? [] });
      setLoading(false);
    })();
    // eslint-disable-next-line
  }, [id]);

  if (loading || blocked) return <div className="flex justify-center py-20 text-gray-400"><Loader2 className="w-6 h-6 animate-spin" /></div>;
  if (!data) return <div className="p-8 text-gray-500">Fakturan hittades inte.</div>;

  return (
    <div style={{ padding: "24px 32px 48px" }}>
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Link href={`/konsult/fakturor/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800">
            <ArrowLeft className="w-4 h-4" /> {data.invoice.invoice_number}
          </Link>
          <span className="text-gray-300">/</span>
          <span className="font-semibold text-gray-900">Redigera</span>
        </div>

        <InvoiceEditForm
          invoice={data.invoice}
          company={data.company}
          customer={data.customer}
          lines={data.lines}
          allCustomers={data.allCustomers}
          getRedirectPath={(invId) => `/konsult/fakturor/${invId}`}
        />
      </div>
    </div>
  );
}
