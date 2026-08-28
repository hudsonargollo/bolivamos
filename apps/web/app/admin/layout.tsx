import { redirect } from "next/navigation";
import { getCurrentSessionRsc } from "@/lib/session-rsc";

const NAV_LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/venues", label: "Venues" },
  { href: "/admin/events", label: "Events" },
  { href: "/admin/vouchers", label: "Vouchers" },
  { href: "/admin/places", label: "Places" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSessionRsc();
  if (!session) redirect("/login");
  if (session.role !== "admin") redirect("/");

  return (
    <div className="min-h-screen bg-bg-off-white text-charcoal-dark">
      <header className="bg-charcoal-dark px-6 py-4 text-white">
        <nav className="flex items-center gap-6">
          <span className="font-display text-xl uppercase">BoliVamos Admin</span>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="opacity-90 hover:opacity-100">
              {link.label}
            </a>
          ))}
          <span className="ml-auto text-sm opacity-70">{session.email}</span>
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
