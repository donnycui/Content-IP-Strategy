import { prisma } from "@/lib/prisma";
import { getMotherThemeLabel, getSourceNameLabel, getTopicTagLabel } from "@/lib/display";
import { mockResearchCard, mockSignals, type SignalRow } from "@/lib/mock-data";
import { observationClusterLabels } from "@/lib/observation-clusters";

type SignalRecord = SignalRow & {
  clusterId?: string;
  reasoningDetail?: string | null;
  modelName?: string | null;
  latestReview?: {
    id: string;
    reviewStatus: "PENDING" | "KEPT" | "REJECTED" | "DEFERRED";
    adjustedImportanceScore?: number | null;
    adjustedViewpointScore?: number | null;
    adjustedConsensusStrength?: number | null;
    adjustedCompanyRoutineScore?: number | null;
    adjustedPriorityRecommendation?: "PRIORITIZE" | "WATCH" | "DEPRIORITIZE" | null;
    reasoningAcceptance?: "ACCEPTED" | "PARTIAL" | "REJECTED" | null;
    reviewNote?: string | null;
    myAngle?: string | null;
  };
};

export async function getSignals(): Promise<SignalRecord[]> {
  if (!process.env.DATABASE_URL) {
    return mockSignals;
  }

  try {
    const signals = await prisma.signal.findMany({
      include: {
        source: true,
        tags: true,
        scores: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        reviews: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
        clusterItems: {
          include: {
            cluster: true,
          },
          take: 1,
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 50,
    });

    return signals.map((signal) => {
      const latestScore = signal.scores[0];
      const latestReview = signal.reviews[0];
      const firstCluster = signal.clusterItems[0]?.cluster;

      return {
        id: signal.id,
        title: signal.title,
        source: getSourceNameLabel(signal.source.name),
        publishedAt: signal.publishedAt?.toISOString() ?? signal.ingestedAt.toISOString(),
        topicTags: signal.tags.filter((tag) => tag.tagType === "TOPIC").map((tag) => getTopicTagLabel(tag.tag)),
        motherTheme: getMotherThemeLabel(signal.tags.find((tag) => tag.tagType === "MOTHER_THEME")?.tag)
          ?? firstCluster?.clusterTitle
          ?? "未映射",
        primaryObservationCluster: latestScore?.primaryObservationCluster
          ? observationClusterLabels[latestScore.primaryObservationCluster]
          : "旧分发模式失效",
        secondaryObservationCluster: latestScore?.secondaryObservationCluster
          ? observationClusterLabels[latestScore.secondaryObservationCluster]
          : null,
        importanceScore: latestScore?.importanceScore ?? 0,
        viewpointScore: latestScore?.viewpointScore ?? 0,
        consensusStrength: latestScore?.consensusStrength ?? 0,
        companyRoutineScore: latestScore?.companyRoutineScore ?? 0,
        priorityRecommendation: latestScore?.priorityRecommendation ?? "WATCH",
        reasoningSummary: latestScore?.reasoningSummary ?? signal.summary ?? "暂时还没有 AI 理由。",
        reasoningDetail: latestScore?.reasoningDetail ?? null,
        modelName: latestScore?.modelName ?? null,
        status: signal.status,
        clusterId: firstCluster?.id,
        latestReview: latestReview
          ? {
              id: latestReview.id,
              reviewStatus: latestReview.reviewStatus,
              adjustedImportanceScore: latestReview.adjustedImportanceScore,
              adjustedViewpointScore: latestReview.adjustedViewpointScore,
              adjustedConsensusStrength: latestReview.adjustedConsensusStrength,
              adjustedCompanyRoutineScore: latestReview.adjustedCompanyRoutineScore,
              adjustedPriorityRecommendation: latestReview.adjustedPriorityRecommendation,
              reasoningAcceptance: latestReview.reasoningAcceptance,
              reviewNote: latestReview.reviewNote,
              myAngle: latestReview.myAngle,
            }
          : undefined,
      };
    });
  } catch {
    return [];
  }
}

export async function getSignalById(id: string): Promise<SignalRecord | null> {
  const signals = await getSignals();
  return signals.find((signal) => signal.id === id) ?? null;
}

export async function getResearchCardPreview() {
  if (!process.env.DATABASE_URL) {
    return mockResearchCard;
  }

  try {
    const card = await prisma.researchCard.findFirst({
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!card) {
      return mockResearchCard;
    }

    return {
      id: card.id,
      title: card.title,
      eventDefinition: card.eventDefinition,
      mainstreamNarrative: card.mainstreamNarrative,
      ignoredVariables: card.ignoredVariables,
      historicalAnalogy: card.historicalAnalogy,
      threeMonthProjection: card.threeMonthProjection,
      oneYearProjection: card.oneYearProjection,
      winnersLosers: card.winnersLosers,
      positioningJudgment: card.positioningJudgment,
    };
  } catch {
    return mockResearchCard;
  }
}

export async function getResearchCardById(id: string) {
  if (!process.env.DATABASE_URL) {
    return {
      id,
      ...mockResearchCard,
    };
  }

  try {
    const card = await prisma.researchCard.findUnique({
      where: {
        id,
      },
      include: {
        cluster: {
          include: {
            items: {
              include: {
                signal: {
                  include: {
                    source: true,
                    scores: {
                      orderBy: {
                        createdAt: "desc",
                      },
                      take: 1,
                    },
                  },
                },
              },
              take: 5,
            },
          },
        },
      },
    });

    if (!card) {
      return null;
    }

    return {
      id: card.id,
      title: card.title,
      eventDefinition: card.eventDefinition,
      mainstreamNarrative: card.mainstreamNarrative,
      ignoredVariables: card.ignoredVariables,
      historicalAnalogy: card.historicalAnalogy,
      threeMonthProjection: card.threeMonthProjection,
      oneYearProjection: card.oneYearProjection,
      winnersLosers: card.winnersLosers,
      positioningJudgment: card.positioningJudgment,
      clusterTitle: card.cluster.clusterTitle,
      clusterSummary: card.cluster.clusterSummary,
      signals: card.cluster.items.map((item) => ({
        id: item.signal.id,
        title: item.signal.title,
        source: item.signal.source.name,
        reasoningSummary: item.signal.scores[0]?.reasoningSummary ?? item.signal.summary ?? "",
        importanceScore: item.signal.scores[0]?.importanceScore ?? 0,
      })),
    };
  } catch {
    return null;
  }
}

export async function getDraftsByResearchCardId(researchCardId: string) {
  if (!process.env.DATABASE_URL) {
    return [
      {
        id: `${researchCardId}-article`,
        platform: "WECHAT_ARTICLE",
        title: mockResearchCard.title,
        content:
          "This signal is not really about near-term demand. It is about where bargaining power is consolidating. Once infrastructure becomes the scarce layer, application narratives stop being the main story and control over bottlenecks becomes the real pricing engine.",
      },
      {
        id: `${researchCardId}-video`,
        platform: "WECHAT_VIDEO",
        title: mockResearchCard.title,
        content:
          "Most people are reading this as a product news story. I think that misses the point. What is actually changing is the control layer of the industry, and that tells you where long-cycle leverage is being rebuilt.",
      },
      {
        id: `${researchCardId}-short`,
        platform: "SHORT_POST",
        title: mockResearchCard.title,
        content:
          "This is not an AI product signal. It is an infrastructure power signal. Watch who controls the bottleneck, because that is where pricing and strategic leverage will accumulate.",
      },
    ];
  }

  try {
    return await prisma.contentDraft.findMany({
      where: {
        researchCardId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  } catch {
    return [];
  }
}

export async function getDraftSupportContext(researchCardId: string) {
  if (!process.env.DATABASE_URL) {
    return {
      clusterTitle: "AI 基础设施权力集中",
      clusterSummary: "多条支撑信号正在同时说明：基础设施层的权力正在加速集中。",
      supportingSignals: [
        {
          id: "signal-ai-capex",
          title: "Cloud capex acceleration suggests AI infrastructure is becoming the new power bottleneck",
          source: "Financial Times",
          reasoningSummary: "This is not a product story. It is a power concentration story hidden inside infrastructure spending.",
          importanceScore: 4.8,
        },
      ],
    };
  }

  try {
    const card = await prisma.researchCard.findUnique({
      where: {
        id: researchCardId,
      },
      include: {
        cluster: {
          include: {
            items: {
              include: {
                signal: {
                  include: {
                    source: true,
                    scores: {
                      orderBy: {
                        createdAt: "desc",
                      },
                      take: 1,
                    },
                  },
                },
              },
              take: 3,
            },
          },
        },
      },
    });

    if (!card) {
      return null;
    }

    return {
      clusterTitle: card.cluster.clusterTitle,
      clusterSummary: card.cluster.clusterSummary,
      supportingSignals: card.cluster.items.map((item) => ({
        id: item.signal.id,
        title: item.signal.title,
        source: item.signal.source.name,
        reasoningSummary: item.signal.scores[0]?.reasoningSummary ?? item.signal.summary ?? "",
        importanceScore: item.signal.scores[0]?.importanceScore ?? 0,
      })),
    };
  } catch {
    return null;
  }
}

export async function getReviewCalibrationRows() {
  if (!process.env.DATABASE_URL) {
    return [];
  }

  try {
    const reviews = await prisma.humanReview.findMany({
      where: {
        signalId: {
          not: null,
        },
      },
      include: {
        signal: {
          include: {
            source: true,
            scores: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    return reviews
      .filter((review) => review.signal && review.signal.scores[0])
      .map((review) => {
        const score = review.signal!.scores[0]!;
        const reviewText = `${review.reviewNote ?? ""} ${review.myAngle ?? ""}`.toLowerCase();
        const deltaImportance =
          review.adjustedImportanceScore == null ? null : review.adjustedImportanceScore - score.importanceScore;
        const deltaViewpoint =
          review.adjustedViewpointScore == null ? null : review.adjustedViewpointScore - score.viewpointScore;
        const deltaConsensus =
          review.adjustedConsensusStrength == null ? null : review.adjustedConsensusStrength - (score.consensusStrength ?? 0);
        const deltaRoutine =
          review.adjustedCompanyRoutineScore == null
            ? null
            : review.adjustedCompanyRoutineScore - (score.companyRoutineScore ?? 0);

        const failureReasons = [
          (deltaImportance != null && deltaImportance <= -1.5) || reviewText.includes("thin") || reviewText.includes("low-substance")
            ? "Thin signal"
            : null,
          (deltaRoutine != null && deltaRoutine >= 1) ||
          reviewText.includes("routine") ||
          reviewText.includes("daily news") ||
          reviewText.includes("company news")
            ? "Routine news misread"
            : null,
          (deltaConsensus != null && deltaConsensus >= 1) ||
          reviewText.includes("consensus") ||
          reviewText.includes("priced in") ||
          reviewText.includes("already known")
            ? "Consensus missed"
            : null,
          (deltaImportance != null && deltaImportance <= -1 && reviewText.includes("single company")) ||
          reviewText.includes("spillover") ||
          reviewText.includes("industry-wide")
            ? "Weak spillover"
            : null,
          (deltaViewpoint != null && deltaViewpoint <= -1) || reviewText.includes("angle") || reviewText.includes("not a lead")
            ? "Angle inflation"
            : null,
          reviewText.includes("theme") || reviewText.includes("mother theme") || reviewText.includes("misfit")
            ? "Theme mismatch"
            : null,
        ].filter((reason): reason is string => Boolean(reason));

        return {
          id: review.id,
          createdAt: review.createdAt.toISOString(),
          signalId: review.signal!.id,
          title: review.signal!.title,
          source: review.signal!.source.name,
          reviewStatus: review.reviewStatus,
          reasoningAcceptance: review.reasoningAcceptance,
          reviewNote: review.reviewNote,
          myAngle: review.myAngle,
          ai: {
            importance: score.importanceScore,
            viewpoint: score.viewpointScore,
            consensus: score.consensusStrength,
            routine: score.companyRoutineScore,
            priority: score.priorityRecommendation,
            modelName: score.modelName,
          },
          human: {
            importance: review.adjustedImportanceScore,
            viewpoint: review.adjustedViewpointScore,
            consensus: review.adjustedConsensusStrength,
            routine: review.adjustedCompanyRoutineScore,
            priority: review.adjustedPriorityRecommendation,
          },
          delta: {
            importance: deltaImportance,
            viewpoint: deltaViewpoint,
            consensus: deltaConsensus,
            routine: deltaRoutine,
          },
          failureReasons,
        };
      });
  } catch {
    return [];
  }
}

export async function getReviewCalibrationSummary() {
  const rows = await getReviewCalibrationRows();
  const threshold = 1;

  const importanceOverScored = rows.filter((row) => (row.delta.importance ?? 0) <= -threshold).length;
  const viewpointOverScored = rows.filter((row) => (row.delta.viewpoint ?? 0) <= -threshold).length;
  const consensusUnderDetected = rows.filter((row) => (row.delta.consensus ?? 0) >= threshold).length;
  const routineUnderDetected = rows.filter((row) => (row.delta.routine ?? 0) >= threshold).length;
  const priorityFalsePositives = rows.filter((row) => {
    if (!row.human.priority) {
      return false;
    }

    return (
      (row.ai.priority === "PRIORITIZE" && row.human.priority !== "PRIORITIZE") ||
      (row.ai.priority === "WATCH" && row.human.priority === "DEPRIORITIZE")
    );
  }).length;

  const mostCommonFailure = [
    { label: "重要性高估", count: importanceOverScored },
    { label: "观点潜力高估", count: viewpointOverScored },
    { label: "日常噪音识别不足", count: routineUnderDetected },
    { label: "共识强度识别不足", count: consensusUnderDetected },
    { label: "优先级误推", count: priorityFalsePositives },
  ].sort((left, right) => right.count - left.count)[0];

  const failureReasonCounts = rows
    .flatMap((row) => row.failureReasons)
    .reduce<Record<string, number>>((accumulator, reason) => {
      accumulator[reason] = (accumulator[reason] ?? 0) + 1;
      return accumulator;
    }, {});

  const topFailureReasons = Object.entries(failureReasonCounts)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }));

  const delayPrioritizeGuidance = [
    routineUnderDetected > 0
      ? "当信号仍然像公司日常新闻、行业外溢又不明确时，不要提前给出“优先推进”。"
      : null,
    consensusUnderDetected > 0
      ? "当主流叙事已经明显收敛时，不要轻易给出“优先推进”；除非仍然存在清晰的差异化角度。"
      : null,
    importanceOverScored > 0
      ? "当信息过薄、信息量不足时，不要提前给出“优先推进”；缺少上下文时应默认保守。"
      : null,
    viewpointOverScored > 0
      ? "当角度看起来尖锐，但结构变化仍然偏弱或未被证实时，不要提前给出“优先推进”。"
      : null,
    priorityFalsePositives > 0
      ? "只有在结构重要性和非共识观点同时成立时，才应该给出“优先推进”。"
      : null,
  ].filter((item): item is string => Boolean(item));

  return {
    sampleSize: rows.length,
    threshold,
    importanceOverScored,
    viewpointOverScored,
    consensusUnderDetected,
    routineUnderDetected,
    priorityFalsePositives,
    mostCommonFailure:
      mostCommonFailure && mostCommonFailure.count > 0
        ? `当前最常见的失败模式是：${mostCommonFailure.label}。`
        : "暂时还没有明显占主导的失败模式，需要更多人工复核样本。",
    topFailureReasons,
    delayPrioritizeGuidance:
      delayPrioritizeGuidance.length > 0
        ? delayPrioritizeGuidance
        : ["暂时还没有足够的 prompt 调整建议，需要更多人工复核样本后再修改 PRIORITIZE 规则。"],
  };
}

export async function getFalseNegativeCalibration() {
  if (!process.env.DATABASE_URL) {
    return {
      watchCandidates: [],
      prioritizeCandidates: [],
    };
  }

  try {
    const signals = await prisma.signal.findMany({
      include: {
        source: true,
        scores: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        publishedAt: "desc",
      },
      take: 50,
    });

    const latestRows = signals
      .filter((signal) => signal.scores[0])
      .map((signal) => {
        const score = signal.scores[0]!;

        return {
          signalId: signal.id,
          title: signal.title,
          source: signal.source.name,
          priorityRecommendation: score.priorityRecommendation,
          importanceScore: score.importanceScore,
          viewpointScore: score.viewpointScore,
          consensusStrength: score.consensusStrength ?? 0,
          companyRoutineScore: score.companyRoutineScore ?? 0,
          reasoningSummary: score.reasoningSummary,
        };
      });

    const watchCandidates = latestRows.filter(
      (row) =>
        row.priorityRecommendation === "DEPRIORITIZE" &&
        row.importanceScore >= 3.6 &&
        row.companyRoutineScore <= 2.8 &&
        (row.viewpointScore >= 3.4 || row.consensusStrength <= 2.5),
    );

    const prioritizeCandidates = latestRows.filter(
      (row) =>
        row.priorityRecommendation === "WATCH" &&
        row.importanceScore >= 4.4 &&
        row.viewpointScore >= 4 &&
        row.consensusStrength <= 2.6 &&
        row.companyRoutineScore <= 2.1,
    );

    return {
      watchCandidates,
      prioritizeCandidates,
    };
  } catch {
    return {
      watchCandidates: [],
      prioritizeCandidates: [],
    };
  }
}
