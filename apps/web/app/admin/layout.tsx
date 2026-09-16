import { redirect } from "next/navigation";
import { getCurrentSessionRsc } from "@/lib/session-rsc";
import AdminHeaderSession from "./admin-header-session";
import "./admin.css";

const NAV_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/hermes-reports", label: "Hermes Reports" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/venues", label: "Venues" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/assets", label: "Assets" },
  { href: "/admin/vouchers", label: "Vouchers" },
  { href: "/admin/places", label: "Places" },
  { href: "/admin/social", label: "Social" },
  { href: "/admin/push", label: "Push" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/payment-methods", label: "Payment Methods" },
  { href: "/admin/moderation", label: "Moderation" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSessionRsc();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  return (
    <div className="admin-root">
      <aside className="a-sidebar">
        <a href="/admin" className="a-wordmark" aria-label="BoliVibes admin home">
          <img
            src="/api/assets/brand/logo-clay.webp"
            alt="BoliVibes"
            width={140}
            height={80}
            className="a-wordmark-logo"
          />
          <span className="wm-tag">Admin</span>
        </a>
        <nav className="a-nav">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>
      </aside>
      <div className="a-content-wrapper">
        <header className="a-header">
          <div className="a-header-inner">
            <div className="a-header-spacer" />
            <AdminHeaderSession email={session.email} fullName={session.fullName} />
          </div>
        </header>
        <main className="a-main">{children}</main>
      </div>
    </div>
  );
}
