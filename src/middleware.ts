import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const ADMIN_COOKIE = "admin_token";

function verifyAdminToken(token: string): boolean {
  const [b64] = token.split(".");
  if (!b64) return false;
  try {
    const payload = atob(b64.replace(/-/g, "+").replace(/_/g, "/"));
    const { exp } = JSON.parse(payload);
    return Date.now() < exp;
  } catch {
    return false;
  }
}

async function getSupabaseUser(request: NextRequest) {
  const response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  return { user, response };
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ── Admin routes ─────────────────────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!token || !verifyAdminToken(token)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // ── Yetkili routes (Supabase auth) ───────────────────────────────────────
  if (pathname.startsWith("/yetkili")) {
    const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http");
    if (!supabaseConfigured) return NextResponse.next();

    const { user, response } = await getSupabaseUser(request);
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    // Fine-grained dükkan check is handled in the layout (client-side)
    // to avoid an extra DB round-trip on every middleware invocation.
    return response;
  }

  // ── Dashboard routes (Supabase auth) ─────────────────────────────────────
  if (pathname.startsWith("/dashboard")) {
    const supabaseConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http");
    if (!supabaseConfigured) return NextResponse.next();

    const { user, response } = await getSupabaseUser(request);
    if (!user) {
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
    return response;
  }

  return NextResponse.next({ request });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
