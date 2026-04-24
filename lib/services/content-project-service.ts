import type {
  ContentAssetPayload,
  ContentProjectUpdateRequest,
  ContentProjectPayload,
  PublishRecordPayload,
  ReviewSnapshotPayload,
  StyleSkillPayload,
  StyleContentDashboardPayload,
  TopicCandidateRow,
} from "@/lib/domain/contracts";
import { buildContentProjectPackage } from "@/lib/content/content-project-package-logic";
import { prisma } from "@/lib/prisma";
import { getTopicCandidates } from "@/lib/topic-candidate-data";
import { generateProjectAssets } from "@/lib/services/content-asset-service";
import { ensureExportPublishRecords } from "@/lib/services/publish-record-service";
import { getReviewSnapshotsByProjectId } from "@/lib/services/review-snapshot-service";
import { ensureActiveStyleSkill } from "@/lib/services/style-skill-service";
import { ensureActiveCenterWorkspace, getCenterWorkspaceForRead } from "@/lib/services/center-workspace-service";

function mapContentProject(record: {
  id: string;
  workspaceId: string;
  creatorProfileId: string | null;
  topicCandidateId: string | null;
  styleSkillId: string | null;
  status: "DRAFT" | "ACTIVE" | "READY" | "ARCHIVED";
  title: string;
  summary: string | null;
  updatedAt: Date;
}): ContentProjectPayload {
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    creatorProfileId: record.creatorProfileId,
    topicCandidateId: record.topicCandidateId,
    styleSkillId: record.styleSkillId,
    status: record.status,
    title: record.title,
    summary: record.summary,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapContentAsset(record: {
  id: string;
  projectId: string;
  assetType: "XHS_POST" | "SHORT_VIDEO_SCRIPT" | "WECHAT_ARTICLE" | "LIVESTREAM_SCRIPT";
  title: string | null;
  content: string;
  targetPlatform: string;
  status: "DRAFT" | "READY" | "APPROVED" | "ARCHIVED";
  updatedAt: Date;
}): ContentAssetPayload {
  return {
    id: record.id,
    projectId: record.projectId,
    assetType: record.assetType,
    title: record.title,
    content: record.content,
    targetPlatform: record.targetPlatform,
    status: record.status,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapPublishRecord(record: {
  id: string;
  projectId: string;
  assetId: string | null;
  channelKey: string;
  mode: "EXPORT" | "DIRECT";
  status: "DRAFT" | "READY" | "EXPORTED" | "QUEUED" | "PUBLISHED" | "FAILED";
  failureReason: string | null;
  packageJson: Record<string, string | number | boolean | null> | null;
  updatedAt: Date;
}): PublishRecordPayload {
  return {
    id: record.id,
    projectId: record.projectId,
    assetId: record.assetId,
    channelKey: record.channelKey,
    mode: record.mode,
    status: record.status,
    failureReason: record.failureReason,
    packageJson: record.packageJson,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function findCandidate(candidates: TopicCandidateRow[], candidateId?: string) {
  if (candidateId) {
    return candidates.find((candidate) => candidate.id === candidateId) ?? null;
  }

  return candidates.find((candidate) => candidate.status === "NEW" || candidate.status === "KEPT") ?? candidates[0] ?? null;
}

function buildMockProject(input: {
  workspaceId: string;
  creatorProfileId?: string | null;
  topicCandidateId?: string | null;
  styleSkillId?: string | null;
  title: string;
  summary?: string | null;
}): ContentProjectPayload {
  return {
    id: `content-project-${Date.now()}`,
    workspaceId: input.workspaceId,
    creatorProfileId: input.creatorProfileId ?? null,
    topicCandidateId: input.topicCandidateId ?? null,
    styleSkillId: input.styleSkillId ?? null,
    status: "ACTIVE",
    title: input.title,
    summary: input.summary ?? null,
    updatedAt: new Date().toISOString(),
  };
}

export async function createContentProjectFromTopicCandidate(candidateId?: string): Promise<{
  project: ContentProjectPayload;
  assets: ContentAssetPayload[];
  publishRecords: PublishRecordPayload[];
  candidate: TopicCandidateRow;
}> {
  const [workspace, styleSkill, candidates] = await Promise.all([
    ensureActiveCenterWorkspace(),
    ensureActiveStyleSkill(),
    getTopicCandidates(),
  ]);

  const candidate = findCandidate(candidates, candidateId);

  if (!candidate) {
    throw new Error("No topic candidate is available.");
  }

  const fallbackProject = buildMockProject({
    workspaceId: workspace.id,
    creatorProfileId: workspace.creatorProfileId,
    topicCandidateId: candidate.id,
    styleSkillId: styleSkill.id,
    title: candidate.title,
    summary: candidate.whyNow || candidate.topicSummary,
  });

  let project = fallbackProject;

  if (process.env.DATABASE_URL) {
    try {
      const prismaClient = prisma as typeof prisma & {
        contentProject?: {
          create: (args: unknown) => Promise<unknown>;
        };
      };

      const saved = await prismaClient.contentProject?.create({
        data: {
          workspaceId: workspace.id,
          creatorProfileId: workspace.creatorProfileId,
          topicCandidateId: candidate.id,
          styleSkillId: styleSkill.id,
          status: "ACTIVE",
          title: candidate.title,
          summary: candidate.whyNow || candidate.topicSummary,
        },
      });

      if (saved) {
        project = mapContentProject(saved as Parameters<typeof mapContentProject>[0]);
      }
    } catch {
      project = fallbackProject;
    }
  }

  const assets = await generateProjectAssets({
    project,
    candidate,
    styleSkill,
  });

  const publishRecords = await ensureExportPublishRecords({
    project,
    assets,
  });

  return {
    project,
    assets,
    publishRecords,
    candidate,
  };
}

export async function getStyleContentDashboard(): Promise<StyleContentDashboardPayload> {
  const workspace = await getCenterWorkspaceForRead({
    currentAgentKey: "STYLE_CONTENT",
  });
  const recommendedCandidates = (await getTopicCandidates()).slice(0, 4);

  if (!process.env.DATABASE_URL) {
    return {
      recommendedCandidates,
      projects: [],
    };
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      contentProject?: {
        findMany: (args: unknown) => Promise<unknown[]>;
      };
    };

    const projects = await prismaClient.contentProject?.findMany({
      where: {
        workspaceId: workspace.id,
      },
      include: {
        assets: true,
        publishRecords: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 4,
    });

    return {
      recommendedCandidates,
      projects: (projects ?? []).map((project) => {
        const value = project as {
          id: string;
          workspaceId: string;
          creatorProfileId: string | null;
          topicCandidateId: string | null;
          styleSkillId: string | null;
          status: "DRAFT" | "ACTIVE" | "READY" | "ARCHIVED";
          title: string;
          summary: string | null;
          updatedAt: Date;
          assets: Array<Parameters<typeof mapContentAsset>[0]>;
          publishRecords: Array<Parameters<typeof mapPublishRecord>[0]>;
        };

        return {
          project: mapContentProject(value),
          assets: value.assets.map(mapContentAsset),
          publishRecords: value.publishRecords.map(mapPublishRecord),
        };
      }),
    };
  } catch {
    return {
      recommendedCandidates,
      projects: [],
    };
  }
}

export async function updateContentProject(input: {
  id: string;
  payload: ContentProjectUpdateRequest;
}): Promise<ContentProjectPayload> {
  const title = input.payload.title !== undefined ? input.payload.title.trim() : undefined;
  const summary = input.payload.summary !== undefined ? input.payload.summary?.trim() || null : undefined;
  const status = input.payload.status;

  if (title === undefined && summary === undefined && !status) {
    throw new Error("At least one content-project field is required.");
  }

  if (!process.env.DATABASE_URL) {
    return {
      id: input.id,
      workspaceId: "center-workspace-primary",
      creatorProfileId: null,
      topicCandidateId: null,
      styleSkillId: null,
      status: status ?? "ACTIVE",
      title: title || "未命名内容项目",
      summary: summary ?? null,
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      contentProject?: {
        update: (args: unknown) => Promise<unknown>;
      };
    };

    const project = await prismaClient.contentProject?.update({
      where: {
        id: input.id,
      },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(summary !== undefined ? { summary } : {}),
        ...(status ? { status } : {}),
      },
    });

    if (!project) {
      throw new Error("Content project not found.");
    }

    return mapContentProject(project as Parameters<typeof mapContentProject>[0]);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "更新内容项目失败。");
  }
}

export async function getContentProjectDetail(projectId: string): Promise<{
  project: ContentProjectPayload;
  assets: ContentAssetPayload[];
  publishRecords: PublishRecordPayload[];
  candidate: TopicCandidateRow | null;
  styleSkill: StyleSkillPayload;
  reviews: ReviewSnapshotPayload[];
} | null> {
  const [workspace, styleSkill, candidates] = await Promise.all([
    ensureActiveCenterWorkspace(),
    ensureActiveStyleSkill(),
    getTopicCandidates(),
  ]);

  if (!process.env.DATABASE_URL) {
    const dashboard = await getStyleContentDashboard();
    const projectEntry = dashboard.projects.find((item) => item.project.id === projectId) ?? null;

    if (!projectEntry) {
      return null;
    }

    return {
      project: projectEntry.project,
      assets: projectEntry.assets,
      publishRecords: projectEntry.publishRecords,
      candidate: candidates.find((candidate) => candidate.id === projectEntry.project.topicCandidateId) ?? null,
      styleSkill,
      reviews: [],
    };
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      contentProject?: {
        findFirst: (args: unknown) => Promise<unknown>;
      };
    };

    const project = await prismaClient.contentProject?.findFirst({
      where: {
        id: projectId,
        workspaceId: workspace.id,
      },
      include: {
        assets: true,
        publishRecords: true,
      },
    });

    if (!project) {
      return null;
    }

    const typedProject = project as {
      id: string;
      workspaceId: string;
      creatorProfileId: string | null;
      topicCandidateId: string | null;
      styleSkillId: string | null;
      status: "DRAFT" | "ACTIVE" | "READY" | "ARCHIVED";
      title: string;
      summary: string | null;
      updatedAt: Date;
      assets: Array<Parameters<typeof mapContentAsset>[0]>;
      publishRecords: Array<Parameters<typeof mapPublishRecord>[0]>;
    };

    return {
      project: mapContentProject(typedProject),
      assets: typedProject.assets.map(mapContentAsset),
      publishRecords: typedProject.publishRecords.map(mapPublishRecord),
      candidate: candidates.find((candidate) => candidate.id === typedProject.topicCandidateId) ?? null,
      styleSkill,
      reviews: await getReviewSnapshotsByProjectId(projectId),
    };
  } catch {
    return null;
  }
}

export async function getContentProjectPackage(projectId: string) {
  const detail = await getContentProjectDetail(projectId);

  if (!detail) {
    return null;
  }

  return buildContentProjectPackage({
    project: detail.project,
    candidate: detail.candidate,
    styleSkill: detail.styleSkill,
    assets: detail.assets,
    publishRecords: detail.publishRecords,
    reviews: detail.reviews,
  });
}
