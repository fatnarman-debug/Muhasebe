"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, HelpCircle, Search, Filter, CheckCircle, Plus, Loader2 } from "lucide-react";

const cardStyle = { background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#7f8c8d", textTransform: "uppercase" as const, letterSpacing: "0.5px" };
const inputStyle = { border: "1px solid #f3f4f6", borderRadius: 8, padding: "9px 14px", fontSize: 13, color: "#2c3e50", background: "#fff", outline: "none" };

type Muhasebeci = { id: string; full_name: string };
type Musteri = {
  id: string;
  name: string;
  org_no: string;
  city: string | null;
  email: string | null;
  phone: string | null;
  is_active: boolean;
  muhasebeci_id: string | null;
  muhasebeci_name: string | null;
};

export default function MusterilerPage() {
  const router = useRouter();
  const [list, setList] = useState<Musteri[]>([]);
  const [accountants, setAccountants] = useState<Muhasebeci[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [search, setSearch] = useState("");
  const [filterAcc, setFilterAcc] = useState("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/yetkili/musteriler");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Listan kunde inte laddas");
        setList(json.musteriler ?? []);
        setAccountants(json.muhasebeciler ?? []);
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Listan kunde inte laddas");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (!toastVisible) return;
    const t = setTimeout(() => setToastVisible(false), 2200);
    return () => clearTimeout(t);
  }, [toastVisible, toast]);

  function showToast(msg: string) {
    setToast(msg);
    setToastVisible(true);
  }

  async function handleAssign(musteri: Musteri, muhasebeci_id: string) {
    setSavingId(musteri.id);
    try {
      let res: Response;
      if (muhasebeci_id) {
        res = await fetch(`/api/yetkili/musteriler/${musteri.id}/ata`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ muhasebeci_id }),
        });
      } else {
        res = await fetch(`/api/yetkili/musteriler/${musteri.id}/ata`, { method: "DELETE" });
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Tilldelning misslyckades");
      const name = accountants.find((a) => a.id === muhasebeci_id)?.full_name ?? null;
      setList((p) => p.map((m) => (m.id === musteri.id ? { ...m, muhasebeci_id: muhasebeci_id || null, muhasebeci_name: name } : m)));
      showToast(muhasebeci_id ? "Tilldelning uppdaterad" : "Tilldelning borttagen");
    } catch (e) {
      showToast(e instanceof Error ? e.message : "Tilldelning misslyckades");
    } finally {
      setSavingId(null);
    }
  }

  const filtered = list.filter((c) => {
    const q = search.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.org_no.includes(q);
    const matchAcc =
      filterAcc === "all" ? true :
      filterAcc === "" ? !c.muhasebeci_id :
      c.muhasebeci_id === filterAcc;
    return matchQ && matchAcc;
  });

  const unassigned = list.filter((c) => !c.muhasebeci_id).length;
  const assigned = list.length - unassigned;
  const aktif = list.filter((c) => c.is_active).length;

  return (
    <>
      {/* Topbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #f3f4f6", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
        className="flex items-center justify-between px-8 h-16 shrink-0">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Kundhantering</h1>
        <div className="flex items-center gap-3">
          <button style={{ width: 38, height: 38, borderRadius: 8, background: "#f8f9fb", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={17} color="#2c3e50" />
          </button>
          <button style={{ width: 38, height: 38, borderRadius: 8, background: "#f8f9fb", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HelpCircle size={17} color="#2c3e50" />
          </button>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: "linear-gradient(135deg,#667eea,#764ba2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>AY</div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto" style={{ padding: 32 }}>
        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 28 }}>
          {[
            { label: "Antal kunder", value: list.length, badge: "Registrerad", badgeBg: "#d4edda", badgeColor: "#155724" },
            { label: "Aktiva kunder", value: aktif, badge: "Aktiv", badgeBg: "#cce5ff", badgeColor: "#0056b3" },
            { label: "Tilldelade", value: assigned, badge: "Konsult", badgeBg: "#eef2ff", badgeColor: "#4338ca" },
            { label: "Otilldelade", value: unassigned, badge: "Väntar", badgeBg: "#fff3cd", badgeColor: "#856404" },
          ].map((s, i) => (
            <div key={i} style={{ ...cardStyle, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={labelStyle}>{s.label}</span>
                <span style={{ background: s.badgeBg, color: s.badgeColor, fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 6 }}>{s.badge}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#111827" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {loadError && (
          <div style={{ ...cardStyle, padding: 16, marginBottom: 20, background: "#fef2f2", color: "#dc2626", fontSize: 13 }}>{loadError}</div>
        )}

        {/* Table card */}
        <div style={cardStyle}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#2c3e50" }}>Kundlista</h3>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <Search size={14} color="#95a5a6" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Kund eller org.nr…" style={{ ...inputStyle, paddingLeft: 32, width: 220 }} />
              </div>
              <div style={{ position: "relative" }}>
                <Filter size={13} color="#95a5a6" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                <select value={filterAcc} onChange={(e) => setFilterAcc(e.target.value)} style={{ ...inputStyle, paddingLeft: 28, paddingRight: 28, appearance: "none" as const, cursor: "pointer" }}>
                  <option value="all">Alla konsulter</option>
                  <option value="">Otilldelade</option>
                  {accountants.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
                </select>
              </div>
              <button onClick={() => router.push("/yetkili/musteriler/new")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: "none", background: "#111827", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                <Plus size={13} /> Ny kund
              </button>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: 48, display: "flex", justifyContent: "center", color: "#95a5a6" }}><Loader2 size={22} className="animate-spin" /></div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #f3f4f6" }}>
                    {["Kund", "Org.nr", "Ort", "Konsult", "Status", "Tilldela / ändra"].map((h) => (
                      <th key={h} style={{ padding: "12px 16px", textAlign: "left", ...labelStyle, whiteSpace: "nowrap" as const }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr><td colSpan={6} style={{ padding: "40px", textAlign: "center", color: "#95a5a6", fontSize: 13 }}>
                      {list.length === 0 ? "Inga kunder ännu. Lägg till med “Ny kund”." : "Inga kunder matchar sökningen."}
                    </td></tr>
                  ) : filtered.map((c, i) => (
                    <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #f3f4f6" : "none" }} className="hover:bg-[#f9fafb] transition-colors">
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#eef2ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#4338ca", flexShrink: 0 }}>
                            {c.name[0]?.toUpperCase()}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#2c3e50", whiteSpace: "nowrap" }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <code style={{ fontSize: 11, color: "#7f8c8d", background: "#f8f9fb", padding: "3px 8px", borderRadius: 4 }}>{c.org_no}</code>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#95a5a6" }}>{c.city ?? "—"}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: c.muhasebeci_id ? "#155724" : "#bdc3c7", fontWeight: c.muhasebeci_id ? 600 : 400 }}>
                        {c.muhasebeci_name || <span style={{ fontStyle: "italic" }}>Otilldelad</span>}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <span style={{ background: c.is_active ? "#d4edda" : "#f8f9fb", color: c.is_active ? "#155724" : "#7f8c8d", padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>
                          {c.is_active ? "Aktiv" : "Inaktiv"}
                        </span>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <select
                            value={c.muhasebeci_id ?? ""}
                            disabled={savingId === c.id || accountants.length === 0}
                            onChange={(e) => handleAssign(c, e.target.value)}
                            style={{ border: "1px solid #f3f4f6", borderRadius: 6, padding: "6px 10px", fontSize: 12, color: "#2c3e50", background: "#fff", cursor: "pointer", outline: "none" }}>
                            <option value="">Otilldelad</option>
                            {accountants.map((a) => <option key={a.id} value={a.id}>{a.full_name}</option>)}
                          </select>
                          {savingId === c.id && <Loader2 size={13} className="animate-spin" color="#95a5a6" />}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ padding: "12px 24px", borderTop: "1px solid #f3f4f6", background: "#f9fafb", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#95a5a6" }}>{filtered.length} kunder visas</span>
            {accountants.length === 0 && (
              <span style={{ fontSize: 11, color: "#c0392b" }}>Lägg till en konsult först för tilldelning.</span>
            )}
          </div>
        </div>
      </main>

      {/* Toast */}
      <div style={{ position: "fixed", bottom: 24, right: 24, zIndex: 200, transition: "all 0.3s", opacity: toastVisible ? 1 : 0, transform: toastVisible ? "translateY(0)" : "translateY(8px)", pointerEvents: toastVisible ? "auto" : "none" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#155724", color: "#fff", padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 600, boxShadow: "0 4px 16px rgba(21,87,36,0.3)" }}>
          <CheckCircle size={15} /> {toast}
        </div>
      </div>
    </>
  );
}
