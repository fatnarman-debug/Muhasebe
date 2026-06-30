# Databas-backup & återställning

Nattlig, krypterad backup av Supabase-databasen till Cloudflare R2.
Workflow: [`.github/workflows/db-backup.yml`](../.github/workflows/db-backup.yml) — körs 02:00 UTC varje natt + manuellt via **Actions → Nightly DB Backup → Run workflow**.

## Vad som ingår
- **Hela databasen** (`pg_dump -Fc`): profiler, företag, kunder, alla fakturor + rader, offerter, kreditfakturor, betalningar, konsulter, prenumerationsstatus, loggar – allt.
- **Ingår INTE:** filer i Supabase Storage (logotyper) och appkod (koden finns i Git). Logotyper kan vid behov säkerhetskopieras separat.

## GitHub-secrets som krävs
Repo → **Settings → Secrets and variables → Actions → New repository secret**:

| Secret | Värde |
|---|---|
| `SUPABASE_DB_URL` | Supabase **Session pooler**-anslutningssträng (Settings → Database → Connection string → URI). OBS: använd pooler-strängen (IPv4), inte transaction-pooler. |
| `R2_ACCOUNT_ID` | Cloudflare Account ID (syns på R2-sidan) |
| `R2_ACCESS_KEY_ID` | Från R2 API-token |
| `R2_SECRET_ACCESS_KEY` | Från R2 API-token |
| `R2_BUCKET` | Bucket-namnet, t.ex. `enkelfaktura-backups` |
| `BACKUP_GPG_PASSPHRASE` | Hemlig lösenfras (generera: `openssl rand -base64 32`). **SPARA SÄKERT** – utan den går backuperna inte att läsa. |

## Rotation (radera gamla automatiskt)
Sätt en lifecycle-regel i R2 (engångs): Bucket → **Settings → Object lifecycle rules → Add rule** → prefix `db/` → *Delete objects 30 days after creation*.

## Återställning (vid behov)
1. **Hämta senaste backup** (lista och ladda ner):
   ```bash
   export AWS_ACCESS_KEY_ID=...  AWS_SECRET_ACCESS_KEY=...  AWS_DEFAULT_REGION=auto
   EP=https://<R2_ACCOUNT_ID>.r2.cloudflarestorage.com
   aws s3 ls s3://<bucket>/db/ --endpoint-url $EP
   aws s3 cp s3://<bucket>/db/backup-<DATUM>.dump.gpg . --endpoint-url $EP
   ```
2. **Dekryptera:**
   ```bash
   gpg --batch --passphrase "<BACKUP_GPG_PASSPHRASE>" \
     --decrypt backup-<DATUM>.dump.gpg > backup.dump
   ```
3. **Återställ** till ett nytt Supabase-projekt (eller valfri Postgres):
   ```bash
   pg_restore --no-owner --no-privileges --clean --if-exists \
     -d "<NYA_DB_URL>" backup.dump
   ```
4. **Peka om appen:** uppdatera `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` i Coolify till det nya projektet → redeploy. Appen är igång igen (~1 h).

> Tips: gör en **teståterställning** till ett tomt projekt en gång, så att du vet att flödet fungerar innan du verkligen behöver det.
