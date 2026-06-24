"use client";

import Link from "next/link";
import { Bell, HelpCircle, TrendingUp, Users, UserCheck, FileText, PersonStanding } from "lucide-react";

const cardStyle = { background: "#fff", borderRadius: 12, padding: 24, boxShadow: "0 2px 8px rgba(0,0,0,0.06)" };
const labelStyle = { fontSize: 12, fontWeight: 600, color: "#7f8c8d", textTransform: "uppercase" as const, letterSpacing: "0.5px" };

const activities = [
  { icon: "👤", color: "#f5f7fa", label: "Yeni Müşteri Eklendi", desc: "Lojistik A.Ş. muhasebeci Emre tarafından eklendi.", time: "12 dakika önce" },
  { icon: "📄", color: "#f5f7fa", label: "Fatura İptali", desc: "#4521 numaralı fatura geçersiz kılındı.", time: "1 saat önce" },
  { icon: "✅", color: "#cce5ff", label: "Vergi Beyannamesi", desc: "KDV beyannamesi onaylandı.", time: "3 saat önce" },
  { icon: "👥", color: "#f5f7fa", label: "Ekip Toplantısı", desc: "Yarın 09:00 için hatırlatıcı eklendi.", time: "5 saat önce" },
];

const accountants = [
  { initials: "SC", name: "Selin Caner", title: "Kıdemli Mali Müşavir", clients: 28, perf: "92%", status: "Müsait", grad: "linear-gradient(135deg,#667eea,#764ba2)" },
  { initials: "MT", name: "Murat Tekin", title: "Genel Muhasebe Sorumlusu", clients: 21, perf: "78%", status: "Yoğun", grad: "linear-gradient(135deg,#f093fb,#f5576c)" },
  { initials: "AY", name: "Ayşe Yıldız", title: "Vergi Danışmanı", clients: 18, perf: "85%", status: "Müsait", grad: "linear-gradient(135deg,#4facfe,#00f2fe)" },
];

export default function YetkiliPage() {
  return (
    <>
      {/* Topbar */}
      <header style={{ background: "#fff", borderBottom: "1px solid #e8ecf1", boxShadow: "0 2px 4px rgba(0,0,0,0.05)" }}
        className="flex items-center justify-between px-8 h-16 shrink-0">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1e3c72" }}>Genel Bakış</h1>
        <div className="flex items-center gap-3">
          <button style={{ width: 38, height: 38, borderRadius: 8, background: "#f5f7fa", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#2c3e50" }}>
            <Bell size={18} />
          </button>
          <button style={{ width: 38, height: 38, borderRadius: 8, background: "#f5f7fa", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#2c3e50" }}>
            <HelpCircle size={18} />
          </button>
          <div style={{ width: 38, height: 38, borderRadius: 8, background: "linear-gradient(135deg,#667eea,#764ba2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>
            AY
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto" style={{ padding: 32 }}>
        {/* Welcome */}
        <div style={{ ...cardStyle, display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h2 style={{ fontSize: 26, fontWeight: 700, color: "#1e3c72", marginBottom: 6 }}>Hoş geldiniz, Ahmet Yılmaz</h2>
            <p style={{ color: "#95a5a6", fontSize: 14 }}>Dükkan Yetkilisi — Bugün, 24 Haziran 2026</p>
            <p style={{ color: "#7f8c8d", fontSize: 13, marginTop: 4 }}>Dükkanınızın güncel durumu aşağıda özetlenmiştir.</p>
            <Link href="/yetkili/muhasebeciler"
              style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16, padding: "10px 20px", borderRadius: 8, background: "linear-gradient(135deg,#2a5298,#1e3c72)", color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              + Yeni Fatura Oluştur
            </Link>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: 90, height: 90, borderRadius: 12, background: "linear-gradient(135deg,#667eea,#764ba2)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 32, marginBottom: 8 }}>
              👤
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#2c3e50" }}>Ahmet Yılmaz</div>
            <div style={{ fontSize: 12, color: "#95a5a6" }}>Dükkan Yetkilisi</div>
          </div>
        </div>

        {/* Summary label */}
        <h3 style={{ fontSize: 17, fontWeight: 600, color: "#2c3e50", marginBottom: 6 }}>Finansal Sağlık Özeti</h3>
        <p style={{ color: "#95a5a6", fontSize: 13, marginBottom: 24 }}>Dükkanınızın anlık performans göstergeleri.</p>

        {/* Stats cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20, marginBottom: 28 }}>
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <Users size={18} color="#2a5298" />
                <span style={labelStyle}>Toplam Muhasebeci</span>
              </div>
              <span style={{ background: "#d4edda", color: "#155724", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>+2 Bu Ay</span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, color: "#1e3c72", marginBottom: 8 }}>12</div>
            <p style={{ fontSize: 12, color: "#95a5a6" }}>Aktif çalışan uzman kadronuz.</p>
          </div>
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <UserCheck size={18} color="#2a5298" />
                <span style={labelStyle}>Toplam Müşteri</span>
              </div>
              <span style={{ background: "#d4edda", color: "#155724", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>+14%</span>
            </div>
            <div style={{ fontSize: 34, fontWeight: 700, color: "#1e3c72", marginBottom: 8 }}>142</div>
            <p style={{ fontSize: 12, color: "#95a5a6" }}>Kayıtlı ve aktif hizmet alan müşteriler.</p>
          </div>
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <TrendingUp size={18} color="#2a5298" />
                <span style={labelStyle}>Aylık Hacim</span>
              </div>
              <span style={{ background: "#cce5ff", color: "#0056b3", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 6 }}>✓ Tahsil Edildi</span>
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: "#1e3c72", marginBottom: 8 }}>₺ 842.500</div>
            <p style={{ fontSize: 12, color: "#95a5a6" }}>Bekleyen tahsilat: ₺ 42.100</p>
          </div>
        </div>

        {/* Chart placeholder */}
        <div style={{ ...cardStyle, marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h4 style={{ fontSize: 16, fontWeight: 600, color: "#2c3e50" }}>Müşteri Hareket Grafiği</h4>
            <div style={{ display: "flex", gap: 4 }}>
              {["7 Gün", "30 Gün"].map((t, i) => (
                <button key={t} style={{ padding: "7px 16px", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500, background: "none", color: i === 0 ? "#2a5298" : "#95a5a6", borderBottom: i === 0 ? "2px solid #2a5298" : "2px solid transparent" }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ height: 180, background: "linear-gradient(135deg,#f5f7fa,#e8ecf1)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📊</div>
              <p style={{ color: "#95a5a6", fontSize: 13 }}>Grafik verileri yükleniyor…</p>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14, fontSize: 11, color: "#bdc3c7" }}>
            {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(d => <span key={d}>{d}</span>)}
          </div>
        </div>

        {/* Two column */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {/* Activities */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h4 style={{ fontSize: 16, fontWeight: 600, color: "#2c3e50" }}>Son Aktiviteler</h4>
              <a href="#" style={{ fontSize: 12, color: "#2a5298", fontWeight: 600, textDecoration: "none" }}>Tümünü Görüntüle</a>
            </div>
            <div>
              {activities.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: i < activities.length - 1 ? "1px solid #e8ecf1" : "none" }}>
                  <div style={{ width: 38, height: 38, borderRadius: 8, background: a.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>
                    {a.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#2c3e50", marginBottom: 2 }}>{a.label}</div>
                    <div style={{ fontSize: 12, color: "#95a5a6", marginBottom: 2 }}>{a.desc}</div>
                    <div style={{ fontSize: 11, color: "#bdc3c7" }}>{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Accountants table */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h4 style={{ fontSize: 16, fontWeight: 600, color: "#2c3e50" }}>En Aktif Muhasebeciler</h4>
              <Link href="/yetkili/muhasebeciler" style={{ fontSize: 12, color: "#2a5298", fontWeight: 600, textDecoration: "none" }}>Tümünü Gör</Link>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f7fa", borderBottom: "1px solid #e8ecf1" }}>
                  {["Muhasebeci", "Müşteri", "Performans", "Durum"].map(h => (
                    <th key={h} style={{ padding: "10px 12px", textAlign: "left", ...labelStyle }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {accountants.map((a, i) => (
                  <tr key={i} style={{ borderBottom: i < accountants.length - 1 ? "1px solid #e8ecf1" : "none" }}
                    className="hover:bg-[#f9fafc] transition-colors">
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 30, height: 30, borderRadius: 6, background: a.grad, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: 11, flexShrink: 0 }}>
                          {a.initials}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#2c3e50" }}>{a.name}</div>
                          <div style={{ fontSize: 11, color: "#95a5a6" }}>{a.title}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#2c3e50" }}>{a.clients}</td>
                    <td style={{ padding: "12px", fontSize: 13, color: "#2c3e50" }}>{a.perf}</td>
                    <td style={{ padding: "12px" }}>
                      <span style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: a.status === "Müsait" ? "#d4edda" : "#fff3cd",
                        color: a.status === "Müsait" ? "#155724" : "#856404",
                      }}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: "#fff", borderTop: "1px solid #e8ecf1", padding: "16px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ fontSize: 12, color: "#95a5a6" }}>LedgerFlow © 2026 LedgerFlow Accounting SaaS. Tüm hakları saklıdır.</p>
        <div style={{ display: "flex", gap: 20 }}>
          {["Kullanım Koşulları", "Gizlilik Politikası", "Güvenlik"].map(l => (
            <a key={l} href="#" style={{ fontSize: 12, color: "#95a5a6", textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </footer>
    </>
  );
}
