"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  matchers?: string[];
};

function matchesPath(pathname: string, matcher: string) {
  if (matcher === "/") {
    return pathname === "/";
  }

  return pathname === matcher || pathname.startsWith(`${matcher}/`);
}

export function TopNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const activeHref =
    items
      .map((item) => {
        const matchers = item.matchers ?? [item.href];
        const matchedLengths = matchers
          .filter((matcher) => matchesPath(pathname, matcher))
          .map((matcher) => matcher.length);

        return {
          href: item.href,
          matchedLength: matchedLengths.length ? Math.max(...matchedLengths) : -1,
        };
      })
      .sort((left, right) => right.matchedLength - left.matchedLength)[0]?.href ?? null;

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => {
        const isActive = item.href === activeHref;

        return (
          <Link
            className={`pill transition ${
              isActive ? "pill-active" : "hover:border-sky-400 hover:text-slate-800"
            }`}
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
