"use client";

import { useState } from "react";
import type { AuthUser } from "@bolivibes/api-schema";

export default function ProfileClient({ user }: { user: AuthUser }) {
  const [theme, setTheme] = useState(() => (typeof document !== "undefined" && document.documentElement.dataset.theme === "dark" ? "dark" : "light"));
  const [language, setLanguage] = useState("ES");
  const name = user.fullName ?? user.email;
  const initials = name.slice(0, 2).toUpperCase();

  function setAppearance(next: "light" | "dark") {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    localStorage.setItem("bolivibes-theme", next);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" }).catch(() => undefined);
    window.location.href = "/login";
  }

  return (
    <main className="bv-app-shell">
      <section className="bv-container-narrow bv-tab-spaced">
        <div className="bv-profile-header">
          <div className="bv-avatar bv-avatar-large">{initials || "—"}</div>
          <div>
            <h1 className="bv-title-sm" style={{ marginBottom: 4 }}>{name}</h1>
            <p className="bv-card-meta">BoliPass: {user.isBoliPassActive ? "active" : "not subscribed"}</p>
          </div>
        </div>

        <div className="bv-stack">
          <div className="bv-card bv-card-pad bv-setting-row">
            <span className="bv-card-title">Appearance</span>
            <span className="bv-segmented">
              {(["light", "dark"] as const).map((option) => (
                <button key={option} type="button" className={theme === option ? "active" : ""} onClick={() => setAppearance(option)}>{option}</button>
              ))}
            </span>
          </div>

          <div className="bv-card bv-card-pad bv-setting-row">
            <span className="bv-card-title">Language</span>
            <span className="bv-segmented">
              {(["ES", "EN"] as const).map((option) => (
                <button key={option} type="button" className={language === option ? "active" : ""} onClick={() => setLanguage(option)}>{option}</button>
              ))}
            </span>
          </div>

          <a className="bv-card bv-card-pad bv-row-link" href="/marketplace"><span>▧</span><span><span className="bv-card-title">Marketplace</span><span className="bv-card-meta">Tours, audio guides and tickets</span></span><span>›</span></a>
          {user.isBoliPassActive && <a className="bv-card bv-card-pad bv-row-link" href="/connect"><span>◎</span><span><span className="bv-card-title">My connections</span><span className="bv-card-meta">Requests and conversations</span></span><span>›</span></a>}
          <div className="bv-card bv-card-pad bv-row-link bv-disabled"><span>♡</span><span className="bv-card-title">Saved events</span><span className="bv-soft">Coming soon</span></div>
          <button className="bv-btn bv-btn-outline" type="button" onClick={logout}>Log out</button>
        </div>
      </section>
    </main>
  );
}
