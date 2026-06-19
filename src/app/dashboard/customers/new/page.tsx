import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CustomerForm } from "@/components/customers/CustomerForm";

export default async function NewCustomerPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: companies } = await supabase
    .from("client_companies")
    .select("id, name")
    .eq("user_id", user!.id)
    .order("name");

  if (!companies?.length) redirect("/dashboard/clients/new");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ny kund</h1>
        <p className="text-gray-500 text-sm mt-1">Lägg till en ny kund</p>
      </div>
      <CustomerForm clientCompanies={companies} />
    </div>
  );
}
