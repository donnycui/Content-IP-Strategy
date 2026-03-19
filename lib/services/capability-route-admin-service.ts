import { ModelCapabilityKey } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/services/service-error";

type UpsertCapabilityRouteInput = {
  capabilityKey?: ModelCapabilityKey;
  defaultModelId?: string;
  fallbackModelId?: string | null;
  allowFallback?: boolean;
  allowUserOverride?: boolean;
  notes?: string;
};

export async function upsertCapabilityRoute(input: UpsertCapabilityRouteInput) {
  if (!process.env.DATABASE_URL) {
    throw new ServiceError("DATABASE_URL is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  if (!input.capabilityKey || !input.defaultModelId) {
    throw new ServiceError("请至少选择能力和默认模型。", 400, "CAPABILITY_ROUTE_FIELDS_REQUIRED");
  }

  const defaultModel = await prisma.managedModel.findUnique({
    where: { id: input.defaultModelId },
    select: { id: true },
  });

  if (!defaultModel) {
    throw new ServiceError("默认模型不存在。", 404, "DEFAULT_MODEL_NOT_FOUND");
  }

  if (input.fallbackModelId) {
    const fallbackModel = await prisma.managedModel.findUnique({
      where: { id: input.fallbackModelId },
      select: { id: true },
    });

    if (!fallbackModel) {
      throw new ServiceError("备用模型不存在。", 404, "FALLBACK_MODEL_NOT_FOUND");
    }
  }

  await prisma.capabilityRoute.upsert({
    where: {
      capabilityKey: input.capabilityKey,
    },
    update: {
      defaultModelId: input.defaultModelId,
      fallbackModelId: input.fallbackModelId || null,
      allowFallback: input.allowFallback ?? false,
      allowUserOverride: input.allowUserOverride ?? false,
      notes: input.notes?.trim() || null,
    },
    create: {
      capabilityKey: input.capabilityKey,
      defaultModelId: input.defaultModelId,
      fallbackModelId: input.fallbackModelId || null,
      allowFallback: input.allowFallback ?? false,
      allowUserOverride: input.allowUserOverride ?? false,
      notes: input.notes?.trim() || null,
    },
  });

  return { updated: true as const };
}
