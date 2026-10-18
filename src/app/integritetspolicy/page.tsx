import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integritetspolicy – Enkelfaktura",
  description: "Så behandlar Enkelfaktura dina personuppgifter enligt GDPR.",
};

export default function IntegritetspolicyPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-800">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">← Till startsidan</Link>

        <div className="mt-6 mb-8 rounded-xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
          <strong>Utkast.</strong> Detta dokument är ett utkast som bör granskas av en jurist innan publicering. Fält inom [hakparentes] ska fyllas i med era riktiga uppgifter.
        </div>

        <h1 className="text-3xl font-bold text-stone-900 mb-2">Integritetspolicy</h1>
        <p className="text-sm text-stone-500 mb-10">Senast uppdaterad: [ÅÅÅÅ-MM-DD]</p>

        <div className="space-y-8 leading-relaxed text-[15px]">
          <section>
            <p>
              Den här integritetspolicyn beskriver hur Enkelfaktura (&quot;vi&quot;, &quot;oss&quot;)
              samlar in och behandlar personuppgifter när du använder vår tjänst för fakturering
              och offerter (&quot;tjänsten&quot;). Vi behandlar personuppgifter i enlighet med
              dataskyddsförordningen (GDPR).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">Personuppgiftsansvarig</h2>
            <p>
              [Företagsnamn AB], org.nr [org.nr], [postadress].
              Kontakt i dataskyddsfrågor: [kontakt-e-post].
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">Två olika roller</h2>
            <p>
              När du registrerar och använder ett konto är vi <strong>personuppgiftsansvariga</strong>{" "}
              för dina konto- och kontaktuppgifter. När du som företag lägger in uppgifter om dina
              egna kunder och fakturamottagare behandlar vi dessa <strong>som personuppgiftsbiträde</strong>{" "}
              på dina instruktioner – då är du personuppgiftsansvarig. Läs mer på vår{" "}
              <Link href="/gdpr" className="text-stone-900 underline">GDPR-sida</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">Vilka personuppgifter vi behandlar</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Kontouppgifter: namn och e-postadress när du registrerar ett konto.</li>
              <li>Företagsuppgifter: företagsnamn, organisationsnummer, adress, bankgiro/plusgiro och andra uppgifter du anger för din fakturering.</li>
              <li>Kund- och fakturauppgifter: uppgifter om dina kunder och de fakturor du skapar, vilket kan innehålla namn, adress, organisationsnummer och i vissa fall personnummer.</li>
              <li>Teknisk data: inloggnings- och användningsinformation som behövs för att tjänsten ska fungera och vara säker.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">Varför vi behandlar uppgifterna</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>För att tillhandahålla tjänsten – skapa konto samt skapa och skicka fakturor och offerter.</li>
              <li>För att skicka e-post, till exempel fakturor och påminnelser till dina kunder på din begäran.</li>
              <li>För att uppfylla rättsliga krav, bland annat bokföringslagens krav på arkivering.</li>
              <li>För att hålla tjänsten säker och förhindra missbruk.</li>
            </ul>
            <p className="mt-3">
              Den rättsliga grunden är fullgörande av avtal (att leverera tjänsten till dig),
              rättslig förpliktelse (t.ex. bokföringslagen) och i förekommande fall berättigat intresse.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">Var dina uppgifter lagras</h2>
            <p>
              All data lagras på servrar inom EU. Säkerhetskopior är krypterade (AES-256).
              För att skicka e-post anlitar vi Resend som e-postleverantör. Sådana leverantörer
              är våra personuppgiftsbiträden och behandlar uppgifter endast enligt våra instruktioner.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">Hur länge vi sparar uppgifter</h2>
            <p>
              Fakturaunderlag och bokföringsinformation sparas så länge som bokföringslagen kräver
              (normalt sju år). Övriga kontouppgifter sparas så länge du har ett aktivt konto.
              Avslutar du ditt konto raderar vi personuppgifter som vi inte är skyldiga att behålla.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">Dina rättigheter</h2>
            <p className="mb-2">Enligt GDPR har du rätt att:</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Få tillgång till de uppgifter vi behandlar om dig.</li>
              <li>Begära rättelse av felaktiga uppgifter.</li>
              <li>Begära radering av uppgifter som vi inte är skyldiga att behålla.</li>
              <li>Begära utdrag av dina uppgifter (dataportabilitet).</li>
              <li>Invända mot viss behandling.</li>
            </ul>
            <p className="mt-3">
              Vill du utöva någon av dessa rättigheter, kontakta oss på [kontakt-e-post].
              Du har även rätt att lämna klagomål till Integritetsskyddsmyndigheten (IMY).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">Cookies</h2>
            <p>
              Vi använder nödvändiga cookies för att hålla dig inloggad och för att tjänsten
              ska fungera. Vi använder inte cookies för marknadsföring eller spårning av tredje part.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">Kontakt</h2>
            <p>
              Har du frågor om hur vi behandlar dina personuppgifter är du välkommen att
              kontakta oss på [kontakt-e-post].
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
