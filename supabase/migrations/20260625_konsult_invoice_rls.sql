-- ============================================================
-- Atanan muhasebeci (konsult) için fatura yetkileri (RLS)
-- Bir muhasebeci, kendisine atanmış (musteri_atamalari) müşteri
-- firmaların müşterilerini, makalelerini, faturalarını ve fatura
-- satırlarını yönetebilir. Firma sahibi (byråansvarig) politikaları
-- olduğu gibi durur; bunlar OR ile eklenir.
-- Idempotent.
-- ============================================================

-- auth.uid() bu firmaya atanmış bir muhasebeci mi?
create or replace function public.is_assigned_accountant(p_company_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.musteri_atamalari ma
    join public.muhasebeciler m on m.id = ma.muhasebeci_id
    where ma.musteri_id = p_company_id
      and m.auth_user_id = auth.uid()
  );
$$;

-- client_companies: atanan muhasebeci okuyabilir + güncelleyebilir
drop policy if exists "assigned accountant reads client companies" on public.client_companies;
create policy "assigned accountant reads client companies" on public.client_companies
  for select using (public.is_assigned_accountant(id));

drop policy if exists "assigned accountant updates client companies" on public.client_companies;
create policy "assigned accountant updates client companies" on public.client_companies
  for update using (public.is_assigned_accountant(id))
  with check (public.is_assigned_accountant(id));

-- customers: atanan muhasebeci tam yönetim
drop policy if exists "assigned accountant manages customers" on public.customers;
create policy "assigned accountant manages customers" on public.customers
  for all using (public.is_assigned_accountant(client_company_id))
  with check (public.is_assigned_accountant(client_company_id));

-- articles
drop policy if exists "assigned accountant manages articles" on public.articles;
create policy "assigned accountant manages articles" on public.articles
  for all using (public.is_assigned_accountant(client_company_id))
  with check (public.is_assigned_accountant(client_company_id));

-- invoices
drop policy if exists "assigned accountant manages invoices" on public.invoices;
create policy "assigned accountant manages invoices" on public.invoices
  for all using (public.is_assigned_accountant(client_company_id))
  with check (public.is_assigned_accountant(client_company_id));

-- invoice_lines (faturanın firmasına göre)
drop policy if exists "assigned accountant manages invoice lines" on public.invoice_lines;
create policy "assigned accountant manages invoice lines" on public.invoice_lines
  for all using (
    exists (select 1 from public.invoices i
      where i.id = invoice_id and public.is_assigned_accountant(i.client_company_id))
  )
  with check (
    exists (select 1 from public.invoices i
      where i.id = invoice_id and public.is_assigned_accountant(i.client_company_id))
  );

-- payments
drop policy if exists "assigned accountant manages payments" on public.payments;
create policy "assigned accountant manages payments" on public.payments
  for all using (
    exists (select 1 from public.invoices i
      where i.id = invoice_id and public.is_assigned_accountant(i.client_company_id))
  )
  with check (
    exists (select 1 from public.invoices i
      where i.id = invoice_id and public.is_assigned_accountant(i.client_company_id))
  );
