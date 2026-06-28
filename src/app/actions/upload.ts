"use server";

import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

export async function uploadLogo(formData: FormData): Promise<{ url: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Inte inloggad." };

  const file = formData.get("file") as File | null;
  const companyId = formData.get("companyId") as string | null;

  if (!file) return { error: "Ingen fil." };
  if (file.size > 2 * 1024 * 1024) return { error: "Filen är för stor (max 2 MB)." };
  if (!["image/png", "image/jpeg", "image/webp", "image/svg+xml"].includes(file.type)) {
    return { error: "Filtypen stöds inte. Använd PNG, JPG, WebP eller SVG." };
  }

  // Verifiera ägarskap: om companyId anges måste företaget tillhöra (eller vara tilldelat) användaren.
  // RLS på client_companies returnerar bara rader användaren får se.
  if (companyId) {
    const { data: owned } = await supabase.from("client_companies").select("id").eq("id", companyId).maybeSingle();
    if (!owned) return { error: "Åtkomst nekad." };
  }

  const ext = file.name.split(".").pop() ?? "png";
  const path = companyId
    ? `${user.id}/${companyId}/logo.${ext}`
    : `${user.id}/temp/logo-${Date.now()}.${ext}`;

  const admin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const bytes = await file.arrayBuffer();
  const { error } = await admin.storage
    .from("logos")
    .upload(path, bytes, { contentType: file.type, upsert: true });

  if (error) return { error: error.message };

  const { data: { publicUrl } } = admin.storage.from("logos").getPublicUrl(path);
  return { url: publicUrl };
}
