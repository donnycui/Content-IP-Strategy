import type { TopicCandidateStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getTopicCandidates } from "@/lib/topic-candidate-data";
import { generateTopicCandidatesForProfileWithTier } from "@/lib/topic-candidate-generation";
import { assertDatabaseConfigured, requireCreatorProfile } from "@/lib/services/profile-service";
import { ServiceError } from "@/lib/services/service-error";

export async function getTopicCandidatesService(creatorProfileId?: string) {
  return getTopicCandidates(creatorProfileId);
}

export async function regenerateTopicCandidates(creatorProfileId?: string) {
  return regenerateTopicCandidatesWithTier(creatorProfileId);
}

export async function regenerateTopicCandidatesWithTier(
  creatorProfileId?: string,
  requestedTier?: "FAST" | "BALANCED" | "DEEP",
) {
  assertDatabaseConfigured();

  const profile = await requireCreatorProfile(creatorProfileId);
  const topics = await prisma.topic.findMany({
    where: {
      creatorProfileId: profile.id,
      status: {
        in: ["ACTIVE", "WATCHING"],
      },
    },
    take: 1,
  });

  if (!topics.length) {
    throw new ServiceError("请先在主题台生成主题线，再刷新选题建议。", 400, "TOPIC_REQUIRED");
  }

  const drafts = await generateTopicCandidatesForProfileWithTier(profile, requestedTier);

  const createdCount = await prisma.$transaction(async (tx) => {
    await tx.topicCandidate.deleteMany({
      where: {
        topic: {
          creatorProfileId: profile.id,
        },
        status: "NEW",
      },
    });

    const created = await Promise.all(
      drafts.map((draft) =>
        tx.topicCandidate.create({
          data: {
            topicId: draft.topicId,
            anchorSignalId: draft.anchorSignalId ?? null,
            title: draft.title,
            whyNow: draft.whyNow,
            fitReason: draft.fitReason,
            formatRecommendation: draft.formatRecommendation,
            priority: draft.priority,
            status: draft.status,
          },
        }),
      ),
    );

    return created.length;
  });

  return { createdCount };
}

export async function updateTopicCandidateStatus(id: string, status?: TopicCandidateStatus) {
  assertDatabaseConfigured();

  if (!status) {
    throw new ServiceError("必须提供新的选题状态。", 400, "TOPIC_CANDIDATE_STATUS_REQUIRED");
  }

  const existing = await prisma.topicCandidate.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
    },
  });

  if (!existing) {
    throw new ServiceError("选题建议不存在或已失效。", 404, "TOPIC_CANDIDATE_NOT_FOUND");
  }

  await prisma.topicCandidate.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });

  return { ok: true };
}
