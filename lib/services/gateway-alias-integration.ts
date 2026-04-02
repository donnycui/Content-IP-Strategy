import { GatewayHealthStatus, ModelTier, Prisma } from "@prisma/client";
import { buildGatewayAdminApiEndpoint } from "@/lib/models/openai-endpoints";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/services/service-error";

const GATEWAY_ALIAS_PROVIDER_KEY = "gateway-alias";

type GatewayAliasRecord = {
  alias_key?: string;
  display_name?: string;
  alias_type?: string;
  enabled?: boolean;
  visibility?: string;
  notes?: string;
};

type GatewayAliasesResponse = {
  aliases?: GatewayAliasRecord[];
};

function buildGatewayAdminHeaders() {
  const adminToken =
    process.env.MODEL_ROUTER_GATEWAY_ADMIN_TOKEN?.trim() || process.env.ZHAOCAI_GATEWAY_ADMIN_TOKEN?.trim();

  if (!adminToken) {
    throw new ServiceError(
      "Set MODEL_ROUTER_GATEWAY_ADMIN_TOKEN or ZHAOCAI_GATEWAY_ADMIN_TOKEN before using gateway alias admin actions.",
      503,
      "GATEWAY_ADMIN_TOKEN_MISSING",
    );
  }

  return {
    "x-admin-token": adminToken,
  };
}

function inferTierFromAliasKey(aliasKey: string): ModelTier {
  const value = aliasKey.toLowerCase();

  if (value.includes("deep")) {
    return "DEEP";
  }

  if (value.includes("fast")) {
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
    throw new ServiceError(
      `Gateway alias request failed: ${response.status} ${response.statusText}`,
      response.status,
      "GATEWAY_FETCH_FAILED",
    );
  }

  return (await response.json()) as T;
}

async function getGatewayConnection(gatewayConnectionId: string) {
  const gateway = await prisma.gatewayConnection.findUnique({
    where: {
      id: gatewayConnectionId,
    },
  });

  if (!gateway) {
    throw new ServiceError("Gateway access not found.", 404, "GATEWAY_NOT_FOUND");
  }

  return gateway;
}

export async function testGatewayAliasAccess(gatewayConnectionId: string) {
  if (!process.env.DATABASE_URL) {
    throw new ServiceError("DATABASE_URL is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const gateway = await getGatewayConnection(gatewayConnectionId);
  const headers = buildGatewayAdminHeaders();
  const aliasesEndpoint = buildGatewayAdminApiEndpoint(gateway.baseUrl, "/gateway/aliases");

  try {
    const response = await fetch(aliasesEndpoint, { headers });
    const healthy = response.ok;

    await prisma.gatewayConnection.update({
      where: {
        id: gateway.id,
      },
      data: {
        healthStatus: healthy ? GatewayHealthStatus.HEALTHY : GatewayHealthStatus.DEGRADED,
      },
    });

    return {
      healthy,
      modelsStatus: response.status,
    };
  } catch (error) {
    await prisma.gatewayConnection.update({
      where: {
        id: gateway.id,
      },
      data: {
        healthStatus: GatewayHealthStatus.ERROR,
      },
    });

    throw new ServiceError(
      error instanceof Error ? `Gateway alias admin test failed: ${error.message}` : "Gateway alias admin test failed.",
      502,
      "GATEWAY_TEST_FAILED",
    );
  }
}

export async function syncGatewayAliasCatalog(gatewayConnectionId: string) {
  if (!process.env.DATABASE_URL) {
    throw new ServiceError("DATABASE_URL is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const gateway = await getGatewayConnection(gatewayConnectionId);
  const headers = buildGatewayAdminHeaders();
  const aliasesEndpoint = buildGatewayAdminApiEndpoint(gateway.baseUrl, "/gateway/aliases");

  try {
    const aliasesPayload = await fetchJson<GatewayAliasesResponse>(aliasesEndpoint, headers);
    const aliases = aliasesPayload.aliases ?? [];

    let upsertedCount = 0;

    await prisma.$transaction(async (tx) => {
      const discoveredAliases: string[] = [];

      for (const alias of aliases) {
        const aliasKey = alias.alias_key?.trim();

        if (!aliasKey) {
          continue;
        }

        discoveredAliases.push(aliasKey);

        const displayName = alias.display_name?.trim() || aliasKey;
        const capabilityTags: Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput = aliases.length
          ? {
              source: "zhaocai-gateway-v2",
              discoveredFrom: aliasesEndpoint,
              aliasType: alias.alias_type ?? "capability",
              visibility: alias.visibility ?? "project",
              notes: alias.notes ?? "",
            }
          : Prisma.JsonNull;

        await tx.managedModel.upsert({
          where: {
            gatewayConnectionId_providerKey_modelKey: {
              gatewayConnectionId: gateway.id,
              providerKey: GATEWAY_ALIAS_PROVIDER_KEY,
              modelKey: aliasKey,
            },
          },
          update: {
            displayName,
            capabilityTags,
            enabled: alias.enabled !== false,
            visibleToUsers: (alias.visibility ?? "project") !== "internal",
            tier: inferTierFromAliasKey(aliasKey),
          },
          create: {
            gatewayConnectionId: gateway.id,
            providerKey: GATEWAY_ALIAS_PROVIDER_KEY,
            modelKey: aliasKey,
            displayName,
            capabilityTags,
            enabled: alias.enabled !== false,
            visibleToUsers: (alias.visibility ?? "project") !== "internal",
            tier: inferTierFromAliasKey(aliasKey),
          },
        });

        upsertedCount += 1;
      }

      await tx.managedModel.updateMany({
        where: {
          gatewayConnectionId: gateway.id,
          providerKey: GATEWAY_ALIAS_PROVIDER_KEY,
          ...(discoveredAliases.length
            ? {
                modelKey: {
                  notIn: discoveredAliases,
                },
              }
            : {}),
        },
        data: {
          enabled: false,
          visibleToUsers: false,
        },
      });

      await tx.gatewayConnection.update({
        where: {
          id: gateway.id,
        },
        data: {
          lastSyncedAt: new Date(),
          healthStatus: GatewayHealthStatus.HEALTHY,
        },
      });
    });

    return {
      gatewayConnectionId: gateway.id,
      modelsCount: aliases.length,
      upsertedCount,
    };
  } catch (error) {
    await prisma.gatewayConnection.update({
      where: {
        id: gateway.id,
      },
      data: {
        healthStatus: GatewayHealthStatus.ERROR,
      },
    });

    if (error instanceof ServiceError) {
      throw error;
    }

    throw new ServiceError(
      error instanceof Error ? `Gateway alias sync failed: ${error.message}` : "Gateway alias sync failed.",
      502,
      "GATEWAY_SYNC_FAILED",
    );
  }
}
