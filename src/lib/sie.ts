/**
 * SIE4-export av kundfakturor.
 *
 * Filen lases in i byrans bokforingsprogram (Fortnox importerar .si/.sie).
 * Den hamnar alltsa i nagon annans bokforing - en felaktig kontering syns
 * inte i vart granssnitt och upptacks kanske forst vid bokslutet. Andra
 * inte konteringen utan att stamma av mot BAS-kontoplanen.
 *
 * Kontona nedan ar hamtade ur BAS-kontoplanen (bas.se), kontrollerade
 * 2026-10-24. Notera sarskilt att 2612 och 2613 INTE ar 12 respektive
 * 6 procent - de avser egna uttag och uthyrning, bada 25 procent. Ratt
 * konton for lagre satser ar 2621 och 2631.
 *
 * Formatet foljer SIE 4B (sie.se). Tva regler ar latta att missa:
 *   1. Filen ska vara teckenkodad i PC8 (CP437), inte UTF-8.
 *   2. Raderna i ett #VER-block maste summera till noll.
 */

export type SieRad = {
  line_total: number;
  vat_amount: number;
  vat_rate: number;
};

export type SieFaktura = {
  invoice_number: string;
  invoice_date: string;          // YYYY-MM-DD
  customer_name: string;
  subtotal: number;
  vat_amount: number;
  total: number;
  rot_rut_amount: number | null;
  reverse_charge: boolean | null;
  lines: SieRad[];
};

export type SieForetag = {
  name: string;
  org_no: string;
};

/* ── Kontoplan (BAS) ──────────────────────────────────────────────── */

export const KONTON = {
  kundfordringar: 1510,
  /** Den del av en ROT/RUT-faktura som Skatteverket betalar. */
  delad_faktura: 1513,
  /** Forsaljningskonto per momssats. */
  forsaljning: { 25: 3001, 12: 3002, 6: 3003 } as Record<number, number>,
  /** Utgaende moms per sats. 2612/2613 ar INTE 12/6 procent. */
  utgaende_moms: { 25: 2611, 12: 2621, 6: 2631 } as Record<number, number>,
  /** Forsaljning inom byggsektorn, omvand betalningsskyldighet. */
  omvand_bygg: 3231,
} as const;

/* ── Teckenkodning ────────────────────────────────────────────────── */

/** CP437-koder for de tecken som faktiskt forekommer i svensk text. */
const CP437: Record<string, number> = {
  "å": 0x86, "ä": 0x84, "ö": 0x94, "Å": 0x8f, "Ä": 0x8e, "Ö": 0x99,
  "é": 0x82, "É": 0x90, "ü": 0x81, "Ü": 0x9a, "à": 0x85, "è": 0x8a,
  "ô": 0x93, "î": 0x8c, "ç": 0x87, "ñ": 0xa4, "Ñ": 0xa5, "£": 0x9c,
};

/**
 * Kodar strangen till CP437. Tecken som inte finns i teckentabellen
 * ersatts med en punkt i stallet for att tyst falla bort - det ska synas
 * i filen att nagot inte kunde representeras.
 */
export function tillCP437(text: string): Uint8Array {
  const ut: number[] = [];
  for (const tecken of text) {
    const kod = tecken.codePointAt(0)!;
    if (kod < 0x80) ut.push(kod);
    else if (CP437[tecken] !== undefined) ut.push(CP437[tecken]);
    else ut.push(0x2e); // '.'
  }
  return Uint8Array.from(ut);
}

/* ── Hjalpare ─────────────────────────────────────────────────────── */

const datum = (iso: string) => iso.slice(0, 10).replace(/-/g, "");
const belopp = (n: number) => (Math.round(n * 100) / 100).toFixed(2);

/** SIE-stranger citeras med dubbelfnutt; inbakade fnuttar escapas. */
const strang = (s: string) => `"${(s ?? "").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;

type Trans = { konto: number; belopp: number };

/**
 * Konterar en faktura. Returnerar raderna och en kontroll pa att de
 * summerar till noll - gor de inte det ar fakturan inte bokforingsbar
 * och ska inte skrivas ut i filen.
 */
export function konteraFaktura(f: SieFaktura): { rader: Trans[];differens: number } {
  const rader: Trans[] = [];
  const rotRut = f.rot_rut_amount ?? 0;

  if (f.reverse_charge) {
    // Ingen moms tas ut. Hela beloppet ar intakt pa 3231.
    rader.push({ konto: KONTON.kundfordringar, belopp: f.total });
    rader.push({ konto: KONTON.omvand_bygg, belopp: -f.total });
  } else {
    // Kundfordran delas nar ROT/RUT har dragits: kunden betalar en del,
    // Skatteverket resten.
    const avKund = f.total - rotRut;
    if (avKund !== 0) rader.push({ konto: KONTON.kundfordringar, belopp: avKund });
    if (rotRut !== 0) rader.push({ konto: KONTON.delad_faktura, belopp: rotRut });

    // Summera netto och moms per momssats - en faktura kan ha flera.
    const perSats = new Map<number, { netto: number; moms: number }>();
    for (const r of f.lines) {
      const s = perSats.get(r.vat_rate) ?? { netto: 0, moms: 0 };
      s.netto += r.line_total;
      s.moms += r.vat_amount;
      perSats.set(r.vat_rate, s);
    }
    for (const [sats, s] of [...perSats.entries()].sort((a, b) => b[0] - a[0])) {
      const fkonto = KONTON.forsaljning[sats];
      const mkonto = KONTON.utgaende_moms[sats];
      // Okand momssats far inte konteras pa mafa - da ar det battre att
      // fakturan utesluts och syns i avvikelselistan.
      if (!fkonto) continue;
      if (s.netto !== 0) rader.push({ konto: fkonto, belopp: -s.netto });
      if (s.moms !== 0 && mkonto) rader.push({ konto: mkonto, belopp: -s.moms });
    }
  }

  const summa = rader.reduce((a, r) => a + r.belopp, 0);
  return { rader, differens: Math.round(summa * 100) / 100 };
}

export type SieResultat = {
  fil: Uint8Array;
  antal: number;
  uteslutna: { faktura: string; skal: string }[];
};

/**
 * Bygger en komplett SIE4-fil.
 *
 * Fakturor som inte gar att kontera (okand momssats, obalans) utesluts och
 * rapporteras i `uteslutna` i stallet for att skrivas ut felaktigt.
 */
export function byggSie(
  foretag: SieForetag,
  fakturor: SieFaktura[],
  rakenskapsar: { start: string; slut: string },
  genereradAv = "EnkeltFaktura"
): SieResultat {
  const rader: string[] = [];
  const uteslutna: { faktura: string; skal: string }[] = [];

  rader.push("#FLAGGA 0");
  rader.push(`#PROGRAM ${strang(genereradAv)} ${strang("1.0")}`);
  rader.push("#FORMAT PC8");
  rader.push(`#GEN ${datum(new Date().toISOString())}`);
  rader.push("#SIETYP 4");
  rader.push(`#FNAMN ${strang(foretag.name)}`);
  rader.push(`#ORGNR ${strang(foretag.org_no)}`);
  rader.push(`#RAR 0 ${datum(rakenskapsar.start)} ${datum(rakenskapsar.slut)}`);

  // Kontonamn for de konton som faktiskt anvands, sa att mottagaren ser
  // vad som menas aven om kontot saknas i deras plan.
  const anvanda = new Map<number, string>();
  const namn: Record<number, string> = {
    1510: "Kundfordringar",
    1513: "Kundfordringar - delad faktura",
    2611: "Utgaende moms pa forsaljning, 25 %",
    2621: "Utgaende moms pa forsaljning, 12 %",
    2631: "Utgaende moms pa forsaljning, 6 %",
    3001: "Forsaljning inom Sverige, 25 % moms",
    3002: "Forsaljning inom Sverige, 12 % moms",
    3003: "Forsaljning inom Sverige, 6 % moms",
    3231: "Forsaljning inom byggsektorn, omvand betalningsskyldighet",
  };

  const verBlock: string[] = [];
  let antal = 0;

  for (const f of fakturor) {
    const { rader: trans, differens } = konteraFaktura(f);
    if (!trans.length) { uteslutna.push({ faktura: f.invoice_number, skal: "inga konterbara rader" }); continue; }
    if (differens !== 0) { uteslutna.push({ faktura: f.invoice_number, skal: `obalans ${differens.toFixed(2)} kr` }); continue; }

    verBlock.push(`#VER "" ${strang(f.invoice_number)} ${datum(f.invoice_date)} ${strang(f.customer_name)}`);
    verBlock.push("{");
    for (const t of trans) {
      anvanda.set(t.konto, namn[t.konto] ?? "");
      verBlock.push(`   #TRANS ${t.konto} {} ${belopp(t.belopp)}`);
    }
    verBlock.push("}");
    antal++;
  }

  for (const [konto, kontonamn] of [...anvanda.entries()].sort((a, b) => a[0] - b[0])) {
    rader.push(`#KONTO ${konto} ${strang(kontonamn)}`);
  }
  rader.push(...verBlock);

  return { fil: tillCP437(rader.join("\r\n") + "\r\n"), antal, uteslutna };
}
