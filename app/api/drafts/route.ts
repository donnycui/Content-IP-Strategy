import { NextResponse } from "next/server";
import { executeStructuredGeneration } from "@/lib/services/structured-generation-service";
import { prisma } from "@/lib/prisma";

type DraftPayload = {
  researchCardId?: string;
  requestedTier?: "FAST" | "BALANCED" | "DEEP";
};

const PROTECTED_DRAFT_ERROR =
  "已存在人工编辑或已推进状态的草稿。为避免覆盖现有内容，本次不会自动重新生成。";

function hasProtectedDraft(draft: {
  status: "DRAFT" | "READY" | "PUBLISHED" | "ARCHIVED";
  createdAt: Date;
  updatedAt: Date;
}) {
  return draft.status !== "DRAFT" || draft.updatedAt.getTime() !== draft.createdAt.getTime();
}

function buildDrafts(card: {
  title: string;
  eventDefinition: string | null;
  mainstreamNarrative: string | null;
  ignoredVariables: string | null;
  threeMonthProjection: string | null;
  winnersLosers: string | null;
  positioningJudgment: string | null;
}, supportContext?: {
  clusterTitle?: string | null;
  supportingSignals: Array<{
    title: string;
    reasoningSummary: string;
  }>;
}) {
  const supportLead = supportContext?.supportingSignals
    .slice(0, 3)
    .map((signal, index) => `${index + 1}. ${signal.title}: ${signal.reasoningSummary}`)
    .join("\n");

  const article = [
    card.eventDefinition,
    card.mainstreamNarrative,
    card.ignoredVariables,
    supportContext?.clusterTitle ? `为什么现在值得讲：这个判断正在被“${supportContext.clusterTitle}”观察簇持续强化。` : null,
    supportLead ? `最近的支撑信号：\n${supportLead}` : null,
    card.threeMonthProjection,
    card.winnersLosers,
    card.positioningJudgment,
  ]
    .filter(Boolean)
    .join("\n\n");

  const video = [
    `大多数人会把这件事理解为：${card.mainstreamNarrative ?? "一次普通变化。"} `,
    `但真正重要的是：${card.ignoredVariables ?? card.eventDefinition ?? "它背后的结构性迁移。"} `,
    supportContext?.clusterTitle ? `为什么现在值得讲：这已经不再是一条孤立 headline，而是“${supportContext.clusterTitle}”观察簇的一部分。` : null,
    supportContext?.supportingSignals[0]
      ? `其中一个支撑信号是：${supportContext.supportingSignals[0].title}。${supportContext.supportingSignals[0].reasoningSummary}`
      : null,
    `如果趋势继续，接下来要盯：${card.threeMonthProjection ?? "权力和利润率开始迁移的位置。"} `,
    `我的站位判断是：${card.positioningJudgment ?? "在周期变得显而易见之前，先决定自己站在哪边。"} `,
  ]
    .filter(Boolean)
    .join("\n\n");

  const shortPost = [
    card.title,
    supportContext?.supportingSignals[0] ? `为什么现在：${supportContext.supportingSignals[0].title}` : null,
    card.ignoredVariables ?? card.eventDefinition ?? "",
    card.positioningJudgment ?? "",
  ]
    .filter(Boolean)
    .join("\n");

  return {
    WECHAT_ARTICLE: article,
    WECHAT_VIDEO: video,
    SHORT_POST: shortPost,
  } as const;
}

type DraftGenerationPayload = {
  wechatArticle?: string;
  wechatVideo?: string;
  shortPost?: string;
};

async function generateDraftsWithModel(card: {
  title: string;
  eventDefinition: string | null;
  mainstreamNarrative: string | null;
  ignoredVariables: string | null;
  threeMonthProjection: string | null;
  winnersLosers: string | null;
  positioningJudgment: string | null;
}, supportContext?: {
  clusterTitle?: string | null;
  supportingSignals: Array<{
    title: string;
    reasoningSummary: string;
  }>;
}, requestedTier?: "FAST" | "BALANCED" | "DEEP") {
  const fallback = buildDrafts(card, supportContext);

  const payload = await executeStructuredGeneration<DraftGenerationPayload>({
    capabilityKey: "draft_generation",
    systemInstruction:
      "你是知识型创作者平台里的草稿生成助手。请基于研究卡和支撑信号，一次性输出三个中文草稿版本：公众号短评、视频号口播、短帖。返回严格 JSON，格式为 {\"wechatArticle\":\"...\",\"wechatVideo\":\"...\",\"shortPost\":\"...\"}。内容要保留结构感、站位判断和为什么现在值得讲，不要输出多余解释。",
    userPrompt: JSON.stringify(
      {
        researchCard: card,
        supportContext,
        fallbackDrafts: fallback,
      },
      null,
      2,
    ),
    metadata: {
      channel: "web",
      flow: "creator-os",
    },
    requestedTier,
  });

  return {
    WECHAT_ARTICLE: payload?.wechatArticle?.trim() || fallback.WECHAT_ARTICLE,
    WECHAT_VIDEO: payload?.wechatVideo?.trim() || fallback.WECHAT_VIDEO,
    SHORT_POST: payload?.shortPost?.trim() || fallback.SHORT_POST,
  } as const;
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const payload = (await request.json()) as DraftPayload;

  if (!payload.researchCardId) {
    return NextResponse.json({ ok: false, error: "researchCardId is required." }, { status: 400 });
  }

  try {
    const researchCard = await prisma.researchCard.findUnique({
      where: { id: payload.researchCardId },
      include: {
        cluster: {
          include: {
            items: {
              include: {
                signal: {
                  include: {
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

    if (!researchCard) {
      return NextResponse.json({ ok: false, error: "Research card not found." }, { status: 404 });
    }

    const existingDrafts = await prisma.contentDraft.findMany({
      where: {
        researchCardId: researchCard.id,
      },
    });

    if (existingDrafts.some(hasProtectedDraft)) {
      return NextResponse.json({ ok: false, error: PROTECTED_DRAFT_ERROR }, { status: 409 });
    }

    const contents = await generateDraftsWithModel(researchCard, {
      clusterTitle: researchCard.cluster.clusterTitle,
      supportingSignals: researchCard.cluster.items.map((item) => ({
        title: item.signal.title,
        reasoningSummary: item.signal.scores[0]?.reasoningSummary ?? item.signal.summary ?? "",
      })),
    }, payload.requestedTier);

    const drafts = await prisma.$transaction(async (tx) => {
      const currentDrafts = await tx.contentDraft.findMany({
        where: {
          researchCardId: researchCard.id,
        },
      });

      if (currentDrafts.some(hasProtectedDraft)) {
        throw new Error(PROTECTED_DRAFT_ERROR);
      }

      const existingMap = new Map(currentDrafts.map((draft) => [draft.platform, draft]));

      const draftInputs = [
        { platform: "WECHAT_ARTICLE" as const, content: contents.WECHAT_ARTICLE },
        { platform: "WECHAT_VIDEO" as const, content: contents.WECHAT_VIDEO },
        { platform: "SHORT_POST" as const, content: contents.SHORT_POST },
      ];

      const results = [];

      for (const draftInput of draftInputs) {
        const existing = existingMap.get(draftInput.platform);

        if (existing) {
          results.push(
            await tx.contentDraft.update({
              where: { id: existing.id },
              data: {
                title: researchCard.title,
                content: draftInput.content,
              },
            }),
          );
        } else {
          results.push(
            await tx.contentDraft.create({
              data: {
                researchCardId: researchCard.id,
                platform: draftInput.platform,
                title: researchCard.title,
                content: draftInput.content,
              },
            }),
          );
        }
      }

      return results;
    });

    return NextResponse.json({ ok: true, drafts });
  } catch (error) {
    if (error instanceof Error && error.message === PROTECTED_DRAFT_ERROR) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 409 });
    }

    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to generate drafts." },
      { status: 500 },
    );
  }
}
