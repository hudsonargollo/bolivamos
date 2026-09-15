"use client";

import { useState } from "react";
import type { AuthResponse } from "@bolivibes/api-schema";

const ROLE_REDIRECT: Record<AuthResponse["user"]["role"], string> = {
  admin: "/admin",
  host: "/host",
  visitor: "/",
};

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Something went wrong. Try again.");
        setSubmitting(false);
        return;
      }

      const data = (await res.json()) as AuthResponse;
      window.location.href = ROLE_REDIRECT[data.user.role] ?? "/";
    } catch {
      setError("Couldn't reach the server. Check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="a-form" style={{ width: "100%", gap: 16 }}>
      {error && (
        <div style={{ background: "rgba(184, 73, 46, 0.1)", borderLeft: "3px solid var(--a-danger)", padding: "10px 14px", borderRadius: 4 }}>
          <p className="a-text-orange" role="alert" style={{ margin: 0, fontSize: 14, color: "var(--a-danger)" }}>
            {error}
          </p>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <label htmlFor="login-email" style={{ fontSize: 13, fontWeight: 700, color: "var(--a-ink-strong)" }}>Email address</label>
        <input
          id="login-email"
          type="email"
          name="email"
          placeholder="name@example.com"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="a-input auth-input"
        />
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <label htmlFor="login-pwd" style={{ fontSize: 13, fontWeight: 700, color: "var(--a-ink-strong)" }}>Password</label>
        </div>
        <input
          id="login-pwd"
          type="password"
          name="password"
          placeholder="••••••••"
          required
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="a-input auth-input"
        />
      </div>
      <button type="submit" disabled={submitting} className="clay-btn auth-submit-btn" style={{ width: "100%", marginTop: 8 }}>
        {submitting ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
