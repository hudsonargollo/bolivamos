"use client";

import { useEffect, useMemo, useState } from "react";
import type { AuthUser, LockedVoucherTeaser, VoucherDto } from "@bolivibes/api-schema";

type VoucherItem = VoucherDto | LockedVoucherTeaser;

const PERKS = [
  { icon: "⌁", title: "Vouchers", body: "Unlock live BoliPass vouchers and member-only savings." },
  { icon: "◎", title: "Connect", body: "See who else is going and start event-based conversations." },
  { icon: "✦", title: "Concierge", body: "Ask the AI companion for nightlife, transport and trip help." },
] as const;

const NIT_FORMAT = /^\d{7,13}$/;

function isLocked(item: VoucherItem): item is LockedVoucherTeaser {
  return "locked" in item;
}

async function getJson<T>(url: string): Promise<T | null> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) return null;
  return (await res.json()) as T;
}

export default function BoliPassClient() {
  const [me, setMe] = useState<AuthUser | null>(null);
  const [items, setItems] = useState<VoucherItem[]>([]);
  const [totalSavedBob, setTotalSavedBob] = useState(0);
  const [nit, setNit] = useState("");
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getJson<AuthUser>("/api/users/me").then(setMe);
    getJson<VoucherItem[]>("/api/vouchers").then((data) => setItems(data ?? []));
    getJson<{ totalSavedBob: number }>("/api/users/me/total-saved").then((data) => setTotalSavedBob(data?.totalSavedBob ?? 0));
  }, []);

  const vip = Boolean(me?.isBoliPassActive);
  const name = me?.fullName ?? me?.email ?? "";
  const initials = name.slice(0, 2).toUpperCase();
  const priceUsd = useMemo(() => (NIT_FORMAT.test(nit) ? 25 : 50), [nit]);

  async function startCheckout() {
    if (!me) {
      window.location.href = "/login";
      return;
    }
    setCheckoutLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/subscriptions/bolipass/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nit: nit || undefined }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error ?? "Could not start checkout.");
      }
      const data = (await res.json()) as { checkoutUrl: string };
      window.location.href = data.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not start checkout.");
      setCheckoutLoading(false);
    }
  }

  return (
    <main className="bv-app-shell">
      <section className="bv-container-narrow bv-tab-spaced">
        <div className="bv-night-card bv-membership-card">
          <div>
            <p className="bv-membership-logo">BOLI<span>PASS</span></p>
            <p className="bv-membership-status">{vip ? "VIP member" : "Free plan"}</p>
          </div>
          <div className="bv-membership-bottom">
            <div>
              <p className="bv-membership-name">{name || "—"}</p>
              <p className="bv-membership-sub">{vip ? "BoliPass active" : "Upgrade to activate vouchers, Connect and Concierge"}</p>
            </div>
            <div className="bv-avatar">{initials || "—"}</div>
          </div>
        </div>

        {vip && <p className="bv-soft" style={{ marginBottom: 18 }}>Total saved so far: {totalSavedBob} BOB</p>}

        {!vip && (
          <div className="bv-stack" style={{ marginBottom: 20 }}>
            <p className="bv-section-kicker">What VIP unlocks</p>
            {PERKS.map((perk) => (
              <div key={perk.title} className="bv-card bv-card-pad bv-row-card">
                <span className="bv-perk-icon">{perk.icon}</span>
                <span>
                  <span className="bv-card-title">{perk.title}</span>
                  <span className="bv-card-meta">{perk.body}</span>
                </span>
              </div>
            ))}
            <div className="bv-card bv-card-pad">
              <p className="bv-card-title" style={{ margin: 0 }}>${priceUsd} per 3 months</p>
              <p className="bv-card-meta">Enter a Bolivian NIT for the self-attested local discount. Format check only.</p>
              <input className="bv-form-control" inputMode="numeric" placeholder="NIT, e.g. 1234567" value={nit} onChange={(e) => setNit(e.target.value)} style={{ marginTop: 12 }} />
              {nit.length > 0 && !NIT_FORMAT.test(nit) && <p className="bv-error">NIT must be 7–13 digits.</p>}
              {error && <p className="bv-error">{error}</p>}
              <button className="bv-btn" onClick={startCheckout} disabled={checkoutLoading} style={{ width: "100%", marginTop: 14 }}>
                {checkoutLoading ? "Opening checkout…" : "Subscribe"}
              </button>
            </div>
          </div>
        )}

        <p className="bv-section-kicker">BoliPass vouchers</p>
        <div className="bv-stack">
          {items.map((item) => {
            const voucher = isLocked(item) ? item.voucher : item;
            return (
              <div key={voucher.id} className="bv-card bv-card-pad">
                <p className="bv-card-title" style={{ margin: 0 }}>{voucher.title}</p>
                {voucher.termsConditions && <p className="bv-card-meta">{voucher.termsConditions}</p>}
                {isLocked(item) ? (
                  <p className="bv-error" style={{ marginBottom: 0 }}>Unlock BoliPass to save about {item.estimatedSavingsBob} BOB</p>
                ) : (
                  <p className="bv-card-meta">Redeem from the venue QR scan flow in the native app.</p>
                )}
              </div>
            );
          })}
          {items.length === 0 && <p className="bv-subtitle">No active vouchers yet.</p>}
        </div>
      </section>
    </main>
  );
}
