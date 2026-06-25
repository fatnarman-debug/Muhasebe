import QRCode from "qrcode";
import type { ClientCompany, Invoice } from "@/types/database";

// ISO tarih → YYYYMMDD (UsingQR tarih formatı)
function ymd(d: string): string {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}${m}${day}`;
}

// UsingQR (Visma Spcs / Bankgirot rev.2) — İsveç banka uygulamalarının
// fatura kameradan okurken algıladığı standart. tp=1: ödeme/fatura.
// Zorunlu alanlar (tp=1): uqr, tp, nme, cid, iref, ddt, due, pt, acc.
export function buildUsingQrString(invoice: Invoice, company: ClientCompany): string | null {
  // Bankgiro ödemesi için gerekli alanlar yoksa QR üretme
  if (!company.bankgiro || !company.org_no) return null;

  const obj = {
    uqr: 1,
    tp: 1,
    nme: company.name,
    cid: company.org_no,
    iref: invoice.ocr_number || invoice.invoice_number,
    idt: ymd(invoice.invoice_date),
    ddt: ymd(invoice.due_date),
    due: Number(invoice.total),
    vat: Number(invoice.vat_amount),
    cur: "SEK",
    pt: "BG",
    acc: company.bankgiro,
  };
  return JSON.stringify(obj);
}

// Luhn / mod10 kontrol rakamı (Bankgiro optik satırı tutar alanı için)
function luhn(numStr: string): number {
  let sum = 0;
  let alt = true; // en sağdaki rakam ×2
  for (let i = numStr.length - 1; i >= 0; i--) {
    let n = Number(numStr[i]);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alt = !alt;
  }
  return (10 - (sum % 10)) % 10;
}

// Bankgiro OCR optik satırı (typ 41) — faturanın en altına basılır.
// Format: # <OCR-referens> # <kr> <öre> <kontroll> > <bankgiro>#41#
export function buildOcrLine(invoice: Invoice, company: ClientCompany): { ref: string; kr: string; ore: string; check: number; bankgiro: string } | null {
  if (!company.bankgiro) return null;
  const ref = invoice.ocr_number || invoice.invoice_number.replace(/\D/g, "");
  const kronor = Math.floor(invoice.total);
  const ore = String(Math.round((invoice.total - kronor) * 100)).padStart(2, "0");
  const check = luhn(`${kronor}${ore}`);
  const bankgiro = company.bankgiro.replace(/\D/g, "");
  return { ref, kr: String(kronor), ore, check, bankgiro };
}

// QR'ı PNG data-URL olarak üretir (PDF içinde <Image src=...> ile kullanılır).
export async function generateInvoiceQr(invoice: Invoice, company: ClientCompany): Promise<string | null> {
  const s = buildUsingQrString(invoice, company);
  if (!s) return null;
  try {
    return await QRCode.toDataURL(s, { errorCorrectionLevel: "M", margin: 1, scale: 6 });
  } catch {
    return null;
  }
}
