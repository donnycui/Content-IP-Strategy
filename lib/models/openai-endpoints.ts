function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

export function buildOpenAiApiEndpoint(baseUrl: string, path: `/${string}`) {
  const normalizedBaseUrl = trimTrailingSlash(baseUrl);

  return normalizedBaseUrl.endsWith("/v1")
    ? `${normalizedBaseUrl}${path}`
    : `${normalizedBaseUrl}/v1${path}`;
}
