import type {
  EvolutionDecisionPayload,
  EvolutionDecisionStatusRequest,
  EvolutionTargetTypeValue,
  ReviewSnapshotPayload,
  SharedMemoryCategoryValue,
} from "@/lib/domain/contracts";
import { prisma } from "@/lib/prisma";
import { createDirectionFromEvolutionDecision } from "@/lib/services/direction-service";
import { getContentProjectDetail } from "@/lib/services/content-project-service";
import { upsertPlatformStrategyMemo } from "@/lib/services/platform-strategy-service";
import { appendProfileEvolutionNote } from "@/lib/services/profile-service";
import { getReviewDashboard } from "@/lib/services/review-snapshot-service";
import { ensureActiveCenterWorkspace } from "@/lib/services/center-workspace-service";
import { upsertActiveSharedMemoryRecord } from "@/lib/services/shared-memory-service";
import { applyStyleEvolutionDecision } from "@/lib/services/style-skill-service";

function mapEvolutionDecision(record: {
  id: string;
  workspaceId: string;
  reviewSnapshotId: string | null;
  targetType: EvolutionTargetTypeValue;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  headline: string;
  rationale: string;
  suggestedAction: string;
  actionPayloadJson: Record<string, string | number | boolean | null> | null;
  updatedAt: Date;
}): EvolutionDecisionPayload {
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    reviewSnapshotId: record.reviewSnapshotId,
    targetType: record.targetType,
    status: record.status,
    headline: record.headline,
    rationale: record.rationale,
    suggestedAction: record.suggestedAction,
    actionPayload: record.actionPayloadJson,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function buildMockDecision(input: {
  workspaceId: string;
  reviewSnapshotId?: string | null;
  targetType: EvolutionTargetTypeValue;
  headline: string;
  rationale: string;
  suggestedAction: string;
  actionPayload?: Record<string, string | number | boolean | null>;
}): EvolutionDecisionPayload {
  return {
    id: `evolution-decision-${Date.now()}`,
    workspaceId: input.workspaceId,
    reviewSnapshotId: input.reviewSnapshotId ?? null,
    targetType: input.targetType,
    status: "PENDING",
    headline: input.headline,
    rationale: input.rationale,
    suggestedAction: input.suggestedAction,
    actionPayload: input.actionPayload ?? null,
    updatedAt: new Date().toISOString(),
  };
}

function deriveDecisionDrafts(review: ReviewSnapshotPayload): Array<{
  targetType: EvolutionTargetTypeValue;
  headline: string;
  rationale: string;
  suggestedAction: string;
  actionPayload?: Record<string, string | number | boolean | null>;
}> {
  const decisions: Array<{
    targetType: EvolutionTargetTypeValue;
    headline: string;
    rationale: string;
    suggestedAction: string;
    actionPayload?: Record<string, string | number | boolean | null>;
  }> = [];

  const views = review.views ?? 0;
  const likes = review.likes ?? 0;
  const inquiries = review.inquiries ?? 0;
  const leads = review.leads ?? 0;
  const saves = review.saves ?? 0;

  if (views > 0 && likes / Math.max(views, 1) >= 0.06) {
    decisions.push({
      targetType: "STYLE",
      headline: `这条内容的表达方式值得保留并继续强化`,
      rationale: `当前互动比率较高（点赞 ${likes} / 浏览 ${views}），说明表达方式至少有一部分贴近了你的真实风格。`,
      suggestedAction: "把这条内容里最有效的表达方式抽成 style skill 更新项，并在后续内容里复用。",
      actionPayload: {
        kind: "STYLE_SKILL_APPEND",
        reviewSnapshotId: review.id,
      },
    });
  }

  if (inquiries > 0 || leads > 0) {
    decisions.push({
      targetType: "DIRECTION",
      headline: "这个方向不只是有流量，可能还有转化信号",
      rationale: `当前内容已经带来 ${inquiries} 次咨询、${leads} 条线索，说明它可能不只是一个可讲选题，而是一条更值得加权的方向。`,
      suggestedAction: "提高这类题型在方向层的权重，并观察是否应该扩成连续主题线。",
      actionPayload: {
        kind: "DIRECTION_FROM_PROJECT",
        projectId: review.projectId,
        priority: leads > 0 ? "PRIMARY" : "SECONDARY",
      },
    });
  }

  if (views > 0 && saves / Math.max(views, 1) < 0.01 && likes / Math.max(views, 1) < 0.02) {
    decisions.push({
      targetType: "PLATFORM_STRATEGY",
      headline: "这条内容的当前包装方式可能不适合这个平台",
      rationale: `当前浏览有 ${views}，但点赞和收藏偏低，说明选题可能还行，平台包装或切口不够强。`,
      suggestedAction: "保留题目本身，但尝试重新包装标题、开场结构和平台适配方式。",
      actionPayload: {
        kind: "PLATFORM_STRATEGY_NOTE",
        channelKey: review.channelKey,
      },
    });
  }

  if (review.reviewNote?.trim()) {
    decisions.push({
      targetType: "PROFILE",
      headline: "这条复盘里有值得写回画像的主观线索",
      rationale: "你在复盘备注里给出了人工判断，这类主观反馈通常比纯数据更能说明画像和内容边界是否需要更新。",
      suggestedAction: `检查这条备注是否应该更新到画像或内容边界：${review.reviewNote.trim()}`,
      actionPayload: {
        kind: "PROFILE_APPEND_BOUNDARY",
        note: review.reviewNote.trim(),
      },
    });
  }

  return decisions.slice(0, 3);
}

function categoryForDecision(targetType: EvolutionTargetTypeValue): SharedMemoryCategoryValue {
  if (targetType === "PROFILE") {
    return "PROFILE_EVOLUTION_NOTE";
  }

  if (targetType === "STYLE") {
    return "STYLE_EVOLUTION_NOTE";
  }

  if (targetType === "DIRECTION") {
    return "KEY_CONCLUSION";
  }

  return "REVIEW_TREND";
}

async function maybeApplyEvolutionDecisionWriteback(mapped: EvolutionDecisionPayload) {
  if (mapped.targetType === "PROFILE" && mapped.actionPayload?.kind === "PROFILE_APPEND_BOUNDARY") {
    const note = mapped.actionPayload.note;

    if (typeof note === "string" && note.trim()) {
      await appendProfileEvolutionNote(note);
    }
  }

  if (mapped.targetType === "STYLE") {
    await applyStyleEvolutionDecision({
      workspaceId: mapped.workspaceId,
      headline: mapped.headline,
      rationale: mapped.rationale,
      suggestedAction: mapped.suggestedAction,
    });
  }

  if (mapped.targetType === "DIRECTION" && mapped.actionPayload?.kind === "DIRECTION_FROM_PROJECT") {
    const projectId = mapped.actionPayload.projectId;
    const priority = mapped.actionPayload.priority;

    if (typeof projectId === "string" && projectId) {
      const project = await getContentProjectDetail(projectId);

      if (project) {
        await createDirectionFromEvolutionDecision({
          title: `沿着「${project.project.title}」扩成连续方向`,
          whyNow: mapped.rationale,
          fitReason: mapped.suggestedAction,
          priority: priority === "PRIMARY" || priority === "SECONDARY" || priority === "WATCH" ? priority : "SECONDARY",
        });
      }
    }
  }

  if (mapped.targetType === "PLATFORM_STRATEGY" && mapped.actionPayload?.kind === "PLATFORM_STRATEGY_NOTE") {
    const channelKey = mapped.actionPayload.channelKey;

    if (typeof channelKey === "string" && channelKey) {
      await upsertPlatformStrategyMemo({
        channelKey,
        headline: mapped.headline,
        summary: mapped.suggestedAction,
        detail: mapped.rationale,
        sourceRef: mapped.reviewSnapshotId ?? "evolution-decision",
      });
    }
  }
}

export async function generateEvolutionDecisions(): Promise<{ createdCount: number }> {
  const workspace = await ensureActiveCenterWorkspace();
  const reviewDashboard = await getReviewDashboard();
  const latestReviews = reviewDashboard.reviews.slice(0, 3);
  const drafts = latestReviews.flatMap(deriveDecisionDrafts);

  if (!drafts.length) {
    return { createdCount: 0 };
  }

  if (!process.env.DATABASE_URL) {
    return {
      createdCount: drafts.length,
    };
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      evolutionDecision?: {
        deleteMany: (args: unknown) => Promise<unknown>;
        create: (args: unknown) => Promise<unknown>;
      };
      $transaction: typeof prisma.$transaction;
    };

    await prismaClient.$transaction(async (tx) => {
      const inner = tx as typeof prisma & {
        evolutionDecision?: {
          deleteMany: (args: unknown) => Promise<unknown>;
          create: (args: unknown) => Promise<unknown>;
        };
      };

      await inner.evolutionDecision?.deleteMany({
        where: {
          workspaceId: workspace.id,
          status: "PENDING",
        },
      });

      for (const [index, draft] of drafts.entries()) {
        const review = latestReviews[index] ?? latestReviews[0] ?? null;

        await inner.evolutionDecision?.create({
          data: {
            workspaceId: workspace.id,
            reviewSnapshotId: review?.id ?? null,
            targetType: draft.targetType,
            headline: draft.headline,
            rationale: draft.rationale,
            suggestedAction: draft.suggestedAction,
            actionPayloadJson: draft.actionPayload ?? null,
          },
        });
      }
    });

    return {
      createdCount: drafts.length,
    };
  } catch {
    return {
      createdCount: drafts.length,
    };
  }
}

export async function getEvolutionDashboard(): Promise<{
  decisions: EvolutionDecisionPayload[];
  latestReviews: ReviewSnapshotPayload[];
}> {
  const workspace = await ensureActiveCenterWorkspace();
  const reviewDashboard = await getReviewDashboard();

  if (!process.env.DATABASE_URL) {
    return {
      decisions: [],
      latestReviews: reviewDashboard.reviews.slice(0, 4),
    };
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      evolutionDecision?: {
        findMany: (args: unknown) => Promise<unknown[]>;
      };
    };

    const decisions = await prismaClient.evolutionDecision?.findMany({
      where: {
        workspaceId: workspace.id,
      },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 8,
    });

    return {
      decisions: (decisions ?? []).map((item) => mapEvolutionDecision(item as Parameters<typeof mapEvolutionDecision>[0])),
      latestReviews: reviewDashboard.reviews.slice(0, 4),
    };
  } catch {
    return {
      decisions: [],
      latestReviews: reviewDashboard.reviews.slice(0, 4),
    };
  }
}

export async function updateEvolutionDecisionStatus(id: string, input: EvolutionDecisionStatusRequest) {
  const status = input.status;

  if (!status) {
    throw new Error("status is required.");
  }

  if (!process.env.DATABASE_URL) {
    return {
      updated: true,
    };
  }

  const prismaClient = prisma as typeof prisma & {
    evolutionDecision?: {
      findUnique: (args: unknown) => Promise<unknown>;
      update: (args: unknown) => Promise<unknown>;
    };
  };

  const decision = await prismaClient.evolutionDecision?.findUnique({
    where: {
      id,
    },
  });

  if (!decision) {
    throw new Error("Evolution decision not found.");
  }

  const mapped = mapEvolutionDecision(decision as Parameters<typeof mapEvolutionDecision>[0]);

  await prismaClient.evolutionDecision?.update({
    where: {
      id,
    },
    data: {
      status,
    },
  });

  if (status === "ACCEPTED") {
    await upsertActiveSharedMemoryRecord({
      workspaceId: mapped.workspaceId,
      category: categoryForDecision(mapped.targetType),
      title: mapped.headline,
      summary: mapped.suggestedAction,
      detail: mapped.rationale,
      agentKey: "EVOLUTION",
      sourceRef: mapped.reviewSnapshotId ?? "evolution-decision",
    });

    await maybeApplyEvolutionDecisionWriteback(mapped);
  }

  return {
    updated: true,
  };
}
