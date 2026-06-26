"use server";

import { createClient } from "@supabase/supabase-js";
import { getAdminSession } from "@/lib/admin-session";
import { logAdminAction } from "@/lib/admin-audit";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const BAN_FOREVER = "876000h"; // ~100 yıl → kalıcı giriş engeli
type Result = { ok: true; info?: string } | { error: string };

/** Bir kullanıcının (büro yetkilisi/bireysel) e-postasını getirir. */
async function getEmail(supabase: ReturnType<typeof adminClient>, userId: string): Promise<string | null> {
  const { data } = await supabase.from("profiles").select("email").eq("id", userId).maybeSingle();
  return data?.email ?? null;
}

/** Bu kullanıcı bir büro sahibiyse, bürosundaki muhasebecilerin auth_user_id listesini döndürür. */
async function getBuroAccountantAuthIds(supabase: ReturnType<typeof adminClient>, userId: string): Promise<string[]> {
  const { data: dukkan } = await supabase.from("muhasebe_dukkanlar").select("id").eq("user_id", userId).maybeSingle();
  if (!dukkan) return [];
  const { data: accountants } = await supabase
    .from("muhasebeciler")
    .select("auth_user_id")
    .eq("dukkan_id", dukkan.id);
  return (accountants ?? []).map((a) => a.auth_user_id).filter((x): x is string => !!x);
}

/**
 * Hesabı dondurur: girişi engeller (auth ban), profiles.frozen_* işaretler.
 * Büro hesabıysa bürodaki muhasebecilerin de girişini kapatır.
 */
export async function freezeAccount(userId: string, reason: string): Promise<Result> {
  if (!(await getAdminSession())) return { error: "Yetkisiz erişim" };
  if (!userId) return { error: "Kullanıcı belirtilmedi" };
  const supabase = adminClient();
  const email = await getEmail(supabase, userId);

  const { error: banErr } = await supabase.auth.admin.updateUserById(userId, { ban_duration: BAN_FOREVER });
  if (banErr) return { error: banErr.message };

  await supabase.from("profiles").update({ frozen_at: new Date().toISOString(), frozen_reason: reason || null }).eq("id", userId);

  // Büro hesabıysa muhasebecilerin de girişini kapat
  const accIds = await getBuroAccountantAuthIds(supabase, userId);
  let bannedAccountants = 0;
  for (const accId of accIds) {
    const { error } = await supabase.auth.admin.updateUserById(accId, { ban_duration: BAN_FOREVER });
    if (!error) bannedAccountants++;
  }

  await logAdminAction({
    action: "account.frozen",
    targetType: "user",
    targetId: userId,
    targetLabel: email,
    metadata: { reason: reason || null, accountants_blocked: bannedAccountants },
  });

  return { ok: true, info: bannedAccountants ? `${bannedAccountants} muhasebeci girişi de kapatıldı.` : undefined };
}

/** Hesabı yeniden aktifleştirir: ban kaldırır, frozen_* temizler, muhasebecileri geri açar. */
export async function unfreezeAccount(userId: string): Promise<Result> {
  if (!(await getAdminSession())) return { error: "Yetkisiz erişim" };
  if (!userId) return { error: "Kullanıcı belirtilmedi" };
  const supabase = adminClient();
  const email = await getEmail(supabase, userId);

  const { error: unbanErr } = await supabase.auth.admin.updateUserById(userId, { ban_duration: "none" });
  if (unbanErr) return { error: unbanErr.message };

  await supabase.from("profiles").update({ frozen_at: null, frozen_reason: null }).eq("id", userId);

  const accIds = await getBuroAccountantAuthIds(supabase, userId);
  let unbanned = 0;
  for (const accId of accIds) {
    const { error } = await supabase.auth.admin.updateUserById(accId, { ban_duration: "none" });
    if (!error) unbanned++;
  }

  await logAdminAction({
    action: "account.unfrozen",
    targetType: "user",
    targetId: userId,
    targetLabel: email,
    metadata: { accountants_reactivated: unbanned },
  });

  return { ok: true, info: unbanned ? `${unbanned} muhasebeci girişi de açıldı.` : undefined };
}

/**
 * Hesabı KALICI olarak siler (geri alınamaz). FK cascade ile tüm veri silinir.
 * Güvenlik: confirmEmail, hesabın e-postasıyla birebir eşleşmeli.
 * GDPR/Bokföringslagen: muhasebe verisi 7 yıl saklanmalı — bu yüzden silmeden önce
 * yedek alınması beklenir (Faz D). Burada yalnızca güçlü onay + iz tutulur.
 */
export async function deleteAccount(userId: string, confirmEmail: string): Promise<Result> {
  if (!(await getAdminSession())) return { error: "Yetkisiz erişim" };
  if (!userId) return { error: "Kullanıcı belirtilmedi" };
  const supabase = adminClient();
  const email = await getEmail(supabase, userId);

  if (!email) return { error: "Hesap bulunamadı" };
  if (confirmEmail.trim().toLowerCase() !== email.toLowerCase()) {
    return { error: "Onay e-postası eşleşmiyor. Silme iptal edildi." };
  }

  // İz kaydını silmeden ÖNCE yaz (hedef sonradan kaybolacağı için)
  await logAdminAction({
    action: "account.deleted",
    targetType: "user",
    targetId: userId,
    targetLabel: email,
    metadata: { irreversible: true },
  });

  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  return { ok: true };
}
