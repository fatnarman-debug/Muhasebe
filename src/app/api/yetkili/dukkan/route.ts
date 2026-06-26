import { createServerClient } from "@supabase/ssr";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); },
      },
    }
  );
}

function createAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

// GET /api/yetkili/dukkan — oturumdaki yetkilinin dükkan bilgisi
export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });

  const { data } = await supabase
    .from("muhasebe_dukkanlar")
    .select("id, dukkan_adi")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return NextResponse.json({ error: "Dükkan bulunamadı" }, { status: 404 });
  return NextResponse.json({ dukkan: data });
}

// PATCH /api/yetkili/dukkan — dükkan adını güncelle
export async function PATCH(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });

  let body: { dukkan_adi?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 }); }

  const name = (body.dukkan_adi ?? "").trim();
  if (!name) return NextResponse.json({ error: "Dükkan adı boş olamaz" }, { status: 400 });
  if (name.length > 120) return NextResponse.json({ error: "Dükkan adı çok uzun" }, { status: 400 });

  // Sahiplik service_role ile doğrulanır (user_id eşleşmesi)
  const { data, error } = await createAdmin()
    .from("muhasebe_dukkanlar")
    .update({ dukkan_adi: name })
    .eq("user_id", user.id)
    .select("id, dukkan_adi")
    .maybeSingle();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Dükkan bulunamadı" }, { status: 404 });
  return NextResponse.json({ dukkan: data });
}
