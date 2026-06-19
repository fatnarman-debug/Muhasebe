"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { CheckCircle, Send, XCircle, Loader2, Mail, Download } from "lucide-react";

interface Props {
  invoiceId: string;
  currentStatus: string;
  customerEmail?: string | null;
}

export function InvoiceStatusActions({ invoiceId, currentStatus, customerEmail }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [emailResult, setEmailResult] = useState<"ok" | "error" | null>(null);

  async function updateStatus(newStatus: string) {
    setLoading(newStatus);
    const supabase = createClient();
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === "sent") updates.sent_at = new Date().toISOString();
    if (newStatus === "paid") { updates.paid_at = new Date().toISOString(); updates.paid_amount = -1; }
    await supabase.from("invoices").update(updates).eq("id", invoiceId);
    router.refresh();
    setLoading(null);
  }

  async function sendEmail() {
    setLoading("email");
    setEmailResult(null);
    const res = await fetch(`/api/invoices/${invoiceId}/send`, { method: "POST" });
    if (res.ok) {
      setEmailResult("ok");
      router.refresh();
    } else {
      const { error } = await res.json();
      alert(error ?? "Något gick fel.");
      setEmailResult("error");
    }
    setLoading(null);
  }

  const isPaid = currentStatus === "paid";
  const isCancelled = currentStatus === "cancelled";
  const isDraft = currentStatus === "draft";
  const isSent = currentStatus === "sent" || currentStatus === "overdue";

  if (isPaid || isCancelled) return null;

  return (
    <div className="flex gap-2 flex-wrap">
      {/* PDF download — always visible */}
      <a href={`/api/invoices/${invoiceId}/pdf`} target="_blank" rel="noreferrer">
        <Button size="sm" variant="outline" className="gap-1.5">
          <Download className="w-3.5 h-3.5" /> PDF
        </Button>
      </a>

      {/* Send via email */}
      {customerEmail && !isCancelled && (
        <Button
          size="sm"
          variant="outline"
          className={`gap-1.5 ${emailResult === "ok" ? "text-green-600 border-green-300" : ""}`}
          onClick={sendEmail}
          disabled={!!loading}
        >
          {loading === "email" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Mail className="w-3.5 h-3.5" />}
          {emailResult === "ok" ? "Skickad!" : "Skicka e-post"}
        </Button>
      )}

      {isDraft && (
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          onClick={() => updateStatus("sent")}
          disabled={!!loading}
        >
          {loading === "sent" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Markera skickad
        </Button>
      )}
      {isSent && (
        <Button
          size="sm"
          className="gap-1.5 bg-green-600 hover:bg-green-700"
          onClick={() => updateStatus("paid")}
          disabled={!!loading}
        >
          {loading === "paid" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
          Markera betald
        </Button>
      )}
      <Button
        size="sm"
        variant="outline"
        className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => updateStatus("cancelled")}
        disabled={!!loading}
      >
        {loading === "cancelled" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
        Makulera
      </Button>
    </div>
  );
}
