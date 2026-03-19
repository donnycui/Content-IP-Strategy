const ACCESS_COOKIE_NAME = "creator_os_stage";
const ACCESS_TTL_SECONDS = 60 * 60 * 12;

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export async function hashAccessValue(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return toHex(digest);
}

export function getAccessCookieName() {
  return ACCESS_COOKIE_NAME;
}

export function getAccessTtlSeconds() {
  return ACCESS_TTL_SECONDS;
}

export function isStagingAccessEnabled() {
  return Boolean(process.env.STAGING_ACCESS_PASSWORD?.trim());
}
