import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";
import { getAdminSession } from "@/lib/admin-session";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export type AuditEntry = {
  action: string;                         // ör: "user.password_reset"
  targetType?: string | null;             // "user" | "muhasebeci" | "client_company" | "buro" ...
  targetId?: string | null;
  targetLabel?: string | null;            // insan-okur etiket (e-posta/ad)
  metadata?: Record<string, unknown>;
  actorEmail?: string;                    // override (yoksa oturumdaki admin)
};

/**
 * Süper admin denetim günlüğüne bir satır yazar.
 * Asla hata fırlatmaz — günlükleme başarısız olsa bile asıl işlem akışını bozmaz.
 */
export async function logAdminAction(entry: AuditEntry): Promise<void> {
  try {
    const actor = entry.actorEmail ?? (await getAdminSession()) ?? "unknown";

    let ip: string | null = null;
    try {
      const h = await headers();
      ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? h.get("x-real-ip") ?? null;
    } catch {
      /* request-scope dışı çağrıldıysa IP atlanır */
    }

    await adminClient().from("admin_audit_logs").insert({
      actor_email: actor,
      action: entry.action,
      target_type: entry.targetType ?? null,
      target_id: entry.targetId ?? null,
      target_label: entry.targetLabel ?? null,
      metadata: entry.metadata ?? {},
      ip,
    });
  } catch (e) {
    console.error("[audit] günlük yazılamadı:", e);
  }
}

export type AuditLogRow = {
  id: string;
  actor_email: string;
  action: string;
  target_type: string | null;
  target_id: string | null;
  target_label: string | null;
  metadata: Record<string, unknown>;
  ip: string | null;
  created_at: string;
};

/** Son denetim kayıtlarını getirir (admin paneli görüntüleyici için). */
export async function fetchAuditLogs(opts?: { limit?: number; action?: string; targetId?: string }): Promise<AuditLogRow[]> {
  let q = adminClient()
    .from("admin_audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(opts?.limit ?? 200);

  if (opts?.action) q = q.eq("action", opts.action);
  if (opts?.targetId) q = q.eq("target_id", opts.targetId);

  const { data, error } = await q;
  if (error) {
    console.error("[audit] kayıtlar okunamadı:", error.message);
    return [];
  }
  return (data ?? []) as AuditLogRow[];
}
