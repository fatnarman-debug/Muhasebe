import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/* Begaran om radering av konto.

   Raderar INTE direkt. Fakturor ar rakenskapsinformation och ska bevaras
   enligt bokforingslagen, medan den registrerade samtidigt har ratt att
   begara radering. Var gransen gar ar inte avgjort an, och att hardkoda ett
   svar nu vore att gissa i en fraga som faktiskt behover ett svar. Begaran
   registreras darfor for handlaggning i stallet for att verkstallas. */

async function userClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

export async function POST(req: Request) {
  const supabase = await userClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Du måste vara inloggad." }, { status: 401 });
  }

  let anledning = "";
  try {
    const body = await req.json();
    anledning = typeof body?.anledning === "string" ? body.anledning.slice(0, 1000) : "";
  } catch { /* anledning ar frivillig */ }

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error } = await admin.from("admin_audit_logs").insert({
    actor_email: user.email ?? user.id,
    action: "user.deletion_requested",
    target_type: "user",
    target_id: user.id,
    target_label: user.email ?? null,
    metadata: { anledning, begard: new Date().toISOString() },
    ip: null,
  });

  if (error) {
    // Sag att den inte kom fram i stallet for att later anvandaren tro att
    // begaran ar registrerad.
    return NextResponse.json(
      { error: "Begäran kunde inte registreras: " + error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
