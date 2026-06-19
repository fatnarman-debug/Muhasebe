import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { ArticleForm } from "@/components/articles/ArticleForm";
import type { Article } from "@/types/database";

export default async function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: article } = await supabase.from("articles").select("*").eq("id", id).single();
  if (!article) notFound();

  const { data: companies } = await supabase
    .from("client_companies")
    .select("id, name")
    .eq("user_id", user!.id)
    .order("name");

  if (!companies || !companies.find((c) => c.id === article.client_company_id)) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/articles">
          <Button variant="ghost" size="sm" className="gap-1.5 text-gray-500">
            <ArrowLeft className="w-4 h-4" /> Artiklar
          </Button>
        </Link>
        <span className="text-gray-300">/</span>
        <span className="font-semibold text-gray-900">{article.name}</span>
      </div>
      <ArticleForm initialData={article as unknown as Article} clientCompanies={companies} />
    </div>
  );
}
