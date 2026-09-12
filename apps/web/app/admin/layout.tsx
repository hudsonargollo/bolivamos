import { redirect } from "next/navigation";
import { getCurrentSessionRsc } from "@/lib/session-rsc";
import AdminHeaderSession from "./admin-header-session";
import "./admin.css";

const NAV_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/venues", label: "Venues" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/vouchers", label: "Vouchers" },
  { href: "/admin/places", label: "Places" },
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
      <header className="a-header">
        <div className="a-header-inner">
          <a href="/admin" className="a-wordmark" aria-label="BoliVibes admin home">
            <img
              src="/bolivibes-logoclay.webp"
              alt="BoliVibes"
              width={180}
              height={102}
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
          <AdminHeaderSession email={session.email} fullName={session.fullName} />
        </div>
      </header>
      <main className="a-main">{children}</main>
    </div>
  );
}
