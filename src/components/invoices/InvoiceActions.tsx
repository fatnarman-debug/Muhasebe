"use client";

import { useState } from "react";
import { Eye, Download, Pencil, Mail, Loader2 } from "lucide-react";

interface Props {
  invoiceId: string;
  status: "draft" | "sent" | "paid" | "overdue";
  onEdit?: () => void;
}

export function InvoiceActions({ invoiceId, status, onEdit }: Props) {
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const isDraft = status === "draft";

  async function handleSendEmail() {
    if (isDraft) return;
    setEmailLoading(true);
    try {
      const res = await fetch(`/api/invoices/${invoiceId}/send-email`, { method: "POST" });
      if (res.ok) {
        setEmailSent(true);
      } else {
        const body = await res.json().catch(() => ({}));
        alert(body?.error ?? "E-posta gönderilirken bir hata oluştu.");
      }
    } catch {
      alert("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setEmailLoading(false);
    }
  }

  const draftTooltip = isDraft ? "Taslak faturalar gönderilemez" : undefined;

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Önizleme */}
      <a
        href={`/api/invoices/${invoiceId}/preview`}
        target="_blank"
        rel="noreferrer"
        className={[
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
          "bg-slate-100 text-slate-700 hover:bg-slate-200",
          "transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1",
        ].join(" ")}
      >
        <Eye className="w-4 h-4" />
        Önizleme
      </a>

      {/* PDF İndir */}
      {isDraft ? (
        <span title={draftTooltip} className="inline-flex">
          <button
            type="button"
            disabled
            className={[
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
              "bg-teal-600 text-white",
              "opacity-40 cursor-not-allowed",
            ].join(" ")}
          >
            <Download className="w-4 h-4" />
            PDF İndir
          </button>
        </span>
      ) : (
        <a
          href={`/api/invoices/${invoiceId}/pdf`}
          target="_blank"
          rel="noreferrer"
          className={[
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
            "bg-teal-600 text-white hover:bg-teal-700",
            "transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-1",
          ].join(" ")}
        >
          <Download className="w-4 h-4" />
          PDF İndir
        </a>
      )}

      {/* Düzenle */}
      <button
        type="button"
        onClick={onEdit}
        className={[
          "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
          "bg-white border border-slate-300 text-slate-700",
          "hover:bg-slate-50 hover:border-slate-400",
          "transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-1",
        ].join(" ")}
      >
        <Pencil className="w-4 h-4" />
        Düzenle
      </button>

      {/* E-mail Gönder */}
      {isDraft ? (
        <span title={draftTooltip} className="inline-flex">
          <button
            type="button"
            disabled
            className={[
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
              "bg-slate-900 text-white",
              "opacity-40 cursor-not-allowed",
            ].join(" ")}
          >
            <Mail className="w-4 h-4" />
            E-mail Gönder
          </button>
        </span>
      ) : (
        <button
          type="button"
          onClick={handleSendEmail}
          disabled={emailLoading || emailSent}
          className={[
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium",
            emailSent
              ? "bg-green-600 text-white cursor-default"
              : "bg-slate-900 text-white hover:bg-slate-800",
            emailLoading ? "opacity-70 cursor-wait" : "",
            "transition-colors duration-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-700 focus-visible:ring-offset-1",
          ].join(" ")}
        >
          {emailLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Mail className="w-4 h-4" />
          )}
          {emailSent ? "Gönderildi!" : "E-mail Gönder"}
        </button>
      )}
    </div>
  );
}
