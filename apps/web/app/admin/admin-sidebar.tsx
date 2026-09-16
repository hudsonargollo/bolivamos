"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  href: string;
  label: string;
  icon: string;
  highlight?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/admin", label: "Overview", icon: "📊" },
  { href: "/admin/hermes-reports", label: "Hermes Reports", icon: "🤖", highlight: true },
  { href: "/admin/analytics", label: "Analytics", icon: "📈" },
  { href: "/admin/users", label: "Users", icon: "👥" },
  { href: "/admin/venues", label: "Venues", icon: "🏬" },
  { href: "/admin/events", label: "Events", icon: "📅" },
  { href: "/admin/assets", label: "Assets", icon: "🖼️" },
  { href: "/admin/vouchers", label: "Vouchers", icon: "🎫" },
  { href: "/admin/places", label: "Places", icon: "🗺️" },
  { href: "/admin/social", label: "Social", icon: "💬" },
  { href: "/admin/push", label: "Push", icon: "🔔" },
  { href: "/admin/products", label: "Products", icon: "🛍️" },
  { href: "/admin/orders", label: "Orders", icon: "📦" },
  { href: "/admin/payment-methods", label: "Payment Methods", icon: "💳" },
  { href: "/admin/moderation", label: "Moderation", icon: "🛡️" },
];

export default function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      className="a-sidebar transition-all duration-300 relative flex flex-col justify-between"
      style={{ width: collapsed ? 76 : 260 }}
    >
      <div>
        <div className="flex items-center justify-between p-4 border-b border-stone-800/80">
          <Link href="/admin" className="a-wordmark flex items-center gap-2.5 overflow-hidden" aria-label="BoliVibes admin home">
            <img
              src="/api/assets/brand/logo-icon.webp"
              alt="BoliVibes"
              width={36}
              height={36}
              className="flex-shrink-0 rounded-xl"
              onError={(e) => { (e.target as HTMLImageElement).src = "/imgs/logo-icon.webp"; }}
            />
            {!collapsed && (
              <div className="flex flex-col truncate">
                <span className="font-extrabold text-stone-100 text-sm tracking-tight">BoliVibes</span>
                <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Admin Center</span>
              </div>
            )}
          </Link>
        </div>

        <nav className="a-nav p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  active
                    ? "bg-amber-500 text-stone-950 shadow-md shadow-amber-500/20 font-extrabold"
                    : item.highlight
                    ? "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30"
                    : "text-stone-300 hover:bg-stone-800/80 hover:text-stone-100"
                }`}
              >
                <span className="text-base flex-shrink-0 text-center w-6">{item.icon}</span>
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Collapse Toggle Button */}
      <div className="p-3 border-t border-stone-800/80">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-stone-200 text-xs font-bold border border-stone-800 transition-all cursor-pointer"
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <span>{collapsed ? "➡️" : "⬅️"}</span>
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
