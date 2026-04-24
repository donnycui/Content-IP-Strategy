import type { LearningInsightPayload, LearningInsightsDashboardPayload } from "@/lib/domain/contracts";
import { getDirections } from "@/lib/direction-data";
import { getActiveSharedMemoryRecords, upsertActiveSharedMemoryRecord } from "@/lib/services/shared-memory-service";
import { getStyleSkillDashboard } from "@/lib/services/style-skill-service";
import { getReviewDashboard } from "@/lib/services/review-snapshot-service";
import { ensureActiveCenterWorkspace, getCenterWorkspaceForRead } from "@/lib/services/center-workspace-service";
import { getTopics } from "@/lib/topic-data";

function buildFallbackInsights(input: {
  hottestTopicTitle?: string | null;
  hottestTopicSummary?: string | null;
  topDirectionTitle?: string | null;
  topDirectionWhyNow?: string | null;
  styleSummary: string;
  reviewHint?: string | null;
}): LearningInsightPayload[] {
  const marketTitle = input.hottestTopicTitle || "当前热点仍在继续收敛中";
  const marketSummary =
    input.hottestTopicSummary || "系统还在根据方向、主题线和复盘结果积累更稳定的热点观察。";
  const styleDetail = input.reviewHint
    ? `最近复盘显示：${input.reviewHint}。结合当前 style skill，系统更倾向继续强化“${input.styleSummary}”这类表达。`
    : `当前还缺少足够复盘数据，先把风格学习重心放在“${input.styleSummary}”这一底味上。`;

  const futureTitle = input.topDirectionTitle || "下一轮最值得继续追的母线";
  const futureSummary = input.topDirectionWhyNow || "方向层还在继续收敛，后续会把更稳定的未来热点预测写回这里。";

  return [
    {
      kind: "MARKET_HOTSPOT",
      title: `市场热点：${marketTitle}`,
      summary: marketSummary,
      detail: "这条洞察来自当前主题线、候选题和信号的重叠区域，用来提醒系统今天应该优先观察什么。",
    },
    {
      kind: "STYLE",
      title: "平台风格观察",
      summary: input.styleSummary,
      detail: styleDetail,
    },
    {
      kind: "FUTURE_TRACK",
      title: `未来热点预测：${futureTitle}`,
      summary: futureSummary,
      detail: "这条洞察代表系统认为下一轮还值得继续押注和观察的方向，不一定是今天立刻要发的题，但会影响接下来的选题权重。",
    },
  ];
}

export async function deriveLearningInsights(): Promise<LearningInsightPayload[]> {
  const [topics, directions, styleDashboard, reviewDashboard] = await Promise.all([
    getTopics(),
    getDirections(),
    getStyleSkillDashboard(),
    getReviewDashboard(),
  ]);

  const hottestTopic = topics[0];
  const topDirection = directions[0];
  const latestReview = reviewDashboard.reviews[0];
  const styleSummary = styleDashboard.skill.summary || "先从创作者画像里的表达风格字段起步";
  const reviewHint = latestReview?.reviewNote || null;

  return buildFallbackInsights({
    hottestTopicTitle: hottestTopic?.title,
    hottestTopicSummary: hottestTopic?.summary,
    topDirectionTitle: topDirection?.title,
    topDirectionWhyNow: topDirection?.whyNow,
    styleSummary,
    reviewHint,
  });
}

export async function generateLearningInsights(): Promise<{ createdCount: number }> {
  const workspace = await ensureActiveCenterWorkspace();
  const insights = await deriveLearningInsights();

  if (!insights.length) {
    return { createdCount: 0 };
  }

  const summary = insights.map((item) => `${item.title}：${item.summary}`).join("；");
  const detail = insights.map((item) => `${item.title}\n${item.detail}`).join("\n\n");

  await upsertActiveSharedMemoryRecord({
    workspaceId: workspace.id,
    category: "LEARNING_INSIGHT",
    title: "主动学习",
    summary,
    detail,
    agentKey: "EVOLUTION",
    sourceRef: "learning-service",
  });

  return {
    createdCount: insights.length,
  };
}

export async function getLearningInsightsDashboard(): Promise<LearningInsightsDashboardPayload> {
  const workspace = await getCenterWorkspaceForRead({
    currentAgentKey: "EVOLUTION",
  });
  const [insights, activeRecords] = await Promise.all([
    deriveLearningInsights(),
    getActiveSharedMemoryRecords(workspace.id, ["LEARNING_INSIGHT"]),
  ]);

  const active = activeRecords[0] ?? null;

  return {
    insights,
    activeMemorySummary: active?.summary ?? null,
    activeMemoryDetail: active?.detail ?? null,
  };
}
