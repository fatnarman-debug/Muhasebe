"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart3, FileSpreadsheet, TrendingUp, Receipt, AlertCircle, Loader2 } from "lucide-react";

const TABS = [
  { key: "moms", label: "Momsrapport", icon: Receipt },
  { key: "revenue", label: "Omsättning", icon: TrendingUp },
  { key: "aging", label: "Åldersanalys", icon: AlertCircle },
  { key: "sie", label: "SIE-export", icon: FileSpreadsheet },
] as const;

type Tab = typeof TABS[number]["key"];

function fmtSEK(n: number) {
  return new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", minimumFractionDigits: 2 }).format(n);
}

function fmtDate(d: string) {
  return new Intl.DateTimeFormat("sv-SE").format(new Date(d));
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dec"];
const QUARTERS = ["Q1 (Jan–Mar)", "Q2 (Apr–Jun)", "Q3 (Jul–Sep)", "Q4 (Okt–Dec)"];

export default function ReportsPage() {
  const [tab, setTab] = useState<Tab>("moms");

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Rapporter</h1>
        <p className="text-gray-500 text-sm mt-1">Ekonomisk översikt och exportfunktioner</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-gray-200">
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === key
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === "moms" && <MomsReport />}
      {tab === "revenue" && <RevenueReport />}
      {tab === "aging" && <AgingReport />}
      {tab === "sie" && <SIEExport />}
    </div>
  );
}

// ─── MOMSRAPPORT ───────────────────────────────────────────────────────────────
function MomsReport() {
  const year = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(year);
  const [selectedQ, setSelectedQ] = useState(Math.floor(new Date().getMonth() / 3));
  const [rows, setRows] = useState<{ vat_rate: number; net: number; vat: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const startMonth = selectedQ * 3 + 1;
    const endMonth = startMonth + 2;
    const start = `${selectedYear}-${String(startMonth).padStart(2, "0")}-01`;
    const end = `${selectedYear}-${String(endMonth).padStart(2, "0")}-${endMonth === 2 ? 28 : 30}`;

    const supabase = createClient();
    supabase
      .from("invoice_lines")
      .select("vat_rate, line_total, vat_amount, invoices!inner(invoice_date, status)")
      .gte("invoices.invoice_date", start)
      .lte("invoices.invoice_date", end)
      .neq("invoices.status", "cancelled")
      .then(({ data }) => {
        const map: Record<number, { net: number; vat: number }> = {};
        (data ?? []).forEach((l: any) => {
          const r = l.vat_rate as number;
          if (!map[r]) map[r] = { net: 0, vat: 0 };
          map[r].net += l.line_total;
          map[r].vat += l.vat_amount;
        });
        setRows(Object.entries(map).map(([r, v]) => ({ vat_rate: Number(r), ...v })).sort((a, b) => b.vat_rate - a.vat_rate));
        setLoading(false);
      });
  }, [selectedYear, selectedQ]);

  const totalNet = rows.reduce((s, r) => s + r.net, 0);
  const totalVat = rows.reduce((s, r) => s + r.vat, 0);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <select
          value={selectedYear}
          onChange={(e) => setSelectedYear(Number(e.target.value))}
          className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm"
        >
          {[year - 1, year, year + 1].map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        <select
          value={selectedQ}
          onChange={(e) => setSelectedQ(Number(e.target.value))}
          className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm"
        >
          {QUARTERS.map((q, i) => <option key={i} value={i}>{q}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Momssammanställning — {QUARTERS[selectedQ]} {selectedYear}</h2>
          <p className="text-xs text-gray-400 mt-0.5">Utgående moms per skattesats (ej makulerade fakturor)</p>
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Momssats</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Nettoomsättning</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Utgående moms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.length === 0 ? (
                <tr><td colSpan={3} className="px-6 py-10 text-center text-gray-400">Inga fakturor under perioden</td></tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.vat_rate} className="hover:bg-gray-50">
                    <td className="px-6 py-3.5 font-medium">{r.vat_rate}%</td>
                    <td className="px-4 py-3.5 text-right tabular-nums text-gray-600">{fmtSEK(r.net)}</td>
                    <td className="px-6 py-3.5 text-right tabular-nums font-semibold">{fmtSEK(r.vat)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {rows.length > 0 && (
              <tfoot className="border-t-2 border-gray-200 bg-gray-50">
                <tr>
                  <td className="px-6 py-3 font-bold text-gray-900">Totalt</td>
                  <td className="px-4 py-3 text-right tabular-nums font-bold">{fmtSEK(totalNet)}</td>
                  <td className="px-6 py-3 text-right tabular-nums font-bold text-blue-700">{fmtSEK(totalVat)}</td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
        Dessa siffror används för <strong>ruta 05, 06, 10, 11, 12</strong> i momsdeklarationen (Skatteverket). Kontrollera alltid mot ditt bokföringssystem.
      </div>
    </div>
  );
}

// ─── OMSÄTTNINGSRAPPORT ────────────────────────────────────────────────────────
function RevenueReport() {
  const year = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(year);
  const [data, setData] = useState<{ month: number; invoiced: number; paid: number; count: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const supabase = createClient();
    supabase
      .from("invoices")
      .select("invoice_date, total, status, paid_amount")
      .gte("invoice_date", `${selectedYear}-01-01`)
      .lte("invoice_date", `${selectedYear}-12-31`)
      .neq("status", "cancelled")
      .then(({ data: invoices }) => {
        const monthly: Record<number, { invoiced: number; paid: number; count: number }> = {};
        for (let m = 1; m <= 12; m++) monthly[m] = { invoiced: 0, paid: 0, count: 0 };
        (invoices ?? []).forEach((inv: any) => {
          const m = new Date(inv.invoice_date).getMonth() + 1;
          monthly[m].invoiced += inv.total;
          monthly[m].count += 1;
          if (inv.status === "paid") monthly[m].paid += inv.total;
        });
        setData(Object.entries(monthly).map(([m, v]) => ({ month: Number(m), ...v })));
        setLoading(false);
      });
  }, [selectedYear]);

  const totalInvoiced = data.reduce((s, d) => s + d.invoiced, 0);
  const totalPaid = data.reduce((s, d) => s + d.paid, 0);
  const maxVal = Math.max(...data.map((d) => d.invoiced), 1);

  return (
    <div className="space-y-4">
      <select
        value={selectedYear}
        onChange={(e) => setSelectedYear(Number(e.target.value))}
        className="h-9 rounded-md border border-input bg-white px-3 py-1 text-sm"
      >
        {[year - 1, year].map((y) => <option key={y} value={y}>{y}</option>)}
      </select>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-6">Fakturerat per månad — {selectedYear}</h2>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : (
          <div className="space-y-2">
            {data.map((d) => (
              <div key={d.month} className="flex items-center gap-3">
                <span className="w-8 text-xs text-gray-500 text-right">{MONTHS[d.month - 1]}</span>
                <div className="flex-1 relative h-7 bg-gray-100 rounded overflow-hidden">
                  <div
                    className="absolute inset-y-0 left-0 bg-blue-500 rounded transition-all duration-500"
                    style={{ width: `${(d.invoiced / maxVal) * 100}%` }}
                  />
                  {d.paid > 0 && (
                    <div
                      className="absolute inset-y-0 left-0 bg-green-400 rounded opacity-70"
                      style={{ width: `${(d.paid / maxVal) * 100}%` }}
                    />
                  )}
                </div>
                <span className="w-32 text-xs tabular-nums text-right text-gray-700">{d.invoiced > 0 ? fmtSEK(d.invoiced) : "—"}</span>
                <span className="w-6 text-xs text-gray-400 text-center">{d.count > 0 ? d.count : ""}</span>
              </div>
            ))}
          </div>
        )}
        <div className="flex gap-6 mt-6 pt-4 border-t border-gray-100">
          <div><p className="text-xs text-gray-400">Fakturerat totalt</p><p className="font-bold text-lg">{fmtSEK(totalInvoiced)}</p></div>
          <div><p className="text-xs text-gray-400">Betalt</p><p className="font-bold text-lg text-green-600">{fmtSEK(totalPaid)}</p></div>
          <div><p className="text-xs text-gray-400">Utestående</p><p className="font-bold text-lg text-amber-600">{fmtSEK(totalInvoiced - totalPaid)}</p></div>
        </div>
        <div className="flex gap-4 mt-3">
          <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded bg-blue-500 inline-block" />Fakturerat</span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-3 rounded bg-green-400 inline-block" />Betalt</span>
        </div>
      </div>
    </div>
  );
}

// ─── ÅLDERSANALYS ──────────────────────────────────────────────────────────────
function AgingReport() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];
    supabase
      .from("invoices")
      .select("id, invoice_number, due_date, total, amount_due, customers(name), client_companies(name)")
      .in("status", ["sent", "overdue"])
      .lte("due_date", today)
      .order("due_date")
      .then(({ data }) => {
        setInvoices(data ?? []);
        setLoading(false);
      });
  }, []);

  function daysOverdue(due: string) {
    return Math.floor((Date.now() - new Date(due).getTime()) / 86400000);
  }

  function bucket(days: number) {
    if (days <= 30) return { label: "1–30 dagar", color: "bg-yellow-100 text-yellow-700" };
    if (days <= 60) return { label: "31–60 dagar", color: "bg-orange-100 text-orange-700" };
    return { label: "60+ dagar", color: "bg-red-100 text-red-700" };
  }

  const totalOverdue = invoices.reduce((s, i) => s + i.amount_due, 0);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">Förfallna fakturor</h2>
            <p className="text-xs text-gray-400 mt-0.5">Skickade fakturor som passerat förfallodatum</p>
          </div>
          {invoices.length > 0 && (
            <div className="text-right">
              <p className="text-xs text-gray-400">Totalt utestående</p>
              <p className="font-bold text-lg text-red-600">{fmtSEK(totalOverdue)}</p>
            </div>
          )}
        </div>
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-gray-400 font-medium">Inga förfallna fakturor</p>
            <p className="text-sm text-gray-300 mt-1">Alla skickade fakturor är inom förfallodatum</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase">Faktura</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Kund</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Förfallodatum</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Dagar</th>
                <th className="text-right px-6 py-3 text-xs font-medium text-gray-500 uppercase">Belopp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {invoices.map((inv) => {
                const days = daysOverdue(inv.due_date);
                const b = bucket(days);
                return (
                  <tr key={inv.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3.5">
                      <a href={`/dashboard/invoices/${inv.id}`} className="font-mono text-blue-600 hover:underline">{inv.invoice_number}</a>
                      <p className="text-xs text-gray-400">{inv.client_companies?.name}</p>
                    </td>
                    <td className="px-4 py-3.5 text-gray-700">{inv.customers?.name}</td>
                    <td className="px-4 py-3.5 text-right text-gray-600">{fmtDate(inv.due_date)}</td>
                    <td className="px-4 py-3.5 text-right">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.color}`}>{days} dagar</span>
                    </td>
                    <td className="px-6 py-3.5 text-right font-semibold tabular-nums">{fmtSEK(inv.amount_due)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── SIE-EXPORT ────────────────────────────────────────────────────────────────
function SIEExport() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-10 text-center">
      <FileSpreadsheet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
      <h3 className="font-semibold text-gray-700 mb-1">SIE4-export</h3>
      <p className="text-sm text-gray-400 max-w-sm mx-auto">
        Export av bokföringsunderlag i SIE4-format för din redovisningsbyrå. Lanseras i nästa version.
      </p>
      <span className="mt-4 inline-block text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">Snart tillgänglig</span>
    </div>
  );
}
