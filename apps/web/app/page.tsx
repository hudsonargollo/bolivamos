import Link from "next/link";
import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "BoliVibes — Discover Santa Cruz, grow local businesses",
  description:
    "BoliVibes is the Santa Cruz discovery app for events, places, BoliPass benefits, AI planning, and business visibility.",
  openGraph: {
    title: "BoliVibes",
    description: "Discover Santa Cruz as a local, visitor, or business owner.",
    url: SITE_URL,
    siteName: "BoliVibes",
  },
};

const userCards = [
  {
    title: "Find what is happening now",
    text: "Browse events, nightlife, culture, food, tours, and city highlights without digging through scattered posts.",
  },
  {
    title: "Plan with BolivIA",
    text: "Ask the BoliVibes concierge for date-night ideas, visitor routes, family plans, or a fast itinerary around Santa Cruz.",
  },
  {
    title: "Unlock BoliPass perks",
    text: "Access local 2-for-1 benefits and partner rewards while keeping BoliPass as one feature inside BoliVibes.",
  },
];

const businessCards = [
  {
    title: "Be found by locals and visitors",
    text: "Showcase your venue, share your story, and feature your best offerings right where people are deciding what to do next.",
  },
  {
    title: "Build loyalty and community",
    text: "Go beyond transactions. Use curated guides, dynamic profiles, and BoliPass perks to turn first-time visitors into regulars.",
  },
  {
    title: "Grow your local brand",
    text: "Access smart analytics, reach high-intent audiences, and connect meaningfully with a community that loves exploring Santa Cruz.",
  },
];

const routes = [
  { href: "/santa-cruz-de-la-sierra/eventos", label: "Events" },
  { href: "/map", label: "3D map" },
  { href: "/bolipass", label: "BoliPass" },
  { href: "/concierge", label: "BolivIA" },
];

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li style={{ display: "grid", gridTemplateColumns: "30px 1fr", gap: 10, alignItems: "start", color: "#f7f1e4", fontWeight: 800, lineHeight: 1.45 }}>
      <span aria-hidden="true" style={{ display: "inline-grid", placeItems: "center", width: 30, height: 30, borderRadius: 999, background: "#e5b824", color: "#201e1d", boxShadow: "0 2px 0 #8e4a20" }}>✓</span>
      <span>{children}</span>
    </li>
  );
}

export default function HomePage() {
  const jsonLd = [
    { "@context": "https://schema.org", "@type": "Organization", name: "BoliVibes", url: SITE_URL, logo: `${SITE_URL}/api/assets/brand/logo-clay.webp` },
    { "@context": "https://schema.org", "@type": "WebSite", name: "BoliVibes", url: SITE_URL },
  ];

  return (
    <main className="bv-app-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <section
        style={{
          position: "relative",
          overflow: "hidden",
          background:
            "radial-gradient(circle at 12% 12%, rgba(229, 184, 36, 0.34), transparent 19rem), radial-gradient(circle at 86% 8%, rgba(139, 166, 114, 0.28), transparent 24rem), linear-gradient(145deg, #201e1d 0%, #33302c 46%, #8f4225 100%)",
          color: "var(--bv-cream)",
        }}
      >
        <div className="bv-container" style={{ width: "min(100%, 1180px)", paddingTop: 28, paddingBottom: 76 }}>
          <nav style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 18, marginBottom: 64 }}>
            <Link href="/" aria-label="BoliVibes home" style={{ display: "inline-flex", alignItems: "center" }}>
              <img src="/api/assets/brand/logo-clay.webp" alt="BoliVibes" width={196} height={56} style={{ height: "auto", maxWidth: "50vw" }} />
            </Link>
            <div className="bv-chip-row" style={{ justifyContent: "flex-end" }}>
              {routes.map((route) => (
                <Link key={route.href} href={route.href} className="bv-chip">
                  {route.label}
                </Link>
              ))}
              <Link href="/login" className="bv-chip">
                Log in
              </Link>
            </div>
          </nav>

          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(280px, 0.9fr)", gap: 34, alignItems: "center" }} className="bv-landing-hero-grid">
            <div>
              <p className="bv-section-kicker" style={{ color: "#e5b824" }}>
                BoliVibes for Santa Cruz
              </p>
              <h1
                style={{
                  margin: "0 0 18px",
                  maxWidth: 760,
                  color: "#fff6e5",
                  fontFamily: "Caprasimo, Georgia, serif",
                  fontSize: "clamp(44px, 8vw, 88px)",
                  lineHeight: 0.94,
                }}
              >
                The city app for plans, places, perks, and local business growth.
              </h1>
              <p style={{ margin: "0 0 30px", maxWidth: 680, color: "#f1dfbd", fontSize: 18, fontWeight: 750, lineHeight: 1.6 }}>
                Discover Santa Cruz de la Sierra like an insider. BoliVibes connects end users with events, restaurants, nightlife, tours, BoliPass rewards, and BolivIA planning — while giving venues and organizers a clearer path to visibility.
              </p>
              <div className="bv-chip-row" style={{ marginBottom: 30 }}>
                <span className="bv-chip">Events</span>
                <span className="bv-chip">3D city map</span>
                <span className="bv-chip">BoliPass perks</span>
                <span className="bv-chip">BolivIA concierge</span>
              </div>
              <div className="bv-chip-row">
                <Link href="/signup?role=visitor" className="bv-btn">
                  I’m exploring Santa Cruz →
                </Link>
                <Link href="/signup?role=host" className="bv-btn bv-btn-sage">
                  I own a business →
                </Link>
                <Link href="/login" className="bv-soft" style={{ color: "#fff6e5", background: "rgba(255,255,255,.12)" }}>
                  Already have an account? Log in
                </Link>
              </div>
            </div>

            <div className="bv-card bv-card-pad" style={{ background: "rgba(253, 250, 243, 0.96)", padding: 20 }}>
              <div style={{ borderRadius: 24, overflow: "hidden", background: "linear-gradient(180deg, #f7f1e4, #e9dfc9)", padding: 20 }}>
                <img src="/api/assets/brand/logo-icon.webp" alt="BoliVibes" width={76} height={76} style={{ borderRadius: 24, boxShadow: "0 4px 0 #8e4a20", marginBottom: 18 }} />
                <p className="bv-section-kicker">Two paths, one city network</p>
                <div style={{ display: "grid", gap: 12 }}>
                  <Link href="/signup?role=visitor" className="bv-card bv-card-pad" style={{ textDecoration: "none", boxShadow: "0 3px 0 #d9c8a4" }}>
                    <h2 className="bv-card-title" style={{ fontSize: 22 }}>For end users</h2>
                    <p className="bv-card-meta" style={{ fontSize: 14 }}>Create a personal account to save plans, explore events, use BolivIA, and unlock BoliPass benefits.</p>
                  </Link>
                  <Link href="/signup?role=host" className="bv-card bv-card-pad" style={{ textDecoration: "none", boxShadow: "0 3px 0 #d9c8a4" }}>
                    <h2 className="bv-card-title" style={{ fontSize: 22 }}>For business owners</h2>
                    <p className="bv-card-meta" style={{ fontSize: 14 }}>Create a business account to start building venue visibility, offers, events, and partner discovery.</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bv-container" style={{ width: "min(100%, 1120px)", paddingTop: 64 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
          <div>
            <p className="bv-section-kicker">For people going out</p>
            <h2 className="bv-title-sm">Open BoliVibes before asking “what should we do?”</h2>
          </div>
          <p className="bv-subtitle" style={{ fontSize: 16 }}>
            The public side of BoliVibes is built for fast discovery: plans for tonight, places worth visiting, benefits worth redeeming, and AI help when you want a plan now.
          </p>
        </div>
        <div className="bv-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 18 }}>
          {userCards.map((card) => (
            <article key={card.title} className="bv-card bv-card-pad" style={{ minHeight: 190 }}>
              <div className="bv-chip" style={{ marginBottom: 16 }}>Personal</div>
              <h3 className="bv-card-title" style={{ fontSize: 21, marginBottom: 10 }}>{card.title}</h3>
              <p className="bv-card-meta" style={{ fontSize: 15, lineHeight: 1.55 }}>{card.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="bv-container" style={{ width: "min(100%, 1120px)", paddingTop: 24 }}>
        <div className="bv-card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 0, overflow: "hidden" }}>
          <div style={{ padding: 30, background: "linear-gradient(160deg, #fdfaf3, #f6efdd)" }}>
            <p className="bv-section-kicker">For venues and organizers</p>
            <h2 className="bv-title-sm">Turn local discovery into real foot traffic.</h2>
            <p className="bv-subtitle" style={{ fontSize: 16 }}>
              BoliVibes gives restaurants, bars, cafés, tour operators, event hosts, and cultural spaces a branded path into the city’s discovery layer.
            </p>
            <div className="bv-chip-row">
              <Link href="/signup?role=host" className="bv-btn">
                Create business account →
              </Link>
              <Link href="/login" className="bv-btn bv-btn-sage">
                Business login →
              </Link>
            </div>
          </div>
          <div style={{ padding: 30, background: "#2d2925", color: "#f7f1e4" }}>
            <ul style={{ display: "grid", gap: 16, listStyle: "none", margin: 0, padding: 0 }}>
              {businessCards.map((card) => (
                <CheckItem key={card.title}>
                  <strong>{card.title}.</strong> {card.text}
                </CheckItem>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bv-container" style={{ width: "min(100%, 1120px)", paddingTop: 24 }}>
        <div className="bv-card bv-card-pad" style={{ textAlign: "center", padding: "40px 24px", background: "linear-gradient(145deg, #fffaf0, #f0e5cd)" }}>
          <p className="bv-section-kicker">Start now</p>
          <h2 className="bv-title-sm" style={{ marginLeft: "auto", marginRight: "auto", maxWidth: 760 }}>
            Choose your BoliVibes path: explore the city or grow your local business.
          </h2>
          <div className="bv-chip-row" style={{ justifyContent: "center" }}>
            <Link href="/signup?role=visitor" className="bv-btn">
              Sign up as end user →
            </Link>
            <Link href="/signup?role=host" className="bv-btn bv-btn-sage">
              Sign up as business owner →
            </Link>
            <Link href="/fexpocruz" className="bv-soft">
              View the FEXPOCRUZ pitch
            </Link>
          </div>
        </div>
      </section>

      <style>{`
        @media (max-width: 820px) {
          .bv-landing-hero-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </main>
  );
}
