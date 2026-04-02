function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

export function buildOpenAiApiEndpoint(baseUrl: string, path: `/${string}`) {
  const normalizedBaseUrl = trimTrailingSlash(baseUrl);

  return normalizedBaseUrl.endsWith("/v1")
    ? `${normalizedBaseUrl}${path}`
    : `${normalizedBaseUrl}/v1${path}`;
}

export function buildGatewayAdminApiEndpoint(baseUrl: string, path: `/${string}`) {
  const normalizedBaseUrl = trimTrailingSlash(baseUrl);
  const gatewayBaseUrl = normalizedBaseUrl.endsWith("/v1")
    ? normalizedBaseUrl.slice(0, -3)
    : normalizedBaseUrl;

  return `${gatewayBaseUrl}/admin${path}`;
}
