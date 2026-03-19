import { ModelCapabilityKey, ModelTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/services/service-error";

type UpsertPlanModelAccessInput = {
  planKey?: string;
  capabilityKey?: ModelCapabilityKey | null;
  allowedTiers?: ModelTier[];
  canSelectModel?: boolean;
  canUsePremiumReasoning?: boolean;
};

export async function upsertPlanModelAccess(input: UpsertPlanModelAccessInput) {
  if (!process.env.DATABASE_URL) {
    throw new ServiceError("DATABASE_URL is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const planKey = input.planKey?.trim().toUpperCase();
  const allowedTiers = [...new Set(input.allowedTiers ?? [])];

  if (!planKey) {
    throw new ServiceError("请选择套餐档位。", 400, "PLAN_KEY_REQUIRED");
  }

  if (!allowedTiers.length) {
    throw new ServiceError("至少选择一个允许使用的模型档位。", 400, "ALLOWED_TIERS_REQUIRED");
  }

  await prisma.$transaction(async (tx) => {
    await tx.planModelAccess.deleteMany({
      where: {
        planKey,
        capabilityKey: input.capabilityKey ?? null,
      },
    });

    await tx.planModelAccess.createMany({
      data: allowedTiers.map((allowedTier) => ({
        planKey,
        capabilityKey: input.capabilityKey ?? null,
        allowedTier,
        canSelectModel: input.canSelectModel ?? false,
        canUsePremiumReasoning: input.canUsePremiumReasoning ?? false,
      })),
    });
  });

  return { updated: true as const };
}
