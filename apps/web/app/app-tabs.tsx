"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/santa-cruz-de-la-sierra/eventos", label: "Feed", icon: "◇", match: ["/santa-cruz-de-la-sierra/eventos", "/en/santa-cruz-de-la-sierra/eventos"] },
  { href: "/city3d", label: "Map", icon: "⌖", match: ["/city3d"] },
  { href: "/bolipass", label: "BoliPass", icon: "▣", match: ["/bolipass"] },
  { href: "/concierge", label: "Concierge", icon: "✦", match: ["/concierge"] },
  { href: "/profile", label: "Profile", icon: "●", match: ["/profile", "/marketplace", "/connect"] },
] as const;

function shouldHide(pathname: string) {
  return pathname.startsWith("/admin") || pathname.startsWith("/host") || pathname.startsWith("/embed") || pathname.startsWith("/api");
}

export default function AppTabs() {
  const pathname = usePathname();
  if (shouldHide(pathname)) return null;

  return (
    <nav className="bv-tabbar" aria-label="BoliVibes app navigation">
      {TABS.map((tab) => {
        const active = tab.match.some((path) => pathname === path || pathname.startsWith(`${path}/`));
        return (
          <Link key={tab.href} href={tab.href} className={`bv-tab ${active ? "bv-tab-active" : ""}`} aria-current={active ? "page" : undefined}>
            <span className="bv-tab-icon" aria-hidden="true">{tab.icon}</span>
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
