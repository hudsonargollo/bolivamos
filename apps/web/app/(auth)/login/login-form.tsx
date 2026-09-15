"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { AuthResponse } from "@bolivibes/api-schema";

const ROLE_REDIRECT: Record<AuthResponse["user"]["role"], string> = {
  admin: "/admin",
  host: "/host",
  visitor: "/",
};

export default function LoginForm({
  t,
}: {
  t: {
    emailLabel: string;
    emailPlaceholder: string;
    pwdLabel: string;
    pwdPlaceholder: string;
    submit: string;
    submitting: string;
    errorGeneric: string;
    errorNetwork: string;
    showPwd: string;
    hidePwd: string;
  };
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        setError(body?.error ?? t.errorGeneric);
        setSubmitting(false);
        return;
      }

      const data = (await res.json()) as AuthResponse;
      window.location.href = ROLE_REDIRECT[data.user.role] ?? "/";
    } catch {
      setError(t.errorNetwork);
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      <AnimatePresence mode="wait">
        {error && (
          <motion.div
            key="error-box"
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1, x: [0, -6, 6, -4, 4, -2, 2, 0] }}
            exit={{ opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs sm:text-sm flex items-start gap-2.5"
            role="alert"
          >
            <span className="text-red-400 text-base leading-none">⚠️</span>
            <span className="flex-1 font-medium leading-snug">{error}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Email Input */}
      <div className="space-y-1.5">
        <label
          htmlFor="login-email"
          className="block text-xs sm:text-sm font-bold text-stone-300 tracking-wide"
        >
          {t.emailLabel}
        </label>
        <div className="relative">
          <input
            id="login-email"
            type="email"
            name="email"
            placeholder={t.emailPlaceholder}
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-stone-900/90 border border-stone-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-100 placeholder-stone-500 text-sm font-medium transition-all outline-none"
          />
        </div>
      </div>

      {/* Password Input */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="login-pwd"
            className="block text-xs sm:text-sm font-bold text-stone-300 tracking-wide"
          >
            {t.pwdLabel}
          </label>
        </div>
        <div className="relative">
          <input
            id="login-pwd"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder={t.pwdPlaceholder}
            required
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-4 pr-12 py-3 rounded-xl bg-stone-900/90 border border-stone-700/80 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 text-stone-100 placeholder-stone-500 text-sm font-medium transition-all outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-200 text-xs font-semibold px-1.5 py-1 rounded transition-colors"
            title={showPassword ? t.hidePwd : t.showPwd}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <motion.button
        type="submit"
        disabled={submitting}
        whileHover={{ scale: submitting ? 1 : 1.015 }}
        whileTap={{ scale: submitting ? 1 : 0.985 }}
        className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:from-amber-400 hover:via-orange-400 hover:to-amber-400 text-stone-950 font-extrabold text-sm tracking-wide shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 cursor-pointer"
      >
        {submitting ? (
          <>
            <svg
              className="animate-spin h-4 w-4 text-stone-950"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span>{t.submitting}</span>
          </>
        ) : (
          <span>{t.submit} →</span>
        )}
      </motion.button>
    </form>
  );
}
