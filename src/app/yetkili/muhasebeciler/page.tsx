"use client";

import { useState } from "react";
import { Bell, HelpCircle, Plus, Trash2, Eye, EyeOff, RefreshCw } from "lucide-react";

const cardStyle = { background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#7f8c8d", textTransform: "uppercase" as const, letterSpacing: "0.5px" };
const inputStyle = {
  width: "100%", border: "1px solid #e8ecf1", borderRadius: 8,
  padding: "10px 14px", fontSize: 13, color: "#2c3e50",
  background: "#fff", outline: "none",
};

const GRADS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
];

function generateKod() {
  return `LF-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`;
}

const initial = [
  { id: "1", name: "Selin Caner",   title: "Kıdemli Mali Müşavir",          email: "selin@demo.com",  kod: "LF-9921-AK", clients: 28, grad: GRADS[0], status: "Aktif" },
  { id: "2", name: "Murat Tekin",   title: "Genel Muhasebe Sorumlusu",      email: "murat@demo.com",  kod: "LF-4432-MT", clients: 21, grad: GRADS[1], status: "Aktif" },
  { id: "3", name: "Ayşe Yıldız",   title: "Vergi Danışmanı",               email: "ayse@demo.com",   kod: "LF-7763-AY", clients: 18, grad: GRADS[2], status: "Aktif" },
  { id: "4", name: "Emre Şahin",    title: "Muhasebe Uzmanı",               email: "emre@demo.com",   kod: "LF-2281-ES", clients: 15, grad: GRADS[3], status: "Beklemede" },
];

export default function MuhasebecilerPage() {
  const [list, setList] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<typeof initial[0] | null>(null);
  const [transferTo, setTransferTo] = useState("");
  const [formAd, setFormAd] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPass, setFormPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [formKod, setFormKod] = useState(generateKod);

  function handleAdd() {
    if (!formAd.trim() || !formEmail.trim() || !formPass.trim()) return;
    setList(p => [...p, { id: String(Date.now()), name: formAd.trim(), title: formTitle.trim() || "Muhasebeci", email: formEmail.trim(), kod: formKod, clients: 0, grad: GRADS[list.length % 4], status: "Aktif" }]);
    setFormAd(""); setFormTitle(""); setFormEmail(""); setFormPass(""); setFormKod(generateKod()); setShowForm(false);
  }

  function handleDeleteConfirm() {
    if (!deleteTarget || !transferTo) return;
    setList(p => p.filter(m => m.id !== deleteTarget.id));
    setDeleteTarget(null); setTransferTo("");
  }

  return (
    <>
      {/* Topbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e8ecf1", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
        className="flex items-center justify-between px-8 h-16 shrink-0">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e3c72" }}>Muhasebeciler</h1>
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
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 28 }}>
          {[
            { label: "Toplam Muhasebeci", value: list.length, badge: "+2 Bu Ay", badgeBg: "#d4edda", badgeColor: "#155724" },
            { label: "Aktif Muhasebeci", value: list.filter(m => m.status === "Aktif").length, badge: "Aktif", badgeBg: "#cce5ff", badgeColor: "#0056b3" },
            { label: "Toplam Müşteri", value: list.reduce((s, m) => s + m.clients, 0), badge: "Atanmış", badgeBg: "#fff3cd", badgeColor: "#856404" },
          ].map((s, i) => (
            <div key={i} style={{ ...cardStyle, padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={labelStyle}>{s.label}</span>
                <span style={{ background: s.badgeBg, color: s.badgeColor, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>{s.badge}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#1e3c72" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Add form */}
        {showForm && (
          <div style={{ ...cardStyle, marginBottom: 24, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #e8ecf1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#2c3e50" }}>Yeni Muhasebeci Kaydı</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#95a5a6", fontSize: 20 }}>×</button>
            </div>
            <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: "Ad Soyad", val: formAd, set: setFormAd, ph: "Örn: Selin Caner" },
                { label: "Unvan", val: formTitle, set: setFormTitle, ph: "Örn: Mali Müşavir" },
                { label: "E-posta", val: formEmail, set: setFormEmail, ph: "ornek@demo.com" },
              ].map(f => (
                <div key={f.label}>
                  <label style={{ ...labelStyle, display: "block", marginBottom: 6 }}>{f.label}</label>
                  <input value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph} style={inputStyle} />
                </div>
              ))}
              <div>
                <label style={{ ...labelStyle, display: "block", marginBottom: 6 }}>Şifre</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} value={formPass} onChange={e => setFormPass(e.target.value)} placeholder="En az 8 karakter" style={{ ...inputStyle, paddingRight: 40 }} />
                  <button onClick={() => setShowPass(v => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#95a5a6" }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ ...labelStyle, display: "block", marginBottom: 6 }}>Benzersiz Kod</label>
                <div style={{ display: "flex", gap: 10 }}>
                  <div style={{ flex: 1, background: "#f5f7fa", border: "1px solid #e8ecf1", borderRadius: 8, padding: "10px 14px", fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#1e3c72", letterSpacing: "0.1em" }}>
                    {formKod}
                  </div>
                  <button onClick={() => setFormKod(generateKod())} style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #e8ecf1", background: "#fff", cursor: "pointer", color: "#2a5298" }}>
                    <RefreshCw size={15} />
                  </button>
                </div>
              </div>
            </div>
            <div style={{ padding: "14px 24px", background: "#f5f7fa", borderTop: "1px solid #e8ecf1", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #e8ecf1", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#7f8c8d" }}>
                İptal
              </button>
              <button onClick={handleAdd} disabled={!formAd || !formEmail || !formPass} style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: !formAd || !formEmail || !formPass ? "#e8ecf1" : "linear-gradient(135deg,#2a5298,#1e3c72)", color: !formAd || !formEmail || !formPass ? "#95a5a6" : "#fff", cursor: !formAd || !formEmail || !formPass ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }}>
                Kaydet
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div style={cardStyle}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #e8ecf1", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#2c3e50" }}>Kayıtlı Muhasebeciler</h3>
            {!showForm && (
              <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, border: "none", background: "linear-gradient(135deg,#2a5298,#1e3c72)", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                <Plus size={14} /> Yeni Muhasebeci
              </button>
            )}
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f7fa", borderBottom: "1px solid #e8ecf1" }}>
                  {["#", "Muhasebeci", "Benzersiz Kod", "Müşteri Sayısı", "Durum", "İşlemler"].map(h => (
                    <th key={h} style={{ padding: "14px 16px", textAlign: "left", ...labelStyle }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {list.map((m, i) => (
                  <tr key={m.id} style={{ borderBottom: i < list.length - 1 ? "1px solid #e8ecf1" : "none" }}
                    className="hover:bg-[#f9fafc] transition-colors">
                    <td style={{ padding: "14px 16px", fontSize: 12, color: "#bdc3c7", fontWeight: 600 }}>{String(i + 1).padStart(2, "0")}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: m.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                          {m.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#2c3e50" }}>{m.name}</div>
                          <div style={{ fontSize: 11, color: "#95a5a6" }}>{m.title}</div>
                          <div style={{ fontSize: 11, color: "#bdc3c7" }}>{m.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <code style={{ fontSize: 12, fontWeight: 700, color: "#1e3c72", background: "#f0f4ff", padding: "4px 10px", borderRadius: 6 }}>{m.kod}</code>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 13, color: "#2c3e50" }}>{m.clients} müşteri</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: m.status === "Aktif" ? "#d4edda" : "#fff3cd", color: m.status === "Aktif" ? "#155724" : "#856404" }}>
                        {m.status}
                      </span>
                    </td>
                    <td style={{ padding: "14px 16px" }}>
                      <button onClick={() => setDeleteTarget(m)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 6, border: "1px solid #e8ecf1", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#e74c3c" }}
                        className="hover:bg-red-50 transition-colors">
                        <Trash2 size={13} /> Sil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Delete modal */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={() => { setDeleteTarget(null); setTransferTo(""); }} />
          <div style={{ position: "relative", background: "#fff", borderRadius: 16, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", overflow: "hidden" }}>
            <div style={{ height: 4, background: "linear-gradient(90deg,#e74c3c,#c0392b)" }} />
            <div style={{ padding: 28 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#ffeaea", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Trash2 size={20} color="#e74c3c" />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2c3e50", marginBottom: 6 }}>{deleteTarget.name} silinsin mi?</h3>
                  <p style={{ fontSize: 13, color: "#7f8c8d", lineHeight: 1.6 }}>
                    Bu işlem geri alınamaz. <strong style={{ color: "#2c3e50" }}>{deleteTarget.clients} müşteri</strong> seçtiğiniz muhasebeciye aktarılacak.
                  </p>
                </div>
              </div>
              <label style={{ ...labelStyle, display: "block", marginBottom: 8 }}>Müşterileri şuraya transfer et</label>
              <select value={transferTo} onChange={e => setTransferTo(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                <option value="">— Muhasebeci seçin —</option>
                {list.filter(m => m.id !== deleteTarget.id).map(m => (
                  <option key={m.id} value={m.id}>{m.name} ({m.clients} müşteri)</option>
                ))}
              </select>
            </div>
            <div style={{ padding: "14px 28px 20px", display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #e8ecf1", background: "#f9fafc" }}>
              <button onClick={() => { setDeleteTarget(null); setTransferTo(""); }} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #e8ecf1", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#7f8c8d" }}>
                İptal
              </button>
              <button onClick={handleDeleteConfirm} disabled={!transferTo} style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: !transferTo ? "#e8ecf1" : "linear-gradient(90deg,#e74c3c,#c0392b)", color: !transferTo ? "#95a5a6" : "#fff", cursor: !transferTo ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600 }}>
                Sil ve Transfer Et
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
