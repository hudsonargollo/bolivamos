import { redirect } from "next/navigation";
import { getCurrentSessionRsc } from "@/lib/session-rsc";

const NAV_LINKS = [
  { href: "/host/events", label: "Events" },
  { href: "/host/vouchers", label: "Vouchers" },
  { href: "/host/analytics", label: "Analytics" },
];

export default async function HostLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSessionRsc();
  if (!session) redirect("/login");
  if (session.role !== "host") redirect("/");

  return (
    <div className="min-h-screen">
      <header className="bg-boli-green px-6 py-4 text-white">
        <nav className="flex items-center gap-6">
          <span className="font-display text-xl uppercase">BoliVamos Host Portal</span>
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className="opacity-90 hover:opacity-100">
              {link.label}
            </a>
          ))}
        </nav>
      </header>
      <main className="p-6">{children}</main>
    </div>
  );
}
