"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import LoginForm from "./login-form";

const DICT = {
  en: {
    welcome: "Welcome back.",
    desc: "Sign in to plan your next adventure in Santa Cruz, unlock BoliPass perks, or manage your business presence.",
    signIn: "Sign In",
    details: "Enter your details to proceed.",
    or: "or",
    google: "Continue with Google",
    emailLabel: "Email address",
    emailPlaceholder: "name@example.com",
    pwdLabel: "Password",
    pwdPlaceholder: "••••••••",
    submit: "Sign In",
    submitting: "Signing in…",
    errorGeneric: "Something went wrong. Try again.",
    errorNetwork: "Couldn't reach the server. Check your connection and try again.",
  },
  es: {
    welcome: "Bienvenido de nuevo.",
    desc: "Inicia sesión para planear tu próxima aventura en Santa Cruz, desbloquear beneficios de BoliPass o gestionar tu negocio.",
    signIn: "Iniciar sesión",
    details: "Ingresa tus datos para continuar.",
    or: "o",
    google: "Continuar con Google",
    emailLabel: "Correo electrónico",
    emailPlaceholder: "nombre@ejemplo.com",
    pwdLabel: "Contraseña",
    pwdPlaceholder: "••••••••",
    submit: "Iniciar sesión",
    submitting: "Iniciando…",
    errorGeneric: "Algo salió mal. Inténtalo de nuevo.",
    errorNetwork: "No se pudo conectar al servidor. Revisa tu conexión.",
  }
};

export default function LoginClient() {
  const [lang, setLang] = useState<"en" | "es">("es");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("bv_lang");
    if (stored === "en" || stored === "es") {
      setLang(stored);
    } else if (navigator.language.toLowerCase().startsWith("en")) {
      setLang("en");
    }
  }, []);

  const t = DICT[lang];

  const toggleLang = () => {
    const next = lang === "en" ? "es" : "en";
    setLang(next);
    localStorage.setItem("bv_lang", next);
  };

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <div className="auth-layout" style={{ position: "relative" }}>
      <button 
        onClick={toggleLang}
        style={{
          position: "absolute",
          top: 20,
          right: 20,
          zIndex: 50,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(8px)",
          border: "1px solid var(--a-border)",
          padding: "6px 12px",
          borderRadius: 999,
          fontFamily: "Figtree, sans-serif",
          fontWeight: 800,
          fontSize: 13,
          color: "var(--a-ink)",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)"
        }}
      >
        {lang === "en" ? "ES / EN" : "EN / ES"}
      </button>

      <div className="auth-visuals">
        <img src="/api/assets/brand/78784b74-4a51-4933-b16a-1a3843008c31-loginhero" alt="Santa Cruz" className="auth-hero-bg" />
        <div className="auth-ambient-orb orb-1"></div>
        <div className="auth-ambient-orb orb-2"></div>
        <div className="auth-ambient-orb orb-3"></div>
        <div className="auth-visual-content">
          <img
            src="/api/assets/brand/logo-icon.webp"
            alt="BoliVibes Icon"
            className="auth-hero-icon"
            onError={(e) => { (e.target as HTMLImageElement).src = "/imgs/logo-icon.webp"; }}
          />
          <h1>{t.welcome}</h1>
          <p>{t.desc}</p>
        </div>
      </div>
      <div className="auth-form-container">
        <div className="auth-card">
          <Link href="/" aria-label="BoliVibes home" className="auth-logo-link">
            <img
              src="/api/assets/brand/logo-clay.webp"
              alt="BoliVibes"
              width={220}
              height={124}
              className="auth-logo"
              onError={(e) => { (e.target as HTMLImageElement).src = "/imgs/logo-clay.webp"; }}
            />
          </Link>
          <div className="auth-header">
            <h2 className="auth-title">{t.signIn}</h2>
            <p className="auth-subtitle">{t.details}</p>
          </div>
          <LoginForm t={t} />
          <div className="auth-divider">
            <hr />
            <span>{t.or}</span>
            <hr />
          </div>
          <a href="/api/auth/google" className="clay-btn clay-charcoal auth-google-btn">
            {t.google}
          </a>
        </div>
      </div>
    </div>
  );
}
