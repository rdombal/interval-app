"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Home", icon: "M3 11l9-8 9 8M5 10v10h14V10" },
  { href: "/browse", label: "Browse", icon: "M21 21l-4.3-4.3M11 19a8 8 0 100-16 8 8 0 000 16z" },
  { href: "/create", label: "Create", icon: "M12 5v14M5 12h14" },
  { href: "/saved", label: "Saved", icon: "M12 21s-7.5-4.7-10-9.2C.2 8.4 1.8 4.8 5.3 4.8c2 0 3.4 1.2 4.7 3 1.3-1.8 2.7-3 4.7-3 3.5 0 5.1 3.6 3.3 7C19.5 16.3 12 21 12 21z" },
];

export function BottomNav() {
  const path = usePathname();
  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 rounded-t-3xl border-x-0 border-b-0 shadow-[0_-8px_24px_-16px_rgba(16,24,40,.25)] md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-around px-3 pb-[env(safe-area-inset-bottom)] pt-1.5">
        {items.map((it) => {
          const active = path === it.href || path.startsWith(it.href + "/");
          return (
            <Link
              key={it.href}
              href={it.href}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[11px] font-medium transition ${
                active
                  ? "bg-mint-100/70 text-mint-700"
                  : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={it.icon} />
              </svg>
              {it.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
