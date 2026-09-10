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
    <form onSubmit={handleSubmit} className="a-form" style={{ width: "100%" }}>
      {error && (
        <p className="a-text-orange" role="alert" style={{ margin: 0 }}>
          {error}
        </p>
      )}
      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="a-input"
      />
      <input
        type="password"
        name="password"
        placeholder="Password"
        required
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="a-input"
      />
      <button type="submit" disabled={submitting} className="clay-btn" style={{ width: "100%" }}>
        {submitting ? "Logging in…" : "Log in"}
      </button>
    </form>
  );
}
