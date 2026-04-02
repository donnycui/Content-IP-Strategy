import type { ModelCapabilityKey } from "../models/model-types";

export const DEFAULT_GATEWAY_ALIAS_BY_CAPABILITY = {
  signal_scoring: "signal/deep",
  ip_extraction_interview: "balanced",
  ip_strategy_report: "balanced",
  direction_generation: "balanced",
  topic_generation: "balanced",
  topic_candidate_generation: "balanced",
  profile_evolution: "balanced",
  draft_generation: "draft/deep",
} as const satisfies Record<ModelCapabilityKey, string>;

export type GatewayRuntimeAuthType = "none" | "bearer" | "api_key" | "passcode";
export type GatewayRuntimeProtocol = "openai-chat-completions" | "openai-responses";

export type GatewayEnvironmentConfig = {
  baseUrl: string;
  alias: string;
  gatewayName: string;
  authType: GatewayRuntimeAuthType;
  authSecret?: string;
  authSecretRef?: string | null;
  protocol: GatewayRuntimeProtocol;
  providerKey: "gateway-alias";
};

export function getCapabilityAliasEnvName(capabilityKey: ModelCapabilityKey) {
  return `MODEL_ROUTER_ALIAS_${capabilityKey.toUpperCase()}`;
}

export function normalizeGatewayRuntimeAuthType(value?: string | null): GatewayRuntimeAuthType {
  const normalized = value?.trim().toLowerCase();

  return normalized === "none" || normalized === "api_key" || normalized === "passcode" ? normalized : "bearer";
}

export function normalizeGatewayRuntimeProtocol(value?: string | null): GatewayRuntimeProtocol {
  return value?.trim() === "openai-responses" ? "openai-responses" : "openai-chat-completions";
}

export function resolveGatewayEnvironmentConfig(
  capabilityKey: ModelCapabilityKey,
  env: Record<string, string | undefined>,
): GatewayEnvironmentConfig | null {
  const baseUrl = (env.MODEL_ROUTER_GATEWAY_BASE_URL?.trim() || env.ZHAOCAI_GATEWAY_BASE_URL?.trim() || "").replace(
    /\/$/,
    "",
  );
  const alias =
    env[getCapabilityAliasEnvName(capabilityKey)]?.trim() || DEFAULT_GATEWAY_ALIAS_BY_CAPABILITY[capabilityKey];
  const authSecret = env.MODEL_ROUTER_GATEWAY_CLIENT_KEY || env.ZHAOCAI_GATEWAY_CLIENT_KEY || "";

  if (!baseUrl || !alias) {
    return null;
  }

  return {
    baseUrl,
    alias,
    gatewayName: "zhaocai-gateway-v2",
    authType: authSecret
      ? normalizeGatewayRuntimeAuthType(env.MODEL_ROUTER_GATEWAY_AUTH_TYPE || env.ZHAOCAI_GATEWAY_AUTH_TYPE)
      : "none",
    authSecret: authSecret || undefined,
    authSecretRef:
      env.MODEL_ROUTER_GATEWAY_CLIENT_KEY !== undefined
        ? "MODEL_ROUTER_GATEWAY_CLIENT_KEY"
        : env.ZHAOCAI_GATEWAY_CLIENT_KEY !== undefined
          ? "ZHAOCAI_GATEWAY_CLIENT_KEY"
          : null,
    protocol: normalizeGatewayRuntimeProtocol(
      env.MODEL_ROUTER_GATEWAY_PROTOCOL || env.ZHAOCAI_GATEWAY_PROTOCOL,
    ),
    providerKey: "gateway-alias",
  };
}
