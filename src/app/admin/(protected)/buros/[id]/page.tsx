import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { ArrowLeft, Building2, Users, UserCheck, FileText, Clock } from "lucide-react";
import { getAdminSession } from "@/lib/admin-session";
import { PasswordResetButton } from "@/components/admin/PasswordResetButton";
import { AccountLifecycleControls } from "@/components/admin/AccountLifecycleControls";
import { BackupControls } from "@/components/admin/BackupControls";
import { formatSEK } from "@/lib/utils";

export const dynamic = "force-dynamic";

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Utkast", sent: "Skickad", paid: "Betald", overdue: "Försenad", cancelled: "Makulerad", credit: "Kredit",
};

export default async function AdminBuroDetailPage({ params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) redirect("/admin/login");
  const { id } = await params;
  const supabase = adminClient();

  const { data: dukkan } = await supabase
    .from("muhasebe_dukkanlar")
    .select("id, dukkan_adi, user_id, created_at")
    .eq("id", id)
    .maybeSingle();

  if (!dukkan) notFound();

  const [{ data: owner }, { data: accountants }, { data: companies }] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, frozen_at, frozen_reason").eq("id", dukkan.user_id).maybeSingle(),
    supabase.from("muhasebeciler").select("id, full_name, email, benzersiz_kod, is_active, auth_user_id").eq("dukkan_id", id).order("created_at"),
    supabase.from("client_companies").select("id, name, org_no, is_active").eq("user_id", dukkan.user_id).order("name"),
  ]);

  const companyIds = (companies ?? []).map((c) => c.id);
  const { data: invoices } = companyIds.length
    ? await supabase
        .from("invoices")
        .select("id, invoice_number, status, total, client_company_id, created_at, sent_at, paid_at, customers(name)")
        .in("client_company_id", companyIds)
        .order("created_at", { ascending: false })
        .limit(25)
    : { data: [] };

  const companyName = new Map((companies ?? []).map((c) => [c.id, c.name]));

  // "Son hareketler" — fatura zaman damgalarından türetilen aktivite akışı (ek tablo yok)
  type Ev = { at: string; label: string; kind: "created" | "sent" | "paid"; inv: string };
  const events: Ev[] = [];
  for (const inv of (invoices ?? []) as Array<{ invoice_number: string; created_at?: string; sent_at?: string; paid_at?: string }>) {
    if (inv.created_at) events.push({ at: inv.created_at, kind: "created", label: "Fatura oluşturuldu", inv: inv.invoice_number });
    if (inv.sent_at)    events.push({ at: inv.sent_at,    kind: "sent",    label: "Fatura gönderildi",   inv: inv.invoice_number });
    if (inv.paid_at)    events.push({ at: inv.paid_at,    kind: "paid",    label: "Ödeme alındı",        inv: inv.invoice_number });
  }
  events.sort((a, b) => b.at.localeCompare(a.at));
  const recentEvents = events.slice(0, 12);
  const EV_DOT: Record<Ev["kind"], string> = { created: "bg-slate-400", sent: "bg-sky-500", paid: "bg-emerald-500" };

  return (
    <div className="space-y-6">
      <Link href="/admin/buros" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Bürolar
      </Link>

      {/* Başlık */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{dukkan.dukkan_adi}</h1>
            <p className="text-sm text-slate-500">Yetkili: {owner?.full_name ?? "—"} · {owner?.email ?? "—"}</p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3">
          <span className="text-xs text-slate-400">Büro yetkilisi giriş hesabı</span>
          <PasswordResetButton userId={dukkan.user_id} label={owner?.email ?? "Yetkili"} />
          <AccountLifecycleControls
            userId={dukkan.user_id}
            email={owner?.email ?? "—"}
            isFrozen={!!owner?.frozen_at}
            frozenReason={owner?.frozen_reason ?? null}
            redirectAfterDelete="/admin/buros"
          />
        </div>
      </div>

      {/* Muhasebeciler */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700">Muhasebeciler ({accountants?.length ?? 0})</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {(accountants ?? []).length === 0 ? (
            <p className="px-5 py-6 text-sm text-slate-400">Muhasebeci yok.</p>
          ) : (accountants ?? []).map((m) => (
            <div key={m.id} className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-medium text-slate-900 text-sm">{m.full_name}
                  <span className={`ml-2 text-[10px] font-semibold px-2 py-0.5 rounded ${m.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                    {m.is_active ? "Aktif" : "Pasif"}
                  </span>
                </div>
                <div className="text-xs text-slate-400">{m.email} · <span className="font-mono">{m.benzersiz_kod}</span></div>
              </div>
              {m.auth_user_id
                ? <PasswordResetButton userId={m.auth_user_id} label={m.email} />
                : <span className="text-xs text-slate-300">Giriş hesabı bağlı değil</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Müşteriler + Faturalar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">Müşteri firmalar ({companies?.length ?? 0})</h2>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {(companies ?? []).length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-400">Müşteri yok.</p>
            ) : (companies ?? []).map((c) => (
              <div key={c.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-800">{c.name}</div>
                  <div className="text-xs text-slate-400 font-mono">{c.org_no}</div>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${c.is_active ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                  {c.is_active ? "Aktif" : "Pasif"}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <h2 className="text-sm font-semibold text-slate-700">Son faturalar</h2>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {(invoices ?? []).length === 0 ? (
              <p className="px-5 py-6 text-sm text-slate-400">Fatura yok.</p>
            ) : (invoices ?? []).map((inv) => {
              const cust = (inv as unknown as { customers?: { name?: string } }).customers;
              return (
                <div key={inv.id} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-mono font-semibold text-slate-800">{inv.invoice_number}</div>
                    <div className="text-xs text-slate-400">{cust?.name ?? companyName.get(inv.client_company_id) ?? "—"} · {STATUS_LABEL[inv.status] ?? inv.status}</div>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatSEK(inv.total)}</span>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Yedekleme & Geri Yükleme */}
      <BackupControls userId={dukkan.user_id} email={owner?.email ?? "—"} />

      {/* Son hareketler (türetilmiş aktivite akışı) */}
      <section className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700">Son hareketler</h2>
        </div>
        {recentEvents.length === 0 ? (
          <p className="px-5 py-6 text-sm text-slate-400">Henüz hareket yok.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentEvents.map((e, i) => (
              <li key={i} className="px-5 py-3 flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full shrink-0 ${EV_DOT[e.kind]}`} />
                <span className="text-sm text-slate-700">{e.label}</span>
                <span className="text-xs font-mono text-slate-400">{e.inv}</span>
                <span className="ml-auto text-xs text-slate-400 whitespace-nowrap">
                  {new Date(e.at).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
