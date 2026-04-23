"use client";

function normalizePath(path: string) {
  return path.startsWith("/") ? path : `/${path}`;
}

export function getApiPath(path: string) {
  const normalized = normalizePath(path);

  if (process.env.NEXT_PUBLIC_USE_VPS_BACKEND === "true") {
    return `/api/vps${normalized}`;
  }

  return `/api${normalized}`;
}
