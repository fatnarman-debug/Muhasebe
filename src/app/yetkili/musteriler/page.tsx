"use client";

import { useState, useEffect } from "react";
import { Bell, HelpCircle, Search, Filter, RefreshCw, CheckCircle, Plus } from "lucide-react";

const cardStyle = { background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#7f8c8d", textTransform: "uppercase" as const, letterSpacing: "0.5px" };
const inputStyle = { border: "1px solid #e8ecf1", borderRadius: 8, padding: "9px 14px", fontSize: 13, color: "#2c3e50", background: "#fff", outline: "none" };

const ACCOUNTANTS = ["Selin Caner", "Murat Tekin", "Ayşe Yıldız", "Emre Şahin"];

const CUSTOMERS = [
  { id: "1", name: "Lojistik A.Ş.",    orgNo: "TC-44211", accountant: "Selin Caner",  lastInvoice: "20 Haz 2026", status: "Aktif",    sector: "Lojistik" },
  { id: "2", name: "Tekno Çözüm Ltd.", orgNo: "TC-55832", accountant: "Selin Caner",  lastInvoice: "18 Haz 2026", status: "Aktif",    sector: "Teknoloji" },
  { id: "3", name: "İnşaat Pro A.Ş.", orgNo: "TC-67921", accountant: "Murat Tekin",  lastInvoice: "15 Haz 2026", status: "Gecikmiş", sector: "İnşaat" },
  { id: "4", name: "Gıda Market Ltd.", orgNo: "TC-33109", accountant: "Murat Tekin",  lastInvoice: "12 Haz 2026", status: "Aktif",    sector: "Gıda" },
  { id: "5", name: "Nakliye Ekspres",  orgNo: "TC-78441", accountant: "Ayşe Yıldız", lastInvoice: "10 Haz 2026", status: "Aktif",    sector: "Lojistik" },
  { id: "6", name: "Yazılım Evi A.Ş.", orgNo: "TC-90213", accountant: "Ayşe Yıldız", lastInvoice: "8 Haz 2026",  status: "Bekliyor", sector: "Teknoloji" },
  { id: "7", name: "Mimarlık Atölyesi",orgNo: "TC-12877", accountant: "Emre Şahin",  lastInvoice: "5 Haz 2026",  status: "Aktif",    sector: "Mimarlık" },
  { id: "8", name: "Sağlık Klinik Ltd",orgNo: "TC-65544", accountant: "Emre Şahin",  lastInvoice: "3 Haz 2026",  status: "Aktif",    sector: "Sağlık" },
  { id: "9", name: "Enerji Çözümleri", orgNo: "TC-21098", accountant: "",            lastInvoice: "—",           status: "Yeni",     sector: "Enerji" },
  { id:"10", name: "Turizm Ajansı",    orgNo: "TC-48723", accountant: "",            lastInvoice: "—",           status: "Yeni",     sector: "Turizm" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, [string, string]> = {
    "Aktif":    ["#d4edda", "#155724"],
    "Gecikmiş": ["#fdecea", "#c0392b"],
    "Bekliyor": ["#fff3cd", "#856404"],
    "Yeni":     ["#cce5ff", "#0056b3"],
  };
  const [bg, color] = map[status] ?? ["#f5f7fa", "#7f8c8d"];
  return <span style={{ background: bg, color, padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{status}</span>;
}

export default function MusterilerPage() {
  const [assignments, setAssignments] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [filterAcc, setFilterAcc] = useState("all");
  const [toast, setToast] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const getAcc = (c: typeof CUSTOMERS[0]) => assignments[c.id] ?? c.accountant;

  function handleAssign(id: string, acc: string) {
    setAssignments(p => ({ ...p, [id]: acc }));
    setToast("Atama güncellendi");
    setToastVisible(true);
  }

  useEffect(() => {
    if (!toastVisible) return;
    const t = setTimeout(() => setToastVisible(false), 2200);
    return () => clearTimeout(t);
  }, [toastVisible, toast]);

  const filtered = CUSTOMERS.filter(c => {
    const acc = getAcc(c);
    const q = search.toLowerCase();
    return (!q || c.name.toLowerCase().includes(q) || c.orgNo.includes(q)) &&
      (filterAcc === "all" || acc === filterAcc);
  });

  const unassigned = CUSTOMERS.filter(c => !getAcc(c)).length;

  return (
    <>
      {/* Topbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e8ecf1", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
        className="flex items-center justify-between px-8 h-16 shrink-0">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e3c72" }}>Müşteri Yönetimi</h1>
        <div className="flex items-center gap-3">
          <button style={{ width: 38, height: 38, borderRadius: 8, background: "#f5f7fa", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Bell size={17} color="#2c3e50" />
          </button>
          <button style={{ width: 38, height: 38, borderRadius: 8, background: "#f5f7fa", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <HelpCircle size={17} color="#2c3e50" />
          </button>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: "linear-gradient(135deg,#667eea,#764ba2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 12 }}>AY</div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto" style={{ padding: 32 }}>
        {/* KPI cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 18, marginBottom: 28 }}>
          {[
            { label: "Toplam Müşteri", value: CUSTOMERS.length, badge: "+8 Bu Ay", badgeBg: "#d4edda", badgeColor: "#155724" },
            { label: "Aktif Müşteri",  value: CUSTOMERS.filter(c => c.status === "Aktif").length, badge: "Aktif", badgeBg: "#cce5ff", badgeColor: "#0056b3" },
            { label: "Atanmamış",     value: unassigned, badge: "Bekliyor", badgeBg: "#fff3cd", badgeColor: "#856404" },
            { label: "Gecikmiş",      value: CUSTOMERS.filter(c => c.status === "Gecikmiş").length, badge: "Dikkat", badgeBg: "#fdecea", badgeColor: "#c0392b" },
          ].map((s, i) => (
            <div key={i} style={{ ...cardStyle, padding: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span style={labelStyle}>{s.label}</span>
                <span style={{ background: s.badgeBg, color: s.badgeColor, fontSize: 11, fontWeight: 600, padding: "4px 8px", borderRadius: 6 }}>{s.badge}</span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: "#1e3c72" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Table card */}
        <div style={cardStyle}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #e8ecf1", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#2c3e50" }}>Müşteri Listesi</h3>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <div style={{ position: "relative" }}>
                <Search size={14} color="#95a5a6" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Müşteri veya TC/Vergi No..." style={{ ...inputStyle, paddingLeft: 32, width: 220 }} />
              </div>
              <div style={{ position: "relative" }}>
                <Filter size={13} color="#95a5a6" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)" }} />
                <select value={filterAcc} onChange={e => setFilterAcc(e.target.value)} style={{ ...inputStyle, paddingLeft: 28, paddingRight: 28, appearance: "none" as const, cursor: "pointer" }}>
                  <option value="all">Tüm Muhasebeciler</option>
                  <option value="">Atanmamış</option>
                  {ACCOUNTANTS.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <button style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#2a5298,#1e3c72)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                <Plus size={13} /> Yeni Müşteri
              </button>
            </div>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f7fa", borderBottom: "1px solid #e8ecf1" }}>
                  {["Müşteri", "Vergi/TC No", "Sektör", "Muhasebeci", "Son Fatura", "Durum", "Yeniden Ata"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", ...labelStyle, whiteSpace: "nowrap" as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ padding: "40px", textAlign: "center", color: "#95a5a6", fontSize: 13 }}>Arama kriterlerine uyan müşteri bulunamadı.</td></tr>
                ) : filtered.map((c, i) => {
                  const acc = getAcc(c);
                  const reassigned = !!assignments[c.id];
                  return (
                    <tr key={c.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid #e8ecf1" : "none" }}
                      className="hover:bg-[#f9fafc] transition-colors">
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f0f4ff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#1e3c72", flexShrink: 0 }}>
                            {c.name[0]}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#2c3e50", whiteSpace: "nowrap" }}>{c.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <code style={{ fontSize: 11, color: "#7f8c8d", background: "#f5f7fa", padding: "3px 8px", borderRadius: 4 }}>{c.orgNo}</code>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#95a5a6" }}>{c.sector}</td>
                      <td style={{ padding: "12px 16px", fontSize: 13, color: reassigned ? "#155724" : "#2c3e50", fontWeight: reassigned ? 600 : 400 }}>
                        {acc || <span style={{ color: "#bdc3c7", fontStyle: "italic" }}>Atanmamış</span>}
                        {reassigned && <CheckCircle size={12} color="#27ae60" style={{ display: "inline", marginLeft: 6, verticalAlign: "middle" }} />}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: 12, color: "#95a5a6", whiteSpace: "nowrap" }}>{c.lastInvoice}</td>
                      <td style={{ padding: "12px 16px" }}><StatusBadge status={c.status} /></td>
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ position: "relative", display: "inline-block" }}>
                          <select value={acc} onChange={e => handleAssign(c.id, e.target.value)}
                            style={{ border: "1px solid #e8ecf1", borderRadius: 6, padding: "6px 28px 6px 10px", fontSize: 12, color: "#2c3e50", background: "#fff", cursor: "pointer", appearance: "none", outline: "none" }}>
                            <option value="">Atanmamış</option>
                            {ACCOUNTANTS.map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                          <RefreshCw size={11} color="#95a5a6" style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{ padding: "12px 24px", borderTop: "1px solid #e8ecf1", background: "#f9fafc", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#95a5a6" }}>{filtered.length} müşteri gösteriliyor</span>
            <span style={{ fontSize: 11, color: "#bdc3c7" }}>24 Haziran 2026</span>
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
