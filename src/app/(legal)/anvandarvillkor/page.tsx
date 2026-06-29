import type { Metadata } from "next";
import Link from "next/link";
import { H1, H2, P, UL, Updated, Draft } from "@/components/legal/prose";

export const metadata: Metadata = {
  title: "Användarvillkor",
  description: "Villkor för användning av Enkelfaktura.",
  alternates: { canonical: "/anvandarvillkor" },
};

export default function AnvandarvillkorPage() {
  return (
    <article>
      <Draft />
      <H1>Användarvillkor</H1>
      <Updated>Senast uppdaterad: [ÅÅÅÅ-MM-DD]</Updated>

      <P>
        Dessa villkor gäller mellan dig (”kunden”, ”du”) och [Företagsnamn AB], org.nr [org.nr] (”Enkelfaktura”, ”vi”), när du
        använder tjänsten Enkelfaktura. Genom att skapa ett konto godkänner du villkoren.
      </P>

      <H2>1. Om tjänsten</H2>
      <P>
        Enkelfaktura är ett webbaserat verktyg för att skapa, skicka och hantera fakturor och offerter samt kunder, anpassat
        för svenska företag. Funktionernas omfattning kan variera beroende på vald plan.
      </P>

      <H2>2. Konto och ansvar</H2>
      <UL>
        <li>Du ska lämna riktiga uppgifter och hålla dem uppdaterade.</li>
        <li>Du ansvarar för att skydda dina inloggningsuppgifter och för all aktivitet som sker via ditt konto.</li>
        <li>Du måste ha rätt att företräda det företag du registrerar och vara minst 18 år.</li>
      </UL>

      <H2>3. Tillåten användning</H2>
      <UL>
        <li>Tjänsten får endast användas för laglig affärsverksamhet.</li>
        <li>Det är inte tillåtet att försöka kringgå säkerhet, störa driften, sprida skadlig kod eller använda tjänsten för olaglig verksamhet.</li>
        <li>Du ansvarar för det innehåll (fakturor, kund- och personuppgifter) du lägger in och för att du har rätt att behandla det.</li>
      </UL>

      <H2>4. Priser och betalning</H2>
      <UL>
        <li>Avgifter följer vid var tid gällande prislista. Det finns en kostnadsfri plan samt betalplaner. Priser anges exklusive moms.</li>
        <li>[Beskriv betalningsvillkor, fakturerings-/prenumerationsperiod, förnyelse och eventuell återbetalningspolicy.]</li>
      </UL>

      <H2>5. Tillgänglighet</H2>
      <P>
        Vi strävar efter hög tillgänglighet men kan inte garantera att tjänsten är fri från avbrott. Planerat underhåll och
        oförutsedda driftstörningar kan förekomma.
      </P>

      <H2>6. Immateriella rättigheter</H2>
      <P>
        Tjänsten, dess programvara och innehåll tillhör Enkelfaktura. Du behåller alla rättigheter till ditt eget innehåll och
        din egen data. Du får en icke-exklusiv rätt att använda tjänsten enligt dessa villkor.
      </P>

      <H2>7. Ansvarsbegränsning</H2>
      <P>
        Tjänsten tillhandahålls ”i befintligt skick”. Vi ansvarar inte för indirekta skador eller utebliven vinst. Vårt
        sammanlagda ansvar är begränsat till de avgifter du betalat de senaste [12] månaderna. Du ansvarar själv för att dina
        fakturor är korrekta och för att följa bokförings- och skatteregler (t.ex. bokföringslagen och Skatteverkets krav).
      </P>

      <H2>8. Uppsägning</H2>
      <P>
        Du kan när som helst säga upp ditt konto. Vi kan stänga av eller säga upp konton som bryter mot villkoren.
        Räkenskapsinformation sparas enligt lag (minst 7 år) även efter uppsägning.
      </P>

      <H2>9. Personuppgifter</H2>
      <P>
        Vår behandling av personuppgifter beskrivs i <Link href="/integritetspolicy" className="text-blue-700 underline">Integritetspolicyn</Link> och på
        vår <Link href="/gdpr" className="text-blue-700 underline">GDPR-sida</Link> (inkl. personuppgiftsbiträdesavtal).
      </P>

      <H2>10. Ändringar av villkoren</H2>
      <P>
        Vi kan komma att ändra dessa villkor. Väsentliga ändringar meddelas i förväg, och fortsatt användning innebär att du
        godkänner de uppdaterade villkoren.
      </P>

      <H2>11. Tillämplig lag och tvist</H2>
      <P>
        Svensk lag tillämpas. Tvister ska i första hand lösas i samförstånd och i annat fall avgöras av svensk allmän domstol,
        med [ort] tingsrätt som första instans.
      </P>
    </article>
  );
}
