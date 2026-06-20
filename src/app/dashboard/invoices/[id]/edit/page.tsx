import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { InvoiceEditForm } from "@/components/invoices/InvoiceEditForm";
import type { Customer, ClientCompany, InvoiceLine } from "@/types/database";

export default async function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: invoice } = await supabase
    .from("invoices")
    .select("*, customers(*), client_companies(*), invoice_lines(*)")
    .eq("id", id)
    .single();

  if (!invoice) notFound();

  const company = invoice.client_companies as unknown as ClientCompany & { user_id: string };
  if (company?.user_id !== user!.id) notFound();

  // Paid and cancelled invoices cannot be edited
  if (invoice.status === "paid" || invoice.status === "cancelled") {
    redirect(`/dashboard/invoices/${id}`);
  }

  const customer = invoice.customers as unknown as Customer;
  const lines = (invoice.invoice_lines as unknown as InvoiceLine[])?.sort((a, b) => a.sort_order - b.sort_order) ?? [];

  // Fetch all customers for this company (for customer selector)
  const { data: allCustomers } = await supabase
    .from("customers")
    .select("id, name, payment_terms_days")
    .eq("client_company_id", company.id)
    .order("name");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href={`/dashboard/invoices/${id}`}>
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500">
            <ArrowLeft className="w-4 h-4" /> {invoice.invoice_number}
          </Button>
        </Link>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-gray-900">Redigera</span>
      </div>

      <InvoiceEditForm
        invoice={invoice as any}
        company={company}
        customer={customer}
        lines={lines}
        allCustomers={allCustomers ?? []}
      />
    </div>
  );
}
