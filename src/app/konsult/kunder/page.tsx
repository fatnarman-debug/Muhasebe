"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const M = ({ name, fill = false, size = 18 }: { name: string; fill?: boolean; size?: number }) => (
  <span className="material-symbols-outlined select-none leading-none"
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0},'wght' 400,'GRAD' 0,'opsz' ${size}`, fontSize: size }}>
    {name}
  </span>
);

type Kund = {
  id: string; name: string; orgNo: string;
  senasteFaktura: string; status: string; bransch: string; email: string;
};

const INIT: Kund[] = [
  { id: "1", name: "AB Logistik Nord",      orgNo: "556701-2345", senasteFaktura: "20 jun 2026", status: "Aktiv",    bransch: "Logistik", email: "kontakt@logistiknord.se" },
  { id: "2", name: "Bygg & Teknik AB",       orgNo: "556702-8823", senasteFaktura: "18 jun 2026", status: "Aktiv",    bransch: "Bygg",     email: "info@byggoteknik.se" },
  { id: "3", name: "Svensson & Son AB",      orgNo: "556703-4412", senasteFaktura: "15 jun 2026", status: "Aktiv",    bransch: "Handel",   email: "info@svenssonson.se" },
  { id: "4", name: "Nordtech Solutions AB",  orgNo: "556704-9901", senasteFaktura: "14 jun 2026", status: "Aktiv",    bransch: "IT",       email: "info@nordtech.se" },
  { id: "5", name: "Malmö Konsult AB",       orgNo: "556705-3312", senasteFaktura: "12 jun 2026", status: "Försenad", bransch: "Konsult",  email: "kontakt@malmokonsult.se" },
];

const STATUS_COLORS: Record<string, [string, string]> = {
  Aktiv:    ["#dcfce7", "#15803d"],
  Försenad: ["#fee2e2", "#dc2626"],
  Väntande: ["#fef9c3", "#a16207"],
};

export default function KonsultKunderPage() {
  const router = useRouter();
  const [kunder]          = useState<Kund[]>(INIT);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Kund | null>(null);

  const filtered = kunder.filter(k => {
    const q = search.toLowerCase();
    return !q || k.name.toLowerCase().includes(q) || k.orgNo.includes(q) || k.bransch.toLowerCase().includes(q);
  });

  const panelOpen = !!selected;

  return (
    <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
      <div style={{ flex: 1, overflow: "auto", transition: "margin-right 0.25s", marginRight: panelOpen ? 360 : 0 }}>

        {/* Topbar */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-8"
          style={{ height: 60, background: "rgba(248,249,251,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e5e7eb" }}>
          <div className="flex items-center gap-3">
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Mina kunder</h2>
            <span style={{ width: 1, height: 18, background: "#e5e7eb" }} />
            <p style={{ fontSize: 13, color: "#9ca3af" }}>{filtered.length} kunder</p>
          </div>
          <button onClick={() => router.push("/konsult/fakturor")}
            className="flex items-center gap-1.5 rounded-lg font-semibold"
            style={{ background: "#111827", color: "#fff", border: "none", cursor: "pointer", padding: "8px 14px", fontSize: 13 }}>
            <M name="add" size={16} /> Ny faktura
          </button>
        </header>

        <div style={{ padding: "24px 32px 48px" }}>

          {/* Search */}
          <div style={{ marginBottom: 18, position: "relative", maxWidth: 320 }}>
            <span style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: "#9ca3af", display: "flex" }}>
              <M name="search" size={16} />
            </span>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Sök kund eller org.nr…"
              style={{ width: "100%", border: "1px solid #e5e7eb", borderRadius: 9, padding: "9px 12px 9px 34px", fontSize: 13, color: "#111827", background: "#fff", outline: "none", boxSizing: "border-box" }}
              onFocus={e => (e.target.style.borderColor = "#111827")}
              onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
            />
          </div>

          {/* Table */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                  {["Kund", "Bransch", "Senaste faktura", "Status", ""].map(h => (
                    <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((k, i) => {
                  const [bg, color] = STATUS_COLORS[k.status] ?? ["#f3f4f6", "#6b7280"];
                  const isSelected = selected?.id === k.id;
                  return (
                    <tr key={k.id}
                      onClick={() => setSelected(isSelected ? null : k)}
                      style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f9fafb" : "none", cursor: "pointer", background: isSelected ? "#f9fafb" : "" }}
                      onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#f9fafb"; }}
                      onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = ""; }}>
                      <td style={{ padding: "13px 18px" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{k.name}</p>
                        <p style={{ fontSize: 11, color: "#9ca3af" }}>{k.orgNo}</p>
                      </td>
                      <td style={{ padding: "13px 18px", fontSize: 12, color: "#6b7280" }}>{k.bransch}</td>
                      <td style={{ padding: "13px 18px", fontSize: 12, color: "#6b7280" }}>{k.senasteFaktura}</td>
                      <td style={{ padding: "13px 18px" }}>
                        <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>{k.status}</span>
                      </td>
                      <td style={{ padding: "13px 18px" }}>
                        <button
                          onClick={e => { e.stopPropagation(); router.push("/konsult/fakturor"); }}
                          style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 11px", borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", fontSize: 12, fontWeight: 500, color: "#374151", cursor: "pointer" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                          onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
                          <M name="add" size={13} /> Faktura
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Side panel */}
      <div style={{
        position: "fixed", right: 0, top: 0, bottom: 0, width: 360,
        background: "#fff", borderLeft: "1px solid #e5e7eb",
        transform: panelOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.25s ease", zIndex: 50,
        display: "flex", flexDirection: "column", overflowY: "auto",
      }}>
        {selected && (
          <>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #f3f4f6", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{selected.name}</h3>
              <button onClick={() => setSelected(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: "20px", flex: 1 }}>
              {/* Info */}
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                {[
                  { label: "Org.nummer",    value: selected.orgNo },
                  { label: "Bransch",       value: selected.bransch },
                  { label: "E-post",        value: selected.email },
                  { label: "Senaste faktura", value: selected.senasteFaktura },
                ].map(row => (
                  <div key={row.label}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{row.label}</p>
                    <p style={{ fontSize: 13, color: "#111827" }}>{row.value}</p>
                  </div>
                ))}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Status</p>
                  {(() => { const [bg, color] = STATUS_COLORS[selected.status] ?? ["#f3f4f6", "#6b7280"]; return <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>{selected.status}</span>; })()}
                </div>
              </div>

              {/* Actions */}
              <button onClick={() => router.push("/konsult/fakturor")}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "#111827", color: "#fff", border: "none", borderRadius: 9, padding: "11px 0", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 8 }}>
                <M name="receipt_long" size={16} /> Skapa faktura
              </button>
              <button
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "#fff", color: "#374151", border: "1px solid #e5e7eb", borderRadius: 9, padding: "10px 0", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
                <M name="mail" size={16} /> Skicka e-post
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
