/**
 * ROT- och RUT-avdrag pa faktura.
 *
 * En enda kalla for berakningen. Bade fakturaformularet och PDF:en anvander
 * den har modulen - rakna inte om avdraget pa nagot annat stalle, da kan
 * kundens faktura och underlaget till Skatteverket sluta stamma overens.
 *
 * Reglerna ar kontrollerade mot skatteverket.se 2026-10-21. Skattereglerna
 * andras: ROT var tillfalligt 50 procent 12 maj - 31 december 2025, knutet
 * till nar kunden betalade. Kontrollera om nar SENAST_KONTROLLERAD ar aldre
 * an ett halvar.
 */

export const SENAST_KONTROLLERAD = "2026-10-21";

export type AvdragsTyp = "rot" | "rut";

export const REGLER = {
  rot: {
    etikett: "ROT-avdrag",
    procent: 0.3,
    /** Tak per person och ar for enbart ROT. */
    tak: 50_000,
  },
  rut: {
    etikett: "RUT-avdrag",
    procent: 0.5,
    /** RUT far anvanda hela det gemensamma taket. */
    tak: 75_000,
  },
} as const;

/** Gemensamt tak for ROT och RUT tillsammans, per person och ar. */
export const GEMENSAMT_TAK = 75_000;

export type Rad = {
  /** Radens belopp exklusive moms. */
  line_total: number;
  /** Momsbeloppet for raden. */
  vat_amount: number;
  /** Ar raden arbete? Bara arbete ger avdrag. */
  is_labor: boolean;
};

export type Underlag = {
  /** Arbetskostnad inklusive moms - det avdraget raknas pa. */
  arbetskostnad: number;
  /** Berakat avdrag, nedrundat till hela kronor. */
  avdrag: number;
  /** Avdraget innan taket tillampades. */
  avdragForeTak: number;
  /** Sant om taket skar ned avdraget. */
  taketNatt: boolean;
  /** Taket som tillampades. */
  tak: number;
};

/**
 * Raknar ut avdraget pa arbetsraderna.
 *
 * Avdraget galler arbetskostnaden *inklusive moms*. Material, resor,
 * maskinhyra och bortforsling ger aldrig avdrag - de raderna ska ha
 * is_labor = false.
 *
 * Taket galler per person och ar och vi kan inte veta hur mycket kunden
 * redan har anvant hos andra utforare. `redanUtnyttjat` finns darfor for
 * den som vill ta hansyn till det; utan den raknas hela taket som ledigt.
 */
export function raknaAvdrag(
  typ: AvdragsTyp,
  rader: Rad[],
  redanUtnyttjat = 0
): Underlag {
  const regel = REGLER[typ];

  const arbetskostnad = rader
    .filter((r) => r.is_labor)
    .reduce((s, r) => s + r.line_total + r.vat_amount, 0);

  const avdragForeTak = Math.floor(arbetskostnad * regel.procent);
  const kvarAvTaket = Math.max(0, regel.tak - Math.max(0, redanUtnyttjat));
  const avdrag = Math.min(avdragForeTak, kvarAvTaket);

  return {
    arbetskostnad: Math.round(arbetskostnad * 100) / 100,
    avdrag,
    avdragForeTak,
    taketNatt: avdrag < avdragForeTak,
    tak: regel.tak,
  };
}

export type Invandning =
  | "ingen-arbetsrad"
  | "foretagskund"
  | "personnummer-saknas";

/**
 * Skal som gor att avdraget inte kan begaras. Returnerar tom lista nar
 * allt ar pa plats. Meningen ar att saga ifran i formularet, innan
 * fakturan skickas - inte efterat nar Skatteverket avslar.
 */
export function kontrollera(opts: {
  kundtyp: string | null | undefined;
  personnummer: string | null | undefined;
  rader: Rad[];
}): Invandning[] {
  const fel: Invandning[] = [];
  if (opts.kundtyp !== "individual") fel.push("foretagskund");
  if (!opts.personnummer?.trim()) fel.push("personnummer-saknas");
  if (!opts.rader.some((r) => r.is_labor)) fel.push("ingen-arbetsrad");
  return fel;
}

export const INVANDNING_TEXT: Record<Invandning, string> = {
  "foretagskund":
    "Avdraget gäller bara privatpersoner. Företag och föreningar kan inte få ROT eller RUT.",
  "personnummer-saknas":
    "Kundens personnummer krävs för att begära utbetalning från Skatteverket. Fyll i det på kunden.",
  "ingen-arbetsrad":
    "Minst en rad måste vara markerad som arbete. Avdraget räknas bara på arbetskostnaden.",
};
