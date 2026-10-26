-- ============================================================
-- subscription_tier: tillat de planer som faktiskt finns
--
-- Kolumnen slappte bara igenom 'free', 'start', 'growth' och 'pro' - namn
-- fran en prismodell som inte langre finns. Planerna heter i dag 'egen' och
-- 'byra', sa en betalning fran Stripe bröt mot villkoret och hela uppdateringen
-- avbröts. Kunden betalade, subscription_status skrevs aldrig om, och kontot
-- förblev utelåst.
--
-- De gamla namnen far vara kvar i listan. Finns det rader som anvander dem
-- skulle migrationen annars misslyckas, och kolumnen styr ingenting - den
-- visas bara i superadmin.
-- ============================================================

alter table public.profiles
  drop constraint if exists profiles_subscription_tier_check;

alter table public.profiles
  add constraint profiles_subscription_tier_check
  check (subscription_tier in ('free', 'egen', 'byra', 'start', 'growth', 'pro'));

comment on column public.profiles.subscription_tier is
  'Vilken plan kunden betalar for: egen | byra. free = ingen betalning. Ovriga varden ar kvar fran en tidigare prismodell. Styr ingen atkomst - det gor subscription_status.';
