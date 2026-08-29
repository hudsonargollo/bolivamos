import { redirect } from "next/navigation";
import { getCurrentSessionRsc } from "@/lib/session-rsc";
import "./admin.css";

const NAV_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/venues", label: "Venues" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/vouchers", label: "Vouchers" },
  { href: "/admin/places", label: "Places" },
  { href: "/admin/push", label: "Push" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSessionRsc();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  return (
    <div className="admin-root">
      <header className="a-header">
        <div className="a-header-inner">
          <a href="/admin" className="a-wordmark">
            <span className="wm-boli">BOLI</span>
            <span className="wm-vamos">VAMOS</span>
            <span className="wm-tag">Admin</span>
          </a>
          <nav className="a-nav">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>
          <span className="a-session">{session.email}</span>
        </div>
      </header>
      <main className="a-main">{children}</main>
    </div>
  );
}
