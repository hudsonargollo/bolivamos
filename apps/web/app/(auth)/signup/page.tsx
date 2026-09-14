import { Suspense } from "react";
import "../../admin/admin.css";
import SignupForm from "./signup-form";

export default function SignupPage() {
  return (
    <div className="admin-root" style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div className="a-card" style={{ width: "100%", maxWidth: 460, display: "flex", flexDirection: "column", gap: 20, alignItems: "center" }}>
        <a href="/" aria-label="BoliVibes home" style={{ display: "inline-flex", justifyContent: "center" }}>
          <img
            src="/api/assets/brand/bolivibes-logo.webp"
            alt="BoliVibes"
            width={280}
            height={158}
            className="a-login-logo"
          />
        </a>
        <div style={{ width: "100%", textAlign: "center" }}>
          <p className="a-kicker">Create your BoliVibes account</p>
          <h1 style={{ margin: "6px 0 0", fontFamily: "Caprasimo, Georgia, serif", fontSize: 30, lineHeight: 1.05 }}>Choose how you’ll use the city network.</h1>
        </div>
        <Suspense fallback={<div className="a-muted">Loading signup…</div>}>
          <SignupForm />
        </Suspense>
        <p className="a-muted" style={{ margin: 0, textAlign: "center", fontSize: 13 }}>
          Already have an account? <a href="/login" className="a-text-orange" style={{ fontWeight: 800 }}>Log in</a>
        </p>
      </div>
    </div>
  );
}
