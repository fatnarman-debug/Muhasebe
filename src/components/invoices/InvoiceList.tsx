"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Search, X, List, Archive, ChevronRight, ChevronDown, ChevronsUpDown } from "lucide-react";
import { formatSEK, formatDate, getInvoiceStatusLabel, getInvoiceStatusColor } from "@/lib/utils";

interface Invoice {
  id: string;
  invoice_number: string;
  invoice_date: string;
  due_date: string;
  total: number;
  status: string;
  ocr_number: string | null;
  customers: { id: string; name: string } | null;
  client_companies: { name: string } | null;
}

interface Props {
  invoices: Invoice[];
}

const STATUSES = ["draft", "sent", "paid", "overdue", "cancelled"];
const MONTHS_SV = ["Januari", "Februari", "Mars", "April", "Maj", "Juni", "Juli", "Augusti", "September", "Oktober", "November", "December"];

export function InvoiceList({ invoices }: Props) {
  const [view, setView] = useState<"list" | "archive">("list");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [yearFilter, setYearFilter] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"invoice_date" | "total" | "due_date">("invoice_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Archive expand state
  const [openCustomers, setOpenCustomers] = useState<Set<string>>(new Set());
  const [openYears, setOpenYears] = useState<Set<string>>(new Set());
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set());

  const years = useMemo(() => {
    const s = new Set(invoices.map((i) => i.invoice_date.slice(0, 4)));
    return Array.from(s).sort().reverse();
  }, [invoices]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return invoices.filter((inv) => {
      if (statusFilter && inv.status !== statusFilter) return false;
      if (yearFilter && !inv.invoice_date.startsWith(yearFilter)) return false;
      if (!q) return true;
      const customer = inv.customers?.name ?? "";
      const company = inv.client_companies?.name ?? "";
      const amount = inv.total.toString();
      const amountFmt = formatSEK(inv.total).replace(/\s/g, "").toLowerCase();
      return (
        inv.invoice_number.toLowerCase().includes(q) ||
        customer.toLowerCase().includes(q) ||
        company.toLowerCase().includes(q) ||
        amount.includes(q) ||
        amountFmt.includes(q) ||
        inv.invoice_date.includes(q) ||
        (inv.ocr_number ?? "").includes(q)
      );
    });
  }, [invoices, search, statusFilter, yearFilter]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let va: number | string = a[sortField];
      let vb: number | string = b[sortField];
      if (typeof va === "string") va = va.toLowerCase();
      if (typeof vb === "string") vb = vb.toLowerCase();
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortField, sortDir]);

  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortDir((d) => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  }

  // Archive grouped structure
  const archiveGrouped = useMemo(() => {
    const map: Record<string, Record<string, Record<string, Record<string, Invoice[]>>>> = {};
    filtered.forEach((inv) => {
      const cust = inv.customers?.name ?? "Okänd kund";
      const [year, monthStr] = inv.invoice_date.split("-");
      const month = String(parseInt(monthStr));
      const day = inv.invoice_date.split("-")[2];
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

  const hasFilters = search || statusFilter || yearFilter;

  return (
    <div className="space-y-4">
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
        {/* Search */}
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

        {/* Status filter */}
        <select
          value={statusFilter ?? ""}
          onChange={(e) => setStatusFilter(e.target.value || null)}
          className="h-9 rounded-md border border-gray-200 px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Alla statusar</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{getInvoiceStatusLabel(s)}</option>
          ))}
        </select>

        {/* Year filter */}
        <select
          value={yearFilter ?? ""}
          onChange={(e) => setYearFilter(e.target.value || null)}
          className="h-9 rounded-md border border-gray-200 px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Alla år</option>
          {years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>

        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setStatusFilter(null); setYearFilter(null); }}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 underline"
          >
            <X className="w-3 h-3" /> Rensa filter
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
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sorted.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <Link href={`/dashboard/invoices/${inv.id}`} className="font-mono font-medium text-gray-900 hover:text-blue-600">
                      {inv.invoice_number}
                    </Link>
                    {inv.client_companies && <p className="text-xs text-gray-400">{inv.client_companies.name}</p>}
                  </td>
                  <td className="px-5 py-3.5 text-gray-700">
                    <SearchHighlight text={inv.customers?.name ?? "—"} query={search} />
                  </td>
                  <td className="px-5 py-3.5 text-gray-500">{formatDate(inv.invoice_date)}</td>
                  <td className="px-5 py-3.5 text-gray-500">{formatDate(inv.due_date)}</td>
                  <td className="px-5 py-3.5 text-right font-medium tabular-nums">
                    <SearchHighlight text={formatSEK(inv.total)} query={search} />
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getInvoiceStatusColor(inv.status)}`}>
                      {getInvoiceStatusLabel(inv.status)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length > 20 && (
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 text-xs text-gray-400 text-center">
              Visar {sorted.length} fakturor
            </div>
          )}
        </div>
      )}

      {/* ARCHIVE VIEW */}
      {view === "archive" && filtered.length > 0 && (
        <div className="space-y-2">
          {Object.entries(archiveGrouped).sort(([a], [b]) => a.localeCompare(b, "sv")).map(([customer, years]) => {
            const custOpen = openCustomers.has(customer);
            const custTotal = Object.values(years).flatMap(m => Object.values(m).flatMap(d => Object.values(d))).flat().reduce((s, i) => s + i.total, 0);
            const custCount = Object.values(years).flatMap(m => Object.values(m).flatMap(d => Object.values(d))).flat().length;
            return (
              <div key={customer} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Customer header */}
                <button
                  onClick={() => setOpenCustomers(toggle(openCustomers, customer))}
                  className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    {custOpen ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
                    <span className="font-semibold text-gray-900">{customer}</span>
                    <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{custCount} fakturor</span>
                  </div>
                  <span className="font-semibold text-gray-700 tabular-nums">{formatSEK(custTotal)}</span>
                </button>

                {custOpen && (
                  <div className="border-t border-gray-100">
                    {Object.entries(years).sort(([a], [b]) => Number(b) - Number(a)).map(([year, months]) => {
                      const yearKey = `${customer}::${year}`;
                      const yearOpen = openYears.has(yearKey);
                      const yearTotal = Object.values(months).flatMap(d => Object.values(d)).flat().reduce((s, i) => s + i.total, 0);
                      const yearCount = Object.values(months).flatMap(d => Object.values(d)).flat().length;
                      return (
                        <div key={year}>
                          <button
                            onClick={() => setOpenYears(toggle(openYears, yearKey))}
                            className="w-full flex items-center justify-between px-8 py-2.5 hover:bg-gray-50 transition-colors bg-gray-50/50"
                          >
                            <div className="flex items-center gap-2">
                              {yearOpen ? <ChevronDown className="w-3.5 h-3.5 text-gray-400" /> : <ChevronRight className="w-3.5 h-3.5 text-gray-400" />}
                              <span className="font-medium text-gray-700">{year}</span>
                              <span className="text-xs text-gray-400">{yearCount} fakturor</span>
                            </div>
                            <span className="text-sm text-gray-500 tabular-nums">{formatSEK(yearTotal)}</span>
                          </button>

                          {yearOpen && (
                            <div>
                              {Object.entries(months).sort(([a], [b]) => Number(b) - Number(a)).map(([month, days]) => {
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
                                                <Link
                                                  key={inv.id}
                                                  href={`/dashboard/invoices/${inv.id}`}
                                                  className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-colors group"
                                                >
                                                  <div className="flex items-center gap-3">
                                                    <span className="font-mono text-sm font-medium text-blue-600 group-hover:text-blue-700">
                                                      {inv.invoice_number}
                                                    </span>
                                                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getInvoiceStatusColor(inv.status)}`}>
                                                      {getInvoiceStatusLabel(inv.status)}
                                                    </span>
                                                  </div>
                                                  <span className="text-sm font-medium text-gray-700 tabular-nums">{formatSEK(inv.total)}</span>
                                                </Link>
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
                          )}
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
      <span className="flex items-center gap-1 justify-end">
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
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-yellow-200 text-gray-900 rounded-sm">{text.slice(idx, idx + query.trim().length)}</mark>
      {text.slice(idx + query.trim().length)}
    </>
  );
}
