-- ============================================================================
-- Faz D+ — Yedeklerin otomatik saklanması (private bucket + kayıt tablosu)
-- Her export, şifreli arşivi 'backups' özel bucket'ına yükler ve buraya iz bırakır.
-- GDPR/veri ikametgâhı: bucket, Supabase projenin bölgesinde durur → proje EU
-- bölgesinde (ör. Frankfurt) olmalı. Yalnızca service_role erişir.
-- ============================================================================

-- Özel (public olmayan) yedek bucket'ı
insert into storage.buckets (id, name, public)
values ('backups', 'backups', false)
on conflict (id) do nothing;

-- Saklanan yedeklerin kaydı
create table if not exists public.account_backups (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid,                              -- kaynak hesap (FK yok: hesap silinse de kayıt kalsın)
  email        text,
  filename     text not null,
  storage_path text not null,                     -- 'backups' bucket içindeki yol
  size_bytes   bigint,
  counts       jsonb not null default '{}'::jsonb,
  has_logos    boolean not null default false,
  created_at   timestamptz not null default now()
);
create index if not exists account_backups_user_idx       on public.account_backups (user_id);
create index if not exists account_backups_created_at_idx on public.account_backups (created_at desc);

alter table public.account_backups enable row level security;

comment on table public.account_backups is
  'Saklanan şifreli yedeklerin meta kaydı (dosya backups bucket''ında). Yalnızca service_role.';
