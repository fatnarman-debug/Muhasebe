import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, Package, Edit } from "lucide-react";
import type { Article, ClientCompany } from "@/types/database";

function fmtSEK(n: number) {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", minimumFractionDigits: 2 }).format(n);
}

export default async function ArticlesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: companies } = await supabase
    .from("client_companies")
    .select("id")
    .eq("user_id", user!.id);

  const companyIds = companies?.map((c) => c.id) ?? [];

  const { data: articles } = companyIds.length
    ? await supabase
        .from("articles")
        .select("*, client_companies(name)")
        .in("client_company_id", companyIds)
        .order("name")
    : { data: [] };

  const active = articles?.filter((a) => a.is_active) ?? [];
  const inactive = articles?.filter((a) => !a.is_active) ?? [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Artiklar</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tjänster och produkter du fakturerar för</p>
        </div>
        <Link href="/dashboard/articles/new">
          <Button className="gap-2"><Plus className="w-4 h-4" /> Ny artikel</Button>
        </Link>
      </div>

      {(!articles || articles.length === 0) ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Package className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Inga artiklar ännu</p>
          <p className="text-sm text-gray-400 mt-1 mb-4">Lägg till tjänster och produkter för att snabbt fylla i fakturor</p>
          <Link href="/dashboard/articles/new">
            <Button className="gap-2"><Plus className="w-4 h-4" /> Skapa första artikel</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <ArticleTable articles={active} title="Aktiva" />
          {inactive.length > 0 && <ArticleTable articles={inactive} title="Inaktiva" dim />}
        </div>
      )}
    </div>
  );
}

function ArticleTable({
  articles,
  title,
  dim,
}: {
  articles: (Article & { client_companies: Pick<ClientCompany, "name"> | null })[];
  title: string;
  dim?: boolean;
}) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${dim ? "opacity-60" : ""}`}>
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-100">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{title} ({articles.length})</h2>
      </div>
      <table className="w-full text-sm">
        <thead className="border-b border-gray-100">
          <tr>
            <th className="text-left px-6 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Artikel</th>
            <th className="text-left px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Företag</th>
            <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">À-pris</th>
            <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Enhet</th>
            <th className="text-right px-4 py-3 font-medium text-gray-500 text-xs uppercase tracking-wide">Moms</th>
            <th className="text-right px-6 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {articles.map((a) => (
            <tr key={a.id} className="hover:bg-gray-50">
              <td className="px-6 py-3.5">
                <p className="font-medium text-gray-900">{a.name}</p>
                {a.description && <p className="text-xs text-gray-400 mt-0.5 truncate max-w-xs">{a.description}</p>}
                <div className="flex gap-1.5 mt-1">
                  {a.is_labor && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 font-medium">Arbete</span>}
                  {a.is_rot_rut_eligible && <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-600 font-medium">ROT/RUT</span>}
                </div>
              </td>
              <td className="px-4 py-3.5 text-gray-500 text-xs">{a.client_companies?.name}</td>
              <td className="px-4 py-3.5 text-right tabular-nums font-medium">{fmtSEK(a.unit_price)}</td>
              <td className="px-4 py-3.5 text-right text-gray-500">{a.unit}</td>
              <td className="px-4 py-3.5 text-right text-gray-500">{a.vat_rate}%</td>
              <td className="px-6 py-3.5 text-right">
                <Link href={`/dashboard/articles/${a.id}/edit`}>
                  <Button variant="ghost" size="sm" className="gap-1 text-gray-500 h-7 px-2">
                    <Edit className="w-3.5 h-3.5" /> Redigera
                  </Button>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
