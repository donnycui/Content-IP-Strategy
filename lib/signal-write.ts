import { prisma } from "@/lib/prisma";
import { scoreSignal } from "@/lib/signal-scoring";

type CreateSignalInput = {
  sourceId: string;
  sourceName?: string | null;
  title: string;
  url: string;
  author?: string | null;
  language?: string | null;
  publishedAt?: Date | null;
  rawContent?: string | null;
  summary?: string | null;
  topicTags?: string[];
  motherTheme?: string | null;
};

export async function createSignalWithScoring(input: CreateSignalInput) {
  const scoring = await scoreSignal({
    title: input.title,
    summary: input.summary,
    sourceName: input.sourceName,
    topicTags: input.topicTags,
    motherTheme: input.motherTheme,
  });

  const signal = await prisma.signal.create({
    data: {
      sourceId: input.sourceId,
      title: input.title,
      url: input.url,
      author: input.author ?? null,
      language: input.language ?? null,
      publishedAt: input.publishedAt ?? null,
      rawContent: input.rawContent ?? null,
      summary: input.summary ?? null,
      tags: {
        create: [
          ...scoring.topicTags.map((tag) => ({
            tag,
            tagType: "TOPIC" as const,
          })),
          {
            tag: scoring.motherTheme,
            tagType: "MOTHER_THEME" as const,
          },
        ],
      },
      scores: {
        create: {
          importanceScore: scoring.importanceScore,
          viewpointScore: scoring.viewpointScore,
          primaryObservationCluster: scoring.primaryObservationCluster,
          secondaryObservationCluster: scoring.secondaryObservationCluster,
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
      },
    },
    include: {
      source: true,
      tags: true,
      scores: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });

  return signal;
}
