"use client";

// Her fatura şablonunun görsel kimliğini gerçekçi bir örnek faturaya uygular.
// Küçük kartlardaki (PreviewXxx) renk/başlık diline sadık kalır.

type Layout = "topbar" | "band" | "gradient" | "sidebar" | "darkpage";

interface Style {
  layout: Layout;
  accent: string;
  headerBg?: string;   // band / sidebar
  headerFg?: string;   // band üstü yazı rengi
  accent2?: string;    // gradient
  minimal?: boolean;   // ince/havadar varyant
}

export const TEMPLATE_STYLES: Record<string, Style> = {
  "klasik-standart":    { layout: "topbar", accent: "#1f2937" },
  "klasik-minimal":     { layout: "topbar", accent: "#111827", minimal: true },
  "klasik-profesyonel": { layout: "topbar", accent: "#334155" },
  "klasik-corporate":   { layout: "band",   accent: "#111827", headerBg: "#111827", headerFg: "#ffffff" },
  "klasik-clean":       { layout: "topbar", accent: "#94a3b8", minimal: true },
  "modern-colorful":    { layout: "band",   accent: "#0d9488", headerBg: "#0d9488", headerFg: "#ffffff" },
  "modern-gradient":    { layout: "gradient", accent: "#7c3aed", accent2: "#a855f7", headerFg: "#ffffff" },
  "modern-bold":        { layout: "band",   accent: "#14b8a6", headerBg: "#111827", headerFg: "#ffffff" },
  "modern-tech":        { layout: "darkpage", accent: "#22c55e" },
  "modern-creative":    { layout: "sidebar", accent: "#f97316", headerBg: "#f97316", headerFg: "#ffffff" },
};

const SAMPLE = {
  company: "Andersson Redovisning AB",
  companyMeta: ["Storgatan 12", "211 34 Malmö", "Org.nr 556712-3456"],
  customer: "Nordic Handel AB",
  customerMeta: ["Kungsgatan 8", "111 43 Stockholm"],
  number: "FAK-1050",
  date: "2026-06-25",
  due: "2026-07-25",
  ocr: "10500000019",
  bankgiro: "5123-4567",
  lines: [
    { d: "Konsulttjänst, junimånad", q: "24 tim", p: "1 150", sum: "27 600" },
    { d: "Bokföring & avstämning", q: "1 st", p: "3 200", sum: "3 200" },
    { d: "Momsdeklaration", q: "1 st", p: "1 400", sum: "1 400" },
  ],
  net: "32 200",
  vat: "8 050",
  total: "40 250",
};

function fmt(s: string) {
  return `${s} kr`;
}

export function SampleInvoice({ templateId }: { templateId: string }) {
  const style = TEMPLATE_STYLES[templateId] ?? TEMPLATE_STYLES["klasik-standart"];
  const dark = style.layout === "darkpage";

  const pageBg = dark ? "#0b0f0c" : "#ffffff";
  const ink = dark ? "#e5e7eb" : "#111827";
  const muted = dark ? "#7b8a80" : "#9ca3af";
  const lineBorder = dark ? "#1f2a22" : "#eef1f4";
  const accent = style.accent;

  const LogoBox = (
    <div
      style={{
        width: 46, height: 46, borderRadius: 10,
        background: dark ? "#16201a" : "#f3f4f6",
        border: `1px solid ${dark ? "#22302820" : "#e5e7eb"}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: muted, fontSize: 9, fontWeight: 700, letterSpacing: "0.05em",
      }}
    >
      LOGO
    </div>
  );

  // ---- Header varyantları ----
  function Header() {
    if (style.layout === "band" || style.layout === "gradient") {
      const bg = style.layout === "gradient"
        ? `linear-gradient(120deg, ${style.accent}, ${style.accent2})`
        : style.headerBg;
      return (
        <div style={{ background: bg, color: style.headerFg, padding: "22px 28px", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div style={{ width: 46, height: 46, borderRadius: 10, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, letterSpacing: "0.05em" }}>LOGO</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: "-0.01em" }}>{SAMPLE.company}</div>
              <div style={{ fontSize: 10, opacity: 0.8 }}>{SAMPLE.companyMeta[2]}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: "0.04em" }}>FAKTURA</div>
            <div style={{ fontSize: 11, opacity: 0.85, fontFamily: "monospace" }}>{SAMPLE.number}</div>
          </div>
        </div>
      );
    }

    // topbar (klasik aile)
    return (
      <div style={{ padding: "26px 28px 0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            {LogoBox}
            <div>
              <div style={{ fontSize: 15, fontWeight: 800, color: ink, letterSpacing: "-0.01em" }}>{SAMPLE.company}</div>
              <div style={{ fontSize: 10, color: muted }}>{SAMPLE.companyMeta[0]} · {SAMPLE.companyMeta[1]}</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: style.minimal ? 18 : 24, fontWeight: style.minimal ? 600 : 800, color: style.minimal ? muted : accent, letterSpacing: style.minimal ? "0.18em" : "0.02em" }}>FAKTURA</div>
            <div style={{ fontSize: 11, color: muted, fontFamily: "monospace", marginTop: 2 }}>{SAMPLE.number}</div>
          </div>
        </div>
        <div style={{ height: style.minimal ? 1 : 3, background: style.minimal ? lineBorder : accent, borderRadius: 2, marginTop: 18 }} />
      </div>
    );
  }

  const sidebar = style.layout === "sidebar";

  const body = (
    <div style={{ padding: sidebar ? "26px 28px 24px 20px" : "22px 28px 26px" }}>
      {/* Meta + kund */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: 24, marginBottom: 22 }}>
        <div style={{ display: "grid", gridTemplateColumns: "auto auto", gap: "5px 16px", alignSelf: "flex-start" }}>
          {[
            ["Fakturadatum", SAMPLE.date],
            ["Förfallodatum", SAMPLE.due],
            ["Betalningssätt", "Bankgiro"],
          ].map(([k, v]) => (
            <div key={k} style={{ display: "contents" }}>
              <span style={{ fontSize: 10, color: muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{k}</span>
              <span style={{ fontSize: 11, color: ink, fontWeight: 600, textAlign: "right" }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: muted, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>Faktureras till</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: ink }}>{SAMPLE.customer}</div>
          {SAMPLE.customerMeta.map((m) => <div key={m} style={{ fontSize: 11, color: muted }}>{m}</div>)}
        </div>
      </div>

      {/* Satırlar */}
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: `2px solid ${sidebar || style.layout === "topbar" ? accent : lineBorder}` }}>
            {[["Beskrivning", "left"], ["Antal", "right"], ["À-pris", "right"], ["Belopp", "right"]].map(([h, al]) => (
              <th key={h} style={{ textAlign: al as "left" | "right", padding: "8px 4px", fontSize: 9.5, fontWeight: 700, color: muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {SAMPLE.lines.map((l, i) => (
            <tr key={i} style={{ borderBottom: `1px solid ${lineBorder}` }}>
              <td style={{ padding: "9px 4px", fontSize: 11.5, color: ink, fontWeight: 500 }}>{l.d}</td>
              <td style={{ padding: "9px 4px", fontSize: 11, color: muted, textAlign: "right" }}>{l.q}</td>
              <td style={{ padding: "9px 4px", fontSize: 11, color: muted, textAlign: "right" }}>{fmt(l.p)}</td>
              <td style={{ padding: "9px 4px", fontSize: 11.5, color: ink, textAlign: "right", fontWeight: 600 }}>{fmt(l.sum)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Toplam */}
      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
        <div style={{ width: 220 }}>
          {[["Netto", SAMPLE.net], ["Moms 25%", SAMPLE.vat]].map(([k, v]) => (
            <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", fontSize: 11, color: muted }}>
              <span>{k}</span><span style={{ color: ink }}>{fmt(v)}</span>
            </div>
          ))}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, padding: "10px 12px", borderRadius: 8, background: dark ? "#11211780" : `${accent}10`, border: `1px solid ${dark ? "#1f3a2a" : `${accent}33`}` }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: ink }}>Att betala</span>
            <span style={{ fontSize: 14, fontWeight: 800, color: dark ? accent : accent }}>{fmt(SAMPLE.total)}</span>
          </div>
        </div>
      </div>

      {/* Footer / ödeme */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 22, paddingTop: 14, borderTop: `1px solid ${lineBorder}` }}>
        <div>
          <div style={{ fontSize: 9.5, color: muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>OCR</div>
          <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: ink, letterSpacing: "0.08em" }}>{SAMPLE.ocr}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 9.5, color: muted, textTransform: "uppercase", letterSpacing: "0.05em" }}>Bankgiro</div>
          <div style={{ fontSize: 13, fontWeight: 700, color: ink }}>{SAMPLE.bankgiro}</div>
        </div>
      </div>
      <div style={{ textAlign: "center", marginTop: 16, fontSize: 10, color: muted }}>Tack för förtroendet · Betala senast {SAMPLE.due}</div>
    </div>
  );

  if (sidebar) {
    return (
      <div style={{ display: "flex", background: pageBg, color: ink, minHeight: 560 }}>
        <div style={{ width: 30, background: style.headerBg, display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 22 }}>
          <span style={{ color: style.headerFg, fontWeight: 800, fontSize: 13, letterSpacing: "0.22em", writingMode: "vertical-rl", transform: "rotate(180deg)" }}>FAKTURA</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ padding: "26px 28px 0 20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              {LogoBox}
              <div>
                <div style={{ fontSize: 15, fontWeight: 800, color: ink }}>{SAMPLE.company}</div>
                <div style={{ fontSize: 10, color: muted }}>{SAMPLE.companyMeta[2]}</div>
              </div>
            </div>
            <div style={{ fontSize: 11, fontFamily: "monospace", color: accent, fontWeight: 700 }}>{SAMPLE.number}</div>
          </div>
          {body}
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: pageBg, color: ink, minHeight: 560 }}>
      <Header />
      {body}
    </div>
  );
}
