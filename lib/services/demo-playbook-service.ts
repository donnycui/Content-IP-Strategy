import type {
  EvolutionDashboardPayload,
  ReviewDashboardPayload,
  StyleContentDashboardPayload,
} from "@/lib/domain/contracts";
import { getCenterHomeData } from "@/lib/services/center-home-service";
import { getStyleContentDashboard } from "@/lib/services/content-project-service";
import { getEvolutionDashboard } from "@/lib/services/evolution-decision-service";
import { getReviewDashboard } from "@/lib/services/review-snapshot-service";

export type DemoStep = {
  title: string;
  description: string;
  href: string;
  state: string;
  details: string[];
};

export type DemoPlaybook = {
  headline: string;
  summary: string;
  steps: DemoStep[];
};

function buildStateLabel(input: {
  count: number;
  emptyLabel: string;
  presentLabel: string;
}) {
  return input.count > 0 ? `${input.presentLabel} ${input.count}` : input.emptyLabel;
}

function buildStyleContentStep(dashboard: StyleContentDashboardPayload): DemoStep {
  const assetCount = dashboard.projects.reduce((sum, item) => sum + item.assets.length, 0);
  const publishCount = dashboard.projects.reduce((sum, item) => sum + item.publishRecords.length, 0);

  return {
    title: "风格与内容 Agent",
    description: "录入风格样本、沉淀 style skill、创建内容项目、编辑内容资产，并把项目推进到导出与发布准备。",
    href: "/agents/style-content",
    state: dashboard.projects.length
      ? `已创建内容项目 ${dashboard.projects.length} 个`
      : "当前还没有内容项目",
    details: [
      buildStateLabel({
        count: dashboard.recommendedCandidates.length,
        emptyLabel: "当前没有可推进选题",
        presentLabel: "可推进选题",
      }),
      buildStateLabel({
        count: assetCount,
        emptyLabel: "当前没有生成内容资产",
        presentLabel: "内容资产",
      }),
      buildStateLabel({
        count: publishCount,
        emptyLabel: "当前没有导出/发布准备记录",
        presentLabel: "导出/发布准备记录",
      }),
    ],
  };
}

function buildReviewStep(dashboard: ReviewDashboardPayload): DemoStep {
  return {
    title: "每日复盘 Agent",
    description: "手动录入项目或资产的表现数据，把结果拉回系统，形成后续进化判断的输入。",
    href: "/agents/daily-review",
    state: dashboard.reviews.length ? `已记录复盘快照 ${dashboard.reviews.length} 条` : "当前还没有复盘快照",
    details: [
      buildStateLabel({
        count: dashboard.projects.length,
        emptyLabel: "当前没有可复盘的内容项目",
        presentLabel: "可复盘内容项目",
      }),
    ],
  };
}

function buildEvolutionStep(dashboard: EvolutionDashboardPayload): DemoStep {
  return {
    title: "升级进化 Agent",
    description: "从复盘快照生成进化决策，采纳后回写风格、画像、方向和平台策略对象。",
    href: "/agents/evolution",
    state: dashboard.decisions.length ? `当前进化决策 ${dashboard.decisions.length} 条` : "当前还没有进化决策",
    details: [
      buildStateLabel({
        count: dashboard.latestReviews.length,
        emptyLabel: "当前没有可供进化的复盘输入",
        presentLabel: "最近复盘输入",
      }),
    ],
  };
}

export async function getDemoPlaybook(): Promise<DemoPlaybook> {
  const [center, styleContent, reviewDashboard, evolutionDashboard] = await Promise.all([
    getCenterHomeData(),
    getStyleContentDashboard(),
    getReviewDashboard(),
    getEvolutionDashboard(),
  ]);

  return {
    headline: "zhaocai-IP-center 当前演示路径",
    summary:
      "这条演示路径按当前已经落地的功能顺序组织，从中枢首页一路走到内容项目、复盘、进化和主动学习，避免手动在各个 Agent 和旧页面之间来回跳。",
    steps: [
      {
        title: "中枢首页",
        description: "先看系统当前判断你处于哪个阶段，再决定从哪个 Agent 切入。",
        href: "/",
        state: center.judgment.stageLabel,
        details: [
          `主动作：${center.judgment.primaryAction.label}`,
          `次动作：${center.judgment.secondaryAction.label}`,
        ],
      },
      {
        title: "IP提炼 Agent",
        description: "从对话式提炼开始，让系统理解你是谁、想做什么和为什么要做。",
        href: "/agents/ip-extraction",
        state: center.agents.find((item) => item.key === "IP_EXTRACTION")?.status ?? "CURRENT",
        details: [center.agents.find((item) => item.key === "IP_EXTRACTION")?.summary ?? "未加载"],
      },
      {
        title: "创作者画像 Agent",
        description: "把提炼结果固化成长期主档，并给后续方向、风格和进化提供共享基线。",
        href: "/agents/creator-profile",
        state: center.agents.find((item) => item.key === "CREATOR_PROFILE")?.status ?? "LOCKED",
        details: [center.agents.find((item) => item.key === "CREATOR_PROFILE")?.summary ?? "未加载"],
      },
      {
        title: "选题方向 Agent",
        description: "从画像生成方向、主题线和候选题，给内容层提供真正可推进的输入。",
        href: "/agents/topic-direction",
        state: center.agents.find((item) => item.key === "TOPIC_DIRECTION")?.status ?? "LOCKED",
        details: [center.agents.find((item) => item.key === "TOPIC_DIRECTION")?.summary ?? "未加载"],
      },
      buildStyleContentStep(styleContent),
      {
        title: "内容项目总览",
        description: "把所有已创建的内容项目集中起来浏览和进入，作为内容层的统一入口。",
        href: "/content/projects",
        state: styleContent.projects.length ? `内容项目 ${styleContent.projects.length} 个` : "当前还没有内容项目总览数据",
        details: styleContent.projects.slice(0, 3).map((item) => item.project.title),
      },
      buildReviewStep(reviewDashboard),
      buildEvolutionStep(evolutionDashboard),
      {
        title: "主动学习",
        description: "在首页和升级进化 Agent 里查看系统最近学到的热点、风格和未来跟踪方向。",
        href: "/agents/evolution",
        state: "已接入首页与升级进化 Agent",
        details: ["当前主动学习结果会写入 shared memory 的 LEARNING_INSIGHT"],
      },
    ],
  };
}
