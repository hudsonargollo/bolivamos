import "../../admin/admin.css";
import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <div className="admin-root" style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="a-card" style={{ width: "100%", maxWidth: 380, display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
        <a href="/" aria-label="BoliVibes home" style={{ display: "inline-flex", justifyContent: "center" }}>
          <img
            src="/bolivibes-logoclay.webp"
            alt="BoliVibes"
            width={280}
            height={158}
            style={{ width: 260, maxWidth: "100%", height: "auto", objectFit: "contain" }}
          />
        </a>
        <LoginForm />
        <div style={{ width: "100%", display: "flex", alignItems: "center", gap: 12 }}>
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid var(--a-border)" }} />
          <span className="a-muted" style={{ fontSize: 12 }}>
            or
          </span>
          <hr style={{ flex: 1, border: "none", borderTop: "1px solid var(--a-border)" }} />
        </div>
        <a href="/api/auth/google" className="clay-btn clay-charcoal" style={{ width: "100%", textAlign: "center" }}>
          Continue with Google
        </a>
      </div>
    </div>
  );
}
