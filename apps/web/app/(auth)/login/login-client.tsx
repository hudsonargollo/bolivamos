"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./login-form";

type Lang = "es" | "en";
type UserPersona = "visitor" | "host";

const DICT = {
  es: {
    badge: "Acceso Seguro a BoliVibes",
    welcome: "Bienvenido de nuevo.",
    welcomeSub: "Tu portal a los mejores eventos, rutas culturales, gastronomía y comunidad de Santa Cruz.",
    tabVisitor: "👥 Exploradores y Locales",
    tabHost: "🏬 Negocios y Creadores",
    visitorPitch: "Descubre qué hacer hoy, desbloquea beneficios 2x1 con BoliPass y crea itinerarios con bolivIA.",
    hostPitch: "Gestiona la presencia de tu local, publica cartelera cultural y recibe clientes calificados.",
    signIn: "Iniciar sesión",
    details: "Ingresa tus credenciales para continuar.",
    or: "o continúa con",
    google: "Continuar con Google",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "nombre@ejemplo.com",
    pwdLabel: "Contraseña",
    pwdPlaceholder: "••••••••",
    submit: "Entrar a BoliVibes",
    submitting: "Iniciando sesión…",
    errorGeneric: "Credenciales inválidas o error en el servidor. Inténtalo de nuevo.",
    errorNetwork: "No se pudo conectar con el servidor. Revisa tu conexión a internet.",
    showPwd: "Ver contraseña",
    hidePwd: "Ocultar contraseña",
    noAccount: "¿No tienes una cuenta todavía?",
    createAccount: "Crear una cuenta gratis →",
    backHome: "← Volver al inicio",
    features: [
      { icon: "🗺️", label: "Mapa 3D Cruceño" },
      { icon: "📅", label: "Cartelera en Vivo 24/7" },
      { icon: "✦", label: "bolivIA Concierge" },
      { icon: "🎫", label: "Club BoliPass" },
    ],
  },
  en: {
    badge: "Secure BoliVibes Access",
    welcome: "Welcome back.",
    welcomeSub: "Your gateway to Santa Cruz's top events, cultural routes, gastronomy, and city community.",
    tabVisitor: "👥 Explorers & Locals",
    tabHost: "🏬 Businesses & Creators",
    visitorPitch: "Discover what's on today, unlock 2-for-1 BoliPass perks, and plan itineraries with bolivIA.",
    hostPitch: "Manage your venue visibility, publish verified cultural events, and welcome real foot traffic.",
    signIn: "Sign In",
    details: "Enter your credentials to continue.",
    or: "or continue with",
    google: "Continue with Google",
    emailLabel: "Email address",
    emailPlaceholder: "name@example.com",
    pwdLabel: "Password",
    pwdPlaceholder: "••••••••",
    submit: "Sign in to BoliVibes",
    submitting: "Signing in…",
    errorGeneric: "Invalid credentials or server error. Please try again.",
    errorNetwork: "Unable to reach server. Please check your internet connection.",
    showPwd: "Show password",
    hidePwd: "Hide password",
    noAccount: "Don't have an account yet?",
    createAccount: "Create a free account →",
    backHome: "← Back to home",
    features: [
      { icon: "🗺️", label: "3D City Map" },
      { icon: "📅", label: "24/7 Live Agenda" },
      { icon: "✦", label: "bolivIA Concierge" },
      { icon: "🎫", label: "BoliPass Club" },
    ],
  },
};

export default function LoginClient() {
  const [lang, setLang] = useState<Lang>("es");
  const [persona, setPersona] = useState<UserPersona>("visitor");

  useEffect(() => {
    const stored = localStorage.getItem("bv_lang");
    if (stored === "en" || stored === "es") {
      setLang(stored);
    } else if (typeof navigator !== "undefined" && navigator.language.toLowerCase().startsWith("en")) {
      setLang("en");
    }
  }, []);

  const t = DICT[lang];

  const handleLangChange = (next: Lang) => {
    setLang(next);
    localStorage.setItem("bv_lang", next);
  };

  return (
    <div className="min-h-screen bg-[#120c09] text-[#f7e9cc] font-sans antialiased selection:bg-amber-500 selection:text-stone-950 flex flex-col justify-between relative overflow-hidden">
      {/* Background Animated Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div
          animate={{
            x: [0, 60, -40, 0],
            y: [0, -50, 40, 0],
            scale: [1, 1.15, 0.95, 1],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -top-20 -left-20 w-[500px] h-[500px] bg-amber-500/15 rounded-full blur-[110px]"
        />
        <motion.div
          animate={{
            x: [0, -70, 50, 0],
            y: [0, 60, -40, 0],
            scale: [1, 1.2, 0.9, 1],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute -bottom-20 -right-20 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, 40, -30, 0],
            y: [0, 40, -50, 0],
          }}
          transition={{
            duration: 16,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-1/2 left-1/3 w-[360px] h-[360px] bg-orange-600/10 rounded-full blur-[100px]"
        />
      </div>

      {/* Top Floating Bar */}
      <div className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-5 flex items-center justify-between">
        <Link href="/" className="inline-flex items-center gap-2.5 group">
          <img
            src="/api/assets/brand/logo-icon.webp"
            alt="BoliVibes"
            className="w-8 h-8 object-contain drop-shadow-[0_4px_12px_rgba(255,196,31,0.25)] group-hover:scale-105 transition-transform"
          />
          <span className="font-bold text-stone-100 text-sm tracking-tight group-hover:text-amber-300 transition-colors">
            BoliVibes
          </span>
        </Link>

        {/* Language Switcher */}
        <div className="bg-stone-900/90 border border-stone-800/90 p-1 rounded-xl flex items-center gap-1 backdrop-blur shadow-lg shadow-black/20 text-xs">
          <button
            onClick={() => handleLangChange("es")}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              lang === "es"
                ? "bg-amber-500 text-stone-950 shadow-sm"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            ES
          </button>
          <button
            onClick={() => handleLangChange("en")}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              lang === "en"
                ? "bg-amber-500 text-stone-950 shadow-sm"
                : "text-stone-400 hover:text-stone-200"
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-6 my-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-center">
        {/* Left Side: Storytelling & Visual Presence */}
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6 hidden lg:block"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold">
            <span>✨</span>
            <span>{t.badge}</span>
          </div>

          {/* Heading */}
          <div className="space-y-3">
            <h1 className="text-4xl xl:text-5xl font-extrabold text-stone-100 tracking-tight leading-[1.08]">
              {t.welcome}
            </h1>
            <p className="text-stone-300 text-base leading-relaxed max-w-lg">
              {t.welcomeSub}
            </p>
          </div>

          {/* Persona Cards / Pitch */}
          <div className="space-y-3 pt-2">
            <div
              onClick={() => setPersona("visitor")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                persona === "visitor"
                  ? "bg-stone-900/90 border-amber-500/40 shadow-md shadow-amber-500/10"
                  : "bg-stone-950/40 border-stone-800/70 hover:border-stone-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-100 text-sm">{t.tabVisitor}</span>
                {persona === "visitor" && <span className="text-amber-400 text-xs font-bold">✓ Activo</span>}
              </div>
              <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">{t.visitorPitch}</p>
            </div>

            <div
              onClick={() => setPersona("host")}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                persona === "host"
                  ? "bg-stone-900/90 border-emerald-500/40 shadow-md shadow-emerald-500/10"
                  : "bg-stone-950/40 border-stone-800/70 hover:border-stone-700"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-stone-100 text-sm">{t.tabHost}</span>
                {persona === "host" && <span className="text-emerald-400 text-xs font-bold">✓ Activo</span>}
              </div>
              <p className="text-stone-400 text-xs mt-1.5 leading-relaxed">{t.hostPitch}</p>
            </div>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-2.5 pt-2">
            {t.features.map((feat, i) => (
              <span
                key={i}
                className="px-3.5 py-1.5 rounded-full bg-stone-900/80 border border-stone-800 text-stone-300 text-xs font-semibold flex items-center gap-1.5 shadow-sm"
              >
                <span>{feat.icon}</span>
                <span>{feat.label}</span>
              </span>
            ))}
          </div>
        </motion.div>

        {/* Right Side: Framer Animated Auth Card */}
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md mx-auto"
        >
          <div className="p-7 sm:p-8 rounded-3xl bg-stone-950/85 border border-stone-800/90 shadow-2xl shadow-black/60 backdrop-blur-xl space-y-6">
            {/* Card Logo & Header */}
            <div className="text-center space-y-3">
              <Link href="/" aria-label="BoliVibes home" className="inline-block group">
                <img
                  src="/api/assets/brand/logo-clay.webp"
                  alt="BoliVibes"
                  className="w-36 sm:w-40 h-auto mx-auto drop-shadow-[0_8px_16px_rgba(255,196,31,0.2)] group-hover:scale-105 transition-transform"
                />
              </Link>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-stone-100 tracking-tight">
                  {t.signIn}
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 mt-1">
                  {t.details}
                </p>
              </div>
            </div>

            {/* Google OAuth Button */}
            <motion.a
              href="/api/auth/google"
              whileHover={{ scale: 1.015 }}
              whileTap={{ scale: 0.985 }}
              className="w-full py-3 px-4 rounded-xl bg-stone-900/90 hover:bg-stone-800/90 border border-stone-700/80 text-stone-100 font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-md shadow-black/20 transition-all cursor-pointer"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2s.7 5.5 1.9 7.9l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                />
              </svg>
              <span>{t.google}</span>
            </motion.a>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-800/80"></div>
              </div>
              <span className="relative px-3 bg-stone-950 text-[11px] font-semibold text-stone-500 uppercase tracking-wider">
                {t.or}
              </span>
            </div>

            {/* Email/Password Form */}
            <LoginForm t={t} />

            {/* Footer Links */}
            <div className="pt-2 text-center space-y-2 border-t border-stone-800/60">
              <p className="text-xs text-stone-400">
                {t.noAccount}{" "}
                <Link
                  href="/signup"
                  className="font-bold text-amber-400 hover:text-amber-300 hover:underline transition-colors"
                >
                  {t.createAccount}
                </Link>
              </p>
              <Link
                href="/"
                className="inline-block text-xs text-stone-500 hover:text-stone-300 transition-colors"
              >
                {t.backHome}
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Footer minimal info */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 text-center text-xs text-stone-600">
        BoliVibes · Santa Cruz de la Sierra, Bolivia
      </footer>
    </div>
  );
}
