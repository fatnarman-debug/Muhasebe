# Skydd mot falska konton

Två spärrar vid registreringen: e-postbekräftelse och Turnstile.

## Om något är fel just nu

Kan ingen logga in, och det börjar efter en ändring av captcha? Sätt i Coolify
på Supabase-tjänsten:

```
GOTRUE_SECURITY_CAPTCHA_ENABLED=false
```

och starta om tjänsten. Inloggningen fungerar igen inom någon minut. Rutan
ligger kvar på sidorna men ingen kontroll görs – koden behöver inte röras.

## E-postbekräftelse

`ENABLE_EMAIL_AUTOCONFIRM=false` på Supabase-tjänsten.

Var tidigare `true`, vilket innebar att vem som helst kunde skriva in en
påhittad adress och få ett konto med provperiod direkt. Värst var att det gick
att registrera sig med **någon annans** adress: den riktiga ägaren möttes sedan
av "adressen är redan registrerad" och kunde inte skapa konto. I ett
faktureringsprogram är det inte acceptabelt.

Registreringssidan hanterar båda lägena. Är bekräftelse på visas "kolla din
e-post" i stället för att användaren släpps in.

## Turnstile

Cloudflares captcha, på **alla tre** vägarna: inloggning, registrering och
lösenordsåterställning.

```
GOTRUE_SECURITY_CAPTCHA_ENABLED=true
GOTRUE_SECURITY_CAPTCHA_PROVIDER=turnstile
GOTRUE_SECURITY_CAPTCHA_SECRET=<Secret Key från Cloudflare>
```

Och på Next.js-appen:

```
NEXT_PUBLIC_TURNSTILE_SITE_KEY=<Site Key från Cloudflare>
```

Site Key syns i webbläsaren och är inte hemlig. Secret Key är det.

### Varför alla tre sidorna

GoTrue kräver en token på inloggning, registrering **och**
lösenordsåterställning så fort captcha slås på. Saknas rutan på någon av dem
går den vägen inte längre att använda – och det märks inte förrän någon
försöker. Lägger du till en ny inloggningsväg måste den också ha rutan.

### Ordningen när något ändras

Koden ut först, serverinställningen sen. Slås captcha på innan rutan finns ute
kräver servern en token som webbläsaren inte skickar, och ingen kan logga in
under tiden.

### Varför bekräftelsen inte räckte

E-postbekräftelsen stoppar åtkomsten, men inte försöket. Ett skript kan
fortfarande fylla i formuläret, och för varje försök skickas ett mejl till en
adress som inte finns. De studsarna skadar avsändarryktet, och då hamnar
riktiga fakturautskick i skräpposten. Turnstile stoppar skriptet innan något
mejl skickas.

Turnstile framför reCAPTCHA för att den inte profilerar besökaren. En captcha
som samlar in uppgifter skulle behöva stöd i integritetspolicyn.

### Att tokenen bara gäller en gång

Misslyckas ett anrop nollställs rutan i koden. Görs inte det skickar nästa
försök samma förbrukade token och avvisas – för användaren ser det ut som fel
lösenord igen, hur många gånger hen än provar.

## Kontrollera att det är påslaget

Ett anrop utan token ska avvisas på alla tre:

```bash
curl -s -X POST "https://api.enkeltfaktura.com/auth/v1/signup" \
  -H "apikey: <anon-nyckeln>" -H "Content-Type: application/json" \
  -d '{"email":"test@example.invalid","password":"Test123456!"}'
```

Svaret ska innehålla `captcha verification process failed`. Kommer ett vanligt
svar är captcha avstängt. Anon-nyckeln finns i webbläsarens javascript och är
inte hemlig.

## Kvar att göra

Registrering via telefon är påslaget (`phone: true`, `phone_autoconfirm: true`)
och används inte. Det är en väg in som ingen bevakar och bör stängas.
