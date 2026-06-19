import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Faktura — Faktureringssystem för redovisningskonsulter",
  description: "Professionell faktureringslösning för redovisningsbyrå",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv" className="h-full">
      <body className={`${inter.className} h-full antialiased bg-gray-50`}>
        {children}
      </body>
    </html>
  );
}
