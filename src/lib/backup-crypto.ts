import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

// Yedek dosyası şifreleme: AES-256-GCM.
// Anahtar, BACKUP_ENCRYPTION_KEY (yoksa ADMIN_SESSION_SECRET) gizli değerinden türetilir.
// Dosya formatı (base64): MAGIC(8) | iv(12) | authTag(16) | ciphertext
const MAGIC = Buffer.from("FKTBAK01"); // 8 bayt sürüm imzası

function key(): Buffer {
  const secret = process.env.BACKUP_ENCRYPTION_KEY || process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("BACKUP_ENCRYPTION_KEY veya ADMIN_SESSION_SECRET tanımlı değil");
  return createHash("sha256").update(secret).digest(); // 32 bayt
}

/** Düz nesneyi şifreleyip base64 string döndürür. */
export function encryptBackup(payload: unknown): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const plaintext = Buffer.from(JSON.stringify(payload), "utf8");
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([MAGIC, iv, authTag, ciphertext]).toString("base64");
}

/** base64 yedeği çözer ve nesneyi döndürür. Bozuk/yanlış anahtar => hata. */
export function decryptBackup<T = unknown>(b64: string): T {
  const buf = Buffer.from(b64.trim(), "base64");
  const magic = buf.subarray(0, 8);
  if (!magic.equals(MAGIC)) throw new Error("Geçersiz yedek dosyası (imza uyuşmuyor)");
  const iv = buf.subarray(8, 20);
  const authTag = buf.subarray(20, 36);
  const ciphertext = buf.subarray(36);
  const decipher = createDecipheriv("aes-256-gcm", key(), iv);
  decipher.setAuthTag(authTag);
  const plaintext = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return JSON.parse(plaintext.toString("utf8")) as T;
}
