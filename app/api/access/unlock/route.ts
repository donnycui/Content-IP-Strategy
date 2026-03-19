import { NextRequest, NextResponse } from "next/server";
import { getAccessCookieName, getAccessTtlSeconds, hashAccessValue, isStagingAccessEnabled } from "@/lib/staging-access";

type UnlockResponse = {
  ok: boolean;
  error?: string;
  data?: {
    redirectTo: string;
  };
};

export async function POST(request: NextRequest) {
  if (!isStagingAccessEnabled()) {
    return NextResponse.json<UnlockResponse>({
      ok: true,
      data: {
        redirectTo: "/",
      },
    });
  }

  const body = (await request.json()) as {
    password?: string;
    next?: string;
  };

  const password = body.password?.trim() ?? "";
  const expectedPassword = process.env.STAGING_ACCESS_PASSWORD?.trim() ?? "";

  if (!password) {
    return NextResponse.json<UnlockResponse>(
      {
        ok: false,
        error: "请输入访问口令。",
      },
      { status: 400 },
    );
  }

  if (password !== expectedPassword) {
    return NextResponse.json<UnlockResponse>(
      {
        ok: false,
        error: "访问口令不正确。",
      },
      { status: 401 },
    );
  }

  const redirectTo = body.next?.startsWith("/") ? body.next : "/";
  const cookieValue = await hashAccessValue(expectedPassword);

  const response = NextResponse.json<UnlockResponse>({
    ok: true,
    data: {
      redirectTo,
    },
  });

  response.cookies.set({
    name: getAccessCookieName(),
    value: cookieValue,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: getAccessTtlSeconds(),
  });

  return response;
}
