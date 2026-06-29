-- ============================================================================
-- Kreditfaktura (fatura iptali / kredinota) desteği
-- Yasal (Bokföringslagen): gönderilmiş/kayda geçmiş bir fatura SİLİNEMEZ ve
-- numara serisi kesintisiz olmalı. İptal/düzeltme için negatif tutarlı bir
-- KREDITFAKTURA oluşturulur; aynı FAKTURA numara serisinden numara alır
-- (offert gibi AYRI seri DEĞİL). Orijinal fatura status='credited' olur.
-- ============================================================================

-- 1) doc_type'a 'credit' ekle (invoice / offert / credit)
alter table public.invoices drop constraint if exists invoices_doc_type_check;
alter table public.invoices add constraint invoices_doc_type_check
  check (doc_type in ('invoice', 'offert', 'credit'));

-- 2) status'a 'credited' ekle (kredite edilmiş ORİJİNAL fatura için)
--    Mevcut 'credit' değeri (eski) korunur; yeni mantıkta orijinal => 'credited'.
alter table public.invoices drop constraint if exists invoices_status_check;
alter table public.invoices add constraint invoices_status_check
  check (status in ('draft','sent','paid','overdue','cancelled','credit','credited','accepted','declined'));

-- 3) Kreditfaktura -> hangi faturayı kredite ettiği
alter table public.invoices
  add column if not exists credited_invoice_id uuid references public.invoices(id) on delete set null;

create index if not exists invoices_credited_invoice_id_idx on public.invoices (credited_invoice_id);

comment on column public.invoices.credited_invoice_id is 'Kreditfaktura ise: kredite edilen orijinal faturanın id''si';
