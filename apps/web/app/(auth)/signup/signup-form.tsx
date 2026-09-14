"use client";

import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import type { AuthResponse } from "@bolivibes/api-schema";

type SignupRole = "visitor" | "host";

const ROLE_REDIRECT: Record<AuthResponse["user"]["role"], string> = {
  admin: "/admin",
  host: "/host",
  visitor: "/",
};

export default function SignupForm() {
  const searchParams = useSearchParams();
  const initialRole = useMemo<SignupRole>(() => (searchParams.get("role") === "host" ? "host" : "visitor"), [searchParams]);
  const [role, setRole] = useState<SignupRole>(initialRole);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName: fullName || undefined, role }),
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

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }} role="group" aria-label="Account type">
        <button
          type="button"
          onClick={() => setRole("visitor")}
          className={role === "visitor" ? "clay-btn" : "clay-btn clay-charcoal"}
          aria-pressed={role === "visitor"}
          style={{ minHeight: 52 }}
        >
          Personal
        </button>
        <button
          type="button"
          onClick={() => setRole("host")}
          className={role === "host" ? "clay-btn" : "clay-btn clay-charcoal"}
          aria-pressed={role === "host"}
          style={{ minHeight: 52 }}
        >
          Business
        </button>
      </div>

      <input
        type="text"
        name="name"
        placeholder={role === "host" ? "Business or contact name" : "Full name"}
        autoComplete="name"
        value={fullName}
        onChange={(e) => setFullName(e.target.value)}
        className="a-input"
      />
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
        placeholder="Password, minimum 8 characters"
        required
        minLength={8}
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="a-input"
      />

      <p className="a-muted" style={{ margin: 0, fontSize: 12, lineHeight: 1.45 }}>
        {role === "host"
          ? "Business accounts can access host tools for venues, events, vouchers, and analytics as they become available."
          : "Personal accounts can explore events, save plans, use BolivIA, and access BoliPass benefits."}
      </p>

      <button type="submit" disabled={submitting} className="clay-btn" style={{ width: "100%" }}>
        {submitting ? "Creating account…" : role === "host" ? "Create business account" : "Create personal account"}
      </button>
    </form>
  );
}
