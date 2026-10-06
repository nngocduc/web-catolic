"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "ホーム" },
  { href: "/mass", label: "ミサ" },
  { href: "/prayers", label: "祈り" },
  { href: "/rosary", label: "ロザリオ" },
];

export function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="navigation" aria-label="メインナビゲーション">
      {links.map(({ href, label }) => {
        const active = href === "/" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
