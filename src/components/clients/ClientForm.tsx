"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Save } from "lucide-react";
import type { ClientCompany } from "@/types/database";
import { LogoUpload } from "./LogoUpload";
import { InvoiceTemplateSelector } from "@/components/invoices/InvoiceTemplateSelector";

interface ClientFormProps {
  initialData?: ClientCompany;
  // Kaydetme sonrası yönlendirme — varsayılan dashboard klient görünümü.
  // Yetkili akışı kendi müşteri listesine yönlendirmek için override eder.
  getRedirectPath?: (id: string) => string;
}

export function ClientForm({ initialData, getRedirectPath }: ClientFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: initialData?.name ?? "",
    org_no: initialData?.org_no ?? "",
    moms_no: initialData?.moms_no ?? "",
    f_skatt: initialData?.f_skatt ?? true,
    address_line1: initialData?.address_line1 ?? "",
    address_line2: initialData?.address_line2 ?? "",
    postal_code: initialData?.postal_code ?? "",
    city: initialData?.city ?? "",
    country: initialData?.country ?? "SE",
    email: initialData?.email ?? "",
    phone: initialData?.phone ?? "",
    bankgiro: initialData?.bankgiro ?? "",
    plusgiro: initialData?.plusgiro ?? "",
    swish: initialData?.swish ?? "",
    iban: initialData?.iban ?? "",
    bic: initialData?.bic ?? "",
    payment_terms_days: initialData?.payment_terms_days ?? 30,
    default_vat_rate: initialData?.default_vat_rate ?? 25,
    notes: initialData?.notes ?? "",
    logo_url: initialData?.logo_url ?? "",
    invoice_prefix: initialData?.invoice_prefix ?? "FAK",
    next_invoice_number: initialData?.next_invoice_number ?? 1,
    invoice_template: (initialData as (typeof initialData & { invoice_template?: string }))?.invoice_template ?? "klasik-standart",
  });

  function set(field: string, value: string | boolean | number) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Inte inloggad."); setLoading(false); return; }

    if (initialData) {
      const { error } = await supabase.from("client_companies").update(form).eq("id", initialData.id);
      if (error) { setError(error.message); setLoading(false); return; }
      router.push(getRedirectPath ? getRedirectPath(initialData.id) : `/dashboard/clients/${initialData.id}`);
    } else {
      const { data, error } = await supabase.from("client_companies")
        .insert({ ...form, user_id: user.id }).select().single();
      if (error) { setError(error.message); setLoading(false); return; }
      router.push(getRedirectPath ? getRedirectPath(data.id) : `/dashboard/clients/${data.id}`);
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
      {/* Logotyp */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Logotyp</h2>
        <p className="text-xs text-gray-500">Logotypen visas automatiskt på dina fakturor.</p>
        <LogoUpload
          companyId={initialData?.id}
          currentUrl={form.logo_url || null}
          onUploaded={(url) => set("logo_url", url)}
        />
      </section>

      {/* Företagsuppgifter */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Företagsuppgifter</h2>
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="name">Företagsnamn <span className="text-red-500">*</span></Label>
            <Input id="name" placeholder="AB Exempel" value={form.name} onChange={(e) => set("name", e.target.value)} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="org_no">Organisationsnummer <span className="text-red-500">*</span></Label>
              <Input id="org_no" placeholder="556123-4567" value={form.org_no} onChange={(e) => set("org_no", e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="moms_no">Momsregistreringsnummer</Label>
              <Input id="moms_no" placeholder="SE556123456701" value={form.moms_no} onChange={(e) => set("moms_no", e.target.value)} />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="f_skatt"
              checked={form.f_skatt}
              onChange={(e) => set("f_skatt", e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-blue-600"
            />
            <Label htmlFor="f_skatt" className="cursor-pointer">
              Godkänd för F-skatt{" "}
              <span className="text-gray-400 font-normal text-xs">(visas automatiskt på fakturan)</span>
            </Label>
          </div>
        </div>
      </section>

      {/* Adress */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Adress</h2>
        <div className="grid gap-4">
          {field("address_line1", "Gatuadress *", "text", "Storgatan 1")}
          {field("address_line2", "C/O, box (valfritt)", "text", "")}
          <div className="grid grid-cols-3 gap-4">
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
        <div className="grid grid-cols-2 gap-4">
          {field("email", "E-post", "email", "info@foretag.se")}
          {field("phone", "Telefon", "tel", "031-123 45 67")}
        </div>
      </section>

      {/* Betalningssätt */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Betalningssätt</h2>
        <div className="grid grid-cols-2 gap-4">
          {field("bankgiro", "Bankgiro", "text", "1234-5678")}
          {field("plusgiro", "Plusgiro", "text", "12 34 56-7")}
          {field("swish", "Swish-nummer", "text", "0701234567")}
          {field("iban", "IBAN", "text", "SE3550000000054910000003")}
          {field("bic", "BIC/SWIFT", "text", "ESSESESS")}
        </div>
      </section>

      {/* Fakturainställningar */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Fakturainställningar</h2>
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="space-y-1.5">
            <Label htmlFor="invoice_prefix">Fakturaprefix</Label>
            <Input
              id="invoice_prefix"
              placeholder="FAK"
              maxLength={6}
              value={form.invoice_prefix}
              onChange={(e) => set("invoice_prefix", e.target.value.toUpperCase())}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="next_invoice_number">Startnummer</Label>
            <Input
              id="next_invoice_number"
              type="number"
              min={1}
              value={form.next_invoice_number}
              onChange={(e) => set("next_invoice_number", Math.max(1, parseInt(e.target.value) || 1))}
            />
            <p className="text-xs text-gray-400">
              Nästa faktura: {(form.invoice_prefix || "FAK")}-{String(form.next_invoice_number || 1).padStart(4, "0")}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
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
          <div className="space-y-1.5">
            <Label htmlFor="default_vat_rate">Standard momssats (%)</Label>
            <select
              id="default_vat_rate"
              value={form.default_vat_rate}
              onChange={(e) => set("default_vat_rate", Number(e.target.value))}
              className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              <option value={25}>25%</option>
              <option value={12}>12%</option>
              <option value={6}>6%</option>
              <option value={0}>0%</option>
            </select>
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

      {/* Fatura Şablonu */}
      <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Fatura Şablonu</h2>
          <p className="text-xs text-gray-400 mt-0.5">Bu şirket için oluşturulacak tüm faturalarda kullanılacak tasarım şablonu.</p>
        </div>
        <InvoiceTemplateSelector
          value={form.invoice_template}
          onChange={(tpl) => set("invoice_template", tpl)}
        />
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="gap-2">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {initialData ? "Spara ändringar" : "Skapa klientföretag"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Avbryt
        </Button>
      </div>
    </form>
  );
}
