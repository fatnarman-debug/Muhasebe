import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "GDPR – Enkelfaktura",
  description: "Så arbetar Enkelfaktura med dataskydd och GDPR.",
};

export default function GdprPage() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-800">
      <div className="max-w-3xl mx-auto px-6 py-16">
        <Link href="/" className="text-sm text-stone-500 hover:text-stone-900">← Till startsidan</Link>

        <h1 className="text-3xl font-bold text-stone-900 mt-6 mb-2">GDPR &amp; dataskydd</h1>
        <p className="text-sm text-stone-500 mb-10">Senast uppdaterad: {new Date().toLocaleDateString("sv-SE")}</p>

        <div className="space-y-8 leading-relaxed text-[15px]">
          <section>
            <p>
              Enkelfaktura är byggt med dataskydd i åtanke. Här sammanfattar vi hur vi arbetar
              enligt dataskyddsförordningen (GDPR). En fullständig beskrivning av hur vi behandlar
              personuppgifter finns i vår{" "}
              <Link href="/integritetspolicy" className="text-stone-900 underline">integritetspolicy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">Data inom EU</h2>
            <p>
              All data lagras på servrar inom EU. Säkerhetskopior är krypterade med AES-256.
              Vi säljer aldrig dina uppgifter vidare.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">Personuppgiftsbiträde</h2>
            <p>
              När du använder Enkelfaktura för att hantera uppgifter om dina egna kunder är du
              personuppgiftsansvarig och vi är ditt personuppgiftsbiträde. Vi behandlar dessa
              uppgifter endast för att leverera tjänsten till dig. Behöver du ett separat
              personuppgiftsbiträdesavtal (PUB-avtal) kan du kontakta oss.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">Dina rättigheter</h2>
            <p>
              Du har rätt till tillgång, rättelse, radering, dataportabilitet och att invända
              mot behandling. Du kan också lämna klagomål till Integritetsskyddsmyndigheten (IMY).
              Läs mer i vår{" "}
              <Link href="/integritetspolicy" className="text-stone-900 underline">integritetspolicy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-stone-900 mb-3">Kontakt</h2>
            <p>
              Frågor om dataskydd? Kontakta oss på{" "}
              <a href="mailto:info@enkeltfaktura.com" className="text-stone-900 underline">info@enkeltfaktura.com</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
