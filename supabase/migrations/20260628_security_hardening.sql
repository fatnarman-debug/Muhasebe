-- ============================================================================
-- Güvenlik & dayanıklılık sertleştirmesi (2026-06-28)
-- 1) Konsult kendi muhasebeciler kaydını RLS ile okuyabilsin (savunma katmanı).
--    (Mevcut "yetkili_kendi_muhasebeciler" politikası korunur; politikalar OR'lanır.)
-- 2) Foreign key index'leri — RLS sorgu performansı + yük altında dayanıklılık.
--    Hepsi IF NOT EXISTS; tekrar çalıştırmak güvenli.
-- ============================================================================

-- 1) Konsult salt-okuma politikası
drop policy if exists "konsult_sees_own_record" on public.muhasebeciler;
create policy "konsult_sees_own_record" on public.muhasebeciler
  for select using (auth_user_id = auth.uid());

-- 2) FK index'leri
create index if not exists invoices_customer_id_idx        on public.invoices(customer_id);
create index if not exists invoices_client_company_id_idx  on public.invoices(client_company_id);
create index if not exists customers_client_company_id_idx on public.customers(client_company_id);
create index if not exists articles_client_company_id_idx  on public.articles(client_company_id);
create index if not exists invoice_lines_invoice_id_idx    on public.invoice_lines(invoice_id);
create index if not exists payments_invoice_id_idx         on public.payments(invoice_id);
create index if not exists musteri_atamalari_muhasebeci_idx on public.musteri_atamalari(muhasebeci_id);
create index if not exists muhasebeciler_dukkan_id_idx     on public.muhasebeciler(dukkan_id);
create index if not exists muhasebeciler_auth_user_id_idx  on public.muhasebeciler(auth_user_id);
create index if not exists client_companies_user_id_idx    on public.client_companies(user_id);
