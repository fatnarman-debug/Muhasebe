-- ============================================================================
-- Offert (teklif) desteği — fatura altyapısını paylaşır, tek tablo + doc_type
-- Yasal: fatura numaraları kesintisiz olmalı (Bokföringslagen) → offert AYRI
-- numara serisi kullanır (client_companies.next_offert_number).
-- ============================================================================

-- 1) invoices: belge türü + teklif→fatura izlenebilirliği
alter table public.invoices
  add column if not exists doc_type text not null default 'invoice',
  add column if not exists source_offer_id uuid references public.invoices(id) on delete set null;

alter table public.invoices drop constraint if exists invoices_doc_type_check;
alter table public.invoices add constraint invoices_doc_type_check
  check (doc_type in ('invoice', 'offert'));

-- 2) status'a teklif durumlarını ekle (mevcut fatura durumları korunur)
alter table public.invoices drop constraint if exists invoices_status_check;
alter table public.invoices add constraint invoices_status_check
  check (status in ('draft','sent','paid','overdue','cancelled','credit','accepted','declined'));

-- 3) ayrı offert numara sayacı
alter table public.client_companies
  add column if not exists next_offert_number integer not null default 1;

create index if not exists invoices_doc_type_idx on public.invoices (doc_type);

comment on column public.invoices.doc_type is 'invoice = faktura, offert = teklif (aynı tablo, paylaşılan altyapı)';
comment on column public.invoices.source_offer_id is 'Bu fatura bir offert''ten oluşturulduysa kaynak offert id''si';
