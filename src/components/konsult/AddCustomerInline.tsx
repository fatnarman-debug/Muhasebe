"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, UserPlus } from "lucide-react";

type Company = { id: string; name: string };

export function AddCustomerInline({ companies, onAdded }: { companies: Company[]; onAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [companyId, setCompanyId] = useState(companies[0]?.id ?? "");
  const [name, setName] = useState("");
  const [orgNo, setOrgNo] = useState("");
  const [address, setAddress] = useState("");
  const [postal, setPostal] = useState("");
  const [city, setCity] = useState("");
  const [email, setEmail] = useState("");

  async function handleSave() {
    setError("");
    if (!companyId) { setError("Välj ett klientföretag."); return; }
    if (!name.trim() || !address.trim() || !postal.trim() || !city.trim()) {
      setError("Namn, adress, postnummer och ort krävs.");
      return;
    }
    setSaving(true);
    const supabase = createClient();
    const { error: err } = await supabase.from("customers").insert({
      client_company_id: companyId,
      name: name.trim(),
      customer_type: "company",
      org_no: orgNo.trim() || null,
      address_line1: address.trim(),
      postal_code: postal.trim(),
      city: city.trim(),
      country: "SE",
      email: email.trim() || null,
    });
    if (err) { setError(err.message); setSaving(false); return; }
    setName(""); setOrgNo(""); setAddress(""); setPostal(""); setCity(""); setEmail("");
    setSaving(false);
    setOpen(false);
    onAdded?.(); // üst sayfa müşteri listesini yeniden yükler
  }

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1.5">
        <UserPlus className="w-4 h-4" /> Ny slutkund
      </Button>
    );
  }

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Ny slutkund</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Klientföretag *</Label>
          <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm">
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label>Kundens namn *</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Kund AB" />
        </div>
        <div className="space-y-1.5">
          <Label>Org.nummer</Label>
          <Input value={orgNo} onChange={(e) => setOrgNo(e.target.value)} placeholder="556xxx-xxxx" />
        </div>
        <div className="space-y-1.5">
          <Label>E-post</Label>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="info@kund.se" />
        </div>
        <div className="space-y-1.5 col-span-2">
          <Label>Adress *</Label>
          <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Storgatan 1" />
        </div>
        <div className="space-y-1.5">
          <Label>Postnummer *</Label>
          <Input value={postal} onChange={(e) => setPostal(e.target.value)} placeholder="211 34" />
        </div>
        <div className="space-y-1.5">
          <Label>Ort *</Label>
          <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Malmö" />
        </div>
      </div>
      {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">{error}</div>}
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Spara kund
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>Avbryt</Button>
      </div>
    </section>
  );
}
