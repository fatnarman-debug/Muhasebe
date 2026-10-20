import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getAdminSession } from "@/lib/admin-session";
import { logAdminAction } from "@/lib/admin-audit";

/* Skapa en ny anvandare fran superadmin-panelen.
   Bjuder in via e-post sa att losenordet aldrig passerar administratoren. */

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function POST(req: Request) {
  if (!(await getAdminSession())) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  let body: { email?: string; full_name?: string; account_type?: string; free?: boolean };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const fullName = (body.full_name ?? "").trim();
  const accountType = body.account_type === "buro" ? "buro" : "privat";
  const free = body.free !== false; // standard: gratis konto

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Geçerli bir e-posta adresi girin." }, { status: 400 });
  }
  if (fullName.length < 2) {
    return NextResponse.json({ error: "İsim en az 2 karakter olmalı." }, { status: 400 });
  }

  const admin = adminClient();
  const role = accountType === "buro" ? "byraansvarig" : "privat";
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enkeltfaktura.com";

  // 1) Bjud in – Supabase skickar ett mail dar anvandaren satter eget losenord.
  const { data: invited, error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    data: { full_name: fullName, role, account_type: accountType },
    redirectTo: `${site}/auth/callback`,
  });

  if (inviteError || !invited?.user) {
    const msg = inviteError?.message ?? "Davet gönderilemedi.";
    // Vanligaste orsaken: adressen finns redan.
    const already = /already|exists|registered/i.test(msg);
    return NextResponse.json(
      { error: already ? "Bu e-posta adresi zaten kayıtlı." : msg },
      { status: already ? 409 : 500 }
    );
  }

  const userId = invited.user.id;

  // 2) Profilen skapas av triggern handle_new_user. Satt gratis-atkomsten.
  //    Upsert i stallet for update: om triggern inte hunnit kora finns ingen rad an.
  if (free) {
    const { error: profileError } = await admin.from("profiles").upsert(
      {
        id: userId,
        email,
        full_name: fullName,
        subscription_status: "active",
        // Markerar kontot som friexemplar sa att det inte raknas som betalande
        // kund nar fakturering kopplas pa.
        plan: "free",
      },
      { onConflict: "id" }
    );
    if (profileError) {
      // Anvandaren ar skapad men gratisflaggan saknas – sag det rakt ut
      // i stallet for att lata det se ut som att allt gick vagen.
      return NextResponse.json(
        {
          ok: true,
          warning:
            "Kullanıcı oluşturuldu ve davet gönderildi, ancak ücretsiz erişim işaretlenemedi: " +
            profileError.message,
          userId,
        },
        { status: 207 }
      );
    }
  }

  await logAdminAction({
    action: "user.invited",
    targetType: "user",
    targetId: userId,
    targetLabel: email,
    metadata: { account_type: accountType, free },
  });

  return NextResponse.json({ ok: true, userId, email });
}
