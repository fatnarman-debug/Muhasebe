import { NextResponse } from "next/server";
import { verifyCredentials, createSessionToken } from "@/lib/admin-session";

// Enkel in-memory brute-force-skydd per IP (best-effort; standalone-server = en instans).
const ATTEMPTS = new Map<string, { count: number; first: number }>();
const WINDOW_MS = 15 * 60 * 1000; // 15 min
const MAX_FAILS = 8;

function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
function isBlocked(ip: string): boolean {
  const e = ATTEMPTS.get(ip);
  if (!e) return false;
  if (Date.now() - e.first > WINDOW_MS) { ATTEMPTS.delete(ip); return false; }
  return e.count >= MAX_FAILS;
}
function recordFail(ip: string) {
  const now = Date.now();
  const e = ATTEMPTS.get(ip);
  if (!e || now - e.first > WINDOW_MS) ATTEMPTS.set(ip, { count: 1, first: now });
  else e.count++;
}

export async function POST(req: Request) {
  const ip = clientIp(req);
  if (isBlocked(ip)) {
    return NextResponse.json({ error: "För många försök. Försök igen om en stund." }, { status: 429 });
  }

  const { email, password } = await req.json().catch(() => ({}));

  if (!email || !password) {
    return NextResponse.json({ error: "Eksik bilgi." }, { status: 400 });
  }

  if (!verifyCredentials(email, password)) {
    recordFail(ip);
    await new Promise((r) => setTimeout(r, 500)); // brute-force delay
    return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  }

  ATTEMPTS.delete(ip); // lyckad inloggning nollställer

  const token = createSessionToken(email);
  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
