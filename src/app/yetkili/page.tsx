"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, HelpCircle, Users, UserCheck, UserPlus, Loader2 } from "lucide-react";

const cardStyle = { background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#7f8c8d", textTransform: "uppercase" as const, letterSpacing: "0.5px" };

const GRADS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
];

type Muhasebeci = { id: string; full_name: string; is_active: boolean; musteri_sayisi: number };
type Musteri = { id: string; name: string; city: string | null; created_at: string; muhasebeci_id: string | null };

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";
}

export default function YetkiliPage() {
  const [name, setName] = useState("");
  const [dukkan, setDukkan] = useState("");
  const [muhasebeciler, setMuhasebeciler] = useState<Muhasebeci[]>([]);
  const [musteriler, setMusteriler] = useState<Musteri[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setName(user.user_metadata?.full_name || user.email || "");
          const { data: d } = await supabase
            .from("muhasebe_dukkanlar")
            .select("dukkan_adi")
            .eq("user_id", user.id)
            .maybeSingle();
          setDukkan(d?.dukkan_adi ?? "");
        }
        const [mRes, cRes] = await Promise.all([
          fetch("/api/yetkili/muhasebeciler"),
          fetch("/api/yetkili/musteriler"),
        ]);
        const mJson = await mRes.json().catch(() => ({}));
        const cJson = await cRes.json().catch(() => ({}));
        setMuhasebeciler(mJson.muhasebeciler ?? []);
        setMusteriler(cJson.musteriler ?? []);
      } catch {
        /* layout guards auth */
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toplamMuh = muhasebeciler.length;
  const toplamMus = musteriler.length;
  const atanmamis = musteriler.filter((m) => !m.muhasebeci_id).length;
  const topMuh = [...muhasebeciler].sort((a, b) => b.musteri_sayisi - a.musteri_sayisi).slice(0, 5);
  const sonMusteriler = musteriler.slice(0, 5); // API zaten created_at desc döndürüyor

  const stats = [
    { icon: Users, label: "Antal konsulter", value: toplamMuh, hint: "Konsulter i din byrå.", badge: `${muhasebeciler.filter((m) => m.is_active).length} aktiva`, badgeBg: "#d4edda", badgeColor: "#155724" },
    { icon: UserCheck, label: "Antal kunder", value: toplamMus, hint: "Registrerade kundföretag.", badge: "Registrerad", badgeBg: "#cce5ff", badgeColor: "#0056b3" },
    { icon: UserPlus, label: "Otilldelade kunder", value: atanmamis, hint: "Ingen konsult tilldelad ännu.", badge: atanmamis > 0 ? "Väntar" : "Klart", badgeBg: atanmamis > 0 ? "#fff3cd" : "#d4edda", badgeColor: atanmamis > 0 ? "#856404" : "#155724" },
  ];

  return (
    <>
      {/* Topbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #f3f4f6", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
        className="flex items-center justify-between px-4 sm:px-8 h-16 shrink-0">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Översikt</h1>
        <div className="flex items-center gap-3">
          <button style={{ width: 38, height: 38, borderRadius: 8, background: "#f8f9fb", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#2c3e50" }}>
            <Bell size={18} />
          </button>
          <button style={{ width: 38, height: 38, borderRadius: 8, background: "#f8f9fb", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#2c3e50" }}>
            <HelpCircle size={18} />
          </button>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: GRADS[0], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>
            {name ? initials(name) : "—"}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        {/* Welcome */}
        <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#111827", marginBottom: 6 }}>
              Välkommen{name ? `, ${name}` : ""}
            </h2>
            <p style={{ color: "#95a5a6", fontSize: 14 }}>
              {dukkan ? `${dukkan} — ` : ""}Byråansvarig
            </p>
            <p style={{ color: "#7f8c8d", fontSize: 13, marginTop: 4 }}>Din byrås aktuella status sammanfattas nedan.</p>
            <Link href="/yetkili/musteriler"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16, padding: "10px 20px", borderRadius: 8, background: "#111827", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              + Lägg till &amp; tilldela kund
            </Link>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 90, height: 90, borderRadius: 12, background: GRADS[0], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 30, fontWeight: 700, marginBottom: 8 }}>
              {name ? initials(name) : "—"}
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#2c3e50" }}>{name || "—"}</div>
            <div style={{ fontSize: 12, color: "#95a5a6" }}>Byråansvarig</div>
          </div>
        </div>

        {/* Summary label */}
        <h3 style={{ fontSize: 17, fontWeight: 600, color: "#2c3e50", marginBottom: 6 }}>Byråöversikt</h3>
        <p style={{ color: "#95a5a6", fontSize: 13, marginBottom: 24 }}>Aktuella nyckeltal.</p>

        {/* Stats cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 28 }}>
          {stats.map((s, i) => (
            <div key={i} style={cardStyle}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <s.icon size={18} color="#111827" />
                  <span style={labelStyle}>{s.label}</span>
                </div>
                <span style={{ background: s.badgeBg, color: s.badgeColor, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>{s.badge}</span>
              </div>
              <div style={{ fontSize: 34, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
                {loading ? <Loader2 size={26} className="animate-spin" color="#bdc3c7" /> : s.value}
              </div>
              <p style={{ fontSize: 12, color: "#95a5a6" }}>{s.hint}</p>
            </div>
          ))}
        </div>

        {/* Two column */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {/* Recent customers */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h4 style={{ fontSize: 16, fontWeight: 600, color: "#2c3e50" }}>Senast tillagda kunder</h4>
              <Link href="/yetkili/musteriler" style={{ fontSize: 12, color: "#111827", fontWeight: 600, textDecoration: "none" }}>Visa alla</Link>
            </div>
            {loading ? (
              <div style={{ padding: 24, textAlign: "center", color: "#bdc3c7" }}><Loader2 size={18} className="animate-spin" /></div>
            ) : sonMusteriler.length === 0 ? (
              <p style={{ fontSize: 13, color: "#95a5a6", padding: "12px 0" }}>Inga kunder tillagda ännu.</p>
            ) : (
              sonMusteriler.map((c, i) => (
                <div key={c.id} style={{ display: "flex", gap: 14, padding: "13px 0", borderBottom: i < sonMusteriler.length - 1 ? "1px solid #f3f4f6" : "none", alignItems: "center" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#4338ca", flexShrink: 0 }}>
                    {c.name[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#2c3e50" }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: "#95a5a6" }}>{c.city ?? "—"}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6, background: c.muhasebeci_id ? "#d4edda" : "#fff3cd", color: c.muhasebeci_id ? "#155724" : "#856404" }}>
                    {c.muhasebeci_id ? "Tilldelad" : "Ej tilldelad"}
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Accountants */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h4 style={{ fontSize: 16, fontWeight: 600, color: "#2c3e50" }}>Konsulter</h4>
              <Link href="/yetkili/muhasebeciler" style={{ fontSize: 12, color: "#111827", fontWeight: 600, textDecoration: "none" }}>Visa alla</Link>
            </div>
            {loading ? (
              <div style={{ padding: 24, textAlign: "center", color: "#bdc3c7" }}><Loader2 size={18} className="animate-spin" /></div>
            ) : topMuh.length === 0 ? (
              <p style={{ fontSize: 13, color: "#95a5a6", padding: "12px 0" }}>Inga konsulter tillagda ännu.</p>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #f3f4f6" }}>
                    {["Konsult", "Kunder", "Status"].map((h) => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", ...labelStyle }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topMuh.map((a, i) => (
                    <tr key={a.id} style={{ borderBottom: i < topMuh.length - 1 ? "1px solid #f3f4f6" : "none" }} className="hover:bg-[#f9fafb] transition-colors">
                      <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 30, height: 30, borderRadius: 6, background: GRADS[i % 4], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: 11, flexShrink: 0 }}>
                            {initials(a.full_name)}
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#2c3e50" }}>{a.full_name}</div>
                        </div>
                      </td>
                      <td style={{ padding: "12px", fontSize: 13, color: "#2c3e50" }}>{a.musteri_sayisi}</td>
                      <td style={{ padding: "12px" }}>
                        <span style={{ padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: a.is_active ? "#d4edda" : "#fff3cd", color: a.is_active ? "#155724" : "#856404" }}>
                          {a.is_active ? "Aktiv" : "Inaktiv"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: "#fff", borderTop: "1px solid #f3f4f6", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: 12, color: "#95a5a6" }}>LedgerFlow © 2026 LedgerFlow Accounting SaaS. Alla rättigheter förbehållna.</p>
        <div style={{ display: "flex", gap: 20 }}>
          {["Användarvillkor", "Integritetspolicy", "Säkerhet"].map((l) => (
            <a key={l} href="#" style={{ fontSize: 12, color: "#95a5a6", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </footer>
    </>
  );
}
