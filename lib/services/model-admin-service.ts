import { ModelTier } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ServiceError } from "@/lib/services/service-error";

type UpdateManagedModelInput = {
  id?: string;
  tier?: ModelTier;
  enabled?: boolean;
  visibleToUsers?: boolean;
};

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
