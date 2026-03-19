import { ModelCapabilityKey, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/services/service-error";

export const MODEL_CAPABILITY_KEYS = [
  "signal_scoring",
  "ip_extraction_interview",
  "ip_strategy_report",
  "direction_generation",
  "topic_generation",
  "topic_candidate_generation",
  "profile_evolution",
  "draft_generation",
] as const satisfies ReadonlyArray<ModelCapabilityKey>;

export type ResolvedCapabilityRoute = {
  capabilityKey: ModelCapabilityKey;
  source: "database" | "environment-fallback";
  defaultModel: {
    id?: string;
    modelKey: string;
    displayName: string;
    gatewayName?: string;
    gatewayBaseUrl?: string;
    authType?: string;
    authSecretRef?: string | null;
    tier?: string;
    providerKey?: string;
    protocol: "openai-chat-completions";
  };
  fallbackModel?: {
    id?: string;
    modelKey: string;
    displayName: string;
    gatewayName?: string;
    gatewayBaseUrl?: string;
    authType?: string;
    authSecretRef?: string | null;
    tier?: string;
    providerKey?: string;
    protocol: "openai-chat-completions";
  } | null;
  allowFallback: boolean;
  allowUserOverride: boolean;
  notes?: string | null;
};

type CapabilityRouteWithModels = Prisma.CapabilityRouteGetPayload<{
  include: {
    defaultModel: {
      include: {
        gatewayConnection: true;
      };
    };
    fallbackModel: {
      include: {
        gatewayConnection: true;
      };
    };
  };
}>;

function mapManagedModel(model: CapabilityRouteWithModels["defaultModel"]) {
  return {
    id: model.id,
    modelKey: model.modelKey,
    displayName: model.displayName,
    gatewayName: model.gatewayConnection.name,
    gatewayBaseUrl: model.gatewayConnection.baseUrl,
    authType: model.gatewayConnection.authType.toLowerCase(),
    authSecretRef: model.gatewayConnection.authSecretRef,
    tier: model.tier,
    providerKey: model.providerKey,
    protocol: "openai-chat-completions" as const,
  };
}

function buildEnvironmentFallback(capabilityKey: ModelCapabilityKey): ResolvedCapabilityRoute {
  const baseUrl = process.env.SIGNAL_SCORING_BASE_URL?.replace(/\/$/, "");
  const model = process.env.SIGNAL_SCORING_MODEL;

  if (!baseUrl || !model) {
    throw new ServiceError("模型路由未配置，且不存在可用的环境变量回退。", 503, "MODEL_ROUTE_UNAVAILABLE");
  }

  return {
    capabilityKey,
    source: "environment-fallback",
    defaultModel: {
      modelKey: model,
      displayName: model,
      gatewayName: "default-environment",
      gatewayBaseUrl: baseUrl,
      authType: process.env.OPENAI_API_KEY ? "bearer" : "none",
      authSecretRef: process.env.OPENAI_API_KEY ? "OPENAI_API_KEY" : null,
      protocol: "openai-chat-completions",
    },
    fallbackModel: null,
    allowFallback: false,
    allowUserOverride: false,
    notes: "Resolved from legacy environment configuration.",
  };
}

export async function resolveCapabilityRoute(capabilityKey: ModelCapabilityKey): Promise<ResolvedCapabilityRoute> {
  if (!process.env.DATABASE_URL) {
    return buildEnvironmentFallback(capabilityKey);
  }

  const route = await prisma.capabilityRoute.findUnique({
    where: {
      capabilityKey,
    },
    include: {
      defaultModel: {
        include: {
          gatewayConnection: true,
        },
      },
      fallbackModel: {
        include: {
          gatewayConnection: true,
        },
      },
    },
  });

  if (!route) {
    return buildEnvironmentFallback(capabilityKey);
  }

  return {
    capabilityKey,
    source: "database",
    defaultModel: mapManagedModel(route.defaultModel),
    fallbackModel: route.fallbackModel ? mapManagedModel(route.fallbackModel) : null,
    allowFallback: route.allowFallback,
    allowUserOverride: route.allowUserOverride,
    notes: route.notes,
  };
}
