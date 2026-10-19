import { ImageResponse } from "next/og";

/* Dynamiskt genererad OG-bild. Next serverar den pa /opengraph-image och
   injicerar meta-taggarna automatiskt – ingen statisk og.png att halla
   uppdaterad. Samma bild anvands av Facebook, LinkedIn, X och Slack.      */

export const alt = "Enkelfaktura – fakturering för svenska företag";
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
            <path
              d="M16 8.5H27L35.5 17V37.4A3.2 3.2 0 0 1 32.3 40.6H16A3.2 3.2 0 0 1 12.8 37.4V11.7A3.2 3.2 0 0 1 16 8.5Z"
              fill="#ffffff" stroke="#13294B" strokeWidth="2.6" strokeLinejoin="round"
            />
            <path d="M27 8.8V17H35.4Z" fill="#AECBE8" />
            <path d="M27 8.8V17H35.4" fill="none" stroke="#13294B" strokeWidth="2.3" strokeLinejoin="round" />
            <path d="M17.6 18.6H26" stroke="#8FB0D6" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M17.6 23.4H22.6" stroke="#8FB0D6" strokeWidth="2.4" strokeLinecap="round" />
            <path d="M14.6 30.8L20.4 37L32 23.4" stroke="#15A39A" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ fontSize: 30, fontWeight: 800, color: "#13294B", letterSpacing: "-0.02em" }}>
            Enkelfaktura
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
