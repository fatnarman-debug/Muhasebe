# Säkerhetskopiering och återställning

Nattlig, krypterad kopia av Supabase-databasen till Cloudflare R2.

> Läs **Om du måste återställa** först om det är skarpt läge. Resten av
> dokumentet beskriver hur det fungerar och varför.

## Var det körs

| | |
|---|---|
| Server | Strato VPS, Tyskland (37.60.251.54) |
| Skript | `/root/supabase-backup.sh` |
| Schema | `cron`, 03:00 varje natt (`crontab -l` visar den) |
| Mål | `r2eu:enkeltfaktura-backups-eu`, prefix `daily/` |
| Filnamn | `supabase_<datum>_<tid>.sql.gz.age` |

Allt ligger på servern. Det körs alltså **inte** i GitHub Actions – det gjorde
det fram till augusti 2026, och det dokumentet beskrev den lösningen. Den
workflow-filen är borttagen, och eventuella kvarvarande `R2_*`- och
`BACKUP_GPG_PASSPHRASE`-secrets i repots inställningar används inte längre.

## Vad som ingår

Hela databasen via `pg_dump` i vanligt SQL-format: profiler, företag, kunder,
fakturor med rader, offerter, kreditfakturor, betalningar, konsulter,
prenumerationer och loggar.

**Ingår inte:** filer i Supabase Storage (logotyper) och appkoden. Koden ligger
i Git. Logotyper får säkerhetskopieras separat om de blir viktiga.

## Hur den skyddas

Kedjan körs i ett enda rör:

```
pg_dump | gzip | age -r <publik nyckel>
```

Den okrypterade dumpen skrivs därför aldrig till disk – inte ens tillfälligt.
Servern blir inte en plats där hela kundregistret ligger i klartext.

Den **publika** nyckeln står i skriptet. Den är inte hemlig; den kan bara
användas för att kryptera.

Den **privata** nyckeln finns inte på servern. Den finns bara i lösenords-
hanteraren. Det betyder två saker, och båda är viktiga:

1. Någon som tar sig in på servern kan inte läsa kopiorna.
2. **Utan den nyckeln går ingen kopia att öppna. Det finns ingen reserv.**

Punkt två är inte teoretisk. En kopia gick redan förlorad på exakt det sättet,
innan rutinen var på plats. Kontrollera med jämna mellanrum att nyckeln
verkligen går att hämta ur lösenordshanteraren – inte att den "borde ligga där".

### Varför EU-hinken

Hinken är skapad med jurisdiktion **EU**, så att personuppgifterna stannar inom
unionen. Det är det som sägs i integritetspolicyn.

En EU-hink kräver en egen token och en egen adress:

```
https://<konto>.eu.r2.cloudflarestorage.com
```

En token för standardjurisdiktionen ger **403** mot den här hinken, även om den
i övrigt har rätt behörighet. Felet ser ut som ett behörighetsproblem men är det
inte – det är fel adress.

### Tokens

| Namn | Behörighet | Används av |
|---|---|---|
| `enkeltfaktura-backup-eu` | Object Read & Write | nattliga skriptet på servern |
| `enkeltfaktura-monitor-eu` | Object Read only | övervakningen nedan |

Övervakningen har medvetet inte skrivrättighet. Ett kommando som bara ska läsa
ska inte kunna radera.

## Övervakning

Från egen dator:

```bash
python3 ~/.config/claude-seo/check_backup.py
```

Den listar `daily/` och tittar på den senaste filen. Är den äldre än 36 timmar
larmar den. Nycklarna ligger i `~/.config/claude-seo/r2-readonly.env`.

Skriptet stoppar också uppladdning av filer under 20 kB. En trasig eller tom
dump är farligare än ingen dump alls, eftersom den ser ut som en fungerande
kopia i listningen.

## Om du måste återställa

**1. Hämta senaste filen.** Namnen är sorterbara på datum:

```bash
rclone ls r2eu:enkeltfaktura-backups-eu/daily/
rclone copy r2eu:enkeltfaktura-backups-eu/daily/<filnamn> .
```

**2. Dekryptera med den privata nyckeln** från lösenordshanteraren. Lägg den i
en fil, till exempel `nyckel.txt`:

```bash
age -d -i nyckel.txt <filnamn> | gunzip > backup.sql
```

**3. Kontrollera att filen är hel innan du rör någon databas:**

```bash
grep -c "CREATE TABLE" backup.sql   # ska vara 59
tail -1 backup.sql                  # ska innehålla "dump complete"
```

Stämmer inte båda – återställ inte. Ta en äldre fil i stället.

**4. Läs in.** Filen är vanlig SQL, så det är `psql` som gäller – inte
`pg_restore`:

```bash
psql "<ny databas-url>" -f backup.sql
```

**5. Peka om appen.** Uppdatera `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_ANON_KEY` och `SUPABASE_SERVICE_ROLE_KEY` i Coolify, och
kör en ny deploy.

## En kopia räknas inte förrän den har öppnats

Att filen finns i hinken säger bara att något laddades upp. Gör en riktig
provåterställning till en tom databas med jämna mellanrum, enligt stegen ovan.
Det är det enda som visar att nyckeln, formatet och innehållet håller ihop.

## Att ta tag i

- **Gallring.** Kontrollera om hinken har en livscykelregel – det är inte
  avstämt. Saknas den växer lagringen utan slut. En regel på prefixet `daily/`
  som tar bort objekt efter 30 dagar räcker, och sätts under hinkens
  inställningar i Cloudflare.
- **Supabase Storage** ingår inte i kopian. Det spelar roll först när
  logotyperna är svåra att ersätta.
