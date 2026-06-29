import type { Metadata } from "next";
import Link from "next/link";
import { H1, H2, P, UL, Updated, Draft } from "@/components/legal/prose";

export const metadata: Metadata = {
  title: "Integritetspolicy",
  description: "Så behandlar Enkelfaktura personuppgifter enligt GDPR.",
  alternates: { canonical: "/integritetspolicy" },
};

export default function IntegritetspolicyPage() {
  return (
    <article>
      <Draft />
      <H1>Integritetspolicy</H1>
      <Updated>Senast uppdaterad: [ÅÅÅÅ-MM-DD]</Updated>

      <P>
        Enkelfaktura (”vi”, ”oss”) värnar om din integritet. Den här policyn beskriver hur vi samlar in och
        behandlar personuppgifter när du använder vår tjänst för fakturering och offerter (”tjänsten”).
      </P>
      <P>
        <strong>Två olika roller:</strong> När du registrerar och använder ett konto är vi
        <strong> personuppgiftsansvariga</strong> för dina konto- och kontaktuppgifter. När du som företag lägger in
        uppgifter om dina egna kunder och fakturamottagare behandlar vi dessa <strong>som personuppgiftsbiträde</strong> på
        dina instruktioner – då är du personuppgiftsansvarig. Läs mer på vår <Link href="/gdpr" className="text-blue-700 underline">GDPR-sida</Link>.
      </P>

      <H2>Personuppgiftsansvarig</H2>
      <P>
        [Företagsnamn AB], org.nr [org.nr], [postadress]. Kontakt i dataskyddsfrågor: [kontakt-e-post].
      </P>

      <H2>Vilka personuppgifter vi behandlar</H2>
      <P>Som personuppgiftsansvariga för ditt konto behandlar vi bland annat:</P>
      <UL>
        <li>Namn, e-postadress och lösenord (lagras krypterat/hashat)</li>
        <li>Företagsnamn, organisationsnummer och roll (t.ex. egenföretagare, byråansvarig, konsult)</li>
        <li>Inloggnings- och aktivitetsloggar samt IP-adress</li>
        <li>Eventuell betal- och faktureringsinformation för din prenumeration</li>
      </UL>
      <P>
        De uppgifter du själv lägger in om dina kunder och fakturor (inkl. namn, adress, org.nr eller personnummer)
        behandlar vi som biträde – se <Link href="/gdpr" className="text-blue-700 underline">GDPR-sidan</Link>.
      </P>

      <H2>Ändamål och rättslig grund</H2>
      <UL>
        <li><strong>Tillhandahålla tjänsten</strong> och fullgöra avtalet med dig – rättslig grund: avtal (art. 6.1 b).</li>
        <li><strong>Fakturering och bokföring</strong> – rättslig grund: rättslig förpliktelse (art. 6.1 c), bl.a. bokföringslagen.</li>
        <li><strong>Säkerhet, loggning och förebyggande av missbruk</strong> – rättslig grund: berättigat intresse (art. 6.1 f).</li>
        <li><strong>Kommunikation och support</strong> – rättslig grund: avtal / berättigat intresse.</li>
        <li><strong>Eventuell marknadsföring</strong> – rättslig grund: samtycke eller berättigat intresse (du kan alltid avregistrera dig).</li>
      </UL>

      <H2>Hur länge vi sparar uppgifterna</H2>
      <UL>
        <li><strong>Kontouppgifter:</strong> så länge ditt konto är aktivt och därefter i upp till [X] månader.</li>
        <li><strong>Räkenskapsinformation</strong> (fakturor och underlag): minst <strong>7 år</strong> efter utgången av det kalenderår då räkenskapsåret avslutades, enligt bokföringslagen – även efter att kontot avslutats.</li>
        <li><strong>Loggar och säkerhetsdata:</strong> upp till [12] månader.</li>
      </UL>

      <H2>Mottagare och underbiträden</H2>
      <P>
        Vi säljer aldrig dina uppgifter. Vi delar uppgifter med leverantörer som hjälper oss att driva tjänsten
        (personuppgiftsbiträden), t.ex. för databas/lagring, e-postutskick och drift. En aktuell lista finns på vår
        <Link href="/gdpr" className="text-blue-700 underline"> GDPR-sida</Link>.
      </P>

      <H2>Överföring till tredjeland</H2>
      <P>
        Vi strävar efter att lagra och behandla data inom EU/EES. Om ett underbiträde behandlar uppgifter utanför EU/EES
        sker det med lämpliga skyddsåtgärder, t.ex. EU-kommissionens standardavtalsklausuler (art. 46). [Ange konkret om/när detta sker.]
      </P>

      <H2>Dina rättigheter</H2>
      <UL>
        <li>Rätt till <strong>tillgång</strong> till dina uppgifter (art. 15)</li>
        <li>Rätt till <strong>rättelse</strong> (art. 16) och <strong>radering</strong> (art. 17)</li>
        <li>Rätt till <strong>begränsning</strong> (art. 18) och <strong>dataportabilitet</strong> (art. 20)</li>
        <li>Rätt att <strong>invända</strong> mot behandling (art. 21) och att återkalla lämnat samtycke</li>
      </UL>
      <P>
        Observera att rätten till radering begränsas av vår skyldighet att spara räkenskapsinformation i 7 år. För att
        utöva dina rättigheter, kontakta [kontakt-e-post].
      </P>

      <H2>Cookies</H2>
      <P>
        Tjänsten använder nödvändiga cookies för inloggning och säkerhet. [Beskriv eventuella analys-/marknadsföringscookies
        och hur samtycke inhämtas.]
      </P>

      <H2>Klagomål</H2>
      <P>
        Om du anser att vi behandlar dina personuppgifter felaktigt har du rätt att lämna klagomål till
        Integritetsskyddsmyndigheten (IMY), <span className="whitespace-nowrap">www.imy.se</span>.
      </P>

      <H2>Ändringar i policyn</H2>
      <P>
        Vi kan komma att uppdatera denna policy. Den senaste versionen publiceras alltid på den här sidan med uppdaterat datum.
      </P>
    </article>
  );
}
