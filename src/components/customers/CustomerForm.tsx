"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import type { Customer, ClientCompany } from "@/types/database";

interface CustomerFormProps {
  initialData?: Customer;
  clientCompanies: Pick<ClientCompany, "id" | "name">[];
}

export function CustomerForm({ initialData, clientCompanies }: CustomerFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    client_company_id: initialData?.client_company_id ?? (clientCompanies[0]?.id ?? ""),
    name: initialData?.name ?? "",
    customer_type: initialData?.customer_type ?? "company",
    org_no: initialData?.org_no ?? "",
    personnummer: initialData?.personnummer ?? "",
    moms_no: initialData?.moms_no ?? "",
    address_line1: initialData?.address_line1 ?? "",
    address_line2: initialData?.address_line2 ?? "",
    postal_code: initialData?.postal_code ?? "",
    city: initialData?.city ?? "",
    country: initialData?.country ?? "SE",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    payment_terms_days: initialData?.payment_terms_days ?? 30,
    notes: initialData?.notes ?? "",
  });

  function set(field: string, value: string | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const isCompany = form.customer_type === "company";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();

    const payload = {
      ...form,
      payment_terms_days: Number(form.payment_terms_days),
      org_no: isCompany ? form.org_no || null : null,
      personnummer: !isCompany ? form.personnummer || null : null,
      moms_no: form.moms_no || null,
      address_line2: form.address_line2 || null,
      email: form.email || null,
      phone: form.phone || null,
      notes: form.notes || null,
    };

    if (initialData) {
      const { error: err } = await supabase
        .from("customers")
        .update(payload)
        .eq("id", initialData.id);
      if (err) { setError(err.message); setLoading(false); return; }
      router.push(`/dashboard/customers/${initialData.id}`);
    } else {
      const { data, error: err } = await supabase
        .from("customers")
        .insert(payload)
        .select()
        .single();
      if (err) { setError(err.message); setLoading(false); return; }
      router.push(`/dashboard/customers/${data.id}`);
    }
    router.refresh();
  }

  const field = (id: string, label: string, type = "text", placeholder = "") => (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={(form as unknown as Record<string, string>)[id] ?? ""}
        onChange={(e) => set(id, e.target.value)}
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Företag */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Företag</h2>
        <div className="space-y-1.5">
          <Label htmlFor="client_company_id">Välj företag <span className="text-red-500">*</span></Label>
          <select
            id="client_company_id"
            value={form.client_company_id}
            onChange={(e) => set("client_company_id", e.target.value)}
            required
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            {clientCompanies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </section>

      {/* Kunduppgifter */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Kunduppgifter</h2>
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label>Kundtyp</Label>
            <div className="flex gap-4">
              {(["company", "individual"] as const).map((t) => (
                <label key={t} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="customer_type"
                    value={t}
                    checked={form.customer_type === t}
                    onChange={() => set("customer_type", t)}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="text-sm">{t === "company" ? "Företag" : "Privatperson"}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="name">{isCompany ? "Företagsnamn" : "Namn"} <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              placeholder={isCompany ? "AB Exempel" : "Anna Svensson"}
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {isCompany ? (
              <>
                {field("org_no", "Organisationsnummer", "text", "556123-4567")}
                {field("moms_no", "Momsregistreringsnummer", "text", "SE556123456701")}
              </>
            ) : (
              field("personnummer", "Personnummer", "text", "YYYYMMDD-XXXX")
            )}
          </div>
        </div>
      </section>

      {/* Adress */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Adress</h2>
        <div className="grid gap-4">
          {field("address_line1", "Gatuadress *", "text", "Storgatan 1")}
          {field("address_line2", "C/O, box (valfritt)")}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="postal_code">Postnummer <span className="text-red-500">*</span></Label>
              <Input id="postal_code" placeholder="41234" value={form.postal_code} onChange={(e) => set("postal_code", e.target.value)} required />
            </div>
            <div className="col-span-2 space-y-1.5">
              <Label htmlFor="city">Ort <span className="text-red-500">*</span></Label>
              <Input id="city" placeholder="Göteborg" value={form.city} onChange={(e) => set("city", e.target.value)} required />
            </div>
          </div>
        </div>
      </section>

      {/* Kontakt */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Kontaktuppgifter</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {field("email", "E-post", "email", "info@foretag.se")}
          {field("phone", "Telefon", "tel", "031-123 45 67")}
        </div>
      </section>

      {/* Betalningsvillkor */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Betalningsvillkor</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="payment_terms_days">Betalningsvillkor (dagar)</Label>
            <Input
              id="payment_terms_days"
              type="number"
              min={0}
              max={90}
              value={form.payment_terms_days}
              onChange={(e) => set("payment_terms_days", Number(e.target.value))}
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="notes">Anteckningar (intern)</Label>
          <Textarea
            id="notes"
            placeholder="Interna anteckningar..."
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={3}
          />
        </div>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {initialData ? "Spara ändringar" : "Skapa kund"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Avbryt
        </Button>
      </div>
    </form>
  );
}
