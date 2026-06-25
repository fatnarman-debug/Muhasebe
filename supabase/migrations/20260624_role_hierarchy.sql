-- Muhasebe Dükkanları (accounting shops)
create table if not exists muhasebe_dukkanlar (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  dukkan_adi text not null,
  created_at timestamptz default now()
);

-- Muhasebeciler (accountants employed by shops)
create table if not exists muhasebeciler (
  id uuid primary key default gen_random_uuid(),
  dukkan_id uuid references muhasebe_dukkanlar not null,
  email text unique not null,
  full_name text not null,
  benzersiz_kod text unique not null,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Müşteri Atamaları (client assignments to accountants)
create table if not exists musteri_atamalari (
  id uuid primary key default gen_random_uuid(),
  musteri_id uuid references client_companies not null,
  muhasebeci_id uuid references muhasebeciler not null,
  atanma_tarihi timestamptz default now(),
  unique(musteri_id)
);

-- Add invoice_template to client_companies if not exists
alter table client_companies
  add column if not exists invoice_template text default 'klasik-standart';

-- RLS Policies
alter table muhasebe_dukkanlar enable row level security;
alter table muhasebeciler enable row level security;
alter table musteri_atamalari enable row level security;

-- Yetkili sees own shop data
create policy "yetkili_kendi_dukkan" on muhasebe_dukkanlar
  for all using (auth.uid() = user_id);

create policy "yetkili_kendi_muhasebeciler" on muhasebeciler
  for all using (
    dukkan_id in (select id from muhasebe_dukkanlar where user_id = auth.uid())
  );

create policy "yetkili_atamalar" on musteri_atamalari
  for all using (
    muhasebeci_id in (
      select m.id from muhasebeciler m
      join muhasebe_dukkanlar d on m.dukkan_id = d.id
      where d.user_id = auth.uid()
    )
  );
