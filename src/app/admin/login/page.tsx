"use client";
// app/admin/login/page.tsx
// The only entry point to the admin. Not linked from anywhere public.
// On theme - dark, glass panel, Mino orb.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// -- Design tokens (matches portfolio theme) ------------------
const T = {
  bg:          "#1A1614",
  glass:       "rgba(15,11,9,0.64)",
  border:      "rgba(255,255,255,0.11)",
  accent:      "#D4B896",
  accentLabel: "#1A1614",
  text:        "#F5F0EA",
  textSub:     "#A89F91",
  textMuted:   "#6B6158",
  error:       "#FCA5A5",
  errorBg:     "rgba(239,68,68,0.10)",
};

export default function AdminLogin() {
  const router   = useRouter();
  const supabase = createClient();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email:    email.trim().toLowerCase(),
      password: password,
    });

    if (authError) {
      // Don't expose specific error details to potential attackers
      setError("Invalid credentials. Please try again.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: T.bg,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      position: "relative",
      overflow: "hidden",
    }}>

      {/* Background glow */}
      <div style={{
        position: "absolute", inset: 0, zIndex: 0,
        background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(212,184,150,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Login card */}
      <div style={{
        position: "relative", zIndex: 1,
        width: "100%", maxWidth: 400,
        background: T.glass,
        backdropFilter: "blur(24px) saturate(200%) brightness(1.12)",
        WebkitBackdropFilter: "blur(24px) saturate(200%) brightness(1.12)",
        border: "1px solid " + T.border,
        borderRadius: 24,
        padding: "40px 36px",
        boxShadow: [
          "0 0 0 0.5px rgba(255,255,255,0.06)",
          "0 24px 64px rgba(0,0,0,0.55)",
          "0 8px 24px rgba(0,0,0,0.35)",
          "inset 0 1.5px 0 rgba(255,255,255,0.18)",
          "inset 0 -1px 0 rgba(0,0,0,0.20)",
        ].join(", "),
      }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          {/* Mino orb - small decorative */}
          <div style={{
            width: 56, height: 56,
            borderRadius: "50%",
            background: "linear-gradient(135deg, rgba(94,234,212,0.20), rgba(13,148,136,0.10))",
            border: "1.5px solid rgba(94,234,212,0.30)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 20px",
            fontSize: 26,
          }}>
            🔐
          </div>
          <h1 style={{
            fontSize: 22, fontWeight: 800,
            color: T.text, margin: 0,
            letterSpacing: "-0.02em",
            fontFamily: "'Bricolage Grotesque', sans-serif",
          }}>
            Admin Access
          </h1>
          <p style={{ fontSize: 13, color: T.textMuted, margin: "8px 0 0" }}>
            Portfolio management dashboard
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div style={{
            padding: "12px 16px",
            borderRadius: 12,
            background: T.errorBg,
            border: "1px solid rgba(239,68,68,0.25)",
            color: T.error,
            fontSize: 13,
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            <span>⚠</span> {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.textSub, display: "block", marginBottom: 8 }}>
              EMAIL ADDRESS
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              disabled={loading}
              style={{
                width: "100%", padding: "12px 16px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: T.text, fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.currentTarget.style.borderColor = T.accent + "60"}
              onBlur={e  => e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"}
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: T.textSub, display: "block", marginBottom: 8 }}>
              PASSWORD
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={loading}
              style={{
                width: "100%", padding: "12px 16px",
                borderRadius: 12,
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: T.text, fontSize: 14,
                fontFamily: "inherit",
                outline: "none",
                boxSizing: "border-box",
                transition: "border-color 0.2s",
              }}
              onFocus={e => e.currentTarget.style.borderColor = T.accent + "60"}
              onBlur={e  => e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)"}
            />
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            style={{
              marginTop: 8,
              padding: "14px",
              borderRadius: 12,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              background: loading ? T.accent + "60" : T.accent,
              color: T.accentLabel,
              fontSize: 14, fontWeight: 700,
              fontFamily: "inherit",
              transition: "background 0.2s, opacity 0.2s",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Signing in..." : "Sign In →"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, fontSize: 11, color: T.textMuted }}>
          Not the admin? <a href="/" style={{ color: T.accent, textDecoration: "none" }}>Return to portfolio</a>
        </p>
      </div>
    </div>
  );
}