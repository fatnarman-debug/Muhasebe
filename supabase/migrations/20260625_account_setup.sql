-- ============================================================
-- ASAMA 1: Hesap tipi (byrå / privat) + kayıt tetikleyicisi
-- Idempotent — tekrar çalıştırmak zararsızdır.
-- ============================================================

-- profiles tablosuna hesap tipi
alter table public.profiles
  add column if not exists account_type text not null default 'privat';

-- Kayıt tetikleyicisi: profil oluştur, byrå ise otomatik dükkan aç
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_account_type text := coalesce(new.raw_user_meta_data->>'account_type', 'privat');
begin
  insert into public.profiles (id, full_name, email, account_type)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Användare'),
    new.email,
    v_account_type
  );

  if v_account_type = 'byra' then
    insert into public.muhasebe_dukkanlar (user_id, dukkan_adi)
    values (
      new.id,
      coalesce(nullif(new.raw_user_meta_data->>'dukkan_adi', ''), 'Min byrå')
    );
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
