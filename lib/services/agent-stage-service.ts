import { CENTER_AGENT_KEY_BY_ROUTE, getAgentRoutePath, type AgentRouteKey } from "@/lib/center/agent-stage-config";
import type {
  AgentThreadRecord,
  CenterAgentStatusValue,
  CenterAgentSummaryPayload,
  CenterWorkspaceRecord,
} from "@/lib/domain/contracts";
import { buildAgentCards, getCenterStageSnapshot } from "@/lib/services/center-home-service";
import { getCenterWorkspaceForRead } from "@/lib/services/center-workspace-service";

type AgentLegacyLink = {
  label: string;
  href: string;
  description: string;
};

type AgentStageDefinition = {
  routeKey: AgentRouteKey;
  label: string;
  kicker: string;
  title: string;
  description: string;
  ownedOutcomes: string[];
  loopNote: string;
  workspaceLinks: AgentLegacyLink[];
};

export type AgentStageShellData = {
  workspace: CenterWorkspaceRecord;
  agent: CenterAgentSummaryPayload;
  thread: AgentThreadRecord | null;
  definition: AgentStageDefinition;
};

const AGENT_STAGE_DEFINITIONS: Record<AgentRouteKey, AgentStageDefinition> = {
  "ip-extraction": {
    routeKey: "ip-extraction",
    label: "IP提炼 Agent",
    kicker: "Stage Agent / IP Extraction",
    title: "先把“你是谁、想做什么”讲清楚，再让系统围绕你运转。",
    description:
      "这个 Agent 负责通过对话式追问收敛创作者定位、目标、边界和第一版提炼报告。它不是一次性表单，而是整个中枢链路的起点。",
    ownedOutcomes: ["IP 提炼报告", "初版定位线索", "内容边界线索", "可交给画像 Agent 的第一版结论"],
    loopNote: "当定位、目标或内容边界发生变化时，这个 Agent 会成为最早应该回看的入口。",
    workspaceLinks: [
      {
        label: "查看画像 Agent",
        href: "/agents/creator-profile",
        description: "提炼完成后去画像 Agent 固化长期主档。",
      },
      {
        label: "返回中枢首页",
        href: "/",
        description: "回到首页查看当前阶段判断和下一步推进。",
      },
    ],
  },
  "creator-profile": {
    routeKey: "creator-profile",
    label: "创作者画像 Agent",
    kicker: "Stage Agent / Creator Profile",
    title: "把提炼结果固化成长期有效的画像，而不是一次性输出。",
    description:
      "这个 Agent 负责维护创作者画像主档，承接 IP 提炼报告，并把后续的风格、方向和进化建议都回写到这张长期主档里。",
    ownedOutcomes: ["当前有效画像", "画像版本变化", "给方向与风格层的共享基线"],
    loopNote: "画像不是静态字段集合，而是后续方向、风格、复盘和进化共用的长期资产。",
    workspaceLinks: [
      {
        label: "返回 IP提炼 Agent",
        href: "/agents/ip-extraction",
        description: "当画像基线不足时，回到提炼 Agent 补一轮访谈。",
      },
      {
        label: "进入方向与选题 Agent",
        href: "/agents/topic-direction",
        description: "画像稳定后，把它推进成方向、主题线和今日选题。",
      },
    ],
  },
  "topic-direction": {
    routeKey: "topic-direction",
    label: "选题方向 Agent",
    kicker: "Stage Agent / Directions and Topics",
    title: "把画像翻译成方向、主题线和今天可以推进的选题。",
    description:
      "这个 Agent 负责把稳定画像落成未来 2 到 4 周的方向判断、主题线，以及当天值得投入的选题建议。",
    ownedOutcomes: ["方向建议", "主题线", "今日选题", "进入内容生产的输入对象"],
    loopNote: "后续搜索、热点研究和主动学习结果，会优先进入这一层来改变方向与选题判断。",
    workspaceLinks: [
      {
        label: "进入风格与内容 Agent",
        href: "/agents/style-content",
        description: "从今天的选题直接推进到内容生产。",
      },
      {
        label: "查看创作者画像 Agent",
        href: "/agents/creator-profile",
        description: "回看当前画像基线，避免方向和选题跑偏。",
      },
    ],
  },
  "style-content": {
    routeKey: "style-content",
    label: "风格与内容 Agent",
    kicker: "Stage Agent / Style and Content",
    title: "把选题推进成你的风格化内容资产，而不是通用稿子。",
    description:
      "这个 Agent 负责接收选题、学习你的风格样本、比较 AI 初稿与手改稿，并逐步形成 style skill。随后它输出图文、短视频和直播脚本等内容资产。",
    ownedOutcomes: ["style skill", "图文稿", "短视频脚本", "公众号文章", "直播脚本", "发布准备包"],
    loopNote: "这里会是后续内容资产层、发布层和平台适配层的真正主战场。",
    workspaceLinks: [
      {
        label: "回到方向与选题 Agent",
        href: "/agents/topic-direction",
        description: "先确认今天要推进的题目，再继续做内容。",
      },
      {
        label: "查看创作者画像 Agent",
        href: "/agents/creator-profile",
        description: "内容风格和表达边界仍然要持续参考当前画像主档。",
      },
    ],
  },
  "daily-review": {
    routeKey: "daily-review",
    label: "每日复盘 Agent",
    kicker: "Stage Agent / Daily Review",
    title: "把发布后的反馈拉回系统，让它知道什么有效、什么无效。",
    description:
      "这个 Agent 负责收集内容表现、直播表现和用户主观反馈，形成单条内容和阶段性的复盘结论，再把这些结论推给升级进化层。",
    ownedOutcomes: ["每日复盘", "阶段复盘", "趋势观察", "值得继续 / 应该停止 / 值得测试的判断"],
    loopNote: "第一版先以人工录入和基础趋势判断为主，不要求一开始就自动拉平台数据。",
    workspaceLinks: [
      {
        label: "进入升级进化 Agent",
        href: "/agents/evolution",
        description: "把复盘结论推进成画像、风格和策略更新建议。",
      },
      {
        label: "返回风格与内容 Agent",
        href: "/agents/style-content",
        description: "回到内容资产和发布记录，补充复盘上下文。",
      },
    ],
  },
  evolution: {
    routeKey: "evolution",
    label: "升级进化 Agent",
    kicker: "Stage Agent / Evolution",
    title: "把复盘和主动学习的结果真正写回画像、风格和策略。",
    description:
      "这个 Agent 不只是展示建议，而是负责将复盘和主动学习结论转成画像更新、风格更新、方向调整和平台策略变化。",
    ownedOutcomes: ["进化建议", "画像更新建议", "风格更新建议", "策略调整建议"],
    loopNote: "这层会成为长期记忆和动态策略更新的交汇点。",
    workspaceLinks: [
      {
        label: "查看创作者画像 Agent",
        href: "/agents/creator-profile",
        description: "确认进化建议最终会写回哪张长期主档。",
      },
      {
        label: "回到方向与选题 Agent",
        href: "/agents/topic-direction",
        description: "检查进化建议是否应该改变今天的内容推进方向。",
      },
    ],
  },
};

export function getAgentStageDefinition(routeKey: AgentRouteKey) {
  return AGENT_STAGE_DEFINITIONS[routeKey];
}

export async function getAgentStageShellData(routeKey: AgentRouteKey): Promise<AgentStageShellData> {
  const definition = getAgentStageDefinition(routeKey);
  const snapshot = await getCenterStageSnapshot();
  const workspace = await getCenterWorkspaceForRead({
    currentAgentKey: CENTER_AGENT_KEY_BY_ROUTE[routeKey],
  });
  const agentKey = CENTER_AGENT_KEY_BY_ROUTE[routeKey];
  const agents = buildAgentCards({
    hasProfile: snapshot.hasStructuredProfile,
    currentAgent: snapshot.currentAgent,
    directionsCount: snapshot.directions.length,
    topicsCount: snapshot.topics.length,
    topicCandidatesCount: snapshot.topicCandidates.length,
    pendingSuggestionsCount: snapshot.pendingSuggestionsCount,
  });
  const agent = agents.find((item) => item.key === agentKey);

  if (!agent) {
    throw new Error(`Agent summary missing for ${routeKey}.`);
  }

  return {
    workspace,
    agent,
    thread: null,
    definition,
  };
}

export function getAgentStageStatusLabel(status: CenterAgentStatusValue) {
  if (status === "CURRENT") {
    return "当前";
  }

  if (status === "REVISIT") {
    return "建议回看";
  }

  return "待解锁";
}

export function getRelatedAgentRoutePath(routeKey: AgentRouteKey) {
  return getAgentRoutePath(CENTER_AGENT_KEY_BY_ROUTE[routeKey]);
}
