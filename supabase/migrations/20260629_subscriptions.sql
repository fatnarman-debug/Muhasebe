-- ============================================================================
-- Prenumeration / provperiod (14 dagars gratis prova-på, sedan betalvägg)
-- Modell: registrera gratis → 14 dagars full åtkomst → uppgradera för att fortsätta.
-- ============================================================================

alter table public.profiles
  add column if not exists subscription_status text not null default 'trialing',
  add column if not exists trial_ends_at timestamptz not null default (now() + interval '14 days'),
  add column if not exists plan text,
  add column if not exists current_period_end timestamptz,
  add column if not exists stripe_subscription_id text;

alter table public.profiles drop constraint if exists profiles_subscription_status_check;
alter table public.profiles add constraint profiles_subscription_status_check
  check (subscription_status in ('trialing','active','past_due','canceled','expired'));

-- Säkerställ att en användare kan läsa sin egen profil (krävs för betalväggen).
-- Säker oavsett om RLS är på/av och om en select-policy redan finns (OR:as ihop).
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);

-- Befintliga konton (skapade innan betalning fanns) får full åtkomst tills vidare.
update public.profiles set subscription_status = 'active' where created_at < now();

comment on column public.profiles.subscription_status is 'trialing | active | past_due | canceled | expired';
comment on column public.profiles.trial_ends_at is 'Slut på 14-dagars provperiod (sätts automatiskt vid registrering)';
