import { ImageResponse } from "next/og";

/* Dynamiskt genererad OG-bild. Next serverar den pa /opengraph-image och
   injicerar meta-taggarna automatiskt – ingen statisk og.png att halla
   uppdaterad. Samma bild anvands av Facebook, LinkedIn, X och Slack.      */

export const alt = "EnkeltFaktura – fakturering för svenska företag";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "76px 80px",
          background: "#faf8f3",
          fontFamily: "Helvetica, Arial, sans-serif",
          position: "relative",
        }}
      >
        {/* Mjuk toning uppe till hoger, samma som pa landningssidan */}
        <div
          style={{
            position: "absolute",
            top: -290,
            right: -230,
            width: 780,
            height: 780,
            borderRadius: 999,
            background: "radial-gradient(circle, #d9f0ec 0%, rgba(250,248,243,0) 68%)",
          }}
        />

        {/* Varumarke */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <svg width="54" height="54" viewBox="0 0 48 48" fill="none">
            <g stroke="#0359F8" strokeWidth="12.08" strokeLinecap="round" strokeLinejoin="round">
              <path d="M6.04 8.9H41.96" />
              <path d="M6.04 23.36H26.22" />
              <path d="M6.04 39.1H30.19L41.96 32.11" />
            </g>
          </svg>
          <span style={{ fontSize: 30, fontWeight: 800, color: "#0A152C", letterSpacing: "-0.02em" }}>
            EnkeltFaktura
          </span>
        </div>

        {/* Budskap */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 800,
              color: "#13294B",
              letterSpacing: "-0.03em",
              lineHeight: 1.06,
              maxWidth: 900,
            }}
          >
            Fakturering så enkel att du faktiskt gör den klar.
          </div>
          <div style={{ display: "flex", fontSize: 27, color: "#57534d", marginTop: 26, maxWidth: 820, lineHeight: 1.45 }}>
            Fakturor, offerter, ROT/RUT och påminnelser – på svenska, enligt svenska regler.
          </div>
        </div>

        {/* Fot */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: 12 }}>
            {["ROT & RUT", "OCR & bankgiro", "GDPR · EU-data"].map((t) => (
              <div
                key={t}
                style={{
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#0f766e",
                  background: "#e7f6f4",
                  border: "1px solid #c6e9e3",
                  borderRadius: 999,
                  padding: "11px 22px",
                }}
              >
                {t}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 23, fontWeight: 600, color: "#13294B" }}>
            enkeltfaktura.com
          </div>
        </div>
      </div>
    ),
    size
  );
}
