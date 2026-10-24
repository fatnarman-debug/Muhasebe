/**
 * Kontroll av organisationsnummer och personnummer.
 *
 * Numren hamnar pa fakturan, i SIE-filen och i begaran om ROT/RUT till
 * Skatteverket. Ett felskrivet nummer upptacks darfor inte har utan forst
 * nar nagon annan avvisar underlaget.
 *
 * Kontrollen ar en Luhn-berakning pa de tio siffrorna. Den fangar
 * felskrivningar och pahittade nummer. Den sager daremot ingenting om
 * numret tillhor den som skriver in det - det kraver en uppslagning mot
 * Bolagsverket, och ar en annan sak.
 */

/** Plockar ut siffrorna och tar bort ett eventuellt sekelprefix (19/20). */
function siffror(input: string): string {
  const rena = (input ?? "").replace(/\D/g, "");
  if (rena.length === 12 && /^(18|19|20)/.test(rena)) return rena.slice(2);
  return rena;
}

function luhn(tio: string): boolean {
  let summa = 0;
  for (let i = 0; i < 10; i++) {
    let d = Number(tio[9 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    summa += d;
  }
  return summa % 10 === 0;
}

export type Kontroll = { giltigt: boolean; fel?: string };

/**
 * Organisationsnummer: tio siffror med giltig kontrollsiffra.
 * Tomt varde accepteras - obligatoriskt eller inte avgors av formularet.
 */
export function kontrolleraOrgNr(input: string | null | undefined): Kontroll {
  const v = (input ?? "").trim();
  if (!v) return { giltigt: true };
  const n = siffror(v);
  if (n.length !== 10) {
    return { giltigt: false, fel: "Organisationsnumret ska ha tio siffror, till exempel 556677-8899." };
  }
  if (!luhn(n)) {
    return { giltigt: false, fel: "Kontrollsiffran stämmer inte. Kontrollera att numret är rätt avskrivet." };
  }
  return { giltigt: true };
}

/**
 * Personnummer: tio siffror med giltig kontrollsiffra, och ett datum som
 * gar att tolka. Ett nummer som inte haller matten gor att begaran om
 * ROT- eller RUT-avdrag avvisas.
 */
export function kontrolleraPersonnummer(input: string | null | undefined): Kontroll {
  const v = (input ?? "").trim();
  if (!v) return { giltigt: true };
  const n = siffror(v);
  if (n.length !== 10) {
    return { giltigt: false, fel: "Personnumret ska ha tio siffror, till exempel 800913-1510." };
  }

  // Samordningsnummer har dag + 60. Rakna bort det innan datumkontrollen.
  const manad = Number(n.slice(2, 4));
  let dag = Number(n.slice(4, 6));
  if (dag > 60) dag -= 60;
  if (manad < 1 || manad > 12 || dag < 1 || dag > 31) {
    return { giltigt: false, fel: "Datumdelen i personnumret ser inte rimlig ut." };
  }

  if (!luhn(n)) {
    return { giltigt: false, fel: "Kontrollsiffran stämmer inte. Kontrollera att numret är rätt avskrivet." };
  }
  return { giltigt: true };
}

/** Skriver numret som NNNNNN-NNNN. Lamnar okanda format ororda. */
export function formateraNummer(input: string | null | undefined): string {
  const v = (input ?? "").trim();
  const n = siffror(v);
  return n.length === 10 ? `${n.slice(0, 6)}-${n.slice(6)}` : v;
}
