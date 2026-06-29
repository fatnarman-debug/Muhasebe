"use client";

import { ClientForm } from "@/components/clients/ClientForm";

export default function OnboardingPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="inline-flex w-12 h-12 rounded-2xl bg-slate-900 items-center justify-center text-white mb-1">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>storefront</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Välkommen till Enkelfaktura!</h1>
        <p className="text-slate-500 text-sm max-w-md mx-auto">
          Innan du börjar fakturera — fyll i uppgifterna för ditt företag. Dessa visas på dina fakturor och offerter.
          Du kan ändra dem när som helst under <strong>Inställningar</strong>.
        </p>
      </div>
      <ClientForm createLabel="Skapa mitt företag" getRedirectPath={() => "/dashboard"} />
    </div>
  );
}
