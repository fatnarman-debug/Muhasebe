"use client";

import { useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Copy, Check, ClipboardPaste, AlertTriangle,
  CheckCircle, XCircle, Loader2, ArrowRight, RefreshCw, Info,
} from "lucide-react";
import { formatSEK, formatDate } from "@/lib/utils";

interface PendingInvoice {
  id: string;
  invoice_number: string;
  ocr_number: string | null;
  total: number;
  status: string;
  customers: { name: string } | null;
}

interface ParsedPayment {
  date: string;
  amount: number;
  ocr?: string;
  sender?: string;
  description?: string;
}

interface MatchResult {
  payment: ParsedPayment;
  invoice: PendingInvoice | null;
  matchType: "ocr" | "amount" | "none";
  selected: boolean;
}

interface Props {
  invoices: PendingInvoice[];
}

const PROMPT = `Du är en assistent som hjälper till med bokföring. Jag bifogar ett bankutdrag som PDF.

Din uppgift är att extrahera ALLA inbetalningar (inkommande betalningar) från utdraget och returnera dem i exakt detta JSON-format:

[
  {
    "date": "ÅÅÅÅ-MM-DD",
    "amount": 12500.00,
    "ocr": "OCR-nummer om det finns (annars null)",
    "sender": "Avsändarens namn om det finns (annars null)",
    "description": "Beskrivning eller referens från banken"
  }
]

Viktiga regler:
- Inkludera BARA inbetalningar (positiva belopp, pengar som KOMMIT IN)
- Ignorera utgående betalningar och avgifter
- OCR-numret hittas ofta i fälten: "Meddelande", "Referens", "OCR", "Avsändarreferens"
- Returnera ENBART JSON-arrayen, inga förklaringar eller annan text
- Om det inte finns några inbetalningar, returnera: []`;

export function ReconciliationClient({ invoices }: Props) {
  const [step, setStep] = useState<"prompt" | "paste" | "review" | "done">("prompt");
  const [copied, setCopied] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [parseError, setParseError] = useState("");
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);

  // Index invoices by OCR and amount for fast lookup
  const byOcr = useMemo(() => {
    const m: Record<string, PendingInvoice> = {};
    invoices.forEach((inv) => { if (inv.ocr_number) m[inv.ocr_number.replace(/\s/g, "")] = inv; });
    return m;
  }, [invoices]);

  const byAmount = useMemo(() => {
    const m: Record<string, PendingInvoice[]> = {};
    invoices.forEach((inv) => {
      const key = inv.total.toFixed(2);
      if (!m[key]) m[key] = [];
      m[key].push(inv);
    });
    return m;
  }, [invoices]);

  function copyPrompt() {
    navigator.clipboard.writeText(PROMPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function parseAndMatch() {
    setParseError("");
    let payments: ParsedPayment[];
    try {
      const cleaned = jsonInput.trim().replace(/^```json?\n?/, "").replace(/\n?```$/, "");
      payments = JSON.parse(cleaned);
      if (!Array.isArray(payments)) throw new Error("Inte en array");
    } catch {
      setParseError("Ogiltigt JSON-format. Kontrollera att du kopierat hela svaret från AI-verktyget.");
      return;
    }

    const results: MatchResult[] = payments.map((p) => {
      const ocrClean = (p.ocr ?? "").toString().replace(/\s/g, "");
      // Try OCR match first
      if (ocrClean && byOcr[ocrClean]) {
        return { payment: p, invoice: byOcr[ocrClean], matchType: "ocr", selected: true };
      }
      // Try amount match (only if unique)
      const amtKey = Number(p.amount).toFixed(2);
      if (byAmount[amtKey]?.length === 1) {
        return { payment: p, invoice: byAmount[amtKey][0], matchType: "amount", selected: true };
      }
      return { payment: p, invoice: null, matchType: "none", selected: false };
    });

    setMatches(results);
    setStep("review");
  }

  function toggleSelect(i: number) {
    setMatches((prev) => prev.map((m, idx) => idx === i ? { ...m, selected: !m.selected } : m));
  }

  async function confirmPayments() {
    setSaving(true);
    const supabase = createClient();
    const toMark = matches.filter((m) => m.selected && m.invoice);
    let count = 0;
    for (const m of toMark) {
      await supabase.from("invoices").update({
        status: "paid",
        paid_at: new Date(m.payment.date).toISOString(),
        paid_amount: m.invoice!.total,
      }).eq("id", m.invoice!.id);
      count++;
    }
    setSavedCount(count);
    setSaving(false);
    setStep("done");
  }

  const matchedCount = matches.filter((m) => m.invoice).length;
  const selectedCount = matches.filter((m) => m.selected && m.invoice).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bankavstämning</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Matcha bankens inbetalningar mot dina skickade fakturor automatiskt
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {[["1", "Kopiera prompt"], ["2", "Klistra in svar"], ["3", "Granska"]].map(([num, label], i) => {
          const stepKeys: typeof step[] = ["prompt", "paste", "review"];
          const isActive = step === stepKeys[i] || (step === "done" && i === 2);
          const isDone = (i === 0 && step !== "prompt") || (i === 1 && (step === "review" || step === "done"));
          return (
            <div key={num} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                isDone ? "bg-green-500 text-white" : isActive ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {isDone ? <Check className="w-3.5 h-3.5" /> : num}
              </div>
              <span className={isActive ? "font-medium text-gray-900" : "text-gray-400"}>{label}</span>
              {i < 2 && <ArrowRight className="w-3.5 h-3.5 text-gray-300" />}
            </div>
          );
        })}
      </div>

      {/* STEP 1: Copy prompt */}
      {step === "prompt" && (
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 space-y-1">
              <p className="font-semibold">Hur det fungerar</p>
              <ol className="list-decimal list-inside space-y-1 text-blue-700">
                <li>Kopiera promtet nedan</li>
                <li>Öppna <strong>ChatGPT, Claude, Gemini</strong> eller annat AI-verktyg</li>
                <li>Bifoga ditt bankutdrag (PDF) och klistra in promtet</li>
                <li>Kopiera JSON-svaret och klistra in det i nästa steg</li>
              </ol>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
              <span className="text-sm font-semibold text-gray-700">Prompt att kopiera</span>
              <button
                onClick={copyPrompt}
                className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  copied ? "bg-green-100 text-green-700" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {copied ? <><Check className="w-3.5 h-3.5" /> Kopierad!</> : <><Copy className="w-3.5 h-3.5" /> Kopiera</>}
              </button>
            </div>
            <pre className="px-5 py-4 text-xs text-gray-700 whitespace-pre-wrap font-mono leading-relaxed bg-gray-50/50 select-all">
              {PROMPT}
            </pre>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setStep("paste")} className="gap-2">
              Nästa — Klistra in AI-svar <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 2: Paste JSON */}
      {step === "paste" && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-2">
              <ClipboardPaste className="w-5 h-5 text-gray-400" />
              <h2 className="font-semibold text-gray-900">Klistra in JSON-svaret från AI-verktyget</h2>
            </div>
            <p className="text-sm text-gray-500">
              Kopiera hela svaret från ChatGPT/Claude/Gemini och klistra in här. Det ska börja med <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">[</code> och sluta med <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">]</code>.
            </p>
            <textarea
              value={jsonInput}
              onChange={(e) => { setJsonInput(e.target.value); setParseError(""); }}
              placeholder={`[\n  {\n    "date": "2026-06-20",\n    "amount": 12500.00,\n    "ocr": "000000019",\n    "sender": "Kunden AB",\n    "description": "Inbetalning"\n  }\n]`}
              rows={12}
              className="w-full font-mono text-xs border border-gray-200 rounded-lg p-3 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
            {parseError && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-sm text-red-700">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                {parseError}
              </div>
            )}
          </div>

          <div className="flex gap-3 justify-between">
            <Button variant="outline" onClick={() => setStep("prompt")}>Tillbaka</Button>
            <Button onClick={parseAndMatch} disabled={!jsonInput.trim()} className="gap-2">
              Matcha mot fakturor <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: Review matches */}
      {step === "review" && (
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <p className="text-2xl font-bold text-gray-900">{matches.length}</p>
              <p className="text-xs text-gray-500 mt-0.5">Inbetalningar hittade</p>
            </div>
            <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
              <p className="text-2xl font-bold text-green-700">{matchedCount}</p>
              <p className="text-xs text-green-600 mt-0.5">Matchade fakturor</p>
            </div>
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4 text-center">
              <p className="text-2xl font-bold text-amber-700">{matches.length - matchedCount}</p>
              <p className="text-xs text-amber-600 mt-0.5">Ej matchade</p>
            </div>
          </div>

          {/* Match list */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-700">Granska matchningar</span>
              <span className="text-xs text-gray-400">{selectedCount} valda att markera som betalda</span>
            </div>
            <div className="divide-y divide-gray-50">
              {matches.map((m, i) => (
                <div key={i} className={`px-5 py-4 flex items-center gap-4 ${m.invoice && m.selected ? "" : "opacity-60"}`}>
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={m.selected}
                    disabled={!m.invoice}
                    onChange={() => toggleSelect(i)}
                    className="w-4 h-4 accent-green-600 cursor-pointer disabled:cursor-not-allowed"
                  />

                  {/* Payment info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-gray-900">{formatSEK(m.payment.amount)}</span>
                      <span className="text-xs text-gray-400">{m.payment.date}</span>
                      {m.payment.ocr && (
                        <span className="text-xs font-mono bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                          OCR: {m.payment.ocr}
                        </span>
                      )}
                    </div>
                    {m.payment.sender && (
                      <p className="text-xs text-gray-400 truncate">{m.payment.sender}</p>
                    )}
                    {m.payment.description && !m.payment.sender && (
                      <p className="text-xs text-gray-400 truncate">{m.payment.description}</p>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center gap-2 shrink-0">
                    {m.invoice ? (
                      <>
                        <ArrowRight className="w-4 h-4 text-gray-300" />
                        <div className="text-right">
                          <p className="text-sm font-mono font-semibold text-blue-600">{m.invoice.invoice_number}</p>
                          <p className="text-xs text-gray-400">{m.invoice.customers?.name}</p>
                          <div className="flex items-center gap-1 justify-end mt-0.5">
                            {m.matchType === "ocr" ? (
                              <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">OCR-match</span>
                            ) : (
                              <span className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-medium">Belopps-match</span>
                            )}
                          </div>
                        </div>
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-4 h-4 text-gray-200" />
                        <div className="text-right">
                          <p className="text-xs text-gray-400">Ingen faktura</p>
                          <p className="text-[10px] text-gray-300">Kan vara privat/annat</p>
                        </div>
                        <XCircle className="w-5 h-5 text-gray-300" />
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {selectedCount === 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 text-sm text-amber-800">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
              Inga fakturor valda. Välj minst en matchning att markera som betald.
            </div>
          )}

          <div className="flex gap-3 justify-between">
            <Button variant="outline" onClick={() => setStep("paste")} className="gap-1.5">
              <RefreshCw className="w-3.5 h-3.5" /> Börja om
            </Button>
            <Button
              onClick={confirmPayments}
              disabled={selectedCount === 0 || saving}
              className="gap-2 bg-green-600 hover:bg-green-700"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
              Markera {selectedCount} faktura{selectedCount !== 1 ? "r" : ""} som betalda
            </Button>
          </div>
        </div>
      )}

      {/* DONE */}
      {step === "done" && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-1">
            {savedCount} faktura{savedCount !== 1 ? "r" : ""} markerad{savedCount !== 1 ? "e" : ""} som betald{savedCount !== 1 ? "a" : ""}
          </h2>
          <p className="text-gray-500 text-sm mb-6">Fakturorna har uppdaterats i systemet.</p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => { setStep("prompt"); setMatches([]); setJsonInput(""); }}>
              Ny avstämning
            </Button>
            <a href="/dashboard/invoices">
              <Button>Visa fakturor</Button>
            </a>
          </div>
        </div>
      )}

      {/* Info: pending invoices */}
      {step === "prompt" && invoices.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              {invoices.length} väntande fakturor (Skickad / Förfallen)
            </span>
          </div>
          <table className="w-full text-sm">
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50">
                  <td className="px-5 py-2.5 font-mono font-medium text-blue-600">{inv.invoice_number}</td>
                  <td className="px-5 py-2.5 text-gray-600">{inv.customers?.name ?? "—"}</td>
                  <td className="px-5 py-2.5 font-mono text-xs text-gray-400">{inv.ocr_number ?? "—"}</td>
                  <td className="px-5 py-2.5 text-right font-medium">{formatSEK(inv.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
