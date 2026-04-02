import { ModelCapabilityKey, ModelTier, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  resolveGatewayEnvironmentConfig,
} from "@/lib/services/model-routing-env";
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
  planKey: string | null;
  source: "database" | "environment-fallback";
  defaultModel: {
    id?: string;
    gatewayConnectionId?: string;
    modelKey: string;
    displayName: string;
    gatewayName?: string;
    gatewayBaseUrl?: string;
    authType?: string;
    authSecretRef?: string | null;
    authSecret?: string;
    tier?: string;
    providerKey?: string;
    protocol: "openai-chat-completions" | "openai-responses";
  };
  fallbackModel?: {
    id?: string;
    gatewayConnectionId?: string;
    modelKey: string;
    displayName: string;
    gatewayName?: string;
    gatewayBaseUrl?: string;
    authType?: string;
    authSecretRef?: string | null;
    authSecret?: string;
    tier?: string;
    providerKey?: string;
    protocol: "openai-chat-completions" | "openai-responses";
  } | null;
  allowFallback: boolean;
  allowUserOverride: boolean;
  effectiveModel: "default" | "fallback" | "override";
  notes?: string | null;
};

type ResolvedPlanAccess = {
  planKey: string;
  allowedTiers: Set<ModelTier>;
  canSelectModel: boolean;
  canUsePremiumReasoning: boolean;
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
  const authSecretRef = model.gatewayConnection.authSecretRef;

  return {
    id: model.id,
    gatewayConnectionId: model.gatewayConnectionId,
    modelKey: model.modelKey,
    displayName: model.displayName,
    gatewayName: model.gatewayConnection.name,
    gatewayBaseUrl: model.gatewayConnection.baseUrl,
    authType: model.gatewayConnection.authType.toLowerCase(),
    authSecretRef,
    authSecret: authSecretRef ? process.env[authSecretRef] : undefined,
    tier: model.tier,
    providerKey: model.providerKey,
    protocol: "openai-chat-completions" as const,
  };
}

function buildGatewayEnvironmentFallback(capabilityKey: ModelCapabilityKey): ResolvedCapabilityRoute | null {
  const config = resolveGatewayEnvironmentConfig(capabilityKey, process.env);

  if (!config) {
    return null;
  }

  return {
    capabilityKey,
    planKey: null,
    source: "environment-fallback",
    defaultModel: {
      modelKey: config.alias,
      displayName: config.alias,
      gatewayName: config.gatewayName,
      gatewayBaseUrl: config.baseUrl,
      gatewayConnectionId: undefined,
      authType: config.authType,
      authSecretRef: config.authSecretRef,
      authSecret: config.authSecret,
      protocol: config.protocol,
      providerKey: config.providerKey,
    },
    fallbackModel: null,
    allowFallback: false,
    allowUserOverride: false,
    effectiveModel: "default",
    notes: "Resolved from gateway alias environment configuration.",
  };
}

function buildLegacyEnvironmentFallback(capabilityKey: ModelCapabilityKey): ResolvedCapabilityRoute {
  const baseUrl = process.env.SIGNAL_SCORING_BASE_URL?.replace(/\/$/, "");
  const model = process.env.SIGNAL_SCORING_MODEL;
  const protocol =
    process.env.SIGNAL_SCORING_PROTOCOL === "openai-chat-completions"
      ? "openai-chat-completions"
      : "openai-responses";

  if (!baseUrl || !model) {
    throw new ServiceError("模型路由未配置，且不存在可用的环境变量回退。", 503, "MODEL_ROUTE_UNAVAILABLE");
  }

  return {
    capabilityKey,
    planKey: null,
    source: "environment-fallback",
    defaultModel: {
      modelKey: model,
      displayName: model,
      gatewayName: "default-environment",
      gatewayBaseUrl: baseUrl,
      gatewayConnectionId: undefined,
      authType: process.env.OPENAI_API_KEY ? "bearer" : "none",
      authSecretRef: process.env.OPENAI_API_KEY ? "OPENAI_API_KEY" : null,
      authSecret: process.env.OPENAI_API_KEY,
      protocol,
    },
    fallbackModel: null,
    allowFallback: false,
    allowUserOverride: false,
    effectiveModel: "default",
    notes: "Resolved from legacy environment configuration.",
  };
}

function buildEnvironmentFallback(capabilityKey: ModelCapabilityKey): ResolvedCapabilityRoute {
  return buildGatewayEnvironmentFallback(capabilityKey) ?? buildLegacyEnvironmentFallback(capabilityKey);
}

function getDefaultPlanKey() {
  return process.env.CREATOR_OS_DEFAULT_PLAN?.trim().toUpperCase() || "STANDARD";
}

async function resolvePlanAccess(planKey: string, capabilityKey: ModelCapabilityKey): Promise<ResolvedPlanAccess | null> {
  const rows = await prisma.planModelAccess.findMany({
    where: {
      planKey,
      OR: [{ capabilityKey }, { capabilityKey: null }],
    },
  });

  if (!rows.length) {
    return null;
  }

  const scopedRows = rows.some((row) => row.capabilityKey === capabilityKey)
    ? rows.filter((row) => row.capabilityKey === capabilityKey)
    : rows.filter((row) => row.capabilityKey === null);

  if (!scopedRows.length) {
    return null;
  }

  return {
    planKey,
    allowedTiers: new Set(scopedRows.map((row) => row.allowedTier)),
    canSelectModel: scopedRows.some((row) => row.canSelectModel),
    canUsePremiumReasoning: scopedRows.some((row) => row.canUsePremiumReasoning),
  };
}

function isModelAllowed(tier: string | undefined, planAccess: ResolvedPlanAccess | null) {
  if (!planAccess || !tier) {
    return true;
  }

  return planAccess.allowedTiers.has(tier as ModelTier);
}

export async function resolveCapabilityRoute(
  capabilityKey: ModelCapabilityKey,
  options?: {
    planKey?: string | null;
    requestedModelId?: string | null;
    requestedTier?: ModelTier | null;
  },
): Promise<ResolvedCapabilityRoute> {
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

  const planAccess = await resolvePlanAccess(options?.planKey?.trim().toUpperCase() || getDefaultPlanKey(), capabilityKey);
  let defaultModel = mapManagedModel(route.defaultModel);
  let fallbackModel = route.fallbackModel ? mapManagedModel(route.fallbackModel) : null;
  let effectiveModel: ResolvedCapabilityRoute["effectiveModel"] = "default";

  if (options?.requestedTier) {
    if (!isModelAllowed(options.requestedTier, planAccess)) {
      throw new ServiceError("当前套餐不可使用该档位。", 403, "PLAN_TIER_DENIED");
    }

    if (defaultModel.tier === options.requestedTier) {
      // keep default model
    } else if (fallbackModel?.tier === options.requestedTier) {
      defaultModel = fallbackModel;
      effectiveModel = "override";
    } else {
      throw new ServiceError("当前能力尚未配置该档位模型。", 400, "CAPABILITY_TIER_NOT_CONFIGURED");
    }
  }

  if (options?.requestedModelId && route.allowUserOverride && planAccess?.canSelectModel) {
    const requestedModel = await prisma.managedModel.findUnique({
      where: {
        id: options.requestedModelId,
      },
      include: {
        gatewayConnection: true,
      },
    });

    if (requestedModel?.enabled && isModelAllowed(requestedModel.tier, planAccess)) {
      defaultModel = mapManagedModel(requestedModel);
      effectiveModel = "override";
    }
  }

  if (!isModelAllowed(defaultModel.tier, planAccess)) {
    if (route.allowFallback && fallbackModel && isModelAllowed(fallbackModel.tier, planAccess)) {
      defaultModel = fallbackModel;
      effectiveModel = "fallback";
    } else {
      throw new ServiceError("当前套餐不可使用该能力所需的模型档位。", 403, "PLAN_MODEL_ACCESS_DENIED");
    }
  }

  return {
    capabilityKey,
    planKey: planAccess?.planKey ?? null,
    source: "database",
    defaultModel,
    fallbackModel,
    allowFallback: route.allowFallback,
    allowUserOverride: route.allowUserOverride && Boolean(planAccess?.canSelectModel),
    effectiveModel,
    notes: route.notes,
  };
}
