import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getAccessCookieName, hashAccessValue, isStagingAccessEnabled } from "@/lib/staging-access";

const ALLOWED_PREFIXES = ["/_next", "/favicon.ico", "/access", "/api/access/unlock"];

function isAllowedPath(pathname: string) {
  return ALLOWED_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

export async function middleware(request: NextRequest) {
  if (!isStagingAccessEnabled()) {
    return NextResponse.next();
  }

  const { pathname, search } = request.nextUrl;

  if (isAllowedPath(pathname)) {
    return NextResponse.next();
  }

  const password = process.env.STAGING_ACCESS_PASSWORD?.trim();

  if (!password) {
    return NextResponse.next();
  }

  const expectedHash = await hashAccessValue(password);
  const cookieValue = request.cookies.get(getAccessCookieName())?.value;

  if (cookieValue === expectedHash) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        ok: false,
        error: "当前环境受访问保护，请先完成口令验证。",
      },
      { status: 401 },
    );
  }

  const target = new URL("/access", request.url);
  target.searchParams.set("next", `${pathname}${search}`);

  return NextResponse.redirect(target);
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};
