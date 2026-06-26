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

// Süper admin: herhangi bir kullanıcının (büro/muhasebeci) şifresini sıfırlar
export async function resetUserPassword(userId: string, newPassword: string): Promise<{ ok: true } | { error: string }> {
  if (!(await getAdminSession())) return { error: "Yetkisiz erişim" };
  if (!userId) return { error: "Kullanıcı belirtilmedi" };
  if (!newPassword || newPassword.length < 8) return { error: "Şifre en az 8 karakter olmalıdır" };

  const { error } = await adminClient().auth.admin.updateUserById(userId, { password: newPassword });
  if (error) return { error: error.message };

  await logAdminAction({ action: "user.password_reset", targetType: "user", targetId: userId });
  return { ok: true };
}

// Süper admin: bir muhasebeciyi aktif/pasif yapar
export async function setAccountantActive(muhasebeciId: string, isActive: boolean): Promise<{ ok: true } | { error: string }> {
  if (!(await getAdminSession())) return { error: "Yetkisiz erişim" };
  const { error } = await adminClient().from("muhasebeciler").update({ is_active: isActive }).eq("id", muhasebeciId);
  if (error) return { error: error.message };

  await logAdminAction({
    action: isActive ? "accountant.activated" : "accountant.deactivated",
    targetType: "muhasebeci",
    targetId: muhasebeciId,
    metadata: { is_active: isActive },
  });
  return { ok: true };
}
