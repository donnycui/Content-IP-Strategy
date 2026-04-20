import type {
  ContentAssetPayload,
  ContentAssetTypeValue,
  ContentAssetUpdateRequest,
  ContentProjectPayload,
  StyleSkillPayload,
  TopicCandidateRow,
} from "@/lib/domain/contracts";
import { prisma } from "@/lib/prisma";
import { executeStructuredGeneration } from "@/lib/services/structured-generation-service";

type ContentDraftPayload = {
  xhsPost?: string;
  shortVideoScript?: string;
  wechatArticle?: string;
  livestreamScript?: string;
};

function mapContentAsset(record: {
  id: string;
  projectId: string;
  assetType: ContentAssetTypeValue;
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

function fallbackAssetTitle(assetType: ContentAssetTypeValue, candidate: TopicCandidateRow) {
  if (assetType === "XHS_POST") {
    return `${candidate.title} · 小红书图文包`;
  }

  if (assetType === "SHORT_VIDEO_SCRIPT") {
    return `${candidate.title} · 短视频脚本`;
  }

  if (assetType === "WECHAT_ARTICLE") {
    return `${candidate.title} · 公众号文章`;
  }

  return `${candidate.title} · 直播脚本`;
}

function buildFallbackAssetDrafts(candidate: TopicCandidateRow, styleSkill: StyleSkillPayload) {
  const xhsPost = [
    `标题：${candidate.title}`,
    "",
    "开场：",
    `今天想讲的不是一个普通热点，而是 ${candidate.whyNow || candidate.topicTitle} 背后的结构性变化。`,
    "",
    "正文结构：",
    `1. 先把大家表面上看到的东西说清楚：${candidate.topicSummary}`,
    `2. 再指出真正值得讲的那一层：${candidate.fitReason}`,
    `3. 最后把它拉回你的长期判断：${styleSkill.summary}`,
    "",
    "结尾：",
    "把评论区当成下一轮风格校准样本，观察哪些表达更像你本人。",
  ].join("\n");

  const shortVideoScript = [
    "口播开头：",
    `很多人会把 ${candidate.title} 当成一条普通内容点，但我更在意它为什么现在值得讲。`,
    "",
    "中段：",
    candidate.whyNow || candidate.topicSummary,
    "",
    "判断：",
    candidate.fitReason,
    "",
    "结尾：",
    `这条内容最后要落回你的风格底味：${styleSkill.summary}`,
  ].join("\n\n");

  const wechatArticle = [
    candidate.title,
    "",
    "一、为什么这不是普通话题",
    candidate.whyNow || candidate.topicSummary,
    "",
    "二、为什么你来讲更成立",
    candidate.fitReason,
    "",
    "三、接下来怎么继续扩成主题线",
    `可以沿着 ${candidate.topicTitle} 继续拆成系列内容，并逐步校准为更接近你的稳定风格。`,
  ].join("\n");

  const livestreamScript = [
    `直播主题：${candidate.title}`,
    "",
    "直播目标：",
    "用更接近真人表达的方式，把这个题目讲成一次可互动的直播切口。",
    "",
    "流程：",
    `1. 开场说明为什么今天讲 ${candidate.title}`,
    `2. 解释为什么现在值得讲：${candidate.whyNow || candidate.topicSummary}`,
    `3. 强调你的判断和站位：${candidate.fitReason}`,
    "4. 用提问和互动收集下一轮内容与风格校准信号",
  ].join("\n");

  return {
    XHS_POST: xhsPost,
    SHORT_VIDEO_SCRIPT: shortVideoScript,
    WECHAT_ARTICLE: wechatArticle,
    LIVESTREAM_SCRIPT: livestreamScript,
  } as const;
}

async function generateDraftsWithModel(candidate: TopicCandidateRow, styleSkill: StyleSkillPayload) {
  const fallback = buildFallbackAssetDrafts(candidate, styleSkill);
  const payload = await executeStructuredGeneration<ContentDraftPayload>({
    capabilityKey: "draft_generation",
    systemInstruction:
      "你是 zhaocai-IP-center 的内容资产生成助手。请围绕给定选题和 style skill，一次性输出四类中文内容资产：xhsPost、shortVideoScript、wechatArticle、livestreamScript。返回严格 JSON，不要附加解释。",
    userPrompt: JSON.stringify(
      {
        candidate,
        styleSkill,
        fallback,
      },
      null,
      2,
    ),
    metadata: {
      channel: "web",
      flow: "zhaocai-ip-center-content-project",
    },
    requestedTier: "BALANCED",
  });

  return {
    XHS_POST: payload?.xhsPost?.trim() || fallback.XHS_POST,
    SHORT_VIDEO_SCRIPT: payload?.shortVideoScript?.trim() || fallback.SHORT_VIDEO_SCRIPT,
    WECHAT_ARTICLE: payload?.wechatArticle?.trim() || fallback.WECHAT_ARTICLE,
    LIVESTREAM_SCRIPT: payload?.livestreamScript?.trim() || fallback.LIVESTREAM_SCRIPT,
  } as const;
}

export async function generateProjectAssets(input: {
  project: ContentProjectPayload;
  candidate: TopicCandidateRow;
  styleSkill: StyleSkillPayload;
}): Promise<ContentAssetPayload[]> {
  const drafts = await generateDraftsWithModel(input.candidate, input.styleSkill);

  const assetInputs = [
    {
      assetType: "XHS_POST" as const,
      title: fallbackAssetTitle("XHS_POST", input.candidate),
      content: drafts.XHS_POST,
      targetPlatform: "xiaohongshu",
    },
    {
      assetType: "SHORT_VIDEO_SCRIPT" as const,
      title: fallbackAssetTitle("SHORT_VIDEO_SCRIPT", input.candidate),
      content: drafts.SHORT_VIDEO_SCRIPT,
      targetPlatform: "short-video",
    },
    {
      assetType: "WECHAT_ARTICLE" as const,
      title: fallbackAssetTitle("WECHAT_ARTICLE", input.candidate),
      content: drafts.WECHAT_ARTICLE,
      targetPlatform: "wechat-official-account",
    },
    {
      assetType: "LIVESTREAM_SCRIPT" as const,
      title: fallbackAssetTitle("LIVESTREAM_SCRIPT", input.candidate),
      content: drafts.LIVESTREAM_SCRIPT,
      targetPlatform: "livestream",
    },
  ];

  if (!process.env.DATABASE_URL) {
    return assetInputs.map((asset) => ({
      id: `content-asset-${asset.assetType.toLowerCase()}`,
      projectId: input.project.id,
      assetType: asset.assetType,
      title: asset.title,
      content: asset.content,
      targetPlatform: asset.targetPlatform,
      status: "DRAFT",
      updatedAt: new Date().toISOString(),
    }));
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      contentAsset?: {
        upsert: (args: unknown) => Promise<unknown>;
      };
    };

    const results: ContentAssetPayload[] = [];

    for (const asset of assetInputs) {
      const saved = await prismaClient.contentAsset?.upsert({
        where: {
          projectId_assetType: {
            projectId: input.project.id,
            assetType: asset.assetType,
          },
        },
        update: {
          title: asset.title,
          content: asset.content,
          targetPlatform: asset.targetPlatform,
        },
        create: {
          projectId: input.project.id,
          assetType: asset.assetType,
          title: asset.title,
          content: asset.content,
          targetPlatform: asset.targetPlatform,
        },
      });

      if (saved) {
        results.push(mapContentAsset(saved as Parameters<typeof mapContentAsset>[0]));
      }
    }

    return results.length
      ? results
      : assetInputs.map((asset) => ({
          id: `content-asset-${asset.assetType.toLowerCase()}`,
          projectId: input.project.id,
          assetType: asset.assetType,
          title: asset.title,
          content: asset.content,
          targetPlatform: asset.targetPlatform,
          status: "DRAFT",
          updatedAt: new Date().toISOString(),
        }));
  } catch {
    return assetInputs.map((asset) => ({
      id: `content-asset-${asset.assetType.toLowerCase()}`,
      projectId: input.project.id,
      assetType: asset.assetType,
      title: asset.title,
      content: asset.content,
      targetPlatform: asset.targetPlatform,
      status: "DRAFT",
      updatedAt: new Date().toISOString(),
    }));
  }
}

export async function updateContentAsset(input: {
  id: string;
  payload: ContentAssetUpdateRequest;
}): Promise<ContentAssetPayload> {
  const title = input.payload.title !== undefined ? input.payload.title?.trim() || null : undefined;
  const content = input.payload.content !== undefined ? input.payload.content : undefined;
  const status = input.payload.status;

  if (title === undefined && content === undefined && !status) {
    throw new Error("At least one content-asset field is required.");
  }

  if (!process.env.DATABASE_URL) {
    return {
      id: input.id,
      projectId: "content-project-mock",
      assetType: "XHS_POST",
      title: title ?? "未命名内容资产",
      content: content ?? "",
      targetPlatform: "xiaohongshu",
      status: status ?? "DRAFT",
      updatedAt: new Date().toISOString(),
    };
  }

  try {
    const prismaClient = prisma as typeof prisma & {
      contentAsset?: {
        update: (args: unknown) => Promise<unknown>;
      };
    };

    const asset = await prismaClient.contentAsset?.update({
      where: {
        id: input.id,
      },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(content !== undefined ? { content } : {}),
        ...(status ? { status } : {}),
      },
    });

    if (!asset) {
      throw new Error("Content asset not found.");
    }

    return mapContentAsset(asset as Parameters<typeof mapContentAsset>[0]);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "更新内容资产失败。");
  }
}
