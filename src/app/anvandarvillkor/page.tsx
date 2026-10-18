import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Användarvillkor – Enkelfaktura",
  description: "Villkor för att använda Enkelfakturas faktureringstjänst.",
};

export default function AnvandarvillkorPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-800">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">← Till startsidan</Link>

        <h1 className="text-3xl font-bold text-stone-900 mt-6 mb-2">Användarvillkor</h1>
        <p className="text-sm text-stone-500 mb-10">Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}</p>

        <div className="space-y-8 leading-relaxed text-[15px]">
          <section>
            <p>
              Dessa användarvillkor gäller när du använder Enkelfaktura (&quot;tjänsten&quot;).
              Genom att skapa ett konto och använda tjänsten godkänner du villkoren.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">1. Tjänsten</h2>
            <p>
              Enkelfaktura är ett webbaserat verktyg för att skapa, skicka och hantera fakturor
              och offerter. Tjänsten riktar sig till egenföretagare, enskilda firmor, aktiebolag
              och redovisningsbyråer i Sverige.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">2. Konto och ansvar</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>Du ansvarar för att uppgifterna du anger är korrekta.</li>
              <li>Du ansvarar för att hålla dina inloggningsuppgifter säkra.</li>
              <li>Du ansvarar för innehållet i de fakturor och offerter du skapar och skickar.</li>
              <li>Du får inte använda tjänsten för olaglig verksamhet eller för att skicka oönskad e-post.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">3. Priser och betalning</h2>
            <p>
              Du kan prova tjänsten kostnadsfritt under provperioden. Därefter krävs ett betalt
              abonnemang för att fortsätta använda tjänsten. Aktuella priser visas på vår
              prissida. Abonnemanget löper utan bindningstid om inget annat anges, och du kan
              avsluta när du vill. Ditt material finns kvar enligt vad som anges nedan.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">4. Dina uppgifter och bokföring</h2>
            <p>
              Du äger de uppgifter och det material du lägger in i tjänsten. Observera att
              fakturaunderlag omfattas av bokföringslagen och ska arkiveras under den tid lagen
              kräver (normalt sju år). En skickad faktura kan därför inte raderas – i stället
              skapas en kreditfaktura. Hur vi behandlar personuppgifter beskrivs i vår{" "}
              <Link href="/integritetspolicy" className="text-stone-900 underline">integritetspolicy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">5. Tillgänglighet</h2>
            <p>
              Vi strävar efter hög tillgänglighet men kan inte garantera att tjänsten alltid är
              fri från avbrott. Vi gör regelbundna säkerhetskopior av dina uppgifter.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">6. Ansvarsbegränsning</h2>
            <p>
              Tjänsten tillhandahålls i befintligt skick. Du ansvarar själv för att de fakturor
              och belopp du skapar är korrekta. Vi ansvarar inte för indirekta skador som kan
              uppstå vid användning av tjänsten, i den utsträckning lagen tillåter.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">7. Ändringar</h2>
            <p>
              Vi kan uppdatera dessa villkor. Väsentliga ändringar meddelar vi i tjänsten eller
              via e-post. Fortsatt användning efter en ändring innebär att du godkänner de
              uppdaterade villkoren.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">8. Kontakt</h2>
            <p>
              Frågor om villkoren? Kontakta oss på{" "}
              <a href="mailto:info@enkeltfaktura.com" className="text-stone-900 underline">info@enkeltfaktura.com</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
