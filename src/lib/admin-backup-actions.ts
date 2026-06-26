"use server";

import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import { getAdminSession } from "@/lib/admin-session";
import { logAdminAction } from "@/lib/admin-audit";
import { encryptBackup, decryptBackup } from "@/lib/backup-crypto";
import type { BackupCounts as Counts, StoredBackup } from "@/lib/backup-types";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Row = Record<string, any>;
type Client = ReturnType<typeof adminClient>;

type LogoFile = { ext: string; dataB64: string };
type ArchiveCompany = Row & { customers: Row[]; articles: Row[]; invoices: Array<Row & { lines: Row[]; payments: Row[] }>; logoFile?: LogoFile | null };
type Archive = {
  format: "FKTBAK01" | "FKTBAK02"; // 02 = logolar gömülü
  exportedAt: string;
  source: { userId: string; email: string | null };
  companies: ArchiveCompany[];
};

const LOGOS_BUCKET = "logos";
const BACKUPS_BUCKET = "backups";
const CONTENT_TYPE: Record<string, string> = { png: "image/png", jpg: "image/jpeg", jpeg: "image/jpeg", webp: "image/webp", svg: "image/svg+xml", gif: "image/gif" };

function countArchive(a: Archive): Counts {
  const c: Counts = { companies: 0, customers: 0, articles: 0, invoices: 0, lines: 0, payments: 0 };
  for (const co of a.companies) {
    c.companies++; c.customers += co.customers.length; c.articles += co.articles.length;
    for (const inv of co.invoices) { c.invoices++; c.lines += inv.lines.length; c.payments += inv.payments.length; }
  }
  return c;
}

/** logo_url'den 'logos' bucket içindeki yolu çıkarır. */
function logoPathFromUrl(logoUrl: string | null | undefined): string | null {
  if (!logoUrl) return null;
  const marker = `/object/public/${LOGOS_BUCKET}/`;
  const i = logoUrl.indexOf(marker);
  if (i === -1) return null;
  return decodeURIComponent(logoUrl.slice(i + marker.length));
}

function extFromPath(path: string): string {
  const m = path.toLowerCase().match(/\.([a-z0-9]+)$/);
  return m ? m[1] : "png";
}

async function blobToB64(blob: Blob): Promise<string> {
  return Buffer.from(await blob.arrayBuffer()).toString("base64");
}

// ── EXPORT ──────────────────────────────────────────────────────────────────

/**
 * Bir hesabın TÜM veri ağacını + firma logolarını şifreli yedeğe çıkarır,
 * arşivi 'backups' özel bucket'ına yükler ve account_backups'a kaydeder.
 * Muhasebe tarihleri korunur (Bokföringslagen sadakati).
 */
export async function exportBuroData(userId: string): Promise<{ ok: true; filename: string; dataB64: string; counts: Counts; storedId: string | null; hasLogos: boolean } | { error: string }> {
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

  // Logoları indir (varsa) ve göm
  let hasLogos = false;
  const logoByCompany = new Map<string, LogoFile>();
  for (const co of companies ?? []) {
    const path = logoPathFromUrl(co.logo_url);
    if (!path) continue;
    const { data: blob, error } = await supabase.storage.from(LOGOS_BUCKET).download(path);
    if (error || !blob) continue;
    logoByCompany.set(co.id, { ext: extFromPath(path), dataB64: await blobToB64(blob) });
    hasLogos = true;
  }

  const archive: Archive = {
    format: "FKTBAK02",
    exportedAt: new Date().toISOString(),
    source: { userId, email: profile?.email ?? null },
    companies: (companies ?? []).map((co) => ({
      ...co,
      logoFile: logoByCompany.get(co.id) ?? null,
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

  // Şifreli arşivi private bucket'a yükle
  const bytes = Buffer.from(dataB64, "base64");
  const storagePath = `${userId}/${Date.now()}-${filename}`;
  let storedId: string | null = null;
  const { error: upErr } = await supabase.storage.from(BACKUPS_BUCKET).upload(storagePath, bytes, { contentType: "application/octet-stream", upsert: false });
  if (!upErr) {
    const { data: rec } = await supabase.from("account_backups").insert({
      user_id: userId, email: profile?.email ?? null, filename, storage_path: storagePath,
      size_bytes: bytes.length, counts, has_logos: hasLogos,
    }).select("id").maybeSingle();
    storedId = rec?.id ?? null;
  } else {
    console.error("[backup] bucket yüklenemedi:", upErr.message);
  }

  await logAdminAction({
    action: "data.export", targetType: "user", targetId: userId, targetLabel: profile?.email ?? null,
    metadata: { ...counts, hasLogos, stored: !!storedId },
  });

  return { ok: true, filename, dataB64, counts, storedId, hasLogos };
}

// ── RESTORE (ortak çekirdek) ────────────────────────────────────────────────

async function restoreArchive(supabase: Client, targetUserId: string, archive: Archive): Promise<{ ok: true; counts: Counts } | { error: string }> {
  if ((archive?.format !== "FKTBAK01" && archive?.format !== "FKTBAK02") || !Array.isArray(archive.companies)) {
    return { error: "Geçersiz yedek içeriği" };
  }

  const companiesIns: Row[] = [];
  const customersIns: Row[] = [];
  const articlesIns: Row[] = [];
  const invoicesIns: Row[] = [];
  const linesIns: Row[] = [];
  const paymentsIns: Row[] = [];

  for (const company of archive.companies) {
    const { customers = [], articles = [], invoices = [], logoFile, ...companyRow } = company;
    const newCompanyId = randomUUID();

    // Logoyu yeni yola yükle ve logo_url'i güncelle
    let logoUrl = companyRow.logo_url ?? null;
    if (logoFile?.dataB64) {
      const newPath = `${targetUserId}/${newCompanyId}/logo.${logoFile.ext}`;
      const { error } = await supabase.storage.from(LOGOS_BUCKET).upload(
        newPath, Buffer.from(logoFile.dataB64, "base64"),
        { contentType: CONTENT_TYPE[logoFile.ext] ?? "image/png", upsert: true }
      );
      if (!error) logoUrl = supabase.storage.from(LOGOS_BUCKET).getPublicUrl(newPath).data.publicUrl;
    }

    companiesIns.push({ ...companyRow, id: newCompanyId, user_id: targetUserId, logo_url: logoUrl });

    const custMap = new Map<string, string>();
    for (const c of customers) { const id = randomUUID(); custMap.set(c.id, id); customersIns.push({ ...c, id, client_company_id: newCompanyId }); }
    const artMap = new Map<string, string>();
    for (const a of articles) { const id = randomUUID(); artMap.set(a.id, id); articlesIns.push({ ...a, id, client_company_id: newCompanyId }); }

    for (const inv of invoices) {
      const { lines = [], payments = [], ...invRow } = inv;
      const newInvId = randomUUID();
      invoicesIns.push({ ...invRow, id: newInvId, client_company_id: newCompanyId, customer_id: invRow.customer_id ? custMap.get(invRow.customer_id) ?? null : null });
      for (const ln of lines) linesIns.push({ ...ln, id: randomUUID(), invoice_id: newInvId, article_id: ln.article_id ? artMap.get(ln.article_id) ?? null : null });
      for (const pm of payments) paymentsIns.push({ ...pm, id: randomUUID(), invoice_id: newInvId });
    }
  }

  const steps: Array<[string, Row[]]> = [
    ["client_companies", companiesIns], ["customers", customersIns], ["articles", articlesIns],
    ["invoices", invoicesIns], ["invoice_lines", linesIns], ["payments", paymentsIns],
  ];
  for (const [table, rows] of steps) {
    if (rows.length === 0) continue;
    const { error } = await supabase.from(table).insert(rows);
    if (error) return { error: `${table} yazılamadı: ${error.message}` };
  }

  return { ok: true, counts: countArchive(archive) };
}

/** Yüklenen (manuel) şifreli yedeği hedef hesaba geri yükler. */
export async function restoreBuroData(targetUserId: string, dataB64: string): Promise<{ ok: true; counts: Counts } | { error: string }> {
  if (!(await getAdminSession())) return { error: "Yetkisiz erişim" };
  if (!targetUserId) return { error: "Hedef kullanıcı belirtilmedi" };
  let archive: Archive;
  try { archive = decryptBackup<Archive>(dataB64); } catch (e) { return { error: e instanceof Error ? e.message : "Yedek çözülemedi" }; }

  const supabase = adminClient();
  const res = await restoreArchive(supabase, targetUserId, archive);
  if ("error" in res) return res;

  await logAdminAction({
    action: "data.restore", targetType: "user", targetId: targetUserId,
    metadata: { ...res.counts, sourceEmail: archive.source?.email ?? null, exportedAt: archive.exportedAt, via: "upload" },
  });
  return res;
}

// ── Saklanan yedekler (bucket) ───────────────────────────────────────────────

/** Bir hesaba ait saklanan yedeklerin listesi. */
export async function listStoredBackups(userId: string): Promise<StoredBackup[]> {
  if (!(await getAdminSession())) return [];
  const { data } = await adminClient()
    .from("account_backups").select("id, filename, storage_path, size_bytes, counts, has_logos, created_at")
    .eq("user_id", userId).order("created_at", { ascending: false }).limit(50);
  return (data ?? []) as StoredBackup[];
}

/** Saklanan bir yedeği hedef hesaba geri yükler (bucket'tan indirip çözer). */
export async function restoreFromStoredBackup(backupId: string, targetUserId: string): Promise<{ ok: true; counts: Counts } | { error: string }> {
  if (!(await getAdminSession())) return { error: "Yetkisiz erişim" };
  if (!backupId || !targetUserId) return { error: "Eksik parametre" };
  const supabase = adminClient();

  const { data: rec } = await supabase.from("account_backups").select("storage_path, email").eq("id", backupId).maybeSingle();
  if (!rec) return { error: "Yedek kaydı bulunamadı" };

  const { data: blob, error } = await supabase.storage.from(BACKUPS_BUCKET).download(rec.storage_path);
  if (error || !blob) return { error: "Yedek dosyası okunamadı: " + (error?.message ?? "") };

  let archive: Archive;
  try { archive = decryptBackup<Archive>(await blobToB64(blob)); } catch (e) { return { error: e instanceof Error ? e.message : "Yedek çözülemedi" }; }

  const res = await restoreArchive(supabase, targetUserId, archive);
  if ("error" in res) return res;

  await logAdminAction({
    action: "data.restore", targetType: "user", targetId: targetUserId,
    metadata: { ...res.counts, sourceEmail: rec.email ?? null, backupId, via: "stored" },
  });
  return res;
}

/** Saklanan yedek için kısa ömürlü imzalı indirme bağlantısı. */
export async function getStoredBackupUrl(backupId: string): Promise<{ ok: true; url: string } | { error: string }> {
  if (!(await getAdminSession())) return { error: "Yetkisiz erişim" };
  const supabase = adminClient();
  const { data: rec } = await supabase.from("account_backups").select("storage_path").eq("id", backupId).maybeSingle();
  if (!rec) return { error: "Yedek kaydı bulunamadı" };
  const { data, error } = await supabase.storage.from(BACKUPS_BUCKET).createSignedUrl(rec.storage_path, 300);
  if (error || !data) return { error: error?.message ?? "Bağlantı oluşturulamadı" };
  return { ok: true, url: data.signedUrl };
}

/** Saklanan bir yedeği siler (dosya + kayıt). GDPR: saklama süresi dolunca temizlik. */
export async function deleteStoredBackup(backupId: string): Promise<{ ok: true } | { error: string }> {
  if (!(await getAdminSession())) return { error: "Yetkisiz erişim" };
  const supabase = adminClient();
  const { data: rec } = await supabase.from("account_backups").select("storage_path, user_id, email").eq("id", backupId).maybeSingle();
  if (!rec) return { error: "Yedek kaydı bulunamadı" };

  await supabase.storage.from(BACKUPS_BUCKET).remove([rec.storage_path]);
  const { error } = await supabase.from("account_backups").delete().eq("id", backupId);
  if (error) return { error: error.message };

  await logAdminAction({ action: "data.backup_deleted", targetType: "user", targetId: rec.user_id ?? null, targetLabel: rec.email ?? null, metadata: { backupId } });
  return { ok: true };
}
