import "../../admin/admin.css";
import LoginForm from "./login-form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="auth-layout">
      <div className="auth-visuals">
        <img src="/api/assets/brand/78784b74-4a51-4933-b16a-1a3843008c31-loginhero" alt="Santa Cruz" className="auth-hero-bg" />
        <div className="auth-ambient-orb orb-1"></div>
        <div className="auth-ambient-orb orb-2"></div>
        <div className="auth-ambient-orb orb-3"></div>
        <div className="auth-visual-content">
          <img
            src="/imgs/bolivibes-icon.webp"
            alt="BoliVibes Icon"
            style={{ width: 80, height: 80, marginBottom: 24, borderRadius: 20, boxShadow: "0 8px 24px rgba(0,0,0,0.2)" }}
          />
          <h1>Welcome back.</h1>
          <p>Sign in to plan your next adventure in Santa Cruz, unlock BoliPass perks, or manage your business presence.</p>
        </div>
      </div>
      <div className="auth-form-container">
        <div className="auth-card">
          <Link href="/" aria-label="BoliVibes home" className="auth-logo-link">
            <img
              src="/api/assets/brand/bolivibes-logo.webp"
              alt="BoliVibes"
              width={220}
              height={124}
              className="auth-logo"
            />
          </Link>
          <div className="auth-header">
            <h2 className="auth-title">Sign In</h2>
            <p className="auth-subtitle">Enter your details to proceed.</p>
          </div>
          <LoginForm />
          <div className="auth-divider">
            <hr />
            <span>or</span>
            <hr />
          </div>
          <a href="/api/auth/google" className="clay-btn clay-charcoal auth-google-btn">
            Continue with Google
          </a>
          <p className="auth-footer-text">
            Don't have an account? <Link href="/signup" className="auth-link">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
