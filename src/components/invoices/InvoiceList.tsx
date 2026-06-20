"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Plus, FileText, Search, X, List, Archive, ChevronRight,
  ChevronDown, ChevronsUpDown, AlertTriangle, CheckCircle,
  Bell, Loader2,
} from "lucide-react";
import { formatSEK, formatDate, getInvoiceStatusLabel, getInvoiceStatusColor } from "@/lib/utils";

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total: number;
  status: string;
  ocr_number: string | null;
  customers: { id: string; name: string; email?: string | null } | null;
  client_companies: { name: string } | null;
}

interface Props {
  invoices: Invoice[];
}

const STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"];
const MONTHS_SV = ["Januari","Februari","Mars","April","Maj","Juni","Juli","Augusti","September","Oktober","November","December"];

export function InvoiceList({ invoices: initial }: Props) {
  const [invoices, setInvoices] = useState<Invoice[]>(initial);
  const [view, setView] = useState<"list" | "archive">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"invoice_date" | "total" | "due_date">("invoice_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [paying, setPaying] = useState<string | null>(null);
  const [reminding, setReminding] = useState<string | null>(null);
  const [reminderFee, setReminderFee] = useState(60);
  const [showReminderModal, setShowReminderModal] = useState<Invoice | null>(null);
  const [reminderResult, setReminderResult] = useState<"ok" | "error" | null>(null);

  // Archive expand state
  const [openCustomers, setOpenCustomers] = useState<Set<string>>(new Set());
  const [openYears, setOpenYears] = useState<Set<string>>(new Set());
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set());

  const years = useMemo(() => {
    const s = new Set(invoices.map((i) => i.invoice_date.slice(0, 4)));
    return Array.from(s).sort().reverse();
  }, [invoices]);

  const overdue = useMemo(() => invoices.filter((i) => i.status === "overdue"), [invoices]);
  const overdueTotal = useMemo(() => overdue.reduce((s, i) => s + i.total, 0), [overdue]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return invoices.filter((inv) => {
      if (statusFilter && inv.status !== statusFilter) return false;
      if (yearFilter && !inv.invoice_date.startsWith(yearFilter)) return false;
      if (!q) return true;
      return (
        inv.invoice_number.toLowerCase().includes(q) ||
        (inv.customers?.name ?? "").toLowerCase().includes(q) ||
        (inv.client_companies?.name ?? "").toLowerCase().includes(q) ||
        inv.total.toString().includes(q) ||
        formatSEK(inv.total).replace(/\s/g, "").toLowerCase().includes(q) ||
        inv.invoice_date.includes(q) ||
        (inv.ocr_number ?? "").includes(q)
      );
    });
  }, [invoices, search, statusFilter, yearFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const va = a[sortField];
      const vb = b[sortField];
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDir]);

  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  }

  const archiveGrouped = useMemo(() => {
    const map: Record<string, Record<string, Record<string, Record<string, Invoice[]>>>> = {};
    filtered.forEach((inv) => {
      const cust = inv.customers?.name ?? "Okänd kund";
      const [year, monthStr, day] = inv.invoice_date.split("-");
      const month = String(parseInt(monthStr));
      if (!map[cust]) map[cust] = {};
      if (!map[cust][year]) map[cust][year] = {};
      if (!map[cust][year][month]) map[cust][year][month] = {};
      if (!map[cust][year][month][day]) map[cust][year][month][day] = [];
      map[cust][year][month][day].push(inv);
    });
    return map;
  }, [filtered]);

  function toggle<T>(set: Set<T>, key: T): Set<T> {
    const next = new Set(set);
    next.has(key) ? next.delete(key) : next.add(key);
    return next;
  }

  // Quick pay — marks invoice as paid optimistically
  const handleQuickPay = useCallback(async (inv: Invoice) => {
    setPaying(inv.id);
    const supabase = createClient();
    await supabase
      .from("invoices")
      .update({ status: "paid", paid_at: new Date().toISOString(), paid_amount: inv.total })
      .eq("id", inv.id);
    setInvoices((prev) => prev.map((i) => i.id === inv.id ? { ...i, status: "paid" } : i));
    setPaying(null);
  }, []);

  // Send reminder
  const handleRemind = useCallback(async () => {
    if (!showReminderModal) return;
    setReminding(showReminderModal.id);
    setReminderResult(null);
    const res = await fetch(`/api/invoices/${showReminderModal.id}/remind`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reminderFee }),
    });
    if (res.ok) {
      setReminderResult("ok");
      setInvoices((prev) => prev.map((i) => i.id === showReminderModal.id ? { ...i, status: "overdue" } : i));
      setTimeout(() => { setShowReminderModal(null); setReminderResult(null); }, 2000);
    } else {
      const { error } = await res.json();
      alert(error ?? "Något gick fel.");
      setReminderResult("error");
    }
    setReminding(null);
  }, [showReminderModal, reminderFee]);

  const hasFilters = search || statusFilter || yearFilter;
  const canAct = (s: string) => s === "sent" || s === "overdue";

  return (
    <div className="space-y-4">
      {/* OVERDUE BANNER */}
      {overdue.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-red-800">
              {overdue.length} förfallen faktura{overdue.length > 1 ? "r" : ""} — totalt {formatSEK(overdueTotal)} utestående
            </p>
            <p className="text-sm text-red-600 mt-0.5">
              Dessa fakturor har passerat förfallodatum. Markera som betalda eller skicka påminnelse.
            </p>
          </div>
          <button
            onClick={() => setStatusFilter(statusFilter === "overdue" ? null : "overdue")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0 ${
              statusFilter === "overdue"
                ? "bg-red-600 text-white"
                : "bg-red-100 text-red-700 hover:bg-red-200"
            }`}
          >
            {statusFilter === "overdue" ? "Visa alla" : "Visa förfallna"}
          </button>
        </div>
      )}

      {/* Top bar */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fakturor</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {filtered.length !== invoices.length
              ? `${filtered.length} av ${invoices.length} fakturor`
              : `${invoices.length} fakturor`}
          </p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${view === "list" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              <List className="w-3.5 h-3.5" /> Lista
            </button>
            <button
              onClick={() => setView("archive")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${view === "archive" ? "bg-gray-900 text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}
            >
              <Archive className="w-3.5 h-3.5" /> Arkiv
            </button>
          </div>
          <Link href="/dashboard/invoices/new">
            <Button className="gap-2"><Plus className="w-4 h-4" /> Ny faktura</Button>
          </Link>
        </div>
      </div>

      {/* Search + filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Sök på kund, fakturanr, belopp, OCR..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-9 rounded-md border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-2.5 top-2.5 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <select
          value={statusFilter ?? ""}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="h-9 rounded-md border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Alla statusar</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{getInvoiceStatusLabel(s)}</option>
          ))}
        </select>
        <select
          value={yearFilter ?? ""}
          onChange={(e) => setYearFilter(e.target.value || null)}
          className="h-9 rounded-md border border-gray-200 px-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Alla år</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setStatusFilter(null); setYearFilter(null); }}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 underline"
          >
            <X className="w-3 h-3" /> Rensa
          </button>
        )}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-16 text-center">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {hasFilters ? "Ingen faktura hittades" : "Inga fakturor ännu"}
          </h3>
          <p className="text-gray-500 text-sm mb-6">
            {hasFilters ? "Prova att ändra sökningen eller filtret." : "Skapa din första faktura för att komma igång."}
          </p>
          {!hasFilters && (
            <Link href="/dashboard/invoices/new">
              <Button className="gap-2"><Plus className="w-4 h-4" /> Skapa faktura</Button>
            </Link>
          )}
        </div>
      )}

      {/* LIST VIEW */}
      {view === "list" && filtered.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Faktura</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Kund</th>
                <SortTh label="Datum" field="invoice_date" current={sortField} dir={sortDir} onSort={toggleSort} />
                <SortTh label="Förfall" field="due_date" current={sortField} dir={sortDir} onSort={toggleSort} />
                <SortTh label="Belopp" field="total" current={sortField} dir={sortDir} onSort={toggleSort} right />
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide text-right">Åtgärder</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((inv) => {
                const isOverdue = inv.status === "overdue";
                return (
                  <tr key={inv.id} className={`hover:bg-gray-50 transition-colors ${isOverdue ? "bg-red-50/40" : ""}`}>
                    <td className="px-5 py-3">
                      <Link href={`/dashboard/invoices/${inv.id}`} className="font-mono font-medium text-gray-900 hover:text-blue-600">
                        {inv.invoice_number}
                      </Link>
                      {inv.client_companies && <p className="text-xs text-gray-400">{inv.client_companies.name}</p>}
                    </td>
                    <td className="px-5 py-3 text-gray-700">
                      <SearchHighlight text={inv.customers?.name ?? "—"} query={search} />
                    </td>
                    <td className="px-5 py-3 text-gray-500">{formatDate(inv.invoice_date)}</td>
                    <td className={`px-5 py-3 ${isOverdue ? "text-red-600 font-medium" : "text-gray-500"}`}>
                      {formatDate(inv.due_date)}
                      {isOverdue && (
                        <p className="text-[10px] text-red-500">
                          {Math.floor((Date.now() - new Date(inv.due_date).getTime()) / 86400000)} dagar sen
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right font-medium tabular-nums">
                      <SearchHighlight text={formatSEK(inv.total)} query={search} />
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getInvoiceStatusColor(inv.status)}`}>
                        {getInvoiceStatusLabel(inv.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {canAct(inv.status) && (
                        <div className="flex gap-1.5 justify-end">
                          {/* Quick pay */}
                          <button
                            onClick={() => handleQuickPay(inv)}
                            disabled={paying === inv.id}
                            className="flex items-center gap-1 text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            title="Markera som betald"
                          >
                            {paying === inv.id
                              ? <Loader2 className="w-3 h-3 animate-spin" />
                              : <CheckCircle className="w-3 h-3" />}
                            Betald
                          </button>
                          {/* Remind — only if customer has email */}
                          {inv.customers?.email && (
                            <button
                              onClick={() => { setShowReminderModal(inv); setReminderResult(null); }}
                              className="flex items-center gap-1 text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 px-2.5 py-1.5 rounded-lg transition-colors"
                              title="Skicka påminnelse"
                            >
                              <Bell className="w-3 h-3" /> Påminnelse
                            </button>
                          )}
                        </div>
                      )}
                      {inv.status === "paid" && (
                        <span className="text-xs text-green-600 font-medium flex items-center gap-1 justify-end">
                          <CheckCircle className="w-3 h-3" /> Betald
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ARCHIVE VIEW */}
      {view === "archive" && filtered.length > 0 && (
        <div className="space-y-2">
          {Object.entries(archiveGrouped).sort(([a], [b]) => a.localeCompare(b, "sv")).map(([customer, custYears]) => {
            const custOpen = openCustomers.has(customer);
            const allInvoices = Object.values(custYears).flatMap((m) => Object.values(m).flatMap((d) => Object.values(d))).flat();
            const custTotal = allInvoices.reduce((s, i) => s + i.total, 0);
            const custOverdue = allInvoices.filter((i) => i.status === "overdue").length;
            return (
              <div key={customer} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setOpenCustomers(toggle(openCustomers, customer))}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {custOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    <span className="font-semibold text-gray-900">{customer}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{allInvoices.length} fakturor</span>
                    {custOverdue > 0 && (
                      <span className="text-xs bg-red-100 text-red-600 font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" /> {custOverdue} förfallen
                      </span>
                    )}
                  </div>
                  <span className="font-semibold text-gray-700 tabular-nums">{formatSEK(custTotal)}</span>
                </button>

                {custOpen && (
                  <div className="border-t border-gray-100">
                    {Object.entries(custYears).sort(([a], [b]) => Number(b) - Number(a)).map(([year, months]) => {
                      const yearKey = `${customer}::${year}`;
                      const yearOpen = openYears.has(yearKey);
                      const yearInvoices = Object.values(months).flatMap((d) => Object.values(d)).flat();
                      const yearTotal = yearInvoices.reduce((s, i) => s + i.total, 0);
                      return (
                        <div key={year}>
                          <button
                            onClick={() => setOpenYears(toggle(openYears, yearKey))}
                            className="w-full flex items-center justify-between px-8 py-2.5 hover:bg-gray-50 bg-gray-50/50 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              {yearOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                              <span className="font-medium text-gray-700">{year}</span>
                              <span className="text-xs text-gray-400">{yearInvoices.length} fakturor</span>
                            </div>
                            <span className="text-sm text-gray-500 tabular-nums">{formatSEK(yearTotal)}</span>
                          </button>

                          {yearOpen && Object.entries(months).sort(([a], [b]) => Number(b) - Number(a)).map(([month, days]) => {
                            const monthKey = `${customer}::${year}::${month}`;
                            const monthOpen = openMonths.has(monthKey);
                            const monthInvoices = Object.values(days).flat();
                            const monthTotal = monthInvoices.reduce((s, i) => s + i.total, 0);
                            return (
                              <div key={month}>
                                <button
                                  onClick={() => setOpenMonths(toggle(openMonths, monthKey))}
                                  className="w-full flex items-center justify-between px-12 py-2 hover:bg-blue-50/30 transition-colors"
                                >
                                  <div className="flex items-center gap-2">
                                    {monthOpen ? <ChevronDown className="w-3 h-3 text-gray-300" /> : <ChevronRight className="w-3 h-3 text-gray-300" />}
                                    <span className="text-sm text-gray-600">{MONTHS_SV[parseInt(month) - 1]}</span>
                                    <span className="text-xs text-gray-400">{monthInvoices.length} fakturor</span>
                                  </div>
                                  <span className="text-xs text-gray-400 tabular-nums">{formatSEK(monthTotal)}</span>
                                </button>

                                {monthOpen && (
                                  <div className="px-16 pb-2">
                                    {Object.entries(days).sort(([a], [b]) => Number(b) - Number(a)).map(([day, dayInvoices]) => (
                                      <div key={day}>
                                        <p className="text-[10px] text-gray-300 font-medium uppercase tracking-wide py-1.5 mt-1">
                                          {year}-{String(parseInt(month)).padStart(2, "0")}-{day}
                                        </p>
                                        <div className="space-y-1">
                                          {dayInvoices.map((inv) => (
                                            <div key={inv.id} className={`flex items-center justify-between px-3 py-2 rounded-lg border transition-colors ${inv.status === "overdue" ? "bg-red-50 border-red-100" : "border-transparent hover:bg-blue-50 hover:border-blue-100"}`}>
                                              <div className="flex items-center gap-3">
                                                <Link href={`/dashboard/invoices/${inv.id}`} className="font-mono text-sm font-medium text-blue-600 hover:underline">
                                                  {inv.invoice_number}
                                                </Link>
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getInvoiceStatusColor(inv.status)}`}>
                                                  {getInvoiceStatusLabel(inv.status)}
                                                </span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-gray-700 tabular-nums">{formatSEK(inv.total)}</span>
                                                {canAct(inv.status) && (
                                                  <button
                                                    onClick={() => handleQuickPay(inv)}
                                                    disabled={paying === inv.id}
                                                    className="text-[10px] font-semibold bg-green-100 text-green-700 hover:bg-green-200 px-2 py-1 rounded-md transition-colors disabled:opacity-50"
                                                  >
                                                    {paying === inv.id ? "..." : "Betald"}
                                                  </button>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* REMINDER MODAL */}
      {showReminderModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setShowReminderModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Skicka påminnelse</h3>
                <p className="text-sm text-gray-500">{showReminderModal.invoice_number} · {showReminderModal.customers?.name}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Fakturabelopp</span>
                <span className="font-medium">{formatSEK(showReminderModal.total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Påminnelseavgift</span>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">kr</span>
                  <input
                    type="number"
                    value={reminderFee}
                    onChange={(e) => setReminderFee(Number(e.target.value))}
                    min={0}
                    className="w-20 h-7 text-right text-sm border border-gray-200 rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>
              </div>
              <div className="border-t border-gray-200 pt-2 flex justify-between font-bold">
                <span>Totalt att betala</span>
                <span className="text-red-600">{formatSEK(showReminderModal.total + reminderFee)}</span>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-4">
              Ett påminnelsemail med "PÅMINNELSE" skickas till <strong>{showReminderModal.customers?.email}</strong>.
              Originalfakturan bifogas som PDF.
            </p>

            {reminderResult === "ok" && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3 mb-4 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Påminnelse skickad!
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={handleRemind}
                disabled={!!reminding || reminderResult === "ok"}
                className="flex-1 bg-amber-600 hover:bg-amber-700 gap-2"
              >
                {reminding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                Skicka påminnelse
              </Button>
              <Button variant="outline" onClick={() => setShowReminderModal(null)}>Avbryt</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SortTh({ label, field, current, dir, onSort, right }: {
  label: string; field: string; current: string; dir: "asc" | "desc";
  onSort: (f: any) => void; right?: boolean;
}) {
  const active = current === field;
  return (
    <th
      className={`${right ? "text-right" : "text-left"} px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer hover:text-gray-800 select-none`}
      onClick={() => onSort(field)}
    >
      <span className={`flex items-center gap-1 ${right ? "justify-end" : ""}`}>
        {right && label}
        <ChevronsUpDown className={`w-3 h-3 ${active ? "text-blue-600" : "text-gray-300"}`} />
        {!right && label}
      </span>
    </th>
  );
}

function SearchHighlight({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(query.toLowerCase().trim());
  if (idx === -1) return <>{text}</>;
  const q = query.trim();
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-gray-900 rounded-sm">{text.slice(idx, idx + q.length)}</mark>
      {text.slice(idx + q.length)}
    </>
  );
}
