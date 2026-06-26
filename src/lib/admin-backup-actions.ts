"use server";

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { getAdminSession } from "@/lib/admin-session";
import { logAdminAction } from "@/lib/admin-audit";
import { encryptBackup, decryptBackup } from "@/lib/backup-crypto";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;

type Archive = {
  format: "FKTBAK01";
  exportedAt: string;
  source: { userId: string; email: string | null };
  companies: Array<Row & { customers: Row[]; articles: Row[]; invoices: Array<Row & { lines: Row[]; payments: Row[] }> }>;
};

type Counts = { companies: number; customers: number; articles: number; invoices: number; lines: number; payments: number };

function countArchive(a: Archive): Counts {
  const c: Counts = { companies: 0, customers: 0, articles: 0, invoices: 0, lines: 0, payments: 0 };
  for (const co of a.companies) {
    c.companies++; c.customers += co.customers.length; c.articles += co.articles.length;
    for (const inv of co.invoices) { c.invoices++; c.lines += inv.lines.length; c.payments += inv.payments.length; }
  }
  return c;
}

/**
 * Bir kullanıcının (büro/bireysel) TÜM veri ağacını şifreli yedeğe çıkarır.
 * Muhasebe geçmişi (created_at/sent_at/paid_at vb.) korunur — Bokföringslagen sadakati.
 */
export async function exportBuroData(userId: string): Promise<{ ok: true; filename: string; dataB64: string; counts: Counts } | { error: string }> {
  if (!(await getAdminSession())) return { error: "Yetkisiz erişim" };
  if (!userId) return { error: "Kullanıcı belirtilmedi" };
  const supabase = adminClient();

  const { data: profile } = await supabase.from("profiles").select("email").eq("id", userId).maybeSingle();
  const { data: companies } = await supabase.from("client_companies").select("*").eq("user_id", userId);
  const companyIds = (companies ?? []).map((c) => c.id);

  if (companyIds.length === 0) return { error: "Bu hesaba bağlı firma/veri bulunamadı." };

  const [{ data: customers }, { data: articles }, { data: invoices }] = await Promise.all([
    supabase.from("customers").select("*").in("client_company_id", companyIds),
    supabase.from("articles").select("*").in("client_company_id", companyIds),
    supabase.from("invoices").select("*").in("client_company_id", companyIds),
  ]);
  const invoiceIds = (invoices ?? []).map((i) => i.id);
  const [{ data: lines }, { data: payments }] = invoiceIds.length
    ? await Promise.all([
        supabase.from("invoice_lines").select("*").in("invoice_id", invoiceIds),
        supabase.from("payments").select("*").in("invoice_id", invoiceIds),
      ])
    : [{ data: [] as Row[] }, { data: [] as Row[] }];

  const archive: Archive = {
    format: "FKTBAK01",
    exportedAt: new Date().toISOString(),
    source: { userId, email: profile?.email ?? null },
    companies: (companies ?? []).map((co) => ({
      ...co,
      customers: (customers ?? []).filter((c) => c.client_company_id === co.id),
      articles: (articles ?? []).filter((a) => a.client_company_id === co.id),
      invoices: (invoices ?? []).filter((inv) => inv.client_company_id === co.id).map((inv) => ({
        ...inv,
        lines: (lines ?? []).filter((l) => l.invoice_id === inv.id),
        payments: (payments ?? []).filter((p) => p.invoice_id === inv.id),
      })),
    })),
  };

  const counts = countArchive(archive);
  const dataB64 = encryptBackup(archive);
  const stamp = new Date().toISOString().slice(0, 10);
  const safeEmail = (profile?.email ?? "hesap").replace(/[^a-z0-9]/gi, "_");
  const filename = `faktura-yedek-${safeEmail}-${stamp}.fktbak`;

  await logAdminAction({
    action: "data.export",
    targetType: "user",
    targetId: userId,
    targetLabel: profile?.email ?? null,
    metadata: { ...counts },
  });

  return { ok: true, filename, dataB64, counts };
}

/**
 * Şifreli yedeği bir HEDEF kullanıcının altına geri yükler (yeni UUID'ler, FK eşlemeli).
 * Orijinal zaman damgaları korunur. Hesap silinip yeniden kayıt olduysa hedef = yeni user_id.
 */
export async function restoreBuroData(targetUserId: string, dataB64: string): Promise<{ ok: true; counts: Counts } | { error: string }> {
  if (!(await getAdminSession())) return { error: "Yetkisiz erişim" };
  if (!targetUserId) return { error: "Hedef kullanıcı belirtilmedi" };

  let archive: Archive;
  try {
    archive = decryptBackup<Archive>(dataB64);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Yedek çözülemedi" };
  }
  if (archive?.format !== "FKTBAK01" || !Array.isArray(archive.companies)) {
    return { error: "Geçersiz yedek içeriği" };
  }

  const supabase = adminClient();

  const companiesIns: Row[] = [];
  const customersIns: Row[] = [];
  const articlesIns: Row[] = [];
  const invoicesIns: Row[] = [];
  const linesIns: Row[] = [];
  const paymentsIns: Row[] = [];

  for (const company of archive.companies) {
    const { customers = [], articles = [], invoices = [], ...companyRow } = company;
    const newCompanyId = randomUUID();
    companiesIns.push({ ...companyRow, id: newCompanyId, user_id: targetUserId });

    const custMap = new Map<string, string>();
    for (const c of customers) {
      const newId = randomUUID();
      custMap.set(c.id, newId);
      customersIns.push({ ...c, id: newId, client_company_id: newCompanyId });
    }
    const artMap = new Map<string, string>();
    for (const a of articles) {
      const newId = randomUUID();
      artMap.set(a.id, newId);
      articlesIns.push({ ...a, id: newId, client_company_id: newCompanyId });
    }
    for (const inv of invoices) {
      const { lines = [], payments = [], ...invRow } = inv;
      const newInvId = randomUUID();
      invoicesIns.push({
        ...invRow,
        id: newInvId,
        client_company_id: newCompanyId,
        customer_id: invRow.customer_id ? custMap.get(invRow.customer_id) ?? null : null,
      });
      for (const ln of lines) {
        linesIns.push({
          ...ln,
          id: randomUUID(),
          invoice_id: newInvId,
          article_id: ln.article_id ? artMap.get(ln.article_id) ?? null : null,
        });
      }
      for (const pm of payments) {
        paymentsIns.push({ ...pm, id: randomUUID(), invoice_id: newInvId });
      }
    }
  }

  // Bağımlılık sırasıyla yaz (parent -> child). Herhangi biri hata verirse durdur.
  const steps: Array<[string, Row[]]> = [
    ["client_companies", companiesIns],
    ["customers", customersIns],
    ["articles", articlesIns],
    ["invoices", invoicesIns],
    ["invoice_lines", linesIns],
    ["payments", paymentsIns],
  ];
  for (const [table, rows] of steps) {
    if (rows.length === 0) continue;
    const { error } = await supabase.from(table).insert(rows);
    if (error) return { error: `${table} yazılamadı: ${error.message}` };
  }

  const counts = countArchive(archive);
  await logAdminAction({
    action: "data.restore",
    targetType: "user",
    targetId: targetUserId,
    metadata: { ...counts, sourceEmail: archive.source?.email ?? null, exportedAt: archive.exportedAt },
  });

  return { ok: true, counts };
}
