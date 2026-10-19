-- ============================================================
-- GUVENLIK DUZELTMESI #3: Pasif muhasebeci erisimi kaybetsin
-- Sorun: is_assigned_accountant() m.is_active kontrolu yapmiyordu.
--        is_active=false yapilan (kovulan) muhasebeci, atamasi durdugu
--        surece musteri/fatura verilerine erisime devam ediyordu.
-- Cozum: Fonksiyona "and m.is_active = true" ekle. Bu fonksiyon tum
--        konsult RLS politikalarinin kalbi oldugu icin tek degisiklik
--        client_companies, customers, articles, invoices, invoice_lines,
--        payments -> hepsini birden korur.
-- ============================================================

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
      and m.is_active = true
  );
$$;
