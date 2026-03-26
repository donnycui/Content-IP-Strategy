import { ModelTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/services/service-error";

type UpdateManagedModelInput = {
  id?: string;
  tier?: ModelTier;
  enabled?: boolean;
  visibleToUsers?: boolean;
};

type CreateManagedModelInput = {
  gatewayConnectionId?: string;
  providerKey?: string;
  modelKey?: string;
  displayName?: string;
  tier?: ModelTier;
  enabled?: boolean;
  visibleToUsers?: boolean;
};

async function getModelRouteReference(id: string) {
  return prisma.capabilityRoute.findFirst({
    where: {
      OR: [
        {
          defaultModelId: id,
        },
        {
          fallbackModelId: id,
        },
      ],
    },
    select: {
      capabilityKey: true,
    },
  });
}

export async function createManagedModel(input: CreateManagedModelInput) {
  if (!process.env.DATABASE_URL) {
    throw new ServiceError("DATABASE_URL is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  if (!input.gatewayConnectionId || !input.modelKey?.trim()) {
    throw new ServiceError("请至少选择 Provider 并填写模型 Key。", 400, "MODEL_CREATE_FIELDS_REQUIRED");
  }

  const gateway = await prisma.gatewayConnection.findUnique({
    where: {
      id: input.gatewayConnectionId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!gateway) {
    throw new ServiceError("Provider 连接不存在。", 404, "GATEWAY_NOT_FOUND");
  }

  const providerKey = input.providerKey?.trim() || gateway.name;
  const modelKey = input.modelKey.trim();

  await prisma.managedModel.upsert({
    where: {
      gatewayConnectionId_providerKey_modelKey: {
        gatewayConnectionId: gateway.id,
        providerKey,
        modelKey,
      },
    },
    update: {
      displayName: input.displayName?.trim() || modelKey,
      tier: input.tier ?? "BALANCED",
      enabled: input.enabled ?? true,
      visibleToUsers: input.visibleToUsers ?? false,
    },
    create: {
      gatewayConnectionId: gateway.id,
      providerKey,
      modelKey,
      displayName: input.displayName?.trim() || modelKey,
      tier: input.tier ?? "BALANCED",
      enabled: input.enabled ?? true,
      visibleToUsers: input.visibleToUsers ?? false,
    },
  });

  return { created: true as const };
}

export async function updateManagedModel(input: UpdateManagedModelInput) {
  if (!process.env.DATABASE_URL) {
    throw new ServiceError("DATABASE_URL is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  if (!input.id) {
    throw new ServiceError("模型 ID 缺失。", 400, "MODEL_ID_REQUIRED");
  }

  const existing = await prisma.managedModel.findUnique({
    where: { id: input.id },
    select: { id: true },
  });

  if (!existing) {
    throw new ServiceError("模型不存在。", 404, "MODEL_NOT_FOUND");
  }

  if (input.enabled === false) {
    const referencedRoute = await getModelRouteReference(input.id);

    if (referencedRoute) {
      throw new ServiceError(
        `该模型仍被能力路由 ${referencedRoute.capabilityKey} 使用，不能停用。请先切换路由。`,
        409,
        "MODEL_IN_USE",
      );
    }
  }

  await prisma.managedModel.update({
    where: { id: input.id },
    data: {
      tier: input.tier,
      enabled: input.enabled,
      visibleToUsers: input.visibleToUsers,
    },
  });

  return { updated: true as const };
}

export async function deleteManagedModel(id: string) {
  if (!process.env.DATABASE_URL) {
    throw new ServiceError("DATABASE_URL is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const existing = await prisma.managedModel.findUnique({
    where: { id },
    select: { id: true },
  });

  if (!existing) {
    throw new ServiceError("模型不存在。", 404, "MODEL_NOT_FOUND");
  }

  const referencedRoute = await getModelRouteReference(id);

  if (referencedRoute) {
    throw new ServiceError(
      `该模型仍被能力路由 ${referencedRoute.capabilityKey} 使用，不能删除。请先切换路由。`,
      409,
      "MODEL_IN_USE",
    );
  }

  await prisma.managedModel.delete({
    where: {
      id,
    },
  });

  return { deleted: true as const };
}
