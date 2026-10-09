"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, User, FileText, Loader2, CheckCircle2 } from "lucide-react";

type AccountType = "buro" | "sahsi";

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("buro");
  const [buroAdi, setBuroAdi] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (accountType === "buro" && !buroAdi.trim()) {
      setError("Lütfen büro adını girin.");
      return;
    }
    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalı.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const role = accountType === "buro" ? "byraansvarig" : "privat";

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          full_name: fullName,
          role,
          dukkan_adi: accountType === "buro" ? buroAdi.trim() : null,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    // E-posta onayı kapalıysa oturum hemen açılır -> role göre yönlendir.
    if (data.session) {
      router.push(accountType === "buro" ? "/yetkili" : "/dashboard");
      router.refresh();
      return;
    }

    // E-posta onayı açıksa -> "e-postanı kontrol et" ekranı.
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hesap oluşturuldu!</h1>
          <p className="text-gray-500 mb-6">
            <strong>{email}</strong> adresine bir onay bağlantısı gönderdik.<br />
            Hesabını aktifleştirmek için bağlantıya tıkla.
          </p>
          <Link href="/auth/login">
            <Button variant="outline">Giriş sayfasına git</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-gray-900">Faktura</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Hesap oluştur</h1>
          <p className="text-gray-500 text-sm mb-6">Önce hesap türünü seç</p>

          {/* Hesap tipi seçimi */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setAccountType("buro")}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors ${
                accountType === "buro"
                  ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Building2 className={`w-6 h-6 ${accountType === "buro" ? "text-blue-600" : "text-gray-400"}`} />
              <span className="text-sm font-semibold text-gray-900">Muhasebe Bürosu</span>
              <span className="text-[11px] text-gray-500 leading-tight">Muhasebeci ekle, müşteri ata</span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType("sahsi")}
              className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-colors ${
                accountType === "sahsi"
                  ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <User className={`w-6 h-6 ${accountType === "sahsi" ? "text-blue-600" : "text-gray-400"}`} />
              <span className="text-sm font-semibold text-gray-900">Şahsi Kullanım</span>
              <span className="text-[11px] text-gray-500 leading-tight">Tek kullanıcı, kendi faturaların</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {accountType === "buro" && (
              <div className="space-y-1.5">
                <Label htmlFor="buroAdi">Büro adı</Label>
                <Input
                  id="buroAdi"
                  type="text"
                  placeholder="Örn. Yılmaz Mali Müşavirlik"
                  value={buroAdi}
                  onChange={(e) => setBuroAdi(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="fullName">Ad ve soyad</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Ahmet Yılmaz"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-posta adresi</Label>
              <Input
                id="email"
                type="email"
                placeholder="ornek@eposta.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="En az 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Hesap oluştur
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            Zaten hesabın var mı?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
              Giriş yap
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
