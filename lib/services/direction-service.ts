import { prisma } from "@/lib/prisma";
import { getDirections } from "@/lib/direction-data";
import { generateDirectionsForProfile } from "@/lib/direction-generation";
import { assertDatabaseConfigured, requireCreatorProfile } from "@/lib/services/profile-service";

export async function getActiveDirectionsService(creatorProfileId?: string) {
  return getDirections(creatorProfileId);
}

export async function regenerateDirections(creatorProfileId?: string) {
  assertDatabaseConfigured();

  const profile = await requireCreatorProfile(creatorProfileId);
  const drafts = await generateDirectionsForProfile(profile);

  const createdCount = await prisma.$transaction(async (tx) => {
    await tx.direction.updateMany({
      where: {
        creatorProfileId: profile.id,
        status: "ACTIVE",
      },
      data: {
        status: "ARCHIVED",
      },
    });

    const created = await Promise.all(
      drafts.map((draft) =>
        tx.direction.create({
          data: {
            creatorProfileId: profile.id,
            title: draft.title,
            whyNow: draft.whyNow,
            fitReason: draft.fitReason,
            priority: draft.priority,
            status: "ACTIVE",
            timeHorizon: draft.timeHorizon,
          },
        }),
      ),
    );

    return created.length;
  });

  return { createdCount };
}
