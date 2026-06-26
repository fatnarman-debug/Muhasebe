-- ============================================================================
-- Faz B — Hesap dondurma (freeze) durumu
-- "Dondur" = girişi engelle (Supabase ban) ama VERİYİ SAKLA.
-- Hukuki dayanak: Bokföringslagen muhasebe kayıtlarını 7 yıl saklamayı zorunlu
-- kılar; ödeme bitse bile fatura/muhasebe verisi silinemez → silmek yerine dondur.
-- Bu kolonlar yalnızca görünürlük/iz amaçlıdır; asıl giriş engeli auth katmanında.
-- ============================================================================

alter table public.profiles
  add column if not exists frozen_at     timestamptz,
  add column if not exists frozen_reason text;

comment on column public.profiles.frozen_at is
  'Hesap dondurulduysa zaman damgası (NULL = aktif). Giriş engeli auth.users ban ile uygulanır.';
comment on column public.profiles.frozen_reason is
  'Dondurma sebebi (ör. "ödeme yapılmadı"). Audit ve müşteri desteği için.';
