"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import type { Article, ClientCompany } from "@/types/database";

interface Props {
  initialData?: Article;
  clientCompanies: Pick<ClientCompany, "id" | "name">[];
}

export function ArticleForm({ initialData, clientCompanies }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    client_company_id: initialData?.client_company_id ?? clientCompanies[0]?.id ?? "",
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    unit: initialData?.unit ?? "st",
    unit_price: initialData?.unit_price ?? 0,
    vat_rate: initialData?.vat_rate ?? 25,
    is_rot_rut_eligible: initialData?.is_rot_rut_eligible ?? false,
    is_labor: initialData?.is_labor ?? false,
  });

  function set(field: string, value: string | number | boolean) {
    setForm((p) => ({ ...p, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    const payload = {
      ...form,
      unit_price: Number(form.unit_price),
      description: form.description || null,
    };

    if (initialData) {
      const { error: err } = await supabase.from("articles").update(payload).eq("id", initialData.id);
      if (err) { setError(err.message); setLoading(false); return; }
      router.push(`/dashboard/articles/${initialData.id}`);
    } else {
      const { data, error: err } = await supabase.from("articles").insert(payload).select().single();
      if (err) { setError(err.message); setLoading(false); return; }
      router.push(`/dashboard/articles/${data.id}`);
    }
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Artikelinformation</h2>
        <div className="space-y-1.5">
          <Label>Klientföretag <span className="text-red-500">*</span></Label>
          <select
            value={form.client_company_id}
            onChange={(e) => set("client_company_id", e.target.value)}
            required
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {clientCompanies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="name">Artikelnamn <span className="text-red-500">*</span></Label>
          <Input
            id="name"
            placeholder="t.ex. Konsulttjänst, Städning, Målning"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Beskrivning (valfritt)</Label>
          <Textarea
            id="description"
            placeholder="Detaljerad beskrivning som visas på fakturan"
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            rows={2}
          />
        </div>
      </section>

      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Pris &amp; moms</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="unit_price">À-pris (ex. moms) <span className="text-red-500">*</span></Label>
            <Input
              id="unit_price"
              type="number"
              min={0}
              step="0.01"
              value={form.unit_price}
              onChange={(e) => set("unit_price", parseFloat(e.target.value) || 0)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label>Enhet</Label>
            <Input
              value={form.unit}
              onChange={(e) => set("unit", e.target.value)}
              placeholder="st, tim, m², m"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Momssats</Label>
            <select
              value={form.vat_rate}
              onChange={(e) => set("vat_rate", Number(e.target.value))}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value={25}>25%</option>
              <option value={12}>12%</option>
              <option value={6}>6%</option>
              <option value={0}>0%</option>
            </select>
          </div>
        </div>

        <div className="space-y-2 pt-2">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_labor}
              onChange={(e) => set("is_labor", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">Arbete (lönekostnad)</span>
              <p className="text-xs text-gray-400">Markeras som arbetstid — krävs för ROT/RUT-avdrag</p>
            </div>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_rot_rut_eligible}
              onChange={(e) => set("is_rot_rut_eligible", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <div>
              <span className="text-sm font-medium text-gray-900">ROT/RUT-berättigad</span>
              <p className="text-xs text-gray-400">Artikeln kan ingå i ROT- eller RUT-avdrag</p>
            </div>
          </label>
        </div>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {initialData ? "Spara ändringar" : "Skapa artikel"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>Avbryt</Button>
      </div>
    </form>
  );
}
