import type {
  GatewayAuthType,
  GatewayConnection,
  GatewayHealthStatus,
  ManagedModel,
  ModelCapabilityKey,
  ModelTier,
  PlanModelAccess,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export type GatewayConnectionRow = {
  id: string;
  name: string;
  baseUrl: string;
  authType: GatewayAuthType;
  authSecretRef: string;
  isActive: boolean;
  healthStatus: GatewayHealthStatus;
  lastSyncedAt: string;
  modelsCount: number;
  routeUsageCount: number;
};

export type ManagedModelRow = {
  id: string;
  gatewayConnectionId: string;
  gatewayName: string;
  providerKey: string;
  modelKey: string;
  displayName: string;
  tier: ModelTier;
  enabled: boolean;
  visibleToUsers: boolean;
  routeUsageCount: number;
};

export type CapabilityRouteRow = {
  capabilityKey:
    | "signal_scoring"
    | "ip_extraction_interview"
    | "ip_strategy_report"
    | "direction_generation"
    | "topic_generation"
    | "topic_candidate_generation"
    | "profile_evolution"
    | "draft_generation";
  defaultModelId: string | null;
  fallbackModelId: string | null;
  allowFallback: boolean;
  allowUserOverride: boolean;
  notes: string;
  defaultModelLabel: string;
  fallbackModelLabel: string;
};

export type PlanModelAccessRow = {
  planKey: string;
  capabilityKey: ModelCapabilityKey | null;
  allowedTiers: ModelTier[];
  canSelectModel: boolean;
  canUsePremiumReasoning: boolean;
  scopeLabel: string;
};

function formatDateTime(value?: Date | null) {
  return value ? value.toLocaleString("zh-CN") : "尚未同步";
}

function mapGatewayConnection(
  connection: GatewayConnection & { _count: { managedModels: number } },
  routeUsageCount: number,
): GatewayConnectionRow {
  return {
    id: connection.id,
    name: connection.name,
    baseUrl: connection.baseUrl,
    authType: connection.authType,
    authSecretRef: connection.authSecretRef ?? "",
    isActive: connection.isActive,
    healthStatus: connection.healthStatus,
    lastSyncedAt: formatDateTime(connection.lastSyncedAt),
    modelsCount: connection._count.managedModels,
    routeUsageCount,
  };
}

function mapManagedModel(
  model: ManagedModel & {
    gatewayConnection: {
      id: string;
      name: string;
    };
  },
  routeUsageCount: number,
): ManagedModelRow {
  return {
    id: model.id,
    gatewayConnectionId: model.gatewayConnection.id,
    gatewayName: model.gatewayConnection.name,
    providerKey: model.providerKey,
    modelKey: model.modelKey,
    displayName: model.displayName,
    tier: model.tier,
    enabled: model.enabled,
    visibleToUsers: model.visibleToUsers,
    routeUsageCount,
  };
}

function scopeLabel(capabilityKey: ModelCapabilityKey | null) {
  if (!capabilityKey) {
    return "全局默认";
  }

  return capabilityKey;
}

function mapPlanAccessScope(rows: PlanModelAccess[]): PlanModelAccessRow {
  const [first] = rows;

  return {
    planKey: first.planKey,
    capabilityKey: first.capabilityKey,
    allowedTiers: [...new Set(rows.map((row) => row.allowedTier))].sort(),
    canSelectModel: rows.some((row) => row.canSelectModel),
    canUsePremiumReasoning: rows.some((row) => row.canUsePremiumReasoning),
    scopeLabel: scopeLabel(first.capabilityKey),
  };
}

export async function getGatewayConnections() {
  if (!process.env.DATABASE_URL) {
    return [] as GatewayConnectionRow[];
  }

  try {
    const [rows, routes] = await Promise.all([
      prisma.gatewayConnection.findMany({
        include: {
          _count: {
            select: {
              managedModels: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.capabilityRoute.findMany({
        include: {
          defaultModel: {
            select: {
              gatewayConnectionId: true,
            },
          },
          fallbackModel: {
            select: {
              gatewayConnectionId: true,
            },
          },
        },
      }),
    ]);

    const routeUsageCountByGatewayId = new Map<string, number>();

    for (const route of routes) {
      routeUsageCountByGatewayId.set(
        route.defaultModel.gatewayConnectionId,
        (routeUsageCountByGatewayId.get(route.defaultModel.gatewayConnectionId) ?? 0) + 1,
      );

      if (route.fallbackModel?.gatewayConnectionId) {
        routeUsageCountByGatewayId.set(
          route.fallbackModel.gatewayConnectionId,
          (routeUsageCountByGatewayId.get(route.fallbackModel.gatewayConnectionId) ?? 0) + 1,
        );
      }
    }

    return rows.map((row) => mapGatewayConnection(row, routeUsageCountByGatewayId.get(row.id) ?? 0));
  } catch {
    return [] as GatewayConnectionRow[];
  }
}

export async function getManagedModels() {
  if (!process.env.DATABASE_URL) {
    return [] as ManagedModelRow[];
  }

  try {
    const [rows, routes] = await Promise.all([
      prisma.managedModel.findMany({
        include: {
          gatewayConnection: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [{ enabled: "desc" }, { displayName: "asc" }],
      }),
      prisma.capabilityRoute.findMany({
        select: {
          defaultModelId: true,
          fallbackModelId: true,
        },
      }),
    ]);

    const routeUsageCountByModelId = new Map<string, number>();

    for (const route of routes) {
      routeUsageCountByModelId.set(
        route.defaultModelId,
        (routeUsageCountByModelId.get(route.defaultModelId) ?? 0) + 1,
      );

      if (route.fallbackModelId) {
        routeUsageCountByModelId.set(
          route.fallbackModelId,
          (routeUsageCountByModelId.get(route.fallbackModelId) ?? 0) + 1,
        );
      }
    }

    return rows.map((row) => mapManagedModel(row, routeUsageCountByModelId.get(row.id) ?? 0));
  } catch {
    return [] as ManagedModelRow[];
  }
}

export async function getCapabilityRoutes() {
  if (!process.env.DATABASE_URL) {
    return [] as CapabilityRouteRow[];
  }

  try {
    const rows = await prisma.capabilityRoute.findMany({
      include: {
        defaultModel: {
          select: {
            displayName: true,
            gatewayConnection: {
              select: {
                name: true,
              },
            },
          },
        },
        fallbackModel: {
          select: {
            displayName: true,
            gatewayConnection: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        capabilityKey: "asc",
      },
    });

    return rows.map((row) => ({
      capabilityKey: row.capabilityKey,
      defaultModelId: row.defaultModelId,
      fallbackModelId: row.fallbackModelId,
      allowFallback: row.allowFallback,
      allowUserOverride: row.allowUserOverride,
      notes: row.notes ?? "",
      defaultModelLabel: `${row.defaultModel.gatewayConnection.name} / ${row.defaultModel.displayName}`,
      fallbackModelLabel: row.fallbackModel
        ? `${row.fallbackModel.gatewayConnection.name} / ${row.fallbackModel.displayName}`
        : "未设置",
    }));
  } catch {
    return [] as CapabilityRouteRow[];
  }
}

export async function getPlanModelAccessRows() {
  if (!process.env.DATABASE_URL) {
    return [] as PlanModelAccessRow[];
  }

  try {
    const rows = await prisma.planModelAccess.findMany({
      orderBy: [{ planKey: "asc" }, { capabilityKey: "asc" }, { allowedTier: "asc" }],
    });

    const grouped = new Map<string, PlanModelAccess[]>();

    for (const row of rows) {
      const key = `${row.planKey}::${row.capabilityKey ?? "global"}`;
      grouped.set(key, [...(grouped.get(key) ?? []), row]);
    }

    return [...grouped.values()].map(mapPlanAccessScope);
  } catch {
    return [] as PlanModelAccessRow[];
  }
}
