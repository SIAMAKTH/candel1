"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useFund } from "./FundProvider";

const links = [
  { href: "/", label: "قرعه‌کشی" },
  { href: "/members", label: "اعضا" },
  { href: "/history", label: "سوابق" },
  { href: "/settings", label: "تنظیمات" },
];

export function Nav() {
  const pathname = usePathname();
  const { state } = useFund();
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="brand">
          <span className="brand-icon" aria-hidden>
            🏠
          </span>
          {state.settings.fundName}
        </Link>
        <nav className="nav">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={pathname === l.href ? "active" : undefined}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
