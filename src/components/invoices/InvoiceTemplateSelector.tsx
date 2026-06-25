"use client";

import { useState } from "react";
import { Eye, X } from "lucide-react";
import { SampleInvoice } from "./InvoiceSamplePreview";

interface Props {
  value: string;
  onChange: (template: string) => void;
}

type TemplateConfig = {
  id: string;
  name: string;
  category: "Klasik" | "Modern";
  preview: React.ReactNode;
};

// ─── Mini preview renderers (pure CSS, no images) ─────────────────────────

function PreviewKlasikStandart() {
  return (
    <div className="w-full h-full bg-white p-2 flex flex-col gap-1">
      <div className="flex justify-between items-start mb-1">
        <div className="space-y-0.5">
          <div className="w-10 h-1.5 bg-gray-800 rounded-sm" />
          <div className="w-7 h-0.5 bg-gray-300 rounded-sm" />
          <div className="w-8 h-0.5 bg-gray-300 rounded-sm" />
        </div>
        <div className="text-right">
          <div className="text-[5px] font-serif font-bold text-gray-800 tracking-widest">FAKTURA</div>
          <div className="w-8 h-1 bg-gray-100 rounded mt-0.5 ml-auto" />
        </div>
      </div>
      <div className="h-px bg-gray-200 w-full" />
      <div className="flex justify-between mt-0.5">
        <div className="space-y-0.5">
          <div className="w-6 h-0.5 bg-gray-400 rounded" />
          <div className="w-9 h-1 bg-gray-700 rounded" />
          <div className="w-7 h-0.5 bg-gray-300 rounded" />
        </div>
        <div className="space-y-0.5 text-right">
          <div className="flex gap-1 justify-end">
            <div className="w-5 h-0.5 bg-gray-300 rounded" />
            <div className="w-4 h-0.5 bg-gray-500 rounded" />
          </div>
          <div className="flex gap-1 justify-end">
            <div className="w-5 h-0.5 bg-gray-300 rounded" />
            <div className="w-4 h-0.5 bg-gray-500 rounded" />
          </div>
        </div>
      </div>
      <div className="mt-1 border border-gray-200 rounded overflow-hidden">
        <div className="bg-gray-50 flex gap-1 px-1 py-0.5">
          <div className="flex-1 h-0.5 bg-gray-300 rounded" />
          <div className="w-3 h-0.5 bg-gray-300 rounded" />
          <div className="w-3 h-0.5 bg-gray-300 rounded" />
        </div>
        {[1,2,3].map(i => (
          <div key={i} className="flex gap-1 px-1 py-0.5 border-t border-gray-100">
            <div className="flex-1 h-0.5 bg-gray-200 rounded" />
            <div className="w-3 h-0.5 bg-gray-200 rounded" />
            <div className="w-3 h-0.5 bg-gray-400 rounded" />
          </div>
        ))}
      </div>
      <div className="flex justify-end mt-0.5">
        <div className="space-y-0.5">
          <div className="flex gap-1">
            <div className="w-6 h-0.5 bg-gray-300 rounded" />
            <div className="w-4 h-0.5 bg-gray-500 rounded" />
          </div>
          <div className="flex gap-1">
            <div className="w-6 h-0.5 bg-gray-400 rounded" />
            <div className="w-4 h-1 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewKlasikMinimal() {
  return (
    <div className="w-full h-full bg-white p-3 flex flex-col gap-2">
      <div className="text-[6px] font-medium text-gray-400 tracking-[0.15em] uppercase">Faktura</div>
      <div className="w-8 h-0.5 bg-gray-800" />
      <div className="flex justify-between mt-1">
        <div className="space-y-0.5">
          <div className="w-9 h-1 bg-gray-700 rounded" />
          <div className="w-6 h-0.5 bg-gray-300 rounded" />
        </div>
        <div className="space-y-0.5 text-right">
          <div className="w-7 h-0.5 bg-gray-300 rounded ml-auto" />
          <div className="w-5 h-0.5 bg-gray-200 rounded ml-auto" />
        </div>
      </div>
      <div className="flex-1 mt-1 space-y-1">
        {[1,2,3].map(i => (
          <div key={i} className="flex justify-between py-0.5 border-b border-gray-100">
            <div className="w-10 h-0.5 bg-gray-200 rounded" />
            <div className="w-4 h-0.5 bg-gray-400 rounded" />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <div className="w-8 h-1 bg-gray-900 rounded" />
      </div>
    </div>
  );
}

function PreviewKlasikProfesyonel() {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="flex h-8">
        <div className="w-1/3 bg-gray-100 p-1.5 flex flex-col justify-center gap-0.5">
          <div className="w-8 h-2 bg-gray-300 rounded" />
          <div className="w-5 h-0.5 bg-gray-400 rounded" />
        </div>
        <div className="flex-1 p-1.5 flex flex-col justify-center items-end gap-0.5">
          <div className="text-[5px] font-bold text-gray-800 tracking-wider">FAKTURA</div>
          <div className="w-7 h-0.5 bg-gray-300 rounded" />
        </div>
      </div>
      <div className="p-1.5 space-y-1 flex-1">
        <div className="flex justify-between">
          <div className="space-y-0.5">
            <div className="w-4 h-0.5 bg-gray-300 rounded" />
            <div className="w-7 h-1 bg-gray-700 rounded" />
          </div>
          <div className="space-y-0.5">
            <div className="flex gap-0.5">
              <div className="w-4 h-0.5 bg-gray-300 rounded" />
              <div className="w-3 h-0.5 bg-gray-500 rounded" />
            </div>
            <div className="flex gap-0.5">
              <div className="w-4 h-0.5 bg-gray-300 rounded" />
              <div className="w-3 h-0.5 bg-gray-500 rounded" />
            </div>
          </div>
        </div>
        <div className="border border-gray-200 rounded overflow-hidden">
          <div className="bg-gray-800 px-1 py-0.5 flex gap-1">
            <div className="flex-1 h-0.5 bg-gray-500 rounded" />
            <div className="w-3 h-0.5 bg-gray-500 rounded" />
          </div>
          {[1,2].map(i => (
            <div key={i} className="flex gap-1 px-1 py-0.5 border-t border-gray-100">
              <div className="flex-1 h-0.5 bg-gray-200 rounded" />
              <div className="w-3 h-0.5 bg-gray-400 rounded" />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <div className="w-7 h-1 bg-gray-900 rounded" />
        </div>
      </div>
    </div>
  );
}

function PreviewKlasikCorporate() {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-gray-900 px-2 py-1.5 flex justify-between items-center">
        <div className="space-y-0.5">
          <div className="w-8 h-1.5 bg-white rounded-sm opacity-90" />
          <div className="w-5 h-0.5 bg-gray-400 rounded" />
        </div>
        <div className="text-right">
          <div className="text-[5px] font-bold text-white tracking-[0.2em]">FAKTURA</div>
          <div className="w-6 h-0.5 bg-gray-500 rounded mt-0.5 ml-auto" />
        </div>
      </div>
      <div className="p-1.5 flex-1 space-y-1">
        <div className="flex justify-between">
          <div className="space-y-0.5">
            <div className="w-5 h-0.5 bg-gray-400 rounded" />
            <div className="w-8 h-1 bg-gray-800 rounded" />
          </div>
          <div className="space-y-0.5 text-right">
            <div className="w-6 h-0.5 bg-gray-300 rounded ml-auto" />
            <div className="w-4 h-0.5 bg-gray-300 rounded ml-auto" />
          </div>
        </div>
        <div className="border border-gray-300 rounded overflow-hidden">
          <div className="bg-gray-200 px-1 py-0.5 flex gap-1">
            <div className="flex-1 h-0.5 bg-gray-400 rounded" />
            <div className="w-3 h-0.5 bg-gray-400 rounded" />
            <div className="w-3 h-0.5 bg-gray-400 rounded" />
          </div>
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-1 px-1 py-0.5 border-t border-gray-200">
              <div className="flex-1 h-0.5 bg-gray-200 rounded" />
              <div className="w-3 h-0.5 bg-gray-200 rounded" />
              <div className="w-3 h-0.5 bg-gray-500 rounded" />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <div className="bg-gray-900 px-1.5 py-0.5 rounded">
            <div className="w-6 h-0.5 bg-white rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewKlasikClean() {
  return (
    <div className="w-full h-full bg-gray-50 p-1.5 flex flex-col gap-1">
      <div className="bg-white rounded p-1.5 flex justify-between items-start">
        <div className="space-y-0.5">
          <div className="w-8 h-1.5 bg-gray-700 rounded" />
          <div className="w-5 h-0.5 bg-gray-300 rounded" />
        </div>
        <div className="text-[5px] font-medium text-gray-500 tracking-wide">FAKTURA</div>
      </div>
      <div className="bg-white rounded p-1.5 flex-1 space-y-0.5">
        {[1,2,3].map(i => (
          <div key={i} className="flex justify-between bg-gray-50 rounded px-1 py-0.5">
            <div className="w-8 h-0.5 bg-gray-300 rounded" />
            <div className="w-3 h-0.5 bg-gray-500 rounded" />
          </div>
        ))}
      </div>
      <div className="bg-white rounded px-1.5 py-1 flex justify-end">
        <div className="flex gap-1 items-center">
          <div className="w-5 h-0.5 bg-gray-400 rounded" />
          <div className="w-4 h-1 bg-gray-800 rounded" />
        </div>
      </div>
    </div>
  );
}

function PreviewModernColorful() {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-teal-600 px-2 py-1.5">
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <div className="w-8 h-1.5 bg-white rounded opacity-95" />
            <div className="w-5 h-0.5 bg-teal-300 rounded" />
          </div>
          <div className="text-right">
            <div className="text-[5px] font-bold text-white tracking-widest">FAKTURA</div>
            <div className="w-6 h-1 bg-teal-400 rounded mt-0.5 ml-auto" />
          </div>
        </div>
      </div>
      <div className="p-1.5 flex-1 space-y-1">
        <div className="flex justify-between">
          <div className="space-y-0.5">
            <div className="w-4 h-0.5 bg-teal-400 rounded" />
            <div className="w-7 h-1 bg-gray-700 rounded" />
          </div>
          <div className="space-y-0.5">
            <div className="flex gap-0.5">
              <div className="w-4 h-0.5 bg-gray-300 rounded" />
              <div className="w-3 h-0.5 bg-gray-600 rounded" />
            </div>
            <div className="flex gap-0.5">
              <div className="w-4 h-0.5 bg-gray-300 rounded" />
              <div className="w-3 h-0.5 bg-gray-600 rounded" />
            </div>
          </div>
        </div>
        <div className="rounded overflow-hidden border border-gray-100">
          <div className="bg-teal-50 border-b border-teal-100 px-1 py-0.5 flex gap-1">
            <div className="flex-1 h-0.5 bg-teal-300 rounded" />
            <div className="w-3 h-0.5 bg-teal-300 rounded" />
          </div>
          {[1,2].map(i => (
            <div key={i} className="flex gap-1 px-1 py-0.5 border-t border-gray-50">
              <div className="flex-1 h-0.5 bg-gray-200 rounded" />
              <div className="w-3 h-0.5 bg-gray-400 rounded" />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <div className="bg-teal-600 px-1.5 py-0.5 rounded">
            <div className="w-5 h-0.5 bg-white rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewModernGradient() {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div
        className="px-2 py-1.5"
        style={{ background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" }}
      >
        <div className="flex justify-between items-center">
          <div className="space-y-0.5">
            <div className="w-9 h-2 bg-white rounded opacity-90" />
            <div className="w-6 h-0.5 bg-purple-300 rounded" />
          </div>
          <div className="text-[5px] font-bold text-white tracking-[0.2em]">FAKTURA</div>
        </div>
        <div className="mt-1 flex gap-2">
          <div className="space-y-0.5">
            <div className="w-4 h-0.5 bg-purple-300 rounded" />
            <div className="w-6 h-0.5 bg-white opacity-70 rounded" />
          </div>
          <div className="space-y-0.5">
            <div className="w-4 h-0.5 bg-purple-300 rounded" />
            <div className="w-5 h-0.5 bg-white opacity-70 rounded" />
          </div>
        </div>
      </div>
      <div className="p-1.5 flex-1 space-y-1">
        <div className="flex justify-between">
          <div className="w-6 h-0.5 bg-gray-300 rounded" />
          <div className="w-7 h-1 bg-gray-700 rounded" />
        </div>
        {[1,2,3].map(i => (
          <div key={i} className="flex gap-1 py-0.5 border-b border-gray-100">
            <div className="flex-1 h-0.5 bg-gray-200 rounded" />
            <div className="w-3 h-0.5 bg-purple-400 rounded" />
          </div>
        ))}
        <div className="flex justify-end">
          <div
            className="px-1.5 py-0.5 rounded"
            style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)" }}
          >
            <div className="w-5 h-0.5 bg-white rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewModernBold() {
  return (
    <div className="w-full h-full bg-white flex flex-col">
      <div className="bg-slate-900 px-2 py-2">
        <div className="text-[7px] font-black text-white tracking-wide leading-none mb-1">FAKTURA</div>
        <div className="flex justify-between items-end">
          <div className="space-y-0.5">
            <div className="w-9 h-1.5 bg-white rounded opacity-80" />
            <div className="w-5 h-0.5 bg-slate-500 rounded" />
          </div>
          <div className="text-right space-y-0.5">
            <div className="w-7 h-1 bg-teal-400 rounded" />
            <div className="w-5 h-0.5 bg-slate-600 rounded ml-auto" />
          </div>
        </div>
      </div>
      <div className="p-1.5 flex-1 space-y-1">
        <div className="flex justify-between">
          <div className="space-y-0.5">
            <div className="w-4 h-0.5 bg-slate-300 rounded" />
            <div className="w-7 h-1 bg-slate-800 rounded" />
          </div>
        </div>
        <div className="border-l-2 border-teal-500 pl-1 space-y-0.5">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-1">
              <div className="flex-1 h-0.5 bg-gray-200 rounded" />
              <div className="w-3 h-0.5 bg-slate-700 rounded" />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <div className="bg-teal-500 px-1.5 py-0.5 rounded">
            <div className="w-6 h-0.5 bg-white rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewModernTech() {
  return (
    <div className="w-full h-full bg-gray-950 p-1.5 flex flex-col gap-1">
      <div className="flex justify-between items-start">
        <div className="space-y-0.5">
          <div className="w-2 h-2 border border-green-400 rounded-sm flex items-center justify-center">
            <div className="w-1 h-1 bg-green-400 rounded-sm" />
          </div>
          <div className="w-7 h-0.5 bg-gray-600 rounded font-mono" />
        </div>
        <div className="text-right">
          <div className="text-[4px] font-mono text-green-400 tracking-widest">INVOICE</div>
          <div className="w-8 h-0.5 bg-green-900 rounded mt-0.5" />
        </div>
      </div>
      <div className="border border-gray-700 rounded flex-1 overflow-hidden">
        <div className="bg-gray-800 px-1 py-0.5 border-b border-gray-700 flex gap-1">
          <div className="w-0.5 h-0.5 bg-green-400 rounded-full mt-0.5" />
          <div className="flex-1 h-0.5 bg-gray-600 rounded" />
          <div className="w-4 h-0.5 bg-green-600 rounded" />
        </div>
        {[1,2,3].map(i => (
          <div key={i} className="flex gap-1 px-1 py-0.5 border-b border-gray-800">
            <div className="flex-1 h-0.5 bg-gray-700 rounded" />
            <div className="w-4 h-0.5 bg-green-700 rounded" />
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <div className="border border-green-500 px-1 py-0.5 rounded">
          <div className="text-[4px] font-mono text-green-400">TOTAL</div>
        </div>
      </div>
    </div>
  );
}

function PreviewModernCreative() {
  return (
    <div className="w-full h-full bg-white flex overflow-hidden">
      <div className="w-5 bg-orange-500 flex flex-col justify-between py-1.5 px-1">
        <div
          className="text-[4px] font-black text-white whitespace-nowrap"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", letterSpacing: "0.1em" }}
        >
          FAKTURA
        </div>
        <div className="space-y-0.5">
          <div className="w-full h-0.5 bg-orange-300 rounded" />
          <div className="w-3/4 h-0.5 bg-orange-200 rounded" />
        </div>
      </div>
      <div className="flex-1 p-1.5 flex flex-col gap-1">
        <div className="flex justify-between items-start">
          <div className="space-y-0.5">
            <div className="w-8 h-1.5 bg-gray-800 rounded" />
            <div className="w-5 h-0.5 bg-gray-300 rounded" />
          </div>
          <div className="w-6 h-1 bg-orange-100 rounded" />
        </div>
        <div className="flex-1 space-y-0.5">
          {[1,2,3].map(i => (
            <div key={i} className="flex gap-1 py-0.5 border-b border-gray-100">
              <div className="flex-1 h-0.5 bg-gray-200 rounded" />
              <div className="w-3 h-0.5 bg-orange-500 rounded" />
            </div>
          ))}
        </div>
        <div className="flex justify-end">
          <div className="bg-orange-500 px-1.5 py-0.5 rounded">
            <div className="w-4 h-0.5 bg-white rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Template definitions ──────────────────────────────────────────────────

const TEMPLATES: TemplateConfig[] = [
  { id: "klasik-standart",    name: "Standart",    category: "Klasik", preview: <PreviewKlasikStandart /> },
  { id: "klasik-minimal",     name: "Minimal",     category: "Klasik", preview: <PreviewKlasikMinimal /> },
  { id: "klasik-profesyonel", name: "Profesyonel", category: "Klasik", preview: <PreviewKlasikProfesyonel /> },
  { id: "klasik-corporate",   name: "Corporate",   category: "Klasik", preview: <PreviewKlasikCorporate /> },
  { id: "klasik-clean",       name: "Clean",       category: "Klasik", preview: <PreviewKlasikClean /> },
  { id: "modern-colorful",    name: "Colorful",    category: "Modern", preview: <PreviewModernColorful /> },
  { id: "modern-gradient",    name: "Gradient",    category: "Modern", preview: <PreviewModernGradient /> },
  { id: "modern-bold",        name: "Bold",        category: "Modern", preview: <PreviewModernBold /> },
  { id: "modern-tech",        name: "Tech",        category: "Modern", preview: <PreviewModernTech /> },
  { id: "modern-creative",    name: "Creative",    category: "Modern", preview: <PreviewModernCreative /> },
];

// ─── Main component ────────────────────────────────────────────────────────

export function InvoiceTemplateSelector({ value, onChange }: Props) {
  const klasikTemplates = TEMPLATES.filter((t) => t.category === "Klasik");
  const modernTemplates = TEMPLATES.filter((t) => t.category === "Modern");
  const [previewId, setPreviewId] = useState<string | null>(null);
  const previewTpl = TEMPLATES.find((t) => t.id === previewId);

  function renderGroup(label: string, templates: TemplateConfig[]) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{label}</span>
          <div className="flex-1 h-px bg-gray-100" />
        </div>
        <div className="grid grid-cols-5 gap-3">
          {templates.map((tpl) => {
            const selected = value === tpl.id;
            return (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onChange(tpl.id)}
                className={[
                  "group relative flex flex-col rounded-xl overflow-hidden transition-all duration-150",
                  "border-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
                  selected
                    ? "border-teal-600 shadow-md shadow-teal-100"
                    : "border-gray-200 hover:border-gray-300 hover:shadow-sm",
                ].join(" ")}
              >
                {/* Preview thumbnail */}
                <div
                  className="relative w-full overflow-hidden bg-gray-50"
                  style={{ aspectRatio: "3/4" }}
                >
                  <div className="absolute inset-0 scale-100">
                    {tpl.preview}
                  </div>
                  {/* Önizleme (popup) butonu */}
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => { e.stopPropagation(); setPreviewId(tpl.id); }}
                    onKeyDown={(e) => { if (e.key === "Enter") { e.stopPropagation(); setPreviewId(tpl.id); } }}
                    className="absolute bottom-1 left-1 flex items-center gap-1 px-1.5 py-1 rounded-md bg-white/90 backdrop-blur border border-gray-200 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity hover:text-gray-900 cursor-pointer shadow-sm"
                  >
                    <Eye className="w-3 h-3" />
                    <span className="text-[9px] font-semibold">Önizle</span>
                  </span>
                  {/* Selected checkmark */}
                  {selected && (
                    <div className="absolute top-1 right-1 w-4 h-4 bg-teal-600 rounded-full flex items-center justify-center shadow">
                      <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  )}
                </div>
                {/* Label row */}
                <div className={[
                  "px-2 py-1.5 flex flex-col gap-0.5 text-left transition-colors",
                  selected ? "bg-teal-50" : "bg-white group-hover:bg-gray-50",
                ].join(" ")}>
                  <span className={[
                    "text-[11px] font-semibold leading-tight truncate",
                    selected ? "text-teal-700" : "text-gray-800",
                  ].join(" ")}>
                    {tpl.name}
                  </span>
                  <span className={[
                    "text-[9px] font-medium uppercase tracking-wide",
                    tpl.category === "Klasik" ? "text-slate-400" : "text-indigo-400",
                    selected && tpl.category === "Klasik" ? "text-teal-500" : "",
                    selected && tpl.category === "Modern" ? "text-teal-500" : "",
                  ].join(" ")}>
                    {tpl.category}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {renderGroup("Klasik", klasikTemplates)}
      {renderGroup("Modern", modernTemplates)}

      {/* Önizleme popup */}
      {previewTpl && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          onClick={() => setPreviewId(null)}
        >
          <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" />
          <div
            className="relative bg-gray-100 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 bg-white shrink-0">
              <div>
                <h3 className="text-sm font-bold text-gray-900">{previewTpl.name}</h3>
                <p className="text-[11px] text-gray-400 uppercase tracking-wide">{previewTpl.category} · Exempelfaktura</p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewId(null)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Fatura örneği */}
            <div className="overflow-y-auto p-5 bg-gray-100">
              <div className="mx-auto max-w-[640px] rounded-xl overflow-hidden shadow-lg ring-1 ring-black/5 bg-white">
                <SampleInvoice templateId={previewTpl.id} />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-200 bg-white shrink-0">
              <button
                type="button"
                onClick={() => setPreviewId(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Stäng
              </button>
              <button
                type="button"
                onClick={() => { onChange(previewTpl.id); setPreviewId(null); }}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-teal-600 hover:bg-teal-700 transition-colors"
              >
                {value === previewTpl.id ? "Vald mall ✓" : "Välj denna mall"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
