import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_token";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function sign(payload: string): string {
  const sig = createHmac("sha256", process.env.ADMIN_SESSION_SECRET!)
    .update(payload)
    .digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${sig}`;
}

function verify(token: string): string | null {
  const [b64, sig] = token.split(".");
  if (!b64 || !sig) return null;
  const payload = Buffer.from(b64, "base64url").toString();
  const expected = createHmac("sha256", process.env.ADMIN_SESSION_SECRET!)
    .update(payload)
    .digest("hex");
  try {
    if (!timingSafeEqual(Buffer.from(sig, "hex"), Buffer.from(expected, "hex"))) return null;
  } catch {
    return null;
  }
  const { email, exp } = JSON.parse(payload);
  if (Date.now() > exp) return null;
  return email;
}

export function verifyCredentials(email: string, password: string): boolean {
  const adminEmail = process.env.ADMIN_EMAIL ?? "";
  const adminPass = process.env.ADMIN_PASSWORD ?? "";
  if (!adminEmail || !adminPass) return false;

  const emailBuf = Buffer.from(email.toLowerCase());
  const adminEmailBuf = Buffer.from(adminEmail.toLowerCase());
  const passBuf = Buffer.from(password);
  const adminPassBuf = Buffer.from(adminPass);

  // timingSafeEqual requires same-length buffers — length mismatch means wrong credentials
  if (emailBuf.length !== adminEmailBuf.length || passBuf.length !== adminPassBuf.length) return false;

  return timingSafeEqual(emailBuf, adminEmailBuf) && timingSafeEqual(passBuf, adminPassBuf);
}

export function createSessionToken(email: string): string {
  const payload = JSON.stringify({ email, exp: Date.now() + MAX_AGE * 1000 });
  return sign(payload);
}

export async function getAdminSession(): Promise<string | null> {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verify(token);
}

export const COOKIE_NAME_EXPORT = COOKIE_NAME;
export const MAX_AGE_EXPORT = MAX_AGE;
