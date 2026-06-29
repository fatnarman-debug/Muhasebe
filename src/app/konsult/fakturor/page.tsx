"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { formatSEK } from "@/lib/utils";

const M = ({ name, size = 18 }: { name: string; size?: number }) => (
  <span className="material-symbols-outlined select-none leading-none"
    style={{ fontVariationSettings: `'FILL' 0,'wght' 400,'GRAD' 0,'opsz' ${size}`, fontSize: size }}>
    {name}
  </span>
);

type Invoice = {
  id: string;
  invoice_number: string;
  status: string;
  doc_type: string;
  invoice_date: string;
  due_date: string;
  total: number;
  customers: { name: string } | null;
  client_companies: { name: string } | null;
};

const STATUS: Record<string, [string, string, string]> = {
  draft:     ["#f3f4f6", "#6b7280", "Utkast"],
  sent:      ["#eff1ff", "#3730a3", "Skickad"],
  paid:      ["#dcfce7", "#15803d", "Betald"],
  overdue:   ["#fee2e2", "#dc2626", "Försenad"],
  cancelled: ["#f3f4f6", "#9ca3af", "Makulerad"],
  credit:    ["#fef9c3", "#a16207", "Kredit"],
  accepted:  ["#dcfce7", "#15803d", "Accepterad"],
  declined:  ["#fee2e2", "#dc2626", "Avvisad"],
};

export default function KonsultFakturorPage() {
  const router = useRouter();
  const [list, setList] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"invoice" | "offert">("invoice");

  useEffect(() => {
    if (typeof window !== "undefined" && new URLSearchParams(window.location.search).get("tab") === "offert") setTab("offert");
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data, error: err } = await supabase
          .from("invoices")
          .select("id, invoice_number, status, doc_type, invoice_date, due_date, total, customers(name), client_companies(name)")
          .order("created_at", { ascending: false });
        if (err) throw new Error(err.message);
        setList((data ?? []) as unknown as Invoice[]);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Kunde inte ladda fakturor");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const isOffert = tab === "offert";
  // Faktura-fliken visar både fakturor och kreditfakturor; offert-fliken endast offerter.
  const filtered = list.filter((i) =>
    isOffert ? i.doc_type === "offert" : (i.doc_type ?? "invoice") !== "offert");

  return (
    <>
      <header className="sticky top-0 z-40 flex items-center justify-between px-8"
        style={{ height: 60, background: "rgba(248,249,251,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e5e7eb" }}>
        <div className="flex items-center gap-3">
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>{isOffert ? "Offerter" : "Fakturor"}</h2>
          <span style={{ width: 1, height: 18, background: "#e5e7eb" }} />
          <p style={{ fontSize: 13, color: "#9ca3af" }}>{filtered.length} {isOffert ? "offerter" : "fakturor"}</p>
        </div>
        <button onClick={() => router.push(`/konsult/fakturor/new${isOffert ? "?type=offert" : ""}`)}
          className="flex items-center gap-1.5 rounded-lg font-semibold"
          style={{ background: "#111827", color: "#fff", border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 13 }}>
          <M name="add" size={16} /> {isOffert ? "Ny offert" : "Ny faktura"}
        </button>
      </header>

      <div style={{ padding: "24px 32px 48px" }}>
        {/* Flikar: Fakturor / Offerter */}
        <div className="flex gap-1 mb-4 border-b border-gray-200">
          {([["invoice", "Fakturor"], ["offert", "Offerter"]] as const).map(([key, lbl]) => (
            <button key={key} onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === key ? "border-gray-900 text-gray-900" : "border-transparent text-gray-400 hover:text-gray-700"}`}>
              {lbl}
            </button>
          ))}
        </div>
        {error && (
          <div style={{ background: "#fef2f2", border: "1px solid #fecaca", color: "#dc2626", borderRadius: 12, padding: 14, fontSize: 13, marginBottom: 18 }}>{error}</div>
        )}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Laddar…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
              {isOffert ? "Inga offerter ännu. Skapa din första med “Ny offert”." : "Inga fakturor ännu. Skapa din första med “Ny faktura”."}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                  {[isOffert ? "Offertnr" : "Fakturanr", "Klientföretag", "Kund", isOffert ? "Giltigt t.o.m." : "Förfaller", "Status", "Belopp"].map((h) => (
                    <th key={h} style={{ padding: "12px 18px", textAlign: h === "Belopp" ? "right" : "left", fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inv, i) => {
                  const [bg, color, label] = STATUS[inv.status] ?? ["#f3f4f6", "#6b7280", inv.status];
                  return (
                    <tr key={inv.id}
                      onClick={() => router.push(`/konsult/fakturor/${inv.id}`)}
                      style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f9fafb" : "none", cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f9fafb")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}>
                      <td style={{ padding: "13px 18px" }}>
                        <code style={{ fontSize: 12, fontWeight: 700, color: "#4338ca", fontFamily: "'JetBrains Mono', monospace" }}>{inv.invoice_number}</code>
                      </td>
                      <td style={{ padding: "13px 18px", fontSize: 13, color: "#111827" }}>{inv.client_companies?.name ?? "—"}</td>
                      <td style={{ padding: "13px 18px", fontSize: 13, color: "#6b7280" }}>{inv.customers?.name ?? "—"}</td>
                      <td style={{ padding: "13px 18px", fontSize: 12, color: "#6b7280" }}>{inv.due_date}</td>
                      <td style={{ padding: "13px 18px" }}>
                        <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>{label}</span>
                      </td>
                      <td style={{ padding: "13px 18px", textAlign: "right", fontSize: 13, fontWeight: 700, color: "#111827" }}>{formatSEK(inv.total)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
