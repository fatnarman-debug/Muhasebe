-- ============================================================
-- Faktura SaaS — Supabase Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends Supabase auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  email text not null,
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'start', 'growth', 'pro')),
  stripe_customer_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CLIENT COMPANIES (klient firmalar — muhasebecinin yönettiği)
-- ============================================================
create table public.client_companies (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  org_no text not null,
  moms_no text,
  f_skatt boolean not null default true,
  address_line1 text not null,
  address_line2 text,
  postal_code text not null,
  city text not null,
  country text not null default 'SE',
  email text,
  phone text,
  bankgiro text,
  plusgiro text,
  swish text,
  iban text,
  bic text,
  logo_url text,
  invoice_prefix text,
  next_invoice_number integer not null default 1,
  payment_terms_days integer not null default 30,
  default_vat_rate integer not null default 25,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- CUSTOMERS (son müşteriler — klient firmanın faturaladığı)
-- ============================================================
create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  client_company_id uuid references public.client_companies(id) on delete cascade not null,
  name text not null,
  customer_type text not null default 'company' check (customer_type in ('company', 'individual')),
  org_no text,
  personnummer text,
  moms_no text,
  address_line1 text not null,
  address_line2 text,
  postal_code text not null,
  city text not null,
  country text not null default 'SE',
  email text,
  phone text,
  payment_terms_days integer,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
-- ARTICLES (ürün/hizmet kataloğu)
-- ============================================================
create table public.articles (
  id uuid primary key default uuid_generate_v4(),
  client_company_id uuid references public.client_companies(id) on delete cascade not null,
  name text not null,
  description text,
  unit text not null default 'st',
  unit_price numeric(12,2) not null default 0,
  vat_rate integer not null default 25 check (vat_rate in (0, 6, 12, 25)),
  is_rot_rut_eligible boolean not null default false,
  is_labor boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ============================================================
-- INVOICES (faturalar)
-- ============================================================
create table public.invoices (
  id uuid primary key default uuid_generate_v4(),
  client_company_id uuid references public.client_companies(id) on delete cascade not null,
  customer_id uuid references public.customers(id) not null,
  invoice_number text not null,
  ocr_number text,
  status text not null default 'draft' check (status in ('draft', 'sent', 'paid', 'overdue', 'cancelled', 'credit')),
  invoice_date date not null default current_date,
  due_date date not null,
  currency text not null default 'SEK',
  exchange_rate numeric(10,6) not null default 1,
  rot_rut_type text check (rot_rut_type in ('rot', 'rut', null)),
  rot_rut_amount numeric(12,2) default 0,
  subtotal numeric(12,2) not null default 0,
  vat_amount numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  amount_due numeric(12,2) not null default 0,
  paid_amount numeric(12,2) not null default 0,
  your_reference text,
  our_reference text,
  notes text,
  sent_at timestamptz,
  paid_at timestamptz,
  pdf_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(client_company_id, invoice_number)
);

-- ============================================================
-- INVOICE LINES (fatura satırları)
-- ============================================================
create table public.invoice_lines (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  sort_order integer not null default 0,
  description text not null,
  quantity numeric(10,3) not null default 1,
  unit text not null default 'st',
  unit_price numeric(12,2) not null,
  vat_rate integer not null default 25,
  line_total numeric(12,2) not null,
  vat_amount numeric(12,2) not null,
  is_labor boolean not null default false,
  article_id uuid references public.articles(id) on delete set null
);

-- ============================================================
-- PAYMENTS (ödemeler)
-- ============================================================
create table public.payments (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid references public.invoices(id) on delete cascade not null,
  amount numeric(12,2) not null,
  payment_date date not null,
  payment_method text not null default 'bankgiro' check (payment_method in ('bankgiro', 'plusgiro', 'swish', 'bank_transfer', 'cash', 'other')),
  reference text,
  notes text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles enable row level security;
alter table public.client_companies enable row level security;
alter table public.customers enable row level security;
alter table public.articles enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_lines enable row level security;
alter table public.payments enable row level security;

-- Profiles: user owns their own row
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Client companies: user owns their companies
create policy "Users can manage own client companies" on public.client_companies
  for all using (auth.uid() = user_id);

-- Customers: via client company ownership
create policy "Users can manage customers of own clients" on public.customers
  for all using (
    exists (select 1 from public.client_companies cc where cc.id = client_company_id and cc.user_id = auth.uid())
  );

-- Articles
create policy "Users can manage articles of own clients" on public.articles
  for all using (
    exists (select 1 from public.client_companies cc where cc.id = client_company_id and cc.user_id = auth.uid())
  );

-- Invoices
create policy "Users can manage invoices of own clients" on public.invoices
  for all using (
    exists (select 1 from public.client_companies cc where cc.id = client_company_id and cc.user_id = auth.uid())
  );

-- Invoice lines: via invoice
create policy "Users can manage invoice lines" on public.invoice_lines
  for all using (
    exists (
      select 1 from public.invoices i
      join public.client_companies cc on cc.id = i.client_company_id
      where i.id = invoice_id and cc.user_id = auth.uid()
    )
  );

-- Payments
create policy "Users can manage payments" on public.payments
  for all using (
    exists (
      select 1 from public.invoices i
      join public.client_companies cc on cc.id = i.client_company_id
      where i.id = invoice_id and cc.user_id = auth.uid()
    )
  );

-- ============================================================
-- AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Användare'),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.set_updated_at();
create trigger set_client_companies_updated_at before update on public.client_companies for each row execute procedure public.set_updated_at();
create trigger set_customers_updated_at before update on public.customers for each row execute procedure public.set_updated_at();
create trigger set_invoices_updated_at before update on public.invoices for each row execute procedure public.set_updated_at();
