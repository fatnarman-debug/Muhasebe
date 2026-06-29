"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Loader2, CheckCircle2, Building2, User } from "lucide-react";

type AccountType = "byra" | "privat";

export default function RegisterPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<AccountType>("byra");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (accountType === "byra" && companyName.trim().length < 2) {
      setError("Ange namnet på din byrå.");
      return;
    }
    if (password.length < 8) {
      setError("Lösenordet måste vara minst 8 tecken.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          account_type: accountType,
          role: accountType === "byra" ? "byraansvarig" : "privat",
          dukkan_adi: accountType === "byra" ? companyName.trim() : null,
        },
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    // E-postabekräftelse av: signUp loggar in direkt → skicka till rätt panel
    if (data.session) {
      router.push(accountType === "byra" ? "/yetkili" : "/dashboard");
      router.refresh();
      return;
    }
    // E-postabekräftelse på: visa bekräftelseskärm
    setSuccess(true);
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="w-full max-w-md text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Konto skapat!</h1>
          <p className="text-gray-500 mb-6">
            Vi har skickat en bekräftelselänk till <strong>{email}</strong>.<br />
            Klicka på länken för att aktivera ditt konto.
          </p>
          <Link href="/auth/login">
            <Button variant="outline">Gå till inloggning</Button>
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
          <span className="text-2xl font-bold text-gray-900">Enkelfaktura</span>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Skapa konto</h1>
          <p className="text-gray-500 text-sm mb-6">Gratis i 14 dagar, inget kreditkort krävs</p>

          {/* Kontotyp */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <button
              type="button"
              onClick={() => setAccountType("byra")}
              className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition ${
                accountType === "byra"
                  ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Building2 className={`w-5 h-5 ${accountType === "byra" ? "text-blue-600" : "text-gray-400"}`} />
              <span className="text-sm font-semibold text-gray-900">Redovisningsbyrå</span>
              <span className="text-xs text-gray-500 leading-snug">Flera användare, egna konsulter</span>
            </button>
            <button
              type="button"
              onClick={() => setAccountType("privat")}
              className={`flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition ${
                accountType === "privat"
                  ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <User className={`w-5 h-5 ${accountType === "privat" ? "text-blue-600" : "text-gray-400"}`} />
              <span className="text-sm font-semibold text-gray-900">Privat användning</span>
              <span className="text-xs text-gray-500 leading-snug">En användare, eget företag</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">För- och efternamn</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Anna Andersson"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            {accountType === "byra" && (
              <div className="space-y-1.5">
                <Label htmlFor="companyName">Byråns namn</Label>
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Andersson Redovisning AB"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email">E-postadress</Label>
              <Input
                id="email"
                type="email"
                placeholder="din@epost.se"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Lösenord</Label>
              <Input
                id="password"
                type="password"
                placeholder="Minst 8 tecken"
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
              Skapa konto
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-4">
            Genom att registrera dig godkänner du våra användarvillkor och integritetspolicy.
          </p>

          <p className="text-center text-sm text-gray-500 mt-4">
            Har du redan ett konto?{" "}
            <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
              Logga in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
