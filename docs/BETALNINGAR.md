# Betalningar

Prenumerationer via Stripe Checkout. Kortuppgifter passerar aldrig våra
servrar – besökaren skickas till Stripes egen sida och kommer tillbaka.

## Flödet

1. Ett nytt konto får 14 dagars provperiod. Det sätts i databasen vid
   registreringen (`trial_ends_at`), inte av Stripe, och kräver inget kort.
2. När provperioden tar slut släpper `dashboard/layout.tsx` inte in användaren
   utan skickar den till `/uppgradera`.
3. Där väljs plan och betalningsperiod. `/api/checkout` öppnar en betalning och
   returnerar en länk till Stripe.
4. Stripe meddelar `/api/stripe/webhook` när något händer med prenumerationen.
   Webhooken skriver om `subscription_status` i `profiles`.
5. Uppsägning och kortbyte sker på Stripes egen sida, via `/api/stripe/portal`.
   Länken finns under Inställningar → Dina uppgifter.

## Tre regler som inte får ändras

**Priset bestäms på servern.** Webbläsaren skickar bara `"egen"` eller
`"byra"` – aldrig ett belopp och aldrig ett `price_id`. Allt som går att ändra
i en begäran kommer förr eller senare att ändras.

**Webhookens signatur kontrolleras.** Adressen är öppen mot internet. Utan
kontrollen mot `STRIPE_WEBHOOK_SECRET` kan vem som helst skicka en begäran och
göra sig själv till betalande kund. Kroppen måste läsas som text, inte json –
signaturen gäller exakt de bytes Stripe skickade.

**Webhooken skriver med `service_role`.** Triggern
`protect_subscription_columns` hindrar vanliga användare från att röra
`subscription_status`, `stripe_customer_id` med flera, och gör undantag just
för `service_role`. Den triggern är ett säkerhetsfix – ta inte bort den.

## Moms

Priserna anges **utan moms**, vilket också står på prissidan. Stripe lägger på
25 procent svensk moms via en skattesats som är skapad i Stripe och anges i
`STRIPE_TAX_RATE_SE`.

Saknas den variabeln vägrar `/api/checkout` att starta en betalning. Det är
med flit: ett köp utan moms ser ut att fungera, men kvittot blir fel och
mellanskillnaden blir vår att betala i efterhand.

| Plan | Utan moms | Moms 25 % | Kunden betalar |
|---|---|---|---|
| Egen, månad | 79 kr | 19,75 kr | 98,75 kr |
| Egen, år | 790 kr | 197,50 kr | 987,50 kr |
| Byrå, månad | 299 kr | 74,75 kr | 373,75 kr |
| Byrå, år | 2 990 kr | 747,50 kr | 3 737,50 kr |

Årspriset är tio månadsavgifter för tolv månader.

## Provperioden när någon betalar tidigt

Betalar kunden på dag 3 av 14 skickas `trial_end` med till Stripe, så att
första dragningen sker när provperioden ändå hade tagit slut. Ingen betalar för
dagar hen redan hade gratis.

Stripe avvisar en provperiod som tar slut för snart. Är det mindre än 48 timmar
kvar, eller har provperioden redan gått ut, skickas `trial_end` inte med och
kunden debiteras direkt.

## Status

Stripes status översätts i `tillVarStatus()`:

| Stripe | Vår | Åtkomst |
|---|---|---|
| `trialing` | `trialing` | ja |
| `active` | `active` | ja |
| `past_due` | `past_due` | **ja** |
| `canceled` | `canceled` | nej |
| `unpaid`, `incomplete_expired` | `expired` | nej |

`past_due` ger fortsatt åtkomst med flit. Ett kort som gått ut ska inte stänga
av faktureringen mitt i månaden – Stripe försöker igen i några dagar, och först
när den ger upp blir prenumerationen `unpaid` eller `canceled`.

Händelser kan komma flera gånger och i fel ordning. Varje hanterare skriver
därför hela tillståndet på nytt i stället för att ändra stegvis, så att samma
händelse två gånger ger samma resultat.

## Miljövariabler

Sätts i Coolify. De två första är hemliga.

| Variabel | Var den hämtas |
|---|---|
| `STRIPE_SECRET_KEY` | Stripe → Developers → API keys (`sk_test_…` / `sk_live_…`) |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Developers → Webhooks → din endpoint (`whsec_…`) |
| `STRIPE_PRICE_EGEN_MONTH` | price-id för Egen, månad |
| `STRIPE_PRICE_EGEN_YEAR` | price-id för Egen, år |
| `STRIPE_PRICE_BYRA_MONTH` | price-id för Byrå, månad |
| `STRIPE_PRICE_BYRA_YEAR` | price-id för Byrå, år |
| `STRIPE_TAX_RATE_SE` | id för skattesatsen, 25 % Sverige (`txr_…`) |

Webhookens adress är `https://enkeltfaktura.com/api/stripe/webhook` och den ska
lyssna på `checkout.session.completed`, `customer.subscription.created`,
`customer.subscription.updated`, `customer.subscription.deleted` och
`invoice.payment_failed`.

## Testa

Stripe har ett testläge med egna nycklar och egna priser. Kort som fungerar:

| Kort | Vad som händer |
|---|---|
| `4242 4242 4242 4242` | går igenom |
| `4000 0025 0000 3155` | kräver 3D Secure |
| `4000 0000 0000 9995` | nekas, täckning saknas |

Vilket utgångsdatum och vilken CVC som helst, så länge datumet är i framtiden.

Webhooken når inte localhost utifrån. Vidarebefordra den under utveckling:

```bash
stripe listen --forward-to localhost:3001/api/stripe/webhook
```

Kommandot skriver ut en egen `whsec_…` som gäller just den sessionen.

## Innan testläget byts mot skarpt läge

- Byt alla sju variabler till live-värden. Priser och skattesats finns **inte**
  i båda lägena – de måste skapas på nytt i skarpt läge.
- Lägg upp webhooken på nytt i skarpt läge och hämta en ny `whsec_…`.
- Gör ett riktigt köp med eget kort och säg upp det. Kvittot ska visa moms som
  egen rad.
