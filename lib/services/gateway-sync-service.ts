import { GatewayAuthType, ModelTier, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/services/service-error";

type GatewayProviderRecord = {
  name: string;
  provider_type?: string;
  base_url?: string;
  models?: string[];
  enabled?: boolean;
  source?: string;
  status?: {
    healthy?: boolean;
    latency_ms?: number;
    request_count?: number;
    error_count?: number;
  };
};

type GatewayProvidersResponse = {
  providers?: GatewayProviderRecord[];
};

type GatewayModelRecord = {
  id: string;
  object?: string;
  owned_by?: string;
};

type GatewayModelsResponse = {
  data?: GatewayModelRecord[];
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

function buildGatewayHeaders(authType: GatewayAuthType, authSecretRef?: string | null) {
  const headers: Record<string, string> = {};

  if (!authSecretRef) {
    return headers;
  }

  const secret = process.env[authSecretRef];

  if (!secret) {
    throw new ServiceError(`网关密钥变量 ${authSecretRef} 未配置。`, 500, "GATEWAY_SECRET_MISSING");
  }

  switch (authType) {
    case "NONE":
      return headers;
    case "API_KEY":
      headers["x-api-key"] = secret;
      return headers;
    case "PASSCODE":
      headers["x-passcode"] = secret;
      return headers;
    case "BEARER":
    default:
      headers.Authorization = `Bearer ${secret}`;
      return headers;
  }
}

function inferTierFromModelKey(modelKey: string): ModelTier {
  const value = modelKey.toLowerCase();

  if (
    value.includes("opus") ||
    value.includes("sonnet") ||
    value.includes("gpt-5") ||
    value.includes("r1") ||
    value.includes("reason")
  ) {
    return "DEEP";
  }

  if (value.includes("mini") || value.includes("flash") || value.includes("haiku") || value.includes("nano")) {
    return "FAST";
  }

  return "BALANCED";
}

async function fetchJson<T>(url: string, headers: Record<string, string>) {
  const response = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new ServiceError(`网关请求失败：${response.status} ${response.statusText}`, response.status, "GATEWAY_FETCH_FAILED");
  }

  return (await response.json()) as T;
}

export async function syncGatewayConnectionModels(gatewayConnectionId: string) {
  if (!process.env.DATABASE_URL) {
    throw new ServiceError("DATABASE_URL is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const connection = await prisma.gatewayConnection.findUnique({
    where: {
      id: gatewayConnectionId,
    },
  });

  if (!connection) {
    throw new ServiceError("网关连接不存在。", 404, "GATEWAY_NOT_FOUND");
  }

  const headers = buildGatewayHeaders(connection.authType, connection.authSecretRef);
  const baseUrl = trimTrailingSlash(connection.baseUrl);

  try {
    const [providersPayload, modelsPayload] = await Promise.all([
      fetchJson<GatewayProvidersResponse>(`${baseUrl}/v1/providers`, headers),
      fetchJson<GatewayModelsResponse>(`${baseUrl}/v1/models`, headers),
    ]);

    const providers = providersPayload.providers ?? [];
    const providerIndex = new Map(providers.map((provider) => [provider.name, provider]));
    const models = modelsPayload.data ?? [];

    let upsertedCount = 0;

    await prisma.$transaction(async (tx) => {
      for (const model of models) {
        const providerKey = model.owned_by ?? "unknown";
        const provider = providerIndex.get(providerKey);
        const displayName = model.id;
        const capabilityTags: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput = provider
          ? {
              providerType: provider.provider_type ?? "unknown",
              source: provider.source ?? "gateway",
              providerModels: provider.models ?? [],
              healthy: provider.status?.healthy ?? null,
            }
          : Prisma.JsonNull;

        await tx.managedModel.upsert({
          where: {
            gatewayConnectionId_providerKey_modelKey: {
              gatewayConnectionId: connection.id,
              providerKey,
              modelKey: model.id,
            },
          },
          update: {
            displayName,
            capabilityTags,
            enabled: true,
            tier: inferTierFromModelKey(model.id),
          },
          create: {
            gatewayConnectionId: connection.id,
            providerKey,
            modelKey: model.id,
            displayName,
            capabilityTags,
            enabled: true,
            visibleToUsers: false,
            tier: inferTierFromModelKey(model.id),
          },
        });

        upsertedCount += 1;
      }

      await tx.gatewayConnection.update({
        where: {
          id: connection.id,
        },
        data: {
          lastSyncedAt: new Date(),
          healthStatus: "HEALTHY",
        },
      });
    });

    return {
      gatewayConnectionId: connection.id,
      providersCount: providers.length,
      modelsCount: models.length,
      upsertedCount,
    };
  } catch (error) {
    await prisma.gatewayConnection.update({
      where: {
        id: connection.id,
      },
      data: {
        healthStatus: "ERROR",
      },
    });

    if (error instanceof ServiceError) {
      throw error;
    }

    throw new ServiceError(
      error instanceof Error ? `网关同步失败：${error.message}` : "网关同步失败。",
      502,
      "GATEWAY_SYNC_FAILED",
    );
  }
}
