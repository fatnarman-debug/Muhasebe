import { createClient } from "@supabase/supabase-js";

// Sunucu-yalnız modül (SUPABASE_SERVICE_ROLE_KEY kullanır). İstemciye import edilmemeli.
function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// ── Yazıcılar (uygulama rotalarından çağrılır) ──────────────────────────────

export type EmailLogEntry = {
  kind: "invoice" | "reminder";
  status: "sent" | "failed";
  toEmail?: string | null;
  subject?: string | null;
  invoiceId?: string | null;
  invoiceNumber?: string | null;
  companyName?: string | null;
  errorMessage?: string | null;
};

/** E-posta gönderim sonucunu loglar. Asla hata fırlatmaz. */
export async function logEmail(entry: EmailLogEntry): Promise<void> {
  try {
    await adminClient().from("email_logs").insert({
      kind: entry.kind,
      status: entry.status,
      to_email: entry.toEmail ?? null,
      subject: entry.subject ?? null,
      invoice_id: entry.invoiceId ?? null,
      invoice_number: entry.invoiceNumber ?? null,
      company_name: entry.companyName ?? null,
      error_message: entry.errorMessage ?? null,
    });
  } catch (e) {
    console.error("[app-logs] email log yazılamadı:", e);
  }
}

export type ErrorLogEntry = {
  scope: string;
  message: string;
  detail?: Record<string, unknown>;
  userId?: string | null;
};

/** Yakalanan bir hatayı loglar. Asla hata fırlatmaz. */
export async function logError(entry: ErrorLogEntry): Promise<void> {
  try {
    await adminClient().from("error_logs").insert({
      scope: entry.scope,
      message: entry.message,
      detail: entry.detail ?? {},
      user_id: entry.userId ?? null,
    });
  } catch (e) {
    console.error("[app-logs] error log yazılamadı:", e);
  }
}

// ── Okuyucular (admin paneli sayfalarından çağrılır) ────────────────────────

export type EmailLogRow = {
  id: string; kind: string; status: string; to_email: string | null; subject: string | null;
  invoice_id: string | null; invoice_number: string | null; company_name: string | null;
  error_message: string | null; created_at: string;
};

export async function fetchEmailLogs(limit = 200): Promise<EmailLogRow[]> {
  const { data, error } = await adminClient()
    .from("email_logs").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) { console.error("[app-logs] email_logs okunamadı:", error.message); return []; }
  return (data ?? []) as EmailLogRow[];
}

export type ErrorLogRow = {
  id: string; scope: string; message: string; detail: Record<string, unknown>;
  user_id: string | null; created_at: string;
};

export async function fetchErrorLogs(limit = 200): Promise<ErrorLogRow[]> {
  const { data, error } = await adminClient()
    .from("error_logs").select("*").order("created_at", { ascending: false }).limit(limit);
  if (error) { console.error("[app-logs] error_logs okunamadı:", error.message); return []; }
  return (data ?? []) as ErrorLogRow[];
}
