import { prisma } from "@/lib/prisma";
import { getDirections } from "@/lib/direction-data";
import { generateDirectionsForProfileWithTier } from "@/lib/direction-generation";
import { assertDatabaseConfigured, requireCreatorProfile } from "@/lib/services/profile-service";

export async function getActiveDirectionsService(creatorProfileId?: string) {
  return getDirections(creatorProfileId);
}

export async function regenerateDirections(creatorProfileId?: string) {
  return regenerateDirectionsWithTier(creatorProfileId);
}

export async function regenerateDirectionsWithTier(
  creatorProfileId?: string,
  requestedTier?: "FAST" | "BALANCED" | "DEEP",
) {
  assertDatabaseConfigured();

  const profile = await requireCreatorProfile(creatorProfileId);
  const drafts = await generateDirectionsForProfileWithTier(profile, requestedTier);

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

export async function createDirectionFromEvolutionDecision(input: {
  title: string;
  whyNow: string;
  fitReason: string;
  priority?: "PRIMARY" | "SECONDARY" | "WATCH";
}) {
  assertDatabaseConfigured();

  const profile = await requireCreatorProfile();
  const normalizedTitle = input.title.trim();

  if (!normalizedTitle) {
    throw new Error("Direction title is required.");
  }

  const existing = await prisma.direction.findFirst({
    where: {
      creatorProfileId: profile.id,
      title: normalizedTitle,
      status: "ACTIVE",
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    return { created: false, directionId: existing.id };
  }

  const direction = await prisma.direction.create({
    data: {
      creatorProfileId: profile.id,
      title: normalizedTitle,
      whyNow: input.whyNow,
      fitReason: input.fitReason,
      priority: input.priority ?? "SECONDARY",
      status: "ACTIVE",
      timeHorizon: "未来 2-4 周",
    },
    select: {
      id: true,
    },
  });

  return { created: true, directionId: direction.id };
}
