import type { Metadata } from "next";
import Link from "next/link";
import { H1, H2, P, UL, Updated, Draft } from "@/components/legal/prose";

export const metadata: Metadata = {
  title: "GDPR & personuppgiftsbiträdesavtal",
  description: "Enkelfakturas roll som personuppgiftsbiträde, biträdesavtal och underbiträden.",
  alternates: { canonical: "/gdpr" },
};

const subprocessors = [
  ["Supabase", "Databas, autentisering och fillagring", "EU (Irland)"],
  ["Resend", "Utskick av faktura- och påminnelsemejl", "[EU / USA – ange]"],
  ["[Hostingleverantör / Coolify]", "Drift och hosting av applikationen", "[ange region – helst EU]"],
];

export default function GdprPage() {
  return (
    <article>
      <Draft />
      <H1>GDPR &amp; personuppgiftsbiträdesavtal</H1>
      <Updated>Senast uppdaterad: [ÅÅÅÅ-MM-DD]</Updated>

      <P>
        Den här sidan förklarar Enkelfakturas roller enligt dataskyddsförordningen (GDPR) och utgör en sammanfattning av det
        personuppgiftsbiträdesavtal (PUB-avtal) som gäller när du använder tjänsten.
      </P>

      <H2>Våra roller</H2>
      <UL>
        <li><strong>Personuppgiftsansvarig</strong> – för dina konto- och kontaktuppgifter (se <Link href="/integritetspolicy" className="text-blue-700 underline">Integritetspolicyn</Link>).</li>
        <li><strong>Personuppgiftsbiträde</strong> – för de personuppgifter du som kund lägger in om dina egna kunder och fakturamottagare. Då är <strong>du</strong> personuppgiftsansvarig och vi behandlar uppgifterna på dina instruktioner.</li>
      </UL>

      <H2>Personuppgiftsbiträdesavtal – sammanfattning</H2>
      <P>När du använder Enkelfaktura för att behandla dina kunders personuppgifter gäller följande mellan dig (ansvarig) och oss (biträde):</P>
      <UL>
        <li><strong>Föremål och ändamål:</strong> behandling av kunddata för att skapa, skicka och hantera fakturor och offerter på dina instruktioner.</li>
        <li><strong>Typ av uppgifter:</strong> namn, adress, e-post, organisationsnummer eller personnummer samt fakturauppgifter.</li>
        <li><strong>Varaktighet:</strong> så länge du använder tjänsten samt lagstadgad arkiveringstid (minst 7 år enligt bokföringslagen).</li>
        <li><strong>Våra skyldigheter:</strong> behandla uppgifter endast enligt dina dokumenterade instruktioner, iaktta sekretess, vidta lämpliga säkerhetsåtgärder, bistå dig vid de registrerades rättigheter, samt radera eller återlämna uppgifter efter avslutat uppdrag (med förbehåll för lagkrav).</li>
        <li><strong>Underbiträden:</strong> du godkänner att vi anlitar de underbiträden som anges nedan, och vi ålägger dem motsvarande skyldigheter.</li>
        <li><strong>Personuppgiftsincident:</strong> vi underrättar dig utan onödigt dröjsmål om vi upptäcker en incident som rör dina uppgifter.</li>
        <li><strong>Granskning:</strong> du har rätt att få information som visar att vi följer våra skyldigheter.</li>
      </UL>
      <P>
        Ett fullständigt, undertecknat personuppgiftsbiträdesavtal kan tillhandahållas på begäran: [kontakt-e-post].
      </P>

      <H2>Underbiträden</H2>
      <div className="overflow-x-auto -mx-1 mb-4">
        <table className="w-full text-sm border border-slate-200 rounded-lg overflow-hidden">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              <th className="text-left font-semibold px-4 py-2.5">Leverantör</th>
              <th className="text-left font-semibold px-4 py-2.5">Ändamål</th>
              <th className="text-left font-semibold px-4 py-2.5">Plats</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {subprocessors.map(([name, purpose, place]) => (
              <tr key={name}>
                <td className="px-4 py-2.5 font-medium text-slate-800">{name}</td>
                <td className="px-4 py-2.5 text-slate-600">{purpose}</td>
                <td className="px-4 py-2.5 text-slate-600">{place}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <P className="text-sm">[Uppdatera listan om ni byter eller lägger till leverantörer. Ange faktisk region för varje tjänst.]</P>

      <H2>Säkerhetsåtgärder</H2>
      <UL>
        <li>Kryptering av data i transit (TLS) och av säkerhetskopior (AES-256)</li>
        <li>Åtkomststyrning per roll – varje konsult ser bara sina egna tilldelade kunder (radnivåsäkerhet, RLS, i databasen)</li>
        <li>Loggning av känsliga administrativa åtgärder (revisionslogg)</li>
        <li>Säkerhetskopior lagrade inom EU</li>
      </UL>

      <H2>De registrerades rättigheter</H2>
      <P>
        Är du en privatperson vars uppgifter finns i tjänsten (t.ex. som fakturamottagare)? Kontakta då i första hand det
        företag som är personuppgiftsansvarigt (vår kund). Vi bistår våra kunder med att uppfylla dina rättigheter enligt GDPR.
      </P>

      <H2>Lagring och radering</H2>
      <P>
        Räkenskapsinformation sparas i minst 7 år enligt bokföringslagen. Övriga personuppgifter raderas eller anonymiseras
        efter avslutat uppdrag i enlighet med <Link href="/integritetspolicy" className="text-blue-700 underline">Integritetspolicyn</Link>.
      </P>

      <H2>Kontakt och klagomål</H2>
      <P>
        Kontakta oss i dataskyddsfrågor på [kontakt-e-post]. Du kan även lämna klagomål till Integritetsskyddsmyndigheten
        (IMY), <span className="whitespace-nowrap">www.imy.se</span>.
      </P>
    </article>
  );
}
