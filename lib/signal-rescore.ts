import { prisma } from "@/lib/prisma";
import { scoreSignal } from "@/lib/signal-scoring";

export async function rescoreSignals(limit?: number) {
  const signals = await prisma.signal.findMany({
    include: {
      source: true,
      tags: true,
    },
    orderBy: {
      publishedAt: "desc",
    },
    take: limit,
  });

  let rescored = 0;

  for (const signal of signals) {
    const scoring = await scoreSignal({
      title: signal.title,
      summary: signal.summary,
      sourceName: signal.source.name,
      topicTags: signal.tags.filter((tag) => tag.tagType === "TOPIC").map((tag) => tag.tag),
      motherTheme: signal.tags.find((tag) => tag.tagType === "MOTHER_THEME")?.tag,
    });

    await prisma.$transaction(async (tx) => {
      await tx.signalScore.create({
        data: {
          signalId: signal.id,
          importanceScore: scoring.importanceScore,
          viewpointScore: scoring.viewpointScore,
          consensusStrength: scoring.consensusStrength,
          companyRoutineScore: scoring.companyRoutineScore,
          structuralScore: scoring.structuralScore,
          impactScore: scoring.impactScore,
          redistributionScore: scoring.redistributionScore,
          durabilityScore: scoring.durabilityScore,
          confidenceScore: scoring.confidenceScore,
          priorityRecommendation: scoring.priorityRecommendation,
          reasoningSummary: scoring.reasoningSummary,
          reasoningDetail: scoring.reasoningDetail,
          modelName: scoring.modelName,
        },
      });

      await tx.signalTag.deleteMany({
        where: {
          signalId: signal.id,
          tagType: "MOTHER_THEME",
        },
      });

      await tx.signalTag.create({
        data: {
          signalId: signal.id,
          tag: scoring.motherTheme,
          tagType: "MOTHER_THEME",
        },
      });

      const existingTopicTags = new Set(signal.tags.filter((tag) => tag.tagType === "TOPIC").map((tag) => tag.tag));
      const missingTopicTags = scoring.topicTags.filter((tag) => !existingTopicTags.has(tag));

      if (missingTopicTags.length) {
        await tx.signalTag.createMany({
          data: missingTopicTags.map((tag) => ({
            signalId: signal.id,
            tag,
            tagType: "TOPIC",
          })),
          skipDuplicates: true,
        });
      }
    });

    rescored += 1;
  }

  const distribution = await prisma.signalScore.groupBy({
    by: ["priorityRecommendation"],
    _count: {
      _all: true,
    },
  });

  return {
    rescored,
    distribution: distribution.map((item) => ({
      priorityRecommendation: item.priorityRecommendation,
      count: item._count._all,
    })),
  };
}
