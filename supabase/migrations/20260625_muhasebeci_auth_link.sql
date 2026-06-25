-- ============================================================
-- Muhasebeci ↔ auth kullanıcısı bağlantısı
-- Muhasebeci oluşturulurken bir Supabase auth kullanıcısı da açılır
-- (e-posta + şifre ile giriş yapabilsin). auth_user_id o kullanıcıya
-- işaret eder; kullanıcı silinirse kolon null olur (kayıt durmaz).
-- Idempotent.
-- ============================================================

alter table public.muhasebeciler
  add column if not exists auth_user_id uuid references auth.users on delete set null;
