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

  return (
    <nav className="flex flex-wrap gap-2">
      {items.map((item) => {
        const matchers = item.matchers ?? [item.href];
        const isActive = matchers.some((matcher) => matchesPath(pathname, matcher));

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
