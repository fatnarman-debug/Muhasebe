"use client";

import { useState, useCallback } from "react";

const M = ({ name, fill = false, size = 18 }: { name: string; fill?: boolean; size?: number }) => (
  <span className="material-symbols-outlined select-none leading-none"
    style={{ fontVariationSettings: `'FILL' ${fill ? 1 : 0},'wght' 400,'GRAD' 0,'opsz' ${size}`, fontSize: size }}>
    {name}
  </span>
);

// ── Types ──────────────────────────────────────────────────────────────
type VatRate = 25 | 12 | 6 | 0;
type FakturaRow = { id: string; beskrivning: string; antal: number; apris: number; momssats: VatRate };
type RotRutTyp = "ROT" | "RUT" | "Grönt" | "";
type FakturaStatus = "Utkast" | "Skickad" | "Betald" | "Försenad" | "Kreditnota";

type Faktura = {
  id: string; nummer: string; kund: string; kundOrgNr: string; datum: string;
  forfallodatum: string; belopp: number; moms: number; attBetala: number;
  status: FakturaStatus; rotRutTyp: RotRutTyp; avdrag: number; konsult: string;
};

// ── Sample data ────────────────────────────────────────────────────────
const SAMPLE_FAKTUROR: Faktura[] = [
  { id:"1", nummer:"FKT-2026-012", kund:"AB Logistik Nord",   kundOrgNr:"556701-2345", datum:"20 jun 2026", forfallodatum:"20 jul 2026", belopp:45000,  moms:11250, attBetala:56250,  status:"Betald",   rotRutTyp:"",    avdrag:0,     konsult:"Erik Lindström" },
  { id:"2", nummer:"FKT-2026-011", kund:"Bygg & Teknik AB",   kundOrgNr:"556702-8823", datum:"18 jun 2026", forfallodatum:"18 jul 2026", belopp:28500,  moms:7125,  attBetala:24225,  status:"Skickad",  rotRutTyp:"ROT", avdrag:11400, konsult:"Erik Lindström" },
  { id:"3", nummer:"FKT-2026-010", kund:"Svensson & Son AB",  kundOrgNr:"556703-4412", datum:"15 jun 2026", forfallodatum:"15 jul 2026", belopp:12000,  moms:3000,  attBetala:15000,  status:"Försenad", rotRutTyp:"",    avdrag:0,     konsult:"Erik Lindström" },
  { id:"4", nummer:"FKT-2026-009", kund:"Nordtech Solutions", kundOrgNr:"556704-9901", datum:"14 jun 2026", forfallodatum:"14 jul 2026", belopp:67500,  moms:16875, attBetala:84375,  status:"Betald",   rotRutTyp:"",    avdrag:0,     konsult:"Anna Svensson"  },
  { id:"5", nummer:"FKT-2026-008", kund:"Malmö Konsult AB",   kundOrgNr:"556705-3312", datum:"12 jun 2026", forfallodatum:"12 jul 2026", belopp:34000,  moms:8500,  attBetala:38300,  status:"Skickad",  rotRutTyp:"RUT", avdrag:4200,  konsult:"Anna Svensson"  },
  { id:"6", nummer:"FKT-2026-007", kund:"Göteborg Handel AB", kundOrgNr:"556706-7740", datum:"10 jun 2026", forfallodatum:"10 jul 2026", belopp:19800,  moms:4950,  attBetala:24750,  status:"Utkast",   rotRutTyp:"",    avdrag:0,     konsult:"Anna Svensson"  },
  { id:"7", nummer:"FKT-2026-006", kund:"Stockholms Bygg AB", kundOrgNr:"556707-1198", datum:"8 jun 2026",  forfallodatum:"8 jul 2026",  belopp:52000,  moms:13000, attBetala:65000,  status:"Betald",   rotRutTyp:"ROT", avdrag:0,     konsult:"Lars Johansson" },
];

const KUNDER_LIST = [
  "AB Logistik Nord","Bygg & Teknik AB","Svensson & Son AB","Nordtech Solutions AB",
  "Malmö Konsult AB","Göteborg Handel AB","Stockholms Bygg AB","Sverige Transport AB",
  "Arkitektbyrån AB","Hälso & Vård AB","Energi Solutions AB","Nordic Travel AB",
];

const KONSULTER_LIST = ["Erik Lindström","Anna Svensson","Lars Johansson","Sara Björk"];

// ── Helpers ────────────────────────────────────────────────────────────
const fmtSEK = (v: number) => new Intl.NumberFormat("sv-SE", { style: "currency", currency: "SEK", maximumFractionDigits: 0 }).format(v);
const calcRow = (r: FakturaRow) => ({ exkl: r.antal * r.apris, moms: r.antal * r.apris * r.momssats / 100 });

const STATUS_STYLE: Record<FakturaStatus, [string,string]> = {
  "Utkast":     ["#f3f4f6","#6b7280"],
  "Skickad":    ["#dbeafe","#1d4ed8"],
  "Betald":     ["#dcfce7","#15803d"],
  "Försenad":   ["#fee2e2","#dc2626"],
  "Kreditnota": ["#fce7f3","#9d174d"],
};

function StatusBadge({ s }: { s: FakturaStatus }) {
  const [bg, color] = STATUS_STYLE[s];
  return <span style={{ background: bg, color, padding:"3px 10px", borderRadius:9999, fontSize:12, fontWeight:600 }}>{s}</span>;
}

const card: React.CSSProperties = { background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, boxShadow:"0 1px 3px rgba(0,0,0,0.05)" };
const inp: React.CSSProperties  = { width:"100%", border:"1px solid #e5e7eb", borderRadius:8, padding:"9px 12px", fontSize:13, color:"#111827", background:"#fff", outline:"none" };
const lbl: React.CSSProperties  = { fontSize:11, fontWeight:600, color:"#6b7280", textTransform:"uppercase" as const, letterSpacing:"0.06em", display:"block", marginBottom:5 };
const sec: React.CSSProperties  = { padding:"20px 24px", borderBottom:"1px solid #f3f4f6" };
const secTitle: React.CSSProperties = { fontSize:13, fontWeight:700, color:"#111827", marginBottom:14 };

// ── New invoice empty state ────────────────────────────────────────────
function emptyForm() {
  return {
    kund: "", kundOrgNr: "", kundAdress: "", kundVatNr: "", kundEmail: "",
    datum: "2026-06-25", forfallodatum: "2026-07-25", betalningsvillkor: "30",
    varRef: "EL-2026", erRef: "",
    sAljarNamn: "Enkelfaktura Redovisning AB", sAljarOrgNr: "556900-0001",
    sAljarVatNr: "SE556900000101", sAljarAdress: "Storgatan 1, 111 20 Stockholm",
    bankgiro: "5050-1234", plusgiro: "", fSkatt: true,
    rows: [{ id:"r1", beskrivning:"", antal:1, apris:0, momssats:25 as VatRate }] as FakturaRow[],
    rotRut: false, rotRutTyp: "" as RotRutTyp,
    personnummer: "", fastighetsbeteckning: "", lagenhetnr: "",
    arbetskostnad: 0, materialkostnad: 0, ovrigaKostnader: 0,
    droejsmal: "8", fritext: "", internAnteckning: "", eFaktura: false,
  };
}

// ── Main component ─────────────────────────────────────────────────────
export default function FakturorPage() {
  const [fakturor, setFakturor] = useState<Faktura[]>(SAMPLE_FAKTUROR);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(emptyForm());
  const [search, setSearch]     = useState("");
  const [statusFilter, setStatus] = useState<FakturaStatus | "">("");
  const [toast, setToast]       = useState("");
  const [selected, setSelected] = useState<Faktura | null>(null);

  const setF = useCallback((k: string, v: unknown) => setForm(p => ({ ...p, [k]: v })), []);
  const setRow = (id: string, k: keyof FakturaRow, v: unknown) =>
    setForm(p => ({ ...p, rows: p.rows.map(r => r.id === id ? { ...r, [k]: v } : r) }));
  const addRow = () => setForm(p => ({ ...p, rows: [...p.rows, { id:"r"+Date.now(), beskrivning:"", antal:1, apris:0, momssats:25 as VatRate }] }));
  const delRow = (id: string) => setForm(p => ({ ...p, rows: p.rows.filter(r => r.id !== id) }));

  // Totals
  const totals = form.rows.reduce((acc, r) => {
    const { exkl, moms } = calcRow(r);
    acc.exkl += exkl; acc.moms += moms;
    const key = `moms${r.momssats}` as keyof typeof acc;
    if (typeof acc[key] === "number") (acc[key] as number) += moms;
    return acc;
  }, { exkl:0, moms:0, moms25:0, moms12:0, moms6:0, moms0:0 });

  const rotRutAvdrag = form.rotRut && form.rotRutTyp
    ? form.rotRutTyp === "ROT"
      ? Math.min(form.arbetskostnad * 0.30, 50000)
      : Math.min(form.arbetskostnad * 0.50, 75000)
    : 0;

  const inkl    = totals.exkl + totals.moms;
  const attBetala = inkl - rotRutAvdrag;

  const nextNr = `FKT-2026-${String(fakturor.length + 1).padStart(3, "0")}`;

  function saveFaktura(status: FakturaStatus) {
    const ny: Faktura = {
      id: String(Date.now()), nummer: nextNr, kund: form.kund,
      kundOrgNr: form.kundOrgNr, datum: "25 jun 2026",
      forfallodatum: `${form.forfallodatum.split("-")[2]} ${["","jan","feb","mar","apr","maj","jun","jul","aug","sep","okt","nov","dec"][+form.forfallodatum.split("-")[1]]} ${form.forfallodatum.split("-")[0]}`,
      belopp: totals.exkl, moms: totals.moms, attBetala,
      status, rotRutTyp: form.rotRut ? form.rotRutTyp : "", avdrag: rotRutAvdrag,
      konsult: KONSULTER_LIST[0],
    };
    setFakturor(p => [ny, ...p]);
    setShowForm(false);
    setForm(emptyForm());
    showToast(status === "Skickad" ? "Faktura skickad" : "Utkast sparat");
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  }

  function markPaid(id: string) {
    setFakturor(p => p.map(f => f.id === id ? { ...f, status: "Betald" } : f));
    showToast("Faktura markerad som betald");
    setSelected(null);
  }

  const filtered = fakturor.filter(f => {
    const q = search.toLowerCase();
    return (!q || f.kund.toLowerCase().includes(q) || f.nummer.toLowerCase().includes(q)) &&
      (!statusFilter || f.status === statusFilter);
  });

  const totalBelopp = filtered.reduce((s, f) => s + f.attBetala, 0);

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <div style={{ display:"flex", flex:1, overflow:"hidden" }}>

      {/* ── Main ─────────────────────────────────────────────────── */}
      <div style={{ flex:1, overflow:"auto", marginRight: selected ? 360 : 0, transition:"margin-right 0.25s" }}>

        {/* Topbar */}
        <header className="sticky top-0 z-40 flex items-center justify-between px-8"
          style={{ height:60, background:"rgba(248,249,251,0.95)", backdropFilter:"blur(10px)", borderBottom:"1px solid #e5e7eb" }}>
          <div className="flex items-center gap-3">
            <h2 style={{ fontSize:16, fontWeight:700, color:"#111827" }}>Fakturor</h2>
            <span style={{ width:1, height:18, background:"#e5e7eb" }} />
            <span style={{ fontSize:13, color:"#9ca3af" }}>{filtered.length} fakturor</span>
          </div>
          <button onClick={() => { setShowForm(true); setSelected(null); }}
            className="flex items-center gap-1.5 rounded-lg font-semibold"
            style={{ background:"#111827", color:"#fff", border:"none", cursor:"pointer", padding:"8px 14px", fontSize:13 }}>
            <M name="add" size={16} /> Ny faktura
          </button>
        </header>

        <div style={{ padding:"24px 32px 48px" }}>

          {/* Filter bar */}
          <div className="flex items-center gap-3" style={{ marginBottom:16 }}>
            <div style={{ position:"relative", flex:1, maxWidth:280 }}>
              <span className="material-symbols-outlined" style={{ position:"absolute", left:10, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", fontSize:18 }}>search</span>
              <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Sök faktura eller kund…" style={{ ...inp, paddingLeft:34 }} />
            </div>
            <div style={{ position:"relative" }}>
              <select value={statusFilter} onChange={e=>setStatus(e.target.value as FakturaStatus|"")}
                style={{ ...inp, width:"auto", appearance:"none" as const, paddingRight:32 }}>
                <option value="">Alla statusar</option>
                {(["Utkast","Skickad","Betald","Försenad","Kreditnota"] as FakturaStatus[]).map(s=>(
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="material-symbols-outlined" style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", fontSize:16, pointerEvents:"none" }}>expand_more</span>
            </div>
            {(search||statusFilter) && <button onClick={()=>{setSearch("");setStatus("");}} style={{ fontSize:12, color:"#6b7280", background:"none", border:"none", cursor:"pointer" }}>Rensa</button>}
          </div>

          {/* Table */}
          <div style={card}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"#f9fafb", borderBottom:"1px solid #f3f4f6" }}>
                  {["Fakturanummer","Kund","Datum","Förfallodatum","Belopp exkl.","Moms","Att betala","ROT/RUT","Status"].map(h=>(
                    <th key={h} style={{ padding:"11px 16px", textAlign:"left", fontSize:11, fontWeight:600, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.06em", whiteSpace:"nowrap" as const }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length===0 ? (
                  <tr><td colSpan={9} style={{ padding:48, textAlign:"center", color:"#9ca3af" }}>Inga fakturor hittades.</td></tr>
                ) : filtered.map((f,i)=>(
                  <tr key={f.id} onClick={()=>setSelected(f.id===selected?.id ? null : f)}
                    style={{ borderBottom:i<filtered.length-1?"1px solid #f9fafb":"none", cursor:"pointer",
                      background:selected?.id===f.id ? "#f0f9ff" : "" }}
                    onMouseEnter={e=>{ if(selected?.id!==f.id) e.currentTarget.style.background="#f9fafb"; }}
                    onMouseLeave={e=>{ if(selected?.id!==f.id) e.currentTarget.style.background=""; }}>
                    <td style={{ padding:"12px 16px" }}>
                      <code style={{ fontSize:12, fontWeight:600, color:"#111827", fontFamily:"'JetBrains Mono', monospace" }}>{f.nummer}</code>
                    </td>
                    <td style={{ padding:"12px 16px" }}>
                      <div>
                        <p style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{f.kund}</p>
                        <p style={{ fontSize:11, color:"#9ca3af" }}>{f.kundOrgNr}</p>
                      </div>
                    </td>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"#6b7280", whiteSpace:"nowrap" as const }}>{f.datum}</td>
                    <td style={{ padding:"12px 16px", fontSize:13, color: f.status==="Försenad"?"#dc2626":"#6b7280", whiteSpace:"nowrap" as const }}>{f.forfallodatum}</td>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"#374151", fontWeight:500 }}>{fmtSEK(f.belopp)}</td>
                    <td style={{ padding:"12px 16px", fontSize:13, color:"#9ca3af" }}>{fmtSEK(f.moms)}</td>
                    <td style={{ padding:"12px 16px", fontSize:14, fontWeight:700, color:"#111827" }}>{fmtSEK(f.attBetala)}</td>
                    <td style={{ padding:"12px 16px" }}>
                      {f.rotRutTyp ? (
                        <span style={{ fontSize:11, fontWeight:600, padding:"2px 8px", borderRadius:6, background:"#fef3c7", color:"#92400e" }}>{f.rotRutTyp} −{fmtSEK(f.avdrag)}</span>
                      ) : <span style={{ color:"#e5e7eb" }}>—</span>}
                    </td>
                    <td style={{ padding:"12px 16px" }}><StatusBadge s={f.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ padding:"11px 16px", borderTop:"1px solid #f3f4f6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:12, color:"#9ca3af" }}>{filtered.length} av {fakturor.length} fakturor · Summa att betala: <strong style={{ color:"#111827" }}>{fmtSEK(totalBelopp)}</strong></span>
              <span style={{ fontSize:11, color:"#d1d5db" }}>25 juni 2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Detail panel ───────────────────────────────────────────── */}
      {selected && (
        <div style={{ position:"fixed", top:0, right:0, bottom:0, width:360, background:"#fff", borderLeft:"1px solid #e5e7eb", boxShadow:"-4px 0 24px rgba(0,0,0,0.08)", zIndex:50, display:"flex", flexDirection:"column" }}>
          <div style={{ padding:"16px 20px", borderBottom:"1px solid #f3f4f6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <code style={{ fontSize:13, fontWeight:700, color:"#111827", fontFamily:"'JetBrains Mono',monospace" }}>{selected.nummer}</code>
              <p style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>{selected.kund}</p>
            </div>
            <button onClick={()=>setSelected(null)} style={{ width:32, height:32, borderRadius:8, border:"none", background:"none", cursor:"pointer", color:"#6b7280", display:"flex", alignItems:"center", justifyContent:"center" }}
              onMouseEnter={e=>(e.currentTarget.style.background="#f3f4f6")} onMouseLeave={e=>(e.currentTarget.style.background="none")}>
              <M name="close" size={20} />
            </button>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:20, display:"flex", flexDirection:"column", gap:14 }}>
            {/* Status */}
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <StatusBadge s={selected.status} />
              <span style={{ fontSize:12, color:"#9ca3af" }}>{selected.konsult}</span>
            </div>
            {/* Amounts */}
            <div style={{ background:"#f9fafb", borderRadius:10, padding:16 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12, color:"#6b7280" }}>Belopp exkl. moms</span>
                <span style={{ fontSize:13, fontWeight:600, color:"#111827" }}>{fmtSEK(selected.belopp)}</span>
              </div>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                <span style={{ fontSize:12, color:"#6b7280" }}>Moms (25%)</span>
                <span style={{ fontSize:13, color:"#111827" }}>{fmtSEK(selected.moms)}</span>
              </div>
              {selected.avdrag > 0 && (
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
                  <span style={{ fontSize:12, color:"#6b7280" }}>{selected.rotRutTyp} avdrag</span>
                  <span style={{ fontSize:13, color:"#dc2626" }}>−{fmtSEK(selected.avdrag)}</span>
                </div>
              )}
              <div style={{ borderTop:"1px solid #e5e7eb", paddingTop:8, display:"flex", justifyContent:"space-between" }}>
                <span style={{ fontSize:13, fontWeight:700, color:"#111827" }}>Att betala</span>
                <span style={{ fontSize:16, fontWeight:800, color:"#111827" }}>{fmtSEK(selected.attBetala)}</span>
              </div>
            </div>
            {/* Dates */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
              <div><p style={lbl}>Fakturadatum</p><p style={{ fontSize:13, color:"#111827" }}>{selected.datum}</p></div>
              <div><p style={lbl}>Förfallodatum</p><p style={{ fontSize:13, color: selected.status==="Försenad"?"#dc2626":"#111827", fontWeight: selected.status==="Försenad" ? 600 : 400 }}>{selected.forfallodatum}</p></div>
            </div>
            {/* Org */}
            <div><p style={lbl}>Org.nummer</p><code style={{ fontSize:12, color:"#9ca3af", background:"#f9fafb", padding:"2px 7px", borderRadius:4 }}>{selected.kundOrgNr}</code></div>
          </div>
          {/* Footer actions */}
          <div style={{ borderTop:"1px solid #f3f4f6", padding:"14px 20px", display:"flex", flexDirection:"column", gap:8 }}>
            {selected.status !== "Betald" && selected.status !== "Kreditnota" && (
              <button onClick={()=>markPaid(selected.id)} style={{ width:"100%", padding:10, borderRadius:8, border:"none", background:"#111827", color:"#fff", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                Markera som betald
              </button>
            )}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
              <button style={{ padding:9, borderRadius:8, border:"1px solid #e5e7eb", background:"#fff", fontSize:12, fontWeight:500, color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}
                onMouseEnter={e=>(e.currentTarget.style.background="#f9fafb")} onMouseLeave={e=>(e.currentTarget.style.background="#fff")}>
                <M name="picture_as_pdf" size={15}/> PDF
              </button>
              <button style={{ padding:9, borderRadius:8, border:"1px solid #e5e7eb", background:"#fff", fontSize:12, fontWeight:500, color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}
                onMouseEnter={e=>(e.currentTarget.style.background="#f9fafb")} onMouseLeave={e=>(e.currentTarget.style.background="#fff")}>
                <M name="send" size={15}/> Skicka
              </button>
              <button style={{ padding:9, borderRadius:8, border:"1px solid #e5e7eb", background:"#fff", fontSize:12, fontWeight:500, color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}
                onMouseEnter={e=>(e.currentTarget.style.background="#f9fafb")} onMouseLeave={e=>(e.currentTarget.style.background="#fff")}>
                <M name="notifications" size={15}/> Påminnelse
              </button>
              <button style={{ padding:9, borderRadius:8, border:"1px solid #fee2e2", background:"#fff", fontSize:12, fontWeight:500, color:"#dc2626", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}
                onMouseEnter={e=>(e.currentTarget.style.background="#fef2f2")} onMouseLeave={e=>(e.currentTarget.style.background="#fff")}>
                <M name="undo" size={15}/> Kreditnota
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── New invoice overlay ─────────────────────────────────────── */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, zIndex:100, background:"rgba(0,0,0,0.4)", display:"flex", justifyContent:"center", alignItems:"flex-start", overflowY:"auto", padding:"32px 24px" }}>
          <div style={{ width:"100%", maxWidth:820, background:"#fff", borderRadius:16, boxShadow:"0 20px 60px rgba(0,0,0,0.18)", marginBottom:32 }}>

            {/* Header */}
            <div style={{ padding:"18px 24px", borderBottom:"1px solid #f3f4f6", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <div>
                <h2 style={{ fontSize:16, fontWeight:800, color:"#111827" }}>Ny faktura</h2>
                <p style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>Fakturanummer: <strong style={{ color:"#111827" }}>{nextNr}</strong></p>
              </div>
              <button onClick={()=>setShowForm(false)} style={{ width:32, height:32, borderRadius:8, border:"none", background:"none", cursor:"pointer", color:"#6b7280", display:"flex", alignItems:"center", justifyContent:"center" }}
                onMouseEnter={e=>(e.currentTarget.style.background="#f3f4f6")} onMouseLeave={e=>(e.currentTarget.style.background="none")}>
                <M name="close" size={20} />
              </button>
            </div>

            {/* ── Section 1: Fakturainformation ── */}
            <div style={sec}>
              <p style={secTitle}>Fakturainformation</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                <div><label style={lbl}>Fakturadatum</label><input type="date" value={form.datum} onChange={e=>setF("datum",e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Förfallodatum</label><input type="date" value={form.forfallodatum} onChange={e=>setF("forfallodatum",e.target.value)} style={inp} /></div>
                <div>
                  <label style={lbl}>Betalningsvillkor</label>
                  <div style={{ position:"relative" }}>
                    <select value={form.betalningsvillkor} onChange={e=>setF("betalningsvillkor",e.target.value)} style={{ ...inp, appearance:"none" as const, paddingRight:32 }}>
                      <option value="10">Netto 10 dagar</option>
                      <option value="15">Netto 15 dagar</option>
                      <option value="30">Netto 30 dagar</option>
                      <option value="60">Netto 60 dagar</option>
                    </select>
                    <span className="material-symbols-outlined" style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", fontSize:16, pointerEvents:"none" }}>expand_more</span>
                  </div>
                </div>
                <div><label style={lbl}>Vår referens</label><input value={form.varRef} onChange={e=>setF("varRef",e.target.value)} placeholder="T.ex. EL-2026" style={inp} /></div>
                <div><label style={lbl}>Er referens</label><input value={form.erRef} onChange={e=>setF("erRef",e.target.value)} placeholder="Kundens referens" style={inp} /></div>
                <div style={{ display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
                  <label style={{ ...lbl, marginBottom:8 }}>F-skatt & e-faktura</label>
                  <div style={{ display:"flex", gap:16 }}>
                    <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, cursor:"pointer" }}>
                      <input type="checkbox" checked={form.fSkatt} onChange={e=>setF("fSkatt",e.target.checked)} style={{ width:15, height:15 }} />
                      Godkänd för F-skatt
                    </label>
                    <label style={{ display:"flex", alignItems:"center", gap:6, fontSize:13, cursor:"pointer" }}>
                      <input type="checkbox" checked={form.eFaktura} onChange={e=>setF("eFaktura",e.target.checked)} style={{ width:15, height:15 }} />
                      Peppol/e-faktura
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 2: Säljare ── */}
            <div style={sec}>
              <p style={secTitle}>Säljare (leverantör)</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div><label style={lbl}>Företagsnamn</label><input value={form.sAljarNamn} onChange={e=>setF("sAljarNamn",e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Org.nummer</label><input value={form.sAljarOrgNr} onChange={e=>setF("sAljarOrgNr",e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Momsregistreringsnummer (VAT)</label><input value={form.sAljarVatNr} onChange={e=>setF("sAljarVatNr",e.target.value)} placeholder="SE556XXXXXX01" style={inp} /></div>
                <div><label style={lbl}>Adress</label><input value={form.sAljarAdress} onChange={e=>setF("sAljarAdress",e.target.value)} style={inp} /></div>
                <div><label style={lbl}>Bankgiro</label><input value={form.bankgiro} onChange={e=>setF("bankgiro",e.target.value)} placeholder="XXXX-XXXX" style={inp} /></div>
                <div><label style={lbl}>Plusgiro (valfritt)</label><input value={form.plusgiro} onChange={e=>setF("plusgiro",e.target.value)} placeholder="XXXXXXX-X" style={inp} /></div>
              </div>
            </div>

            {/* ── Section 3: Köpare ── */}
            <div style={sec}>
              <p style={secTitle}>Köpare (kund)</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div>
                  <label style={lbl}>Kund *</label>
                  <div style={{ position:"relative" }}>
                    <select value={form.kund} onChange={e=>setF("kund",e.target.value)} style={{ ...inp, appearance:"none" as const, paddingRight:32 }}>
                      <option value="">Välj kund…</option>
                      {KUNDER_LIST.map(k=><option key={k} value={k}>{k}</option>)}
                    </select>
                    <span className="material-symbols-outlined" style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", fontSize:16, pointerEvents:"none" }}>expand_more</span>
                  </div>
                </div>
                <div><label style={lbl}>Org.nummer</label><input value={form.kundOrgNr} onChange={e=>setF("kundOrgNr",e.target.value)} placeholder="556XXX-XXXX" style={inp} /></div>
                <div><label style={lbl}>Faktureringsadress</label><input value={form.kundAdress} onChange={e=>setF("kundAdress",e.target.value)} placeholder="Gatuadress, Postnr Stad" style={inp} /></div>
                <div><label style={lbl}>E-post (för faktura)</label><input value={form.kundEmail} onChange={e=>setF("kundEmail",e.target.value)} placeholder="ekonomi@kund.se" style={inp} /></div>
                <div><label style={lbl}>Momsregistreringsnummer (köpare)</label><input value={form.kundVatNr} onChange={e=>setF("kundVatNr",e.target.value)} placeholder="SE556XXXXXX01 (B2B)" style={inp} /></div>
              </div>
            </div>

            {/* ── Section 4: Fakturarader ── */}
            <div style={sec}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
                <p style={secTitle}>Fakturarader</p>
                <button onClick={addRow} style={{ fontSize:12, color:"#111827", background:"none", border:"1px solid #e5e7eb", borderRadius:7, padding:"5px 10px", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
                  <M name="add" size={14}/> Lägg till rad
                </button>
              </div>
              {/* Table header */}
              <div style={{ display:"grid", gridTemplateColumns:"3fr 0.7fr 1fr 0.7fr 1fr 32px", gap:8, marginBottom:6 }}>
                {["Beskrivning","Antal","À-pris (SEK)","Moms","Belopp",""].map(h=>(
                  <span key={h} style={{ ...lbl, marginBottom:0 }}>{h}</span>
                ))}
              </div>
              {form.rows.map(r => {
                const { exkl, moms: rMoms } = calcRow(r);
                return (
                  <div key={r.id} style={{ display:"grid", gridTemplateColumns:"3fr 0.7fr 1fr 0.7fr 1fr 32px", gap:8, marginBottom:8 }}>
                    <input value={r.beskrivning} onChange={e=>setRow(r.id,"beskrivning",e.target.value)} placeholder="Tjänstebeskrivning…" style={inp} />
                    <input type="number" value={r.antal} onChange={e=>setRow(r.id,"antal",+e.target.value)} min={1} style={{ ...inp, textAlign:"center" as const }} />
                    <input type="number" value={r.apris} onChange={e=>setRow(r.id,"apris",+e.target.value)} min={0} style={inp} />
                    <div style={{ position:"relative" }}>
                      <select value={r.momssats} onChange={e=>setRow(r.id,"momssats",+e.target.value as VatRate)} style={{ ...inp, appearance:"none" as const, paddingRight:20 }}>
                        <option value={25}>25%</option>
                        <option value={12}>12%</option>
                        <option value={6}>6%</option>
                        <option value={0}>0%</option>
                      </select>
                      <span className="material-symbols-outlined" style={{ position:"absolute", right:4, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", fontSize:14, pointerEvents:"none" }}>expand_more</span>
                    </div>
                    <div style={{ ...inp, background:"#f9fafb", color:"#374151", fontWeight:600, textAlign:"right" as const, display:"flex", alignItems:"center", justifyContent:"flex-end" }}>
                      {fmtSEK(exkl + rMoms)}
                    </div>
                    <button onClick={()=>delRow(r.id)} disabled={form.rows.length===1}
                      style={{ border:"none", background:"none", cursor:form.rows.length===1?"not-allowed":"pointer", color:"#9ca3af", display:"flex", alignItems:"center", justifyContent:"center", opacity:form.rows.length===1?0.3:1 }}>
                      <M name="close" size={18}/>
                    </button>
                  </div>
                );
              })}

              {/* Totals */}
              <div style={{ marginTop:16, borderTop:"2px solid #f3f4f6", paddingTop:16 }}>
                <div style={{ display:"flex", justifyContent:"flex-end" }}>
                  <div style={{ minWidth:260 }}>
                    {[
                      { label:"Summa exkl. moms", val:fmtSEK(totals.exkl), bold:false },
                      ...(totals.moms25>0?[{ label:"Moms 25%", val:fmtSEK(totals.moms25), bold:false }]:[]),
                      ...(totals.moms12>0?[{ label:"Moms 12%", val:fmtSEK(totals.moms12), bold:false }]:[]),
                      ...(totals.moms6>0?[{ label:"Moms 6%", val:fmtSEK(totals.moms6), bold:false }]:[]),
                      { label:"Total inkl. moms", val:fmtSEK(inkl), bold:true },
                    ].map(t=>(
                      <div key={t.label} style={{ display:"flex", justifyContent:"space-between", gap:32, marginBottom:6 }}>
                        <span style={{ fontSize:13, color:t.bold?"#111827":"#6b7280", fontWeight:t.bold?700:400 }}>{t.label}</span>
                        <span style={{ fontSize:13, color:"#111827", fontWeight:t.bold?800:400 }}>{t.val}</span>
                      </div>
                    ))}
                    {rotRutAvdrag > 0 && (
                      <>
                        <div style={{ display:"flex", justifyContent:"space-between", gap:32, marginBottom:6 }}>
                          <span style={{ fontSize:13, color:"#dc2626", fontWeight:600 }}>{form.rotRutTyp} avdrag</span>
                          <span style={{ fontSize:13, color:"#dc2626", fontWeight:600 }}>−{fmtSEK(rotRutAvdrag)}</span>
                        </div>
                        <div style={{ display:"flex", justifyContent:"space-between", gap:32, borderTop:"1px solid #e5e7eb", paddingTop:8 }}>
                          <span style={{ fontSize:14, color:"#111827", fontWeight:800 }}>Att betala</span>
                          <span style={{ fontSize:16, color:"#111827", fontWeight:800 }}>{fmtSEK(attBetala)}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 5: ROT/RUT avdrag ── */}
            <div style={sec}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: form.rotRut ? 14 : 0 }}>
                <div>
                  <p style={secTitle}>ROT/RUT avdrag</p>
                  {!form.rotRut && <p style={{ fontSize:12, color:"#9ca3af", marginTop:-10 }}>För hushållsarbete, ROT (renovering) eller RUT (hushållstjänster)</p>}
                </div>
                <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                  <div onClick={()=>setF("rotRut",!form.rotRut)} style={{ width:40, height:22, borderRadius:11, background:form.rotRut?"#111827":"#e5e7eb", position:"relative", transition:"background 0.2s", flexShrink:0 }}>
                    <div style={{ position:"absolute", top:3, left:form.rotRut?20:3, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"left 0.2s" }} />
                  </div>
                  <span style={{ fontSize:13, color:"#374151", fontWeight:500 }}>Aktivera avdrag</span>
                </label>
              </div>
              {form.rotRut && (
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                  <div>
                    <label style={lbl}>Avdragstyp</label>
                    <div style={{ position:"relative" }}>
                      <select value={form.rotRutTyp} onChange={e=>setF("rotRutTyp",e.target.value)} style={{ ...inp, appearance:"none" as const, paddingRight:32 }}>
                        <option value="">Välj typ…</option>
                        <option value="ROT">ROT (renovering/reparation) — 30% max 50 000 kr</option>
                        <option value="RUT">RUT (hushållstjänster) — 50% max 75 000 kr</option>
                        <option value="Grönt">Grönt avdrag (energieffektivitet)</option>
                      </select>
                      <span className="material-symbols-outlined" style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", fontSize:16, pointerEvents:"none" }}>expand_more</span>
                    </div>
                  </div>
                  <div><label style={lbl}>Personnummer (köparen)</label><input value={form.personnummer} onChange={e=>setF("personnummer",e.target.value)} placeholder="YYYYMMDD-XXXX" style={inp} /></div>
                  {form.rotRutTyp==="ROT"
                    ? <div><label style={lbl}>Fastighetsbeteckning</label><input value={form.fastighetsbeteckning} onChange={e=>setF("fastighetsbeteckning",e.target.value)} placeholder="T.ex. Stockholm Solna 1:1" style={inp} /></div>
                    : <div><label style={lbl}>Lägenhetsnummer</label><input value={form.lagenhetnr} onChange={e=>setF("lagenhetnr",e.target.value)} placeholder="T.ex. 1001" style={inp} /></div>
                  }
                  <div><label style={lbl}>Arbetskostnad (exkl. moms)</label><input type="number" value={form.arbetskostnad} onChange={e=>setF("arbetskostnad",+e.target.value)} placeholder="0" style={inp} /></div>
                  <div><label style={lbl}>Materialkostnad (exkl. moms)</label><input type="number" value={form.materialkostnad} onChange={e=>setF("materialkostnad",+e.target.value)} placeholder="0" style={inp} /></div>
                  <div><label style={lbl}>Övriga kostnader</label><input type="number" value={form.ovrigaKostnader} onChange={e=>setF("ovrigaKostnader",+e.target.value)} placeholder="0" style={inp} /></div>
                  {form.rotRutTyp && form.arbetskostnad > 0 && (
                    <div style={{ gridColumn:"1/-1", background:"#f0fdf4", borderRadius:8, padding:"12px 14px", border:"1px solid #bbf7d0" }}>
                      <p style={{ fontSize:12, color:"#15803d", fontWeight:600 }}>
                        Beräknat avdrag: <strong>{fmtSEK(rotRutAvdrag)}</strong>
                        {form.rotRutTyp==="ROT" ? " (30% av arbetskostnad, max 50 000 kr)" : " (50% av arbetskostnad, max 75 000 kr)"}
                        {" "} · Att betala efter avdrag: <strong>{fmtSEK(attBetala)}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── Section 6: Betalningsinformation ── */}
            <div style={sec}>
              <p style={secTitle}>Betalningsinformation</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:14 }}>
                <div>
                  <label style={lbl}>OCR-nummer (auto)</label>
                  <div style={{ ...inp, background:"#f9fafb", color:"#6b7280", fontFamily:"'JetBrains Mono',monospace", fontSize:12 }}>
                    {nextNr.replace("FKT-","").replace("-","")}
                  </div>
                </div>
                <div>
                  <label style={lbl}>Dröjsmålsränta</label>
                  <div style={{ position:"relative" }}>
                    <select value={form.droejsmal} onChange={e=>setF("droejsmal",e.target.value)} style={{ ...inp, appearance:"none" as const, paddingRight:32 }}>
                      <option value="8">8% (standard)</option>
                      <option value="0">Ingen ränta</option>
                      <option value="ref">Referensränta + 8 pp</option>
                    </select>
                    <span className="material-symbols-outlined" style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", color:"#9ca3af", fontSize:16, pointerEvents:"none" }}>expand_more</span>
                  </div>
                </div>
                <div>
                  <label style={lbl}>Betalningsmetod</label>
                  <div style={{ ...inp, background:"#f9fafb", fontSize:12, color:"#374151" }}>
                    {form.bankgiro ? `Bankgiro ${form.bankgiro}` : form.plusgiro ? `Plusgiro ${form.plusgiro}` : "—"}
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 7: Övrigt ── */}
            <div style={{ ...sec, borderBottom:"none" }}>
              <p style={secTitle}>Meddelande & anteckningar</p>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div>
                  <label style={lbl}>Fritext på fakturan</label>
                  <textarea value={form.fritext} onChange={e=>setF("fritext",e.target.value)} rows={3} placeholder="T.ex. Tack för förtroendet! Betalning via bankgiro…" style={{ ...inp, resize:"vertical" as const, fontFamily:"inherit" }} />
                </div>
                <div>
                  <label style={lbl}>Intern anteckning (syns ej på faktura)</label>
                  <textarea value={form.internAnteckning} onChange={e=>setF("internAnteckning",e.target.value)} rows={3} placeholder="Interna noteringar…" style={{ ...inp, resize:"vertical" as const, fontFamily:"inherit" }} />
                </div>
              </div>
            </div>

            {/* ── Footer buttons ── */}
            <div style={{ padding:"16px 24px", background:"#f9fafb", borderTop:"1px solid #f3f4f6", borderRadius:"0 0 16px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <button onClick={()=>setShowForm(false)} style={{ padding:"9px 18px", borderRadius:8, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer", fontSize:13, color:"#6b7280" }}>Avbryt</button>
              <div style={{ display:"flex", gap:8 }}>
                <button onClick={()=>saveFaktura("Utkast")} style={{ padding:"9px 18px", borderRadius:8, border:"1px solid #e5e7eb", background:"#fff", cursor:"pointer", fontSize:13, color:"#374151", fontWeight:500, display:"flex", alignItems:"center", gap:5 }}>
                  <M name="draft" size={15}/> Spara som utkast
                </button>
                <button onClick={()=>saveFaktura("Skickad")} disabled={!form.kund}
                  style={{ padding:"9px 18px", borderRadius:8, border:"none", cursor:!form.kund?"not-allowed":"pointer", fontSize:13, fontWeight:700,
                    background:!form.kund?"#f3f4f6":"#111827", color:!form.kund?"#9ca3af":"#fff", display:"flex", alignItems:"center", gap:5 }}>
                  <M name="send" size={15}/> Skicka faktura
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ─────────────────────────────────────────────────────── */}
      <div style={{ position:"fixed", bottom:24, right:24, zIndex:300, transition:"all 0.25s", opacity:toast?1:0, transform:toast?"translateY(0)":"translateY(8px)", pointerEvents:toast?"auto":"none" }}>
        <div className="flex items-center gap-2" style={{ background:"#111827", color:"#fff", padding:"10px 16px", borderRadius:10, fontSize:13, fontWeight:500, boxShadow:"0 4px 16px rgba(0,0,0,0.15)" }}>
          <M name="check_circle" fill size={16}/> {toast}
        </div>
      </div>
    </div>
  );
}
