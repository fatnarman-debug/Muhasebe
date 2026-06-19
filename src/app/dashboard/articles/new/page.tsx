import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ArticleForm } from "@/components/articles/ArticleForm";

export default async function NewArticlePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: companies } = await supabase
    .from("client_companies")
    .select("id, name")
    .eq("user_id", user!.id)
    .order("name");

  if (!companies || companies.length === 0) {
    redirect("/dashboard/clients/new");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/articles">
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500">
            <ArrowLeft className="w-4 h-4" /> Artiklar
          </Button>
        </Link>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-gray-900">Ny artikel</span>
      </div>
      <ArticleForm clientCompanies={companies} />
    </div>
  );
}
