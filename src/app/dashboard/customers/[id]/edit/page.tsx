import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CustomerForm } from "@/components/customers/CustomerForm";
import type { Customer, ClientCompany } from "@/types/database";

export default async function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
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

  const { data: companies } = await supabase
    .from("client_companies")
    .select("id, name")
    .eq("user_id", user!.id)
    .order("name");

  const customer = data as unknown as Customer;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Redigera kund</h1>
        <p className="text-gray-500 text-sm mt-1">{customer.name}</p>
      </div>
      <CustomerForm initialData={customer} clientCompanies={companies ?? []} />
    </div>
  );
}
