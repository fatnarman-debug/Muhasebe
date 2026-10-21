import type { NextConfig } from "next";

// Säkerhetsheaders för alla svar (clickjacking, MIME-sniffing, referrer, HTTPS).
const securityHeaders = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      // Jamforelsesidan mot en namngiven konkurrent ar borttagen. Adressen
      // ar indexerad, sa den pekas om i stallet for att ge 404.
      { source: "/jamfor/bokio-alternativ", destination: "/", permanent: true },
      { source: "/jamfor", destination: "/", permanent: true },
    ];
  },
};

export default nextConfig;
