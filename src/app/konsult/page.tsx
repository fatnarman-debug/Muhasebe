"use client";

import { useRouter } from "next/navigation";

const M = ({ name, fill = false, size = 20 }: { name: string; fill?: boolean; size?: number }) => (
  <span className="material-symbols-outlined select-none leading-none"
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0},'wght' 400,'GRAD' 0,'opsz' ${size}`, fontSize: size }}>
    {name}
  </span>
);

const KONSULT = { name: "Anna Svensson" };

const QUICK = [
  { icon: "receipt_long", ibg: "#eff1ff", ifg: "#3b5bdb", title: "Ny faktura",       desc: "Skapa en faktura för en av dina kunder",   href: "/konsult/fakturor" },
  { icon: "group",        ibg: "#ecfdf5", ifg: "#059669", title: "Mina kunder",       desc: "Se och hantera dina tilldelade kunder",     href: "/konsult/kunder" },
  { icon: "pending_actions", ibg: "#fef2f2", ifg: "#dc2626", title: "Väntande fakturor", desc: "Granska ej betalda och förfallna fakturor", href: "/konsult/fakturor" },
];

const KUNDER = [
  { id: "1", name: "AB Logistik Nord",  orgNo: "556701-2345", senasteFaktura: "20 jun 2026", status: "Aktiv",    bransch: "Logistik" },
  { id: "2", name: "Bygg & Teknik AB",  orgNo: "556702-8823", senasteFaktura: "18 jun 2026", status: "Aktiv",    bransch: "Bygg" },
  { id: "3", name: "Svensson & Son AB", orgNo: "556703-4412", senasteFaktura: "15 jun 2026", status: "Aktiv",    bransch: "Handel" },
  { id: "4", name: "Nordtech Solutions AB", orgNo: "556704-9901", senasteFaktura: "14 jun 2026", status: "Aktiv", bransch: "IT" },
  { id: "5", name: "Malmö Konsult AB",  orgNo: "556705-3312", senasteFaktura: "12 jun 2026", status: "Försenad", bransch: "Konsult" },
];

const FAKTUROR = [
  { nr: "FKT-2026-060", kund: "AB Logistik Nord",  belopp: "32 500 kr", status: "Skickad",  date: "20 jun" },
  { nr: "FKT-2026-059", kund: "Bygg & Teknik AB",  belopp: "18 750 kr", status: "Betald",   date: "18 jun" },
  { nr: "FKT-2026-058", kund: "Svensson & Son AB", belopp: "9 200 kr",  status: "Betald",   date: "15 jun" },
  { nr: "FKT-2026-057", kund: "Nordtech Solutions AB", belopp: "44 000 kr", status: "Försenad", date: "10 jun" },
];

const STATUS_COLORS: Record<string, [string, string]> = {
  Aktiv:     ["#dcfce7", "#15803d"],
  Försenad:  ["#fee2e2", "#dc2626"],
  Väntande:  ["#fef9c3", "#a16207"],
  Skickad:   ["#eff1ff", "#3730a3"],
  Betald:    ["#dcfce7", "#15803d"],
};

const card: React.CSSProperties = {
  background: "#fff", border: "1px solid #e5e7eb",
  borderRadius: 14, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
};

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 12 }}>{children}</p>;
}

export default function KonsultPage() {
  const router = useRouter();

  return (
    <>
      {/* Topbar */}
      <header className="sticky top-0 z-40 flex items-center justify-between px-8"
        style={{ height: 60, background: "rgba(248,249,251,0.95)", backdropFilter: "blur(10px)", borderBottom: "1px solid #e5e7eb" }}>
        <div className="flex items-center gap-3">
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Översikt</h2>
          <span style={{ width: 1, height: 18, background: "#e5e7eb" }} />
          <p style={{ fontSize: 13, color: "#9ca3af" }}>Välkommen tillbaka, {KONSULT.name.split(" ")[0]}</p>
        </div>
        <p style={{ fontSize: 12, color: "#9ca3af" }}>Onsdag 24 juni 2026 · v.26</p>
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

        {/* Alt satır */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 18 }}>

          {/* Mina kunder */}
          <div>
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
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #f3f4f6" }}>
                    {["Kund", "Bransch", "Senaste faktura", "Status", ""].map(h => (
                      <th key={h} style={{ padding: "11px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {KUNDER.map((k, i) => {
                    const [bg, color] = STATUS_COLORS[k.status] ?? ["#f3f4f6", "#6b7280"];
                    return (
                      <tr key={k.id} style={{ borderBottom: i < KUNDER.length - 1 ? "1px solid #f9fafb" : "none", cursor: "pointer" }}
                        onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                        onMouseLeave={e => (e.currentTarget.style.background = "")}>
                        <td style={{ padding: "12px 16px" }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{k.name}</p>
                          <p style={{ fontSize: 11, color: "#9ca3af" }}>{k.orgNo}</p>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{k.bransch}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{k.senasteFaktura}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ background: bg, color, padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600 }}>{k.status}</span>
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
            </div>
          </div>

          {/* Senaste fakturor */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <SectionLabel>Senaste fakturor</SectionLabel>
              <button onClick={() => router.push("/konsult/fakturor")}
                style={{ fontSize: 12, fontWeight: 600, color: "#3b5bdb", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 12 }}
                onMouseEnter={e => (e.currentTarget.style.textDecoration = "underline")}
                onMouseLeave={e => (e.currentTarget.style.textDecoration = "none")}>
                Visa alla →
              </button>
            </div>
            <div style={{ ...card, overflow: "hidden" }}>
              {FAKTUROR.map((f, i) => {
                const [bg, color] = STATUS_COLORS[f.status] ?? ["#f3f4f6", "#6b7280"];
                return (
                  <div key={i} style={{ padding: "12px 16px", borderBottom: i < FAKTUROR.length - 1 ? "1px solid #f9fafb" : "none", cursor: "pointer" }}
                    onMouseEnter={e => (e.currentTarget.style.background = "#f9fafb")}
                    onMouseLeave={e => (e.currentTarget.style.background = "")}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 3 }}>
                      <code style={{ fontSize: 11, fontWeight: 700, color: "#4338ca", fontFamily: "'JetBrains Mono', monospace" }}>{f.nr}</code>
                      <span style={{ background: bg, color, padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600 }}>{f.status}</span>
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{f.kund}</p>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 2 }}>
                      <span style={{ fontSize: 11, color: "#9ca3af" }}>{f.date}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#111827" }}>{f.belopp}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

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
