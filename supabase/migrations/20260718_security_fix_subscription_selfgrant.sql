-- ============================================================
-- GUVENLIK DUZELTMESI #4: Kullanici kendine abonelik veremesin
-- Sorun: profiles UPDATE politikasi sutun kisiti yoktu ->
--        kullanici subscription_status='active' yapip bedava premium olabiliyordu.
-- Cozum: Trigger ile abonelik/odeme sutunlarini korur. Normal kullanici
--        (authenticated) bu alanlari DEGISTIREMEZ; degistirmeye calisirsa
--        eski degerler korunur. Service-role (odeme sistemi/admin) muaf.
-- ============================================================

create or replace function public.protect_subscription_columns()
returns trigger as $$
begin
  -- Service-role (odeme sistemi / admin) bu korumadan muaf
  if current_setting('request.jwt.claim.role', true) = 'service_role'
     or current_user = 'supabase_admin'
     or current_user = 'postgres' then
    return new;
  end if;

  -- Normal kullanici abonelik/odeme alanlarini DEGISTIREMEZ: eski degeri koru
  new.subscription_status    := old.subscription_status;
  new.subscription_tier      := old.subscription_tier;
  new.stripe_customer_id     := old.stripe_customer_id;
  new.stripe_subscription_id := old.stripe_subscription_id;
  new.trial_ends_at          := old.trial_ends_at;
  new.account_type           := old.account_type;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists protect_subscription_on_profiles on public.profiles;
create trigger protect_subscription_on_profiles
  before update on public.profiles
  for each row execute function public.protect_subscription_columns();
