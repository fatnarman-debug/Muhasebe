import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Edit, Mail, Phone, MapPin, Building2, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Customer, ClientCompany } from "@/types/database";

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data } = await supabase
    .from("customers")
    .select("*, client_companies(id, name, user_id)")
    .eq("id", id)
    .single();

  if (!data) notFound();

  const company = data.client_companies as unknown as (ClientCompany & { user_id: string }) | null;
  if (company?.user_id !== user!.id) notFound();

  const customer = data as unknown as Customer;

  // Get invoice count for this customer
  const { count: invoiceCount } = await supabase
    .from("invoices")
    .select("id", { count: "exact", head: true })
    .eq("customer_id", id);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            {customer.customer_type === "company" ? "Företag" : "Privatperson"}
            {company && <> · {company.name}</>}
          </p>
        </div>
        <Link href={`/dashboard/customers/${id}/edit`}>
          <Button variant="outline" className="gap-2">
            <Edit className="w-4 h-4" /> Redigera
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <p className="text-xs text-gray-500 mb-1">Antal fakturor</p>
          <p className="text-2xl font-bold text-gray-900">{invoiceCount ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kunduppgifter */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Kunduppgifter</h2>
          <div className="space-y-3 text-sm">
            {customer.org_no && (
              <div className="flex gap-2">
                <span className="text-gray-400 min-w-[120px]">Org.nr</span>
                <span className="text-gray-900">{customer.org_no}</span>
              </div>
            )}
            {customer.personnummer && (
              <div className="flex gap-2">
                <span className="text-gray-400 min-w-[120px]">Personnummer</span>
                <span className="text-gray-900">{customer.personnummer}</span>
              </div>
            )}
            {customer.moms_no && (
              <div className="flex gap-2">
                <span className="text-gray-400 min-w-[120px]">Moms.nr</span>
                <span className="text-gray-900">{customer.moms_no}</span>
              </div>
            )}
            <div className="flex gap-2">
              <span className="text-gray-400 min-w-[120px]">Betaltid</span>
              <span className="text-gray-900">{customer.payment_terms_days ?? 30} dagar</span>
            </div>
          </div>
        </div>

        {/* Kontakt & Adress */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Kontakt</h2>
          <div className="space-y-2.5 text-sm">
            {customer.email && (
              <div className="flex items-center gap-2 text-gray-700">
                <Mail className="w-4 h-4 text-gray-400" />
                <a href={`mailto:${customer.email}`} className="hover:text-blue-600">{customer.email}</a>
              </div>
            )}
            {customer.phone && (
              <div className="flex items-center gap-2 text-gray-700">
                <Phone className="w-4 h-4 text-gray-400" />
                <a href={`tel:${customer.phone}`} className="hover:text-blue-600">{customer.phone}</a>
              </div>
            )}
            <div className="flex items-start gap-2 text-gray-700">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div>
                <p>{customer.address_line1}</p>
                {customer.address_line2 && <p>{customer.address_line2}</p>}
                <p>{customer.postal_code} {customer.city}</p>
                {customer.country !== "SE" && <p>{customer.country}</p>}
              </div>
            </div>
            {company && (
              <div className="flex items-center gap-2 text-gray-700">
                <Building2 className="w-4 h-4 text-gray-400" />
                <Link href={`/dashboard/clients/${company.id}`} className="hover:text-blue-600">
                  {company.name}
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Fakturor */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Fakturor</h2>
          <Link href={`/dashboard/invoices?customer=${id}`}>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <FileText className="w-3.5 h-3.5" /> Se alla
            </Button>
          </Link>
        </div>
        {(invoiceCount ?? 0) === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">Inga fakturor ännu</p>
        ) : (
          <p className="text-sm text-gray-500">{invoiceCount} faktura{invoiceCount === 1 ? "" : "r"}</p>
        )}
      </div>

      {customer.notes && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Anteckningar</h2>
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{customer.notes}</p>
        </div>
      )}
    </div>
  );
}
