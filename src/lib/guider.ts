/**
 * Guiderna, pa ett stalle.
 *
 * Listan lases av /guider och av sitemap.ts. Skrivs en ny guide in pa bara
 * ett av stallena blir den antingen osynlig for besokaren eller osynlig for
 * Google - och bada misstagen ar tysta.
 *
 * `kontrollerad` ar samma datum som star i guidens egen kalltext. Skatteregler
 * andras, och ett datum som sager nar uppgifterna sist stamdes av ar det enda
 * som visar nar en sida behover ses over.
 */

export type Guide = {
  slug: string;
  titel: string;
  /** Vad guiden svarar pa, i en mening. Visas pa kortet. */
  lead: string;
  /** Kort etikett for amnet, t.ex. "ROT" eller "Moms". */
  etikett: string;
  /** Datum da uppgifterna sist stamdes av mot kallan. */
  kontrollerad: string;
};

export const guider: Guide[] = [
  {
    slug: "rot-avdrag-pa-faktura",
    titel: "ROT-avdrag på fakturan",
    etikett: "ROT",
    lead:
      "Vad som räknas som arbete, när du begär pengarna från Skatteverket och varför kundens betaldatum avgör vilket år avdraget hör till.",
    kontrollerad: "26 oktober 2026",
  },
  {
    slug: "rut-avdrag-pa-faktura",
    titel: "RUT-avdrag på fakturan",
    etikett: "RUT",
    lead:
      "50 procent av arbetskostnaden – men bara om kunden betalar elektroniskt. Gränsfallen i städ, trädgård, flytt och tvätt rad för rad.",
    kontrollerad: "26 oktober 2026",
  },
  {
    slug: "omvand-betalningsskyldighet",
    titel: "Omvänd betalningsskyldighet",
    etikett: "Moms",
    lead:
      "Byggtjänster till företag i byggsektorn och tjänster till företag i andra EU-länder faktureras utan moms. Så skriver du fakturan rätt.",
    kontrollerad: "22 oktober 2026",
  },
  {
    slug: "matmoms",
    titel: "Matmoms efter sänkningen",
    etikett: "Moms",
    lead:
      "Livsmedel ligger på 6 procent sedan 1 april 2026, servering är kvar på 12. Samma mat kan alltså ha två satser beroende på var den äts.",
    kontrollerad: "22 oktober 2026",
  },
];
