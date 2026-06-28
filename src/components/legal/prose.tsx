import type { ReactNode } from "react";

// Delade, läsbara byggstenar för juridiska sidor (svenska).

export const H1 = ({ children }: { children: ReactNode }) => (
  <h1 className="text-3xl font-bold tracking-tight text-slate-900">{children}</h1>
);

export const Updated = ({ children }: { children: ReactNode }) => (
  <p className="text-sm text-slate-400 mt-2 mb-8">{children}</p>
);

export const H2 = ({ children }: { children: ReactNode }) => (
  <h2 className="text-xl font-semibold text-slate-900 mt-10 mb-3">{children}</h2>
);

export const H3 = ({ children }: { children: ReactNode }) => (
  <h3 className="text-base font-semibold text-slate-800 mt-6 mb-2">{children}</h3>
);

export const P = ({ children }: { children: ReactNode }) => (
  <p className="text-slate-600 leading-relaxed mb-4">{children}</p>
);

export const UL = ({ children }: { children: ReactNode }) => (
  <ul className="list-disc pl-5 space-y-1.5 text-slate-600 mb-4 leading-relaxed">{children}</ul>
);

export const Draft = () => (
  <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 mb-8">
    <strong>Utkast.</strong> Detta dokument är ett utkast som ska granskas av en jurist innan publicering.
    Fält inom [hakparentes] måste fyllas i med era riktiga uppgifter.
  </div>
);
