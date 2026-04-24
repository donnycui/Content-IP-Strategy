import type { StyleRevisionPayload, StyleSamplePayload, StyleSkillDashboardPayload, StyleSkillPayload } from "@/lib/domain/contracts";
import { getActiveCreatorProfile } from "@/lib/profile-data";
import { prisma } from "@/lib/prisma";
import { ensureActiveCenterWorkspace, getCenterWorkspaceForRead } from "@/lib/services/center-workspace-service";

function buildFallbackRules(profile?: Awaited<ReturnType<typeof getActiveCreatorProfile>> | null) {
  const voice = profile?.voiceStyle || "先说人话，再说观点，最后给行动方向。";
  const positioning = profile?.positioning || "围绕创作者当前定位，用清晰判断替代空泛套话。";
  const boundary = profile?.contentBoundaries || "避免模板化套话、空洞鸡血和与画像不一致的流量表达。";

  return [
    "# 风格规则",
    "",
    "## 当前底味",
    voice,
    "",
    "## 表达定位",
    positioning,
    "",
    "## 禁忌边界",
    boundary,
    "",
    "## 当前阶段工作法",
    "- 优先让表达贴近创作者本人，而不是追求平均化模板。",
    "- 生成初稿以后，必须允许用户手动修改，并把修改差异沉淀成后续规则。",
    "- 当用户还没有足够样本时，先提供可编辑的基础稿，再逐步收敛风格。",
  ].join("\n");
}

function buildFallbackStyleSkill(input: {
  workspaceId: string;
  creatorProfileId?: string | null;
  profile?: Awaited<ReturnType<typeof getActiveCreatorProfile>> | null;
}): StyleSkillPayload {
  return {
    id: `style-skill-${input.workspaceId}`,
    workspaceId: input.workspaceId,
    creatorProfileId: input.creatorProfileId ?? null,
    status: input.profile?.voiceStyle ? "ACTIVE" : "DRAFT",
    title: "个人风格 Skill",
    summary: input.profile?.voiceStyle
      ? `当前先从画像里的表达风格出发：${input.profile.voiceStyle}`
      : "当前还没有稳定风格样本，先从画像和后续手改稿逐步沉淀 style skill。",
    rulesMarkdown: buildFallbackRules(input.profile),
    version: 1,
    revisionCount: 0,
    sampleCount: 0,
    updatedAt: new Date().toISOString(),
  };
}

function mapStyleSkill(record: {
  id: string;
  workspaceId: string;
  creatorProfileId: string | null;
  status: "DRAFT" | "ACTIVE" | "ARCHIVED";
  title: string;
  summary: string;
  rulesMarkdown: string;
  version: number;
  revisionCount: number;
  sampleCount: number;
  updatedAt: Date;
}): StyleSkillPayload {
  return {
    id: record.id,
    workspaceId: record.workspaceId,
    creatorProfileId: record.creatorProfileId,
    status: record.status,
    title: record.title,
    summary: record.summary,
    rulesMarkdown: record.rulesMarkdown,
    version: record.version,
    revisionCount: record.revisionCount,
    sampleCount: record.sampleCount,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapStyleSample(record: {
  id: string;
  styleSkillId: string;
  title: string;
  sourceLabel: string | null;
  sampleText: string;
  updatedAt: Date;
}): StyleSamplePayload {
  return {
    id: record.id,
    styleSkillId: record.styleSkillId,
    title: record.title,
    sourceLabel: record.sourceLabel,
    sampleText: record.sampleText,
    updatedAt: record.updatedAt.toISOString(),
  };
}

function mapStyleRevision(record: {
  id: string;
  styleSkillId: string;
  sampleId: string | null;
  draftText: string;
  revisedText: string;
  ruleDelta: string | null;
  createdAt: Date;
}): StyleRevisionPayload {
  return {
    id: record.id,
    styleSkillId: record.styleSkillId,
    sampleId: record.sampleId,
    draftText: record.draftText,
    revisedText: record.revisedText,
    ruleDelta: record.ruleDelta,
    createdAt: record.createdAt.toISOString(),
  };
}

export async function getActiveStyleSkill(): Promise<StyleSkillPayload> {
  const [workspace, profile] = await Promise.all([
    getCenterWorkspaceForRead({
      currentAgentKey: "STYLE_CONTENT",
    }),
    getActiveCreatorProfile(),
  ]);
  const fallback = buildFallbackStyleSkill({
    workspaceId: workspace.id,
    creatorProfileId: workspace.creatorProfileId,
    profile,
  });

  if (!process.env.DATABASE_URL) {
    return fallback;
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      styleSkill?: {
        findUnique: (args: unknown) => Promise<unknown>;
      };
    };

    const skill = await prismaClient.styleSkill?.findUnique({
      where: {
        workspaceId: workspace.id,
      },
    });

    return skill ? mapStyleSkill(skill as Parameters<typeof mapStyleSkill>[0]) : fallback;
  } catch {
    return fallback;
  }
}

export async function ensureActiveStyleSkill(): Promise<StyleSkillPayload> {
  const workspace = await ensureActiveCenterWorkspace();
  const profile = await getActiveCreatorProfile();
  const fallback = buildFallbackStyleSkill({
    workspaceId: workspace.id,
    creatorProfileId: workspace.creatorProfileId,
    profile,
  });

  if (!process.env.DATABASE_URL) {
    return fallback;
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      styleSkill?: {
        upsert: (args: unknown) => Promise<unknown>;
      };
    };

    const skill = await prismaClient.styleSkill?.upsert({
      where: {
        workspaceId: workspace.id,
      },
      update: {
        creatorProfileId: workspace.creatorProfileId,
        ...(fallback.summary ? { summary: fallback.summary } : {}),
      },
      create: {
        workspaceId: workspace.id,
        creatorProfileId: workspace.creatorProfileId,
        status: fallback.status,
        title: fallback.title,
        summary: fallback.summary,
        rulesMarkdown: fallback.rulesMarkdown,
      },
    });

    return skill ? mapStyleSkill(skill as Parameters<typeof mapStyleSkill>[0]) : fallback;
  } catch {
    return fallback;
  }
}

export async function getStyleSkillDashboard(): Promise<StyleSkillDashboardPayload> {
  const skill = await getActiveStyleSkill();

  if (!process.env.DATABASE_URL) {
    return {
      skill,
      samples: [],
      revisions: [],
    };
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      styleSample?: {
        findMany: (args: unknown) => Promise<unknown[]>;
      };
      styleRevision?: {
        findMany: (args: unknown) => Promise<unknown[]>;
      };
    };

    const [samples, revisions] = await Promise.all([
      prismaClient.styleSample?.findMany({
        where: {
          styleSkillId: skill.id,
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 5,
      }),
      prismaClient.styleRevision?.findMany({
        where: {
          styleSkillId: skill.id,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 5,
      }),
    ]);

    return {
      skill,
      samples: (samples ?? []).map((item) => mapStyleSample(item as Parameters<typeof mapStyleSample>[0])),
      revisions: (revisions ?? []).map((item) => mapStyleRevision(item as Parameters<typeof mapStyleRevision>[0])),
    };
  } catch {
    return {
      skill,
      samples: [],
      revisions: [],
    };
  }
}

export async function syncStyleSkillCounts(styleSkillId: string) {
  if (!process.env.DATABASE_URL) {
    return;
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      styleSample?: {
        count: (args: unknown) => Promise<number>;
      };
      styleRevision?: {
        count: (args: unknown) => Promise<number>;
      };
      styleSkill?: {
        update: (args: unknown) => Promise<unknown>;
      };
    };

    const [sampleCount, revisionCount] = await Promise.all([
      prismaClient.styleSample?.count({
        where: {
          styleSkillId,
        },
      }),
      prismaClient.styleRevision?.count({
        where: {
          styleSkillId,
        },
      }),
    ]);

    await prismaClient.styleSkill?.update({
      where: {
        id: styleSkillId,
      },
      data: {
        sampleCount: sampleCount ?? 0,
        revisionCount: revisionCount ?? 0,
        version: {
          increment: 1,
        },
        status: sampleCount ? "ACTIVE" : "DRAFT",
      },
    });
  } catch {
    // Ignore count sync failures until the style-skill layer is fully migrated.
  }
}

export async function applyStyleEvolutionDecision(input: {
  workspaceId: string;
  headline: string;
  rationale: string;
  suggestedAction: string;
}) {
  const skill = await ensureActiveStyleSkill();

  if (!process.env.DATABASE_URL) {
    return skill;
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      styleSkill?: {
        update: (args: unknown) => Promise<unknown>;
      };
    };

    const appendedRule = [
      skill.rulesMarkdown,
      "",
      "## 新增进化信号",
      `- ${input.headline}`,
      `- 原因：${input.rationale}`,
      `- 动作：${input.suggestedAction}`,
    ].join("\n");

    const summary = `${skill.summary}；最新进化：${input.headline}`;

    const updated = await prismaClient.styleSkill?.update({
      where: {
        id: skill.id,
      },
      data: {
        summary,
        rulesMarkdown: appendedRule,
        version: {
          increment: 1,
        },
      },
    });

    return updated ? mapStyleSkill(updated as Parameters<typeof mapStyleSkill>[0]) : skill;
  } catch {
    return skill;
  }
}
