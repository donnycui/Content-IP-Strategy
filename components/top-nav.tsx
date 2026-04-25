"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [pendingHref, setPendingHref] = useState<string | null>(null);
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

  useEffect(() => {
    setPendingHref(null);
  }, [pathname]);

  const pendingItem = pendingHref ? items.find((item) => item.href === pendingHref) ?? null : null;

  return (
    <div className="flex flex-col items-start gap-3 lg:items-end">
      <nav aria-busy={Boolean(pendingItem)} className="flex flex-wrap gap-2">
        {items.map((item) => {
          const isActive = item.href === activeHref;
          const isPending = item.href === pendingHref;

          return (
            <Link
              className={`pill transition ${
                isActive
                  ? "pill-active"
                  : isPending
                    ? "border-sky-300/60 bg-sky-100/70 text-slate-800 shadow-[inset_0_0_0_1px_rgba(93,136,178,0.18)]"
                    : "hover:border-sky-400 hover:text-slate-800"
              }`}
              href={item.href}
              key={item.href}
              onClick={() => {
                if (item.href !== activeHref) {
                  setPendingHref(item.href);
                }
              }}
            >
              <span>{item.label}</span>
              {isPending ? <span className="ml-2 h-2 w-2 animate-pulse rounded-full bg-sky-500/70" /> : null}
            </Link>
          );
        })}
      </nav>

      {pendingItem ? (
        <div className="flex items-center gap-2 rounded-full border border-sky-300/45 bg-sky-100/70 px-3 py-1.5 text-xs text-slate-700">
          <span className="h-2 w-2 animate-pulse rounded-full bg-sky-500/70" />
          正在打开 {pendingItem.label}
        </div>
      ) : null}
    </div>
  );
}
