import type {
  ReviewDashboardPayload,
  ReviewSnapshotCreateRequest,
  ReviewSnapshotPayload,
} from "@/lib/domain/contracts";
import { prisma } from "@/lib/prisma";
import { getStyleContentDashboard } from "@/lib/services/content-project-service";
import { ensureActiveCenterWorkspace } from "@/lib/services/center-workspace-service";

function mapReviewSnapshot(record: {
  id: string;
  workspaceId: string;
  projectId: string;
  assetId: string | null;
  channelKey: string;
  views: number | null;
  likes: number | null;
  comments: number | null;
  shares: number | null;
  saves: number | null;
  inquiries: number | null;
  leads: number | null;
  conversions: number | null;
  reviewNote: string | null;
  updatedAt: Date;
}): ReviewSnapshotPayload {
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    projectId: record.projectId,
    assetId: record.assetId,
    channelKey: record.channelKey,
    views: record.views,
    likes: record.likes,
    comments: record.comments,
    shares: record.shares,
    saves: record.saves,
    inquiries: record.inquiries,
    leads: record.leads,
    conversions: record.conversions,
    reviewNote: record.reviewNote,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function buildMockReviewSnapshot(input: {
  workspaceId: string;
  projectId: string;
  assetId?: string | null;
  channelKey: string;
  views?: number | null;
  likes?: number | null;
  comments?: number | null;
  shares?: number | null;
  saves?: number | null;
  inquiries?: number | null;
  leads?: number | null;
  conversions?: number | null;
  reviewNote?: string | null;
}): ReviewSnapshotPayload {
  return {
    id: `review-snapshot-${Date.now()}`,
    workspaceId: input.workspaceId,
    projectId: input.projectId,
    assetId: input.assetId ?? null,
    channelKey: input.channelKey,
    views: input.views ?? null,
    likes: input.likes ?? null,
    comments: input.comments ?? null,
    shares: input.shares ?? null,
    saves: input.saves ?? null,
    inquiries: input.inquiries ?? null,
    leads: input.leads ?? null,
    conversions: input.conversions ?? null,
    reviewNote: input.reviewNote ?? null,
    updatedAt: new Date().toISOString(),
  };
}

export async function createReviewSnapshot(input: ReviewSnapshotCreateRequest): Promise<ReviewSnapshotPayload> {
  const workspace = await ensureActiveCenterWorkspace();

  if (!input.projectId || !input.channelKey) {
    throw new Error("projectId and channelKey are required.");
  }

  const fallback = buildMockReviewSnapshot({
    workspaceId: workspace.id,
    projectId: input.projectId,
    assetId: input.assetId ?? null,
    channelKey: input.channelKey,
    views: input.views ?? null,
    likes: input.likes ?? null,
    comments: input.comments ?? null,
    shares: input.shares ?? null,
    saves: input.saves ?? null,
    inquiries: input.inquiries ?? null,
    leads: input.leads ?? null,
    conversions: input.conversions ?? null,
    reviewNote: input.reviewNote ?? null,
  });

  if (!process.env.DATABASE_URL) {
    return fallback;
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      reviewSnapshot?: {
        create: (args: unknown) => Promise<unknown>;
      };
    };

    const review = await prismaClient.reviewSnapshot?.create({
      data: {
        workspaceId: workspace.id,
        projectId: input.projectId,
        assetId: input.assetId ?? null,
        channelKey: input.channelKey,
        views: input.views ?? null,
        likes: input.likes ?? null,
        comments: input.comments ?? null,
        shares: input.shares ?? null,
        saves: input.saves ?? null,
        inquiries: input.inquiries ?? null,
        leads: input.leads ?? null,
        conversions: input.conversions ?? null,
        reviewNote: input.reviewNote?.trim() || null,
      },
    });

    return review ? mapReviewSnapshot(review as Parameters<typeof mapReviewSnapshot>[0]) : fallback;
  } catch {
    return fallback;
  }
}

export async function getReviewDashboard(): Promise<ReviewDashboardPayload> {
  const [workspace, styleContent] = await Promise.all([ensureActiveCenterWorkspace(), getStyleContentDashboard()]);

  if (!process.env.DATABASE_URL) {
    return {
      projects: styleContent.projects,
      reviews: [],
    };
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      reviewSnapshot?: {
        findMany: (args: unknown) => Promise<unknown[]>;
      };
    };

    const reviews = await prismaClient.reviewSnapshot?.findMany({
      where: {
        workspaceId: workspace.id,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 8,
    });

    return {
      projects: styleContent.projects,
      reviews: (reviews ?? []).map((item) => mapReviewSnapshot(item as Parameters<typeof mapReviewSnapshot>[0])),
    };
  } catch {
    return {
      projects: styleContent.projects,
      reviews: [],
    };
  }
}
