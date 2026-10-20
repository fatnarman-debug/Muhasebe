import { createServerClient } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

/* Bygg aldrig redirecten fran request.url: bakom Coolifys proxy ser
   containern sin egen bind-adress (0.0.0.0:3000) och anvandaren skickas dit.
   Anvand den konfigurerade publika adressen i stallet. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://enkeltfaktura.com";

function to(dest: string) {
  return NextResponse.redirect(new URL(dest, SITE_URL));
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  // Utan ?code kommer anvandaren fran en inbjudan eller losenordslank, dar
  // token ligger i URL-hashen som servern inte kan lasa. Skicka vidare till
  // klientsidan - hashen foljer med redirecten och plockas upp dar.
  // Galler ocksa inbjudningar som skickades innan redirectTo andrades.
  if (!code) return to("/auth/satt-losenord");

  const cookieStore = await cookies();
  const supabase = createServerClient(
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

  await supabase.auth.exchangeCodeForSession(code);

  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role ?? "privat";
  const dest = role === "byraansvarig" ? "/yetkili" : role === "konsult" ? "/konsult" : "/dashboard";
  return to(dest);
}
