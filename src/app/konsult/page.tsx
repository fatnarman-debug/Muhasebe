"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const M = ({ name, fill = false, size = 20 }: { name: string; fill?: boolean; size?: number }) => (
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

const QUICK = [
  { icon: "receipt_long", ibg: "#eff1ff", ifg: "#3b5bdb", title: "Ny faktura",       desc: "Skapa en faktura för en av dina kunder",   href: "/konsult/fakturor" },
  { icon: "group",        ibg: "#ecfdf5", ifg: "#059669", title: "Mina kunder",       desc: "Se och hantera dina tilldelade kunder",     href: "/konsult/kunder" },
  { icon: "pending_actions", ibg: "#fef2f2", ifg: "#dc2626", title: "Väntande fakturor", desc: "Granska ej betalda och förfallna fakturor", href: "/konsult/fakturor" },
];

const card: React.CSSProperties = {
  background: "#fff", border: "1px solid #e5e7eb",
  borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>{children}</p>;
}

export default function KonsultPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [kunder, setKunder] = useState<Kund[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/konsult/me");
        const json = await res.json();
        setFirstName((json?.konsult?.full_name ?? "").split(" ")[0] ?? "");
        setKunder(json?.kunder ?? []);
      } catch {
        /* layout already guards auth */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <>
      {/* Topbar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-8"
        style={{ height: 60, background: "rgba(248,249,251,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e5e7eb" }}>
        <div className="flex items-center gap-3">
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Översikt</h2>
          <span style={{ width: 1, height: 18, background: "#e5e7eb" }} />
          <p style={{ fontSize: 13, color: "#9ca3af" }}>Välkommen tillbaka{firstName ? `, ${firstName}` : ""}</p>
        </div>
      </header>

      {/* Body */}
      <div style={{ padding: "24px 32px 48px", flex: 1 }}>

        {/* Snabbåtgärder */}
        <SectionLabel>Snabbåtgärder</SectionLabel>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 28 }}>
          {QUICK.map((a, i) => (
            <button key={i} onClick={() => router.push(a.href)}
              style={{ ...card, padding: "18px 20px", cursor: "pointer", border: "1px solid #e5e7eb", textAlign: "left", display: "flex", flexDirection: "column", gap: 12, transition: "box-shadow 0.15s, border-color 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"; (e.currentTarget as HTMLElement).style.borderColor = "#d1d5db"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = "#e5e7eb"; }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: a.ibg, color: a.ifg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <M name={a.icon} size={20} />
                </div>
                <span style={{ color: "#d1d5db" }}><M name="arrow_forward" size={16} /></span>
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#111827", lineHeight: 1.3 }}>{a.title}</p>
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 3, lineHeight: 1.5 }}>{a.desc}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Mina kunder */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <SectionLabel>Mina kunder</SectionLabel>
          <button onClick={() => router.push("/konsult/kunder")}
            style={{ fontSize: 12, fontWeight: 600, color: "#3b5bdb", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 12 }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
            Visa alla →
          </button>
        </div>
        <div style={{ ...card, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>Laddar…</div>
          ) : kunder.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
              Inga kunder tilldelade ännu. Din byrå tilldelar kunder till dig.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                  {["Kund", "Stad", "Status", ""].map(h => (
                    <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {kunder.slice(0, 6).map((k, i) => {
                  const [bg, color] = k.is_active ? ["#dcfce7", "#15803d"] : ["#f3f4f6", "#6b7280"];
                  return (
                    <tr key={k.id} style={{ borderBottom: i < Math.min(kunder.length, 6) - 1 ? "1px solid #f9fafb" : "none" }}>
                      <td style={{ padding: "12px 16px" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{k.name}</p>
                        <p style={{ fontSize: 11, color: "#9ca3af" }}>{k.org_no}</p>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{k.city ?? "—"}</td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>{k.is_active ? "Aktiv" : "Inaktiv"}</span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <button onClick={() => router.push("/konsult/fakturor")}
                          style={{ display: "flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 7, border: "1px solid #e5e7eb", background: "#fff", fontSize: 12, fontWeight: 500, color: "#374151", cursor: "pointer", whiteSpace: "nowrap" }}
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

      {/* Footer */}
      <footer style={{ borderTop: "1px solid #e5e7eb", padding: "14px 32px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#fff" }}>
        <div className="flex items-center gap-2">
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 12, color: "#111827" }}>LedgerFlow</span>
          <span style={{ color: "#d1d5db", fontSize: 11 }}>© 2026 · Alla rättigheter förbehållna</span>
        </div>
        <div className="flex gap-5">
          {["Användarvillkor", "Integritetspolicy", "Säkerhetsstandarder"].map(l => (
            <a key={l} href="#" style={{ fontSize: 11, color: "#9ca3af", textDecoration: "none" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#111827")}
              onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}>{l}</a>
          ))}
        </div>
      </footer>
    </>
  );
}
