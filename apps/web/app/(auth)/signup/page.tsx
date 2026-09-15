import { Suspense } from "react";
import "../../admin/admin.css";
import SignupForm from "./signup-form";
import Link from "next/link";

export default function SignupPage() {
  return (
    <div className="auth-layout">
      <div className="auth-visuals">
        <img src="/api/assets/brand/78784b74-4a51-4933-b16a-1a3843008c31-loginhero" alt="Santa Cruz" className="auth-hero-bg" style={{ filter: "hue-rotate(25deg) brightness(0.9)" }} />
        <div className="auth-ambient-orb orb-1" style={{ background: "#97b17e" }}></div>
        <div className="auth-ambient-orb orb-2" style={{ background: "#c4703d" }}></div>
        <div className="auth-ambient-orb orb-3" style={{ background: "#e5b824" }}></div>
        <div className="auth-visual-content">
          <img
            src="/imgs/bolivibes-icon.webp"
            alt="BoliVibes Icon"
            className="auth-hero-icon"
          />
          <h1>Join BoliVibes.</h1>
          <p>
            Create your account to reach locals, manage events, and offer BoliPass perks, or simply to discover the best of Santa Cruz with BolivIA.
          </p>
        </div>
      </div>
      <div className="auth-form-container">
        <div className="auth-card" style={{ maxWidth: 480 }}>
          <Link href="/" aria-label="BoliVibes home" className="auth-logo-link">
            <img
              src="/api/assets/brand/bolivibes-logo.webp"
              alt="BoliVibes"
              width={200}
              height={112}
              className="auth-logo"
            />
          </Link>
          <div className="auth-header">
            <h2 className="auth-title">Create Account</h2>
            <p className="auth-subtitle">Choose how you’ll use the city network.</p>
          </div>
          <Suspense fallback={<div className="a-muted">Loading signup…</div>}>
            <SignupForm />
          </Suspense>
          <div className="auth-divider">
            <hr />
            <span>or</span>
            <hr />
          </div>
          <a href="/api/auth/google" className="clay-btn clay-charcoal auth-google-btn">
            Sign up with Google
          </a>
        </div>
      </div>
    </div>
  );
}
