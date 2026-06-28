"use client";

import { useEffect, useState } from "react";
import { Bell, HelpCircle, Plus, Trash2, Eye, EyeOff, Loader2 } from "lucide-react";

const cardStyle = { background: "#fff", borderRadius: 12, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#7f8c8d", textTransform: "uppercase" as const, letterSpacing: "0.5px" };
const inputStyle = {
  width: "100%", border: "1px solid #f3f4f6", borderRadius: 8,
  padding: "10px 14px", fontSize: 13, color: "#2c3e50",
  background: "#fff", outline: "none",
};

const GRADS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
];

type Muhasebeci = {
  id: string;
  full_name: string;
  email: string;
  benzersiz_kod: string;
  is_active: boolean;
  created_at: string;
  musteri_sayisi: number;
};

export default function MuhasebecilerPage() {
  const [list, setList] = useState<Muhasebeci[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Muhasebeci | null>(null);
  const [transferTo, setTransferTo] = useState("");
  const [deleting, setDeleting] = useState(false);

  const [formAd, setFormAd] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPass, setFormPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/yetkili/muhasebeciler");
        const json = await res.json();
        if (!res.ok) throw new Error(json.error || "Listan kunde inte laddas");
        setList(json.muhasebeciler ?? []);
      } catch (e) {
        setLoadError(e instanceof Error ? e.message : "Listan kunde inte laddas");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function handleAdd() {
    setFormError("");
    if (!formAd.trim() || !formEmail.trim() || !formPass.trim()) return;
    if (formPass.length < 8) { setFormError("Lösenordet måste vara minst 8 tecken."); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/yetkili/muhasebeciler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: formAd.trim(), email: formEmail.trim(), password: formPass }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Registrering misslyckades");
      setList((p) => [json.muhasebeci, ...p]);
      setFormAd(""); setFormEmail(""); setFormPass(""); setShowForm(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Registrering misslyckades");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteConfirm() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const qs = transferTo ? `?transfer_to=${transferTo}` : "";
      const res = await fetch(`/api/yetkili/muhasebeciler/${deleteTarget.id}${qs}`, { method: "DELETE" });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Borttagning misslyckades");
      setList((p) => p.filter((m) => m.id !== deleteTarget.id));
      setDeleteTarget(null); setTransferTo("");
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : "Borttagning misslyckades");
    } finally {
      setDeleting(false);
    }
  }

  const aktifSayisi = list.filter((m) => m.is_active).length;
  const toplamMusteri = list.reduce((s, m) => s + (m.musteri_sayisi ?? 0), 0);
  const canSave = !!formAd.trim() && !!formEmail.trim() && formPass.length >= 8;

  return (
    <>
      {/* Topbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #f3f4f6", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
        className="flex items-center justify-between px-4 sm:px-8 h-16 shrink-0">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#111827" }}>Konsulter</h1>
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

      <main className="flex-1 overflow-y-auto p-4 sm:p-8">
        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 28 }}>
          {[
            { label: "Antal konsulter", value: list.length, badge: "Registrerad", badgeBg: "#d4edda", badgeColor: "#155724" },
            { label: "Aktiva konsulter", value: aktifSayisi, badge: "Aktiv", badgeBg: "#cce5ff", badgeColor: "#0056b3" },
            { label: "Antal kunder", value: toplamMusteri, badge: "Tilldelade", badgeBg: "#fff3cd", badgeColor: "#856404" },
          ].map((s, i) => (
            <div key={i} style={{ ...cardStyle, padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={labelStyle}>{s.label}</span>
                <span style={{ background: s.badgeBg, color: s.badgeColor, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>{s.badge}</span>
              </div>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#111827" }}>{s.value}</div>
            </div>
          ))}
        </div>

        {loadError && (
          <div style={{ ...cardStyle, padding: 16, marginBottom: 20, background: "#fef2f2", color: "#dc2626", fontSize: 13 }}>
            {loadError}
          </div>
        )}

        {/* Add form */}
        {showForm && (
          <div style={{ ...cardStyle, marginBottom: 24, overflow: "hidden" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "#2c3e50" }}>Ny konsult</h3>
              <button onClick={() => setShowForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#95a5a6", fontSize: 20 }}>×</button>
            </div>
            <div style={{ padding: 24, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
              <div>
                <label style={{ ...labelStyle, display: "block", marginBottom: 6 }}>Namn</label>
                <input value={formAd} onChange={(e) => setFormAd(e.target.value)} placeholder="T.ex. Anna Svensson" style={inputStyle} />
              </div>
              <div>
                <label style={{ ...labelStyle, display: "block", marginBottom: 6 }}>E-post</label>
                <input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} placeholder="namn@byrå.se" style={inputStyle} />
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <label style={{ ...labelStyle, display: "block", marginBottom: 6 }}>Lösenord (ges till konsulten)</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} value={formPass} onChange={(e) => setFormPass(e.target.value)} placeholder="Minst 8 tecken" style={{ ...inputStyle, paddingRight: 40 }} />
                  <button onClick={() => setShowPass((v) => !v)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#95a5a6" }}>
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p style={{ fontSize: 11, color: "#95a5a6", marginTop: 6 }}>
                  Konsulten loggar in på <strong>/auth/login</strong> med denna e-post och lösenord. Unik kod genereras automatiskt.
                </p>
              </div>
              {formError && (
                <div style={{ gridColumn: "1/-1", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>
                  {formError}
                </div>
              )}
            </div>
            <div style={{ padding: "14px 24px", background: "#f8f9fb", borderTop: "1px solid #f3f4f6", display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowForm(false)} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #f3f4f6", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#7f8c8d" }}>
                Avbryt
              </button>
              <button onClick={handleAdd} disabled={!canSave || saving} style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: !canSave || saving ? "#f3f4f6" : "#111827", color: !canSave || saving ? "#95a5a6" : "#fff", cursor: !canSave || saving ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                {saving && <Loader2 size={14} className="animate-spin" />}
                Spara
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        <div style={cardStyle}>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #f3f4f6", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ fontSize: 15, fontWeight: 600, color: "#2c3e50" }}>Registrerade konsulter</h3>
            {!showForm && (
              <button onClick={() => setShowForm(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 18px", borderRadius: 8, border: "none", background: "#111827", color: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                <Plus size={14} /> Ny konsult
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ padding: 48, display: "flex", justifyContent: "center", color: "#95a5a6" }}>
              <Loader2 size={22} className="animate-spin" />
            </div>
          ) : list.length === 0 ? (
            <div style={{ padding: 48, textAlign: "center", color: "#95a5a6", fontSize: 14 }}>
              Inga konsulter ännu. Börja med “Ny konsult”.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8f9fb", borderBottom: "1px solid #f3f4f6" }}>
                    {["#", "Konsult", "Unik kod", "Antal kunder", "Status", "Åtgärder"].map((h) => (
                      <th key={h} style={{ padding: "14px 16px", textAlign: "left", ...labelStyle }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {list.map((m, i) => (
                    <tr key={m.id} style={{ borderBottom: i < list.length - 1 ? "1px solid #f3f4f6" : "none" }}
                      className="hover:bg-[#f9fafb] transition-colors">
                      <td style={{ padding: "14px 16px", fontSize: 12, color: "#bdc3c7", fontWeight: 600 }}>{String(i + 1).padStart(2, "0")}</td>
                      <td style={{ padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: GRADS[i % 4], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
                            {m.full_name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#2c3e50" }}>{m.full_name}</div>
                            <div style={{ fontSize: 11, color: "#bdc3c7" }}>{m.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <code style={{ fontSize: 12, fontWeight: 700, color: "#4338ca", background: "#eef2ff", padding: "4px 10px", borderRadius: 6 }}>{m.benzersiz_kod}</code>
                      </td>
                      <td style={{ padding: "14px 16px", fontSize: 13, color: "#2c3e50" }}>{m.musteri_sayisi} kunder</td>
                      <td style={{ padding: "14px 16px" }}>
                        <span style={{ padding: "5px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600, background: m.is_active ? "#d4edda" : "#fff3cd", color: m.is_active ? "#155724" : "#856404" }}>
                          {m.is_active ? "Aktiv" : "Inaktiv"}
                        </span>
                      </td>
                      <td style={{ padding: "14px 16px" }}>
                        <button onClick={() => setDeleteTarget(m)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 6, border: "1px solid #f3f4f6", background: "#fff", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#e74c3c" }}
                          className="hover:bg-red-50 transition-colors">
                          <Trash2 size={13} /> Ta bort
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Delete modal */}
      {deleteTarget && (
        <div style={{ position: "fixed", inset: 0, zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }} onClick={() => { if (!deleting) { setDeleteTarget(null); setTransferTo(""); } }} />
          <div style={{ position: "relative", background: "#fff", borderRadius: 16, width: 440, boxShadow: "0 20px 60px rgba(0,0,0,0.15)", overflow: "hidden" }}>
            <div style={{ height: 4, background: "linear-gradient(90deg,#e74c3c,#c0392b)" }} />
            <div style={{ padding: 28 }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#ffeaea", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Trash2 size={20} color="#e74c3c" />
                </div>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#2c3e50", marginBottom: 6 }}>Ta bort {deleteTarget.full_name}?</h3>
                  <p style={{ fontSize: 13, color: "#7f8c8d", lineHeight: 1.6 }}>
                    Åtgärden kan inte ångras; konsultens inloggning tas också bort.
                    {deleteTarget.musteri_sayisi > 0 && (
                      <> <strong style={{ color: "#2c3e50" }}>{deleteTarget.musteri_sayisi} kunder</strong> kan överföras till en annan konsult.</>
                    )}
                  </p>
                </div>
              </div>
              {deleteTarget.musteri_sayisi > 0 && (
                <>
                  <label style={{ ...labelStyle, display: "block", marginBottom: 8 }}>Överför kunder till (valfritt)</label>
                  <select value={transferTo} onChange={(e) => setTransferTo(e.target.value)} style={{ ...inputStyle, appearance: "none" }}>
                    <option value="">— Överför inte (ta bort tilldelningar) —</option>
                    {list.filter((m) => m.id !== deleteTarget.id).map((m) => (
                      <option key={m.id} value={m.id}>{m.full_name} ({m.musteri_sayisi} kunder)</option>
                    ))}
                  </select>
                </>
              )}
            </div>
            <div style={{ padding: "14px 28px 20px", display: "flex", justifyContent: "flex-end", gap: 10, borderTop: "1px solid #f3f4f6", background: "#f9fafb" }}>
              <button onClick={() => { setDeleteTarget(null); setTransferTo(""); }} disabled={deleting} style={{ padding: "9px 20px", borderRadius: 8, border: "1px solid #f3f4f6", background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#7f8c8d" }}>
                Avbryt
              </button>
              <button onClick={handleDeleteConfirm} disabled={deleting} style={{ padding: "9px 22px", borderRadius: 8, border: "none", background: deleting ? "#f3f4f6" : "linear-gradient(90deg,#e74c3c,#c0392b)", color: deleting ? "#95a5a6" : "#fff", cursor: deleting ? "not-allowed" : "pointer", fontSize: 13, fontWeight: 600, display: "flex", alignItems: "center", gap: 8 }}>
                {deleting && <Loader2 size={14} className="animate-spin" />}
                Ta bort
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
