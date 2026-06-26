-- ============================================================================
-- Faz A — Süper Admin Denetim Günlüğü (audit log)
-- GDPR: her hassas admin işlemi iz bırakır (kim / ne zaman / neye / ne yaptı).
-- Bu tablo SADECE service_role tarafından yazılır/okunur (admin paneli).
-- RLS açık + hiçbir policy yok => anon/authenticated erişemez, service_role bypass eder.
-- ============================================================================

create table if not exists public.admin_audit_logs (
  id           uuid primary key default gen_random_uuid(),
  actor_email  text        not null,              -- işlemi yapan admin (ADMIN_EMAIL)
  action       text        not null,              -- ör: 'user.password_reset', 'account.frozen'
  target_type  text,                              -- ör: 'user' | 'muhasebeci' | 'client_company' | 'buro'
  target_id    text,                              -- hedefin id'si (uuid ya da serbest metin)
  target_label text,                              -- insan-okur etiket (e-posta / ad)
  metadata     jsonb       not null default '{}'::jsonb,
  ip           text,                              -- isteğin IP'si (varsa)
  created_at   timestamptz not null default now()
);

create index if not exists admin_audit_logs_created_at_idx on public.admin_audit_logs (created_at desc);
create index if not exists admin_audit_logs_target_idx     on public.admin_audit_logs (target_type, target_id);
create index if not exists admin_audit_logs_actor_idx      on public.admin_audit_logs (actor_email);
create index if not exists admin_audit_logs_action_idx     on public.admin_audit_logs (action);

-- RLS açık, policy yok => yalnızca service_role (admin paneli) erişebilir.
alter table public.admin_audit_logs enable row level security;

comment on table public.admin_audit_logs is
  'Süper admin denetim günlüğü. Yalnızca service_role erişir. GDPR hesap verebilirlik (accountability) kaydı.';
