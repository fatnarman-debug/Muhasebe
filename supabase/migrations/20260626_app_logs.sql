-- ============================================================================
-- Faz C — Görünürlük: e-posta logları + hata logları
-- Her iki tablo da yalnızca service_role tarafından yazılır/okunur (admin paneli
-- + sunucu rotaları). RLS açık, policy yok => anon/authenticated erişemez.
-- ============================================================================

-- Gönderilen/başarısız e-postalar (fatura + hatırlatma)
create table if not exists public.email_logs (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null,                 -- 'invoice' | 'reminder'
  status        text not null,                 -- 'sent' | 'failed'
  to_email      text,
  subject       text,
  invoice_id    uuid,                           -- referans (FK yok: log kalıcı olsun)
  invoice_number text,
  company_name  text,
  error_message text,
  created_at    timestamptz not null default now()
);
create index if not exists email_logs_created_at_idx on public.email_logs (created_at desc);
create index if not exists email_logs_status_idx     on public.email_logs (status);
create index if not exists email_logs_invoice_idx    on public.email_logs (invoice_id);
alter table public.email_logs enable row level security;

-- Yakalanan uygulama hataları
create table if not exists public.error_logs (
  id          uuid primary key default gen_random_uuid(),
  scope       text not null,                    -- ör: 'invoice.send' | 'invoice.remind'
  message     text not null,
  detail      jsonb not null default '{}'::jsonb,
  user_id     text,                             -- ilgili kullanıcı (varsa)
  created_at  timestamptz not null default now()
);
create index if not exists error_logs_created_at_idx on public.error_logs (created_at desc);
create index if not exists error_logs_scope_idx      on public.error_logs (scope);
alter table public.error_logs enable row level security;

comment on table public.email_logs is 'Gönderilen/başarısız fatura & hatırlatma e-postaları. Yalnızca service_role.';
comment on table public.error_logs is 'Yakalanan uygulama hataları (sunucu). Yalnızca service_role.';
