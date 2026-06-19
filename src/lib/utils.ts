import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatSEK(amount: number): string {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("sv-SE").format(new Date(dateStr));
}

export function generateOCR(invoiceNumber: string): string {
  const base = invoiceNumber.replace(/\D/g, "").padStart(8, "0");
  const digits = base.split("").map(Number);
  let sum = 0;
  let alternate = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = digits[i];
    if (alternate) { n *= 2; if (n > 9) n -= 9; }
    sum += n;
    alternate = !alternate;
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return `${base}${checkDigit}`;
}

export function getInvoiceStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: "Utkast", sent: "Skickad", paid: "Betald",
    overdue: "Förfallen", cancelled: "Makulerad", credit: "Kreditfaktura",
  };
  return labels[status] ?? status;
}

export function getInvoiceStatusColor(status: string): string {
  const colors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700", sent: "bg-blue-100 text-blue-700",
    paid: "bg-green-100 text-green-700", overdue: "bg-red-100 text-red-700",
    cancelled: "bg-gray-100 text-gray-500", credit: "bg-orange-100 text-orange-700",
  };
  return colors[status] ?? "bg-gray-100 text-gray-700";
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function toDateInput(date: Date): string {
  return date.toISOString().split("T")[0];
}
