"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const M = ({ name, fill = false, size = 18 }: { name: string; fill?: boolean; size?: number }) => (
  <span className="material-symbols-outlined select-none leading-none"
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0},'wght' 400,'GRAD' 0,'opsz' ${size}`, fontSize: size }}>
    {name}
  </span>
);

type Kund = {
  id: string;
  name: string;
  org_no: string;
  city: string | null;
  email: string | null;
  is_active: boolean;
};

export default function KonsultKunderPage() {
  const router = useRouter();
  const [kunder, setKunder] = useState<Kund[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Kund | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/konsult/me");
        const json = await res.json();
        setKunder(json?.kunder ?? []);
      } catch {
        /* layout guards auth */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = kunder.filter(k => {
    const q = search.toLowerCase();
    return !q || k.name.toLowerCase().includes(q) || k.org_no.includes(q) || (k.city ?? "").toLowerCase().includes(q);
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
            {loading ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Laddar…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                {kunder.length === 0
                  ? "Inga kunder tilldelade ännu. Din byrå tilldelar kunder till dig."
                  : "Ingen kund matchar sökningen."}
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    {["Kund", "Stad", "Status", ""].map(h => (
                      <th key={h} style={{ padding: "12px 18px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((k, i) => {
                    const [bg, color] = k.is_active ? ["#dcfce7", "#15803d"] : ["#f3f4f6", "#6b7280"];
                    const isSelected = selected?.id === k.id;
                    return (
                      <tr key={k.id}
                        onClick={() => setSelected(isSelected ? null : k)}
                        style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f9fafb" : "none", cursor: "pointer", background: isSelected ? "#f9fafb" : "" }}
                        onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = "#f9fafb"; }}
                        onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = ""; }}>
                        <td style={{ padding: "13px 18px" }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{k.name}</p>
                          <p style={{ fontSize: 11, color: "#9ca3af" }}>{k.org_no}</p>
                        </td>
                        <td style={{ padding: "13px 18px", fontSize: 12, color: "#6b7280" }}>{k.city ?? "—"}</td>
                        <td style={{ padding: "13px 18px" }}>
                          <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>{k.is_active ? "Aktiv" : "Inaktiv"}</span>
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
            )}
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
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 24 }}>
                {[
                  { label: "Org.nummer", value: selected.org_no },
                  { label: "Stad",       value: selected.city ?? "—" },
                  { label: "E-post",     value: selected.email ?? "—" },
                ].map(row => (
                  <div key={row.label}>
                    <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{row.label}</p>
                    <p style={{ fontSize: 13, color: "#111827" }}>{row.value}</p>
                  </div>
                ))}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Status</p>
                  {(() => { const [bg, color] = selected.is_active ? ["#dcfce7", "#15803d"] : ["#f3f4f6", "#6b7280"]; return <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>{selected.is_active ? "Aktiv" : "Inaktiv"}</span>; })()}
                </div>
              </div>

              <button onClick={() => router.push("/konsult/fakturor")}
                style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, background: "#111827", color: "#fff", border: "none", borderRadius: 9, padding: "11px 0", fontSize: 13, fontWeight: 600, cursor: "pointer", marginBottom: 8 }}>
                <M name="receipt_long" size={16} /> Skapa faktura
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
