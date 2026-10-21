import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/* Dataportabilitet: anvandaren laddar ner sina egna uppgifter.
   Kors med anvandarens egen session, inte service-role, sa att
   radnivasakerheten i databasen avgor vad som kommer med. Ingen
   annans uppgifter kan hamna i filen aven om nagot annat gar fel. */

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

// Tabeller som innehaller anvandarens eget material.
const TABELLER = [
  "profiles",
  "client_companies",
  "customers",
  "articles",
  "invoices",
  "invoice_lines",
  "payments",
] as const;

export async function GET() {
  const supabase = await userClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Du måste vara inloggad." }, { status: 401 });
  }

  const innehall: Record<string, unknown> = {};
  const problem: string[] = [];

  for (const tabell of TABELLER) {
    const { data, error } = await supabase.from(tabell).select("*");
    if (error) {
      // Sag rakt ut vad som inte kom med i stallet for att leverera en
      // fil som ser komplett ut men saknar delar.
      problem.push(`${tabell}: ${error.message}`);
      continue;
    }
    innehall[tabell] = data ?? [];
  }

  const exportfil = {
    exporterad: new Date().toISOString(),
    konto: { id: user.id, epost: user.email },
    om_filen:
      "Export av dina uppgifter från EnkeltFaktura. Innehåller de rader du själv " +
      "har åtkomst till. Fakturor utgör räkenskapsinformation och ska sparas " +
      "enligt bokföringslagen även om du avslutar kontot.",
    ...(problem.length ? { kunde_inte_hamtas: problem } : {}),
    data: innehall,
  };

  const datum = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(exportfil, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="enkeltfaktura-export-${datum}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
