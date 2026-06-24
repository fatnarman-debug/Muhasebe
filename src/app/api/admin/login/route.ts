import { NextResponse } from "next/server";
import { verifyCredentials, createSessionToken } from "@/lib/admin-session";

export async function POST(req: Request) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Eksik bilgi." }, { status: 400 });
  }

  if (!verifyCredentials(email, password)) {
    await new Promise((r) => setTimeout(r, 400)); // brute-force delay
    return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
  }

  const token = createSessionToken(email);

  const res = NextResponse.json({ ok: true });
  res.cookies.set("admin_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}
