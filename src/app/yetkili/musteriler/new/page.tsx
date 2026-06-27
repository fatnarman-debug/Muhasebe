"use client";

import Link from "next/link";
import { ClientForm } from "@/components/clients/ClientForm";

export default function YetkiliNewClientPage() {
  return (
    <main className="flex-1 overflow-y-auto" style={{ padding: 32 }}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Nytt kundföretag</h1>
            <p style={{ color: "#95a5a6", fontSize: 13, marginTop: 4 }}>
              Företagsuppgifter inkl. logotyp, fakturamall (10 alternativ) och startnummer för fakturor.
            </p>
          </div>
          <Link href="/yetkili/musteriler" style={{ fontSize: 13, color: "#111827", fontWeight: 600, textDecoration: "none" }}>
            ← Tillbaka till listan
          </Link>
        </div>

        <ClientForm getRedirectPath={() => "/yetkili/musteriler"} />
      </div>
    </main>
  );
}
