export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export type SubscriptionTier = "free" | "start" | "growth" | "pro";
export type InvoiceStatus = "draft" | "sent" | "paid" | "overdue" | "cancelled" | "credit";
export type CustomerType = "company" | "individual";
export type PaymentMethod = "bankgiro" | "plusgiro" | "swish" | "bank_transfer" | "cash" | "other";
export type RotRutType = "rot" | "rut";
export type VatRate = 0 | 6 | 12 | 25;

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  subscription_tier: SubscriptionTier;
  stripe_customer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientCompany {
  id: string;
  user_id: string;
  name: string;
  org_no: string;
  moms_no: string | null;
  f_skatt: boolean;
  address_line1: string;
  address_line2: string | null;
  postal_code: string;
  city: string;
  country: string;
  email: string | null;
  phone: string | null;
  bankgiro: string | null;
  plusgiro: string | null;
  swish: string | null;
  iban: string | null;
  bic: string | null;
  logo_url: string | null;
  invoice_prefix: string | null;
  next_invoice_number: number;
  payment_terms_days: number;
  default_vat_rate: number;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: string;
  client_company_id: string;
  name: string;
  customer_type: CustomerType;
  org_no: string | null;
  personnummer: string | null;
  moms_no: string | null;
  address_line1: string;
  address_line2: string | null;
  postal_code: string;
  city: string;
  country: string;
  email: string | null;
  phone: string | null;
  payment_terms_days: number | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  client_company_id: string;
  name: string;
  description: string | null;
  unit: string;
  unit_price: number;
  vat_rate: VatRate;
  is_rot_rut_eligible: boolean;
  is_labor: boolean;
  is_active: boolean;
  created_at: string;
}

export interface Invoice {
  id: string;
  client_company_id: string;
  customer_id: string;
  invoice_number: string;
  ocr_number: string | null;
  status: InvoiceStatus;
  invoice_date: string;
  due_date: string;
  currency: string;
  exchange_rate: number;
  rot_rut_type: RotRutType | null;
  rot_rut_amount: number;
  subtotal: number;
  vat_amount: number;
  total: number;
  amount_due: number;
  paid_amount: number;
  your_reference: string | null;
  our_reference: string | null;
  notes: string | null;
  sent_at: string | null;
  paid_at: string | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  sort_order: number;
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: VatRate;
  line_total: number;
  vat_amount: number;
  is_labor: boolean;
  article_id: string | null;
}

export interface Payment {
  id: string;
  invoice_id: string;
  amount: number;
  payment_date: string;
  payment_method: PaymentMethod;
  reference: string | null;
  notes: string | null;
  created_at: string;
}

// Joined types
export interface InvoiceWithDetails extends Invoice {
  customer: Customer;
  client_company: ClientCompany;
  invoice_lines: InvoiceLine[];
  payments: Payment[];
}

export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Omit<Profile, "created_at" | "updated_at">; Update: Partial<Profile> };
      client_companies: { Row: ClientCompany; Insert: Omit<ClientCompany, "id" | "created_at" | "updated_at">; Update: Partial<ClientCompany> };
      customers: { Row: Customer; Insert: Omit<Customer, "id" | "created_at" | "updated_at">; Update: Partial<Customer> };
      articles: { Row: Article; Insert: Omit<Article, "id" | "created_at">; Update: Partial<Article> };
      invoices: { Row: Invoice; Insert: Omit<Invoice, "id" | "created_at" | "updated_at">; Update: Partial<Invoice> };
      invoice_lines: { Row: InvoiceLine; Insert: Omit<InvoiceLine, "id">; Update: Partial<InvoiceLine> };
      payments: { Row: Payment; Insert: Omit<Payment, "id" | "created_at">; Update: Partial<Payment> };
    };
  };
}
