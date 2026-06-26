"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const M = ({ name, size = 20 }: { name: string; size?: number }) => (
  <span className="material-symbols-outlined select-none leading-none"
    style={{ fontVariationSettings: `'FILL' 1,'wght' 400,'GRAD' 0,'opsz' ${size}`, fontSize: size }}>
    {name}
  </span>
);

const inp: React.CSSProperties = {
  width: "100%", border: "1px solid #e5e7eb", borderRadius: 9,
  padding: "10px 13px", fontSize: 14, color: "#111827",
  background: "#fff", outline: "none", boxSizing: "border-box",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPass, setShowPass] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      if (authError) { setError("Felaktigt e-post eller lösenord."); setLoading(false); return; }
      const role = data.user?.user_metadata?.role ?? "konsult";
      const dest =
        role === "byraansvarig" ? "/yetkili" :
        role === "privat"       ? "/dashboard" :
        "/konsult";
      router.push(dest);
      router.refresh();
    } catch {
      setError("Ett fel uppstod. Försök igen.");
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fb", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 420 }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "#111827", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
            <M name="account_balance" size={20} />
          </div>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 800, fontSize: 18, color: "#111827", letterSpacing: "-0.01em" }}>
            LedgerFlow
          </span>
        </div>

        {/* Card */}
        <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 16, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", padding: "32px 28px" }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 4, letterSpacing: "-0.02em" }}>Logga in</h1>
          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 24 }}>Ange dina uppgifter för att fortsätta</p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>E-postadress</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="din@byrå.se" required autoComplete="email"
                style={inp}
                onFocus={e => (e.target.style.borderColor = "#111827")}
                onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Lösenord</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" required autoComplete="current-password"
                  style={{ ...inp, paddingRight: 40 }}
                  onFocus={e => (e.target.style.borderColor = "#111827")}
                  onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9ca3af", display: "flex", alignItems: "center" }}>
                  <M name={showPass ? "visibility_off" : "visibility"} size={18} />
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#dc2626" }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading}
              style={{ background: "#111827", color: "#fff", border: "none", borderRadius: 9, padding: "11px 0", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
              {loading && <span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />}
              {loading ? "Loggar in…" : "Logga in"}
            </button>
          </form>
        </div>

      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
