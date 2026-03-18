import { prisma } from "@/lib/prisma";
import { getDirections } from "@/lib/direction-data";
import { getTopics } from "@/lib/topic-data";
import { generateTopicsForProfile } from "@/lib/topic-generation";
import { assertDatabaseConfigured, requireCreatorProfile } from "@/lib/services/profile-service";
import { ServiceError } from "@/lib/services/service-error";

export async function getTopicsService(creatorProfileId?: string) {
  return getTopics(creatorProfileId);
}

export async function regenerateTopics(creatorProfileId?: string) {
  assertDatabaseConfigured();

  const profile = await requireCreatorProfile(creatorProfileId);
  const persistedDirections = await prisma.direction.findMany({
    where: {
      creatorProfileId: profile.id,
      status: "ACTIVE",
    },
    orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
  });

  if (!persistedDirections.length) {
    throw new ServiceError("请先在方向台生成并确认方向，再刷新主题线。", 400, "DIRECTION_REQUIRED");
  }

  const directionRows = (await getDirections(profile.id)).filter((direction) =>
    persistedDirections.some((item) => item.id === direction.id),
  );
  const drafts = await generateTopicsForProfile(profile, directionRows);

  const createdCount = await prisma.$transaction(async (tx) => {
    await tx.topic.updateMany({
      where: {
        creatorProfileId: profile.id,
        status: {
          in: ["ACTIVE", "WATCHING"],
        },
      },
      data: {
        status: "ARCHIVED",
      },
    });

    const created = await Promise.all(
      drafts.map((draft) =>
        tx.topic.create({
          data: {
            creatorProfileId: profile.id,
            directionId: draft.directionId ?? null,
            title: draft.title,
            summary: draft.summary,
            status: draft.status,
            heatScore: draft.heatScore,
            signalCount: draft.signalCount,
            primaryObservationCluster: draft.primaryObservationCluster,
            secondaryObservationCluster: draft.secondaryObservationCluster ?? null,
          },
        }),
      ),
    );

    return created.length;
  });

  return { createdCount };
}
