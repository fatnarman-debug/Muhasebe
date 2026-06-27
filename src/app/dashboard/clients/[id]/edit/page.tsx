import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ClientForm } from "@/components/clients/ClientForm";
import type { ClientCompany } from "@/types/database";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.from("client_companies").select("*").eq("id", id).single();
  if (!data) notFound();
  const client = data as unknown as ClientCompany;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Redigera företag</h1>
        <p className="text-gray-500 text-sm mt-1">{client.name}</p>
      </div>
      <ClientForm initialData={client} />
    </div>
  );
}
