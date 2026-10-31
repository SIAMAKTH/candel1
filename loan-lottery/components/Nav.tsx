"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "./StoreProvider";

const links = [
  { href: "/", label: "خانه" },
  { href: "/draws", label: "قرعه‌کشی‌ها" },
  { href: "/winners", label: "برندگان" },
  { href: "/my-tickets", label: "بلیط‌های من" },
  { href: "/admin", label: "مدیریت" },
];

export function Nav() {
  const pathname = usePathname();
  const { store } = useStore();
  const active = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          <span className="brand-ticket" aria-hidden>
            🎟
          </span>
          {store.siteName}
        </Link>
        <nav className="nav">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className={active(l.href) ? "active" : undefined}>
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
