---
name: yrkessida-research
description: >
  SERP-driven research before writing or updating any EnkeltFaktura
  profession page (/for/[yrke]), comparison page (/jamfor/*) or guide
  (/guider/*). Searches the real Swedish query, reads every ranking page,
  rejects facts older than six months, verifies tax numbers against
  Skatteverket, and outputs content mapped straight onto the Yrke type in
  src/lib/yrken.ts. Use before creating ANY new public content page, and
  when refreshing an existing one. Trigger words: yrkessida, meslek sayfası,
  ny sida, content research, SERP research, /for/, /jamfor/, /guider/.
user-invocable: true
argument-hint: "[yrke eller sorgu, örn: snickare | faktura för elektriker]"
---

# Yrkessida Research

Never write a profession page from memory. Search first, read the competition,
then write something that answers what they leave unanswered.

A page that repeats what the top ten already say has no reason to rank. The
point of this workflow is to find the gap, not to summarise the consensus.

## When to run

- Before creating a new `/for/[yrke]`, `/jamfor/*` or `/guider/*` page
- Before adding a profession to `src/lib/yrken.ts`
- When refreshing a page older than ~6 months, or after a tax-rule change

## Step 1 — Search the real query

Run the query a Swedish tradesperson would actually type, plus variants:

```
faktura för <yrke>
fakturaprogram <yrke>
<yrke> fakturera ROT          (only if the trade is ROT/RUT eligible)
hur fakturerar man som <yrke>
```

Use `WebSearch`. Record every distinct domain in the top results.

**Read the SERP itself as data.** What page *type* is Google rewarding — guides,
software landing pages, forum threads, calculators? If the top ten are all
guides and we ship a product page, we lose regardless of quality. Say so and
adapt the page type.

## Step 2 — Read the ranking pages

`WebFetch` each result in the top ~8. For every page record:

| Field | Why |
|---|---|
| Last updated / published date | Freshness gate, step 3 |
| H2/H3 structure | What the market considers a complete answer |
| Questions answered | Feeds our FAQ |
| Concrete numbers (percent, caps, prices) | Must be verified, step 3 |
| What it is missing | This is the opportunity |

## Step 3 — Freshness gate (the hard rule)

**Reject any fact whose source is older than six months, unless re-verified
against a primary source today.**

Swedish tax rules move. ROT was temporarily 50 % between 12 May and 31 December
2025 and dropped back to 30 % on 1 January 2026 — a large share of pages still
online quote the old figure. Copying them ships a factual error into a page that
tells people how to invoice.

Verify every tax number against **skatteverket.se** directly, not against a
blog that cites it. If a number cannot be verified today, leave it out and say
so in the output rather than guessing.

Facts that are currently verified (re-check if more than six months old):

- ROT 2026: **30 %** of labour cost, cap **50 000 kr** per person per year
- RUT 2026: **50 %** of labour cost
- Shared ROT+RUT cap: **75 000 kr** per person per year, of which at most
  50 000 kr may be ROT; RUT may use the whole ceiling
- Temporary 50 % ROT applied 12 May – 31 December 2025, keyed on the date the
  customer **paid** the invoice, not when the work was done
- Deduction applies to labour only — never material, travel, machinery or waste disposal

## Step 4 — Find the gap

List what no ranking page answers well. Typical gaps worth owning:

- The trade's *actual* invoice lines, named the way the trade names them
- What specifically goes wrong in that trade's invoicing
- Edge cases: jour/utryckning, delbetalning, förskott, utlägg, spillmaterial
- Whether a borderline task qualifies for the deduction at all

A gap is only worth filling if we can answer it concretely. "We explain it
better" is not a gap.

## Step 5 — Map onto the data model

Output must drop straight into the `Yrke` type in `src/lib/yrken.ts`:

```ts
{
  slug, namn (plural), singular (bestämd form),
  kategori: "bygg" | "hem" | "halsa" | "kreativt" | "konsult",
  avdrag: "rot" | "rut" | null,
  meta,            // ≤155 chars
  lead,            // the trade's invoicing reality, NOT product pitch
  fakturarader,    // 4–6 real line items, trade vocabulary
  utmaningar,      // 3 concrete problems, each with a consequence
  faq,             // 2+ trade-specific Q&A, not generic ROT questions
  relaterade,      // 2–3 sibling slugs
}
```

The page template at `src/app/for/[yrke]/page.tsx` renders three variants off
`avdrag`: ROT, RUT, or no deduction (which shows invoice legal requirements
instead). Set `avdrag: null` when the trade genuinely has no deduction —
do not stretch a trade into ROT because it is convenient.

## Step 6 — Write it

Rules that override any pattern found in the research:

1. **Never copy phrasing.** Take the question, write our own answer.
2. **Answer in the first 100 words.** AI engines and featured snippets quote
   the opening, not the conclusion.
3. **Be numerically specific.** "30 % of labour cost, capped at 50 000 kr per
   person per year" gets quoted; "a generous deduction" does not.
4. **Every entry must be genuinely different.** Copying an existing entry and
   swapping the noun produces a thin page that will not rank and risks being
   treated as a doorway page. Fifteen real pages beat eighty-five empty ones.
5. **Swedish text needs native review before it is treated as final.** Write it
   as well as possible, then say plainly that it is unreviewed.

## Step 7 — Ship

- Add the entry to `src/lib/yrken.ts` (sitemap picks it up automatically)
- Add the slug to a sibling's `relaterade` so it is internally linked
- Consider adding it to `FOOTER_YRKEN` in `src/components/site/SiteChrome.tsx`
  only if it is a high-volume trade — the footer list stays short by design
- Verify locally: title, canonical, FAQPage schema, and the correct
  ROT/RUT/none variant rendering

## Output format

Report before writing any code:

```
SERP: <query>
  Page types ranking: <guides | product | forum | mixed>
  Sources read: <n>  |  Fresh (<6 mo): <n>  |  Stale, rejected: <n>

Verified facts
  - <fact> — source, date

Gaps nobody covers
  1. <gap>

Proposed entry
  avdrag: <rot|rut|null>   kategori: <...>
  <the Yrke fields>

Unverified / needs a human
  - <anything that could not be confirmed today>
```

Never skip the last section. If nothing is unverified, say so explicitly.
