import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminSession } from "@/lib/admin-session";
import { logAdminAction } from "@/lib/admin-audit";

/* AdminPlanForm har anropat den har endpointen sedan den byggdes, men
   filen fanns aldrig – anropet gick tyst i 404 och planbytet sparades inte.
   Nu finns den. */

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const PLANER = new Set(["individual", "accountant", "free"]);

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Kullanıcı kimliği eksik" }, { status: 400 });

  let body: { plan?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const plan = (body.plan ?? "").trim();
  if (!PLANER.has(plan)) {
    return NextResponse.json({ error: "Geçersiz plan" }, { status: 400 });
  }

  const admin = adminClient();

  const { data: before } = await admin
    .from("profiles")
    .select("email, plan")
    .eq("id", id)
    .maybeSingle();

  if (!before) {
    return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });
  }

  const { error } = await admin.from("profiles").update({ plan }).eq("id", id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction({
    action: "user.plan_changed",
    targetType: "user",
    targetId: id,
    targetLabel: before.email ?? null,
    metadata: { from: before.plan ?? null, to: plan },
  });

  return NextResponse.json({ ok: true, plan });
}
