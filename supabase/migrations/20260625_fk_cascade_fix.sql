-- ============================================================
-- FK CASCADE düzeltmesi
-- Rol hiyerarşisi tabloları cascade'siz tanımlanmıştı; bu yüzden
-- bir auth kullanıcısı silinmek istendiğinde "Database error
-- deleting user" hatası çıkıyordu. Cascade ekliyoruz.
-- Idempotent — tekrar çalıştırmak zararsızdır.
-- ============================================================

-- muhasebe_dukkanlar.user_id -> auth.users (kullanıcı silinince dükkan da silinsin)
alter table public.muhasebe_dukkanlar
  drop constraint if exists muhasebe_dukkanlar_user_id_fkey,
  add constraint muhasebe_dukkanlar_user_id_fkey
    foreign key (user_id) references auth.users(id) on delete cascade;

-- muhasebeciler.dukkan_id -> muhasebe_dukkanlar (dükkan silinince muhasebeciler de)
alter table public.muhasebeciler
  drop constraint if exists muhasebeciler_dukkan_id_fkey,
  add constraint muhasebeciler_dukkan_id_fkey
    foreign key (dukkan_id) references public.muhasebe_dukkanlar(id) on delete cascade;

-- musteri_atamalari.musteri_id -> client_companies
alter table public.musteri_atamalari
  drop constraint if exists musteri_atamalari_musteri_id_fkey,
  add constraint musteri_atamalari_musteri_id_fkey
    foreign key (musteri_id) references public.client_companies(id) on delete cascade;

-- musteri_atamalari.muhasebeci_id -> muhasebeciler
alter table public.musteri_atamalari
  drop constraint if exists musteri_atamalari_muhasebeci_id_fkey,
  add constraint musteri_atamalari_muhasebeci_id_fkey
    foreign key (muhasebeci_id) references public.muhasebeciler(id) on delete cascade;
