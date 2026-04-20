import type {
  CenterAgentKeyValue,
  CenterAgentSummaryPayload,
  CenterCoordinatorPayload,
  CenterHomePayload,
  CenterJudgmentPayload,
  CenterMemorySnapshotPayload,
  CenterMetricPayload,
  CenterQuickActionPayload,
} from "@/lib/domain/contracts";
import { getAgentRoutePath } from "@/lib/center/agent-stage-config";
import { getDirections } from "@/lib/direction-data";
import { getActiveCreatorProfile } from "@/lib/profile-data";
import { getProfileUpdateSuggestions } from "@/lib/profile-update-suggestion-data";
import { syncCenterAgentThreads } from "@/lib/services/agent-thread-service";
import { ensureActiveCenterWorkspace } from "@/lib/services/center-workspace-service";
import { getSharedMemorySnapshotProjection, syncHomepageMemorySnapshot } from "@/lib/services/shared-memory-service";
import { getTopicCandidates } from "@/lib/topic-candidate-data";
import { getTopics } from "@/lib/topic-data";

function hasProfile(profile: Awaited<ReturnType<typeof getActiveCreatorProfile>>) {
  if (!profile) {
    return false;
  }

  return Boolean(profile.positioning || profile.persona || profile.audience || profile.coreThemes);
}

function determineCurrentAgent(input: {
  hasProfile: boolean;
  directionsCount: number;
  topicsCount: number;
  topicCandidatesCount: number;
}): CenterAgentKeyValue {
  if (!input.hasProfile) {
    return "IP_EXTRACTION";
  }

  if (!input.directionsCount || !input.topicsCount || !input.topicCandidatesCount) {
    return "TOPIC_DIRECTION";
  }

  return "STYLE_CONTENT";
}

function createJudgment(input: {
  hasProfile: boolean;
  directionsCount: number;
  topicsCount: number;
  topicCandidatesCount: number;
  pendingSuggestionsCount: number;
}): CenterJudgmentPayload {
  if (!input.hasProfile) {
    return {
      stageLabel: "IP提炼",
      title: "先让系统真正理解你是谁，再决定后面的选题、风格和发布。",
      description: "第一次正式使用先从对话式 IP 提炼开始。你只需要先讲需求，系统会一步一步追问并生成第一版提炼报告。",
      reason: "当前还没有稳定画像，后面的方向、内容和复盘都缺少统一基线。",
      primaryAction: {
        label: "开始第一次 IP 提炼",
        href: getAgentRoutePath("IP_EXTRACTION"),
      },
      secondaryAction: {
        label: "先看看创作者画像结构",
        href: getAgentRoutePath("CREATOR_PROFILE"),
      },
    };
  }

  if (!input.directionsCount || !input.topicsCount || !input.topicCandidatesCount) {
    return {
      stageLabel: "选题方向",
      title: "画像已经有了，下一步要把它翻译成方向、主题线和今天能做的选题。",
      description: "zhaocai-IP-center 现在会优先推进方向和选题层，让后面的风格化内容生产有明确输入。",
      reason: "当前画像已经具备基础信息，但方向/选题链路还没有稳定跑满。",
      primaryAction: {
        label: "进入方向与选题",
        href: getAgentRoutePath("TOPIC_DIRECTION"),
      },
      secondaryAction: {
        label: "回看创作者画像",
        href: getAgentRoutePath("CREATOR_PROFILE"),
      },
    };
  }

  return {
    stageLabel: "风格与内容",
    title: "方向和选题已经具备，下一步该把它们推进成你的风格化内容包。",
    description: "这一轮先复用现有方向和选题内核，把首页切成真正的中枢入口。风格 skill、内容资产和发布层会接管下一步执行。",
    reason:
      input.pendingSuggestionsCount > 0
        ? `当前还有 ${input.pendingSuggestionsCount} 条升级建议待处理，但更优先的是把已有选题推进成可发布内容。`
        : "今天已经有足够的方向和选题储备，适合从内容形态和平台包装开始。",
    primaryAction: {
      label: "从今日选题推进内容",
      href: getAgentRoutePath("STYLE_CONTENT"),
    },
    secondaryAction: {
      label: "查看升级进化建议",
      href: getAgentRoutePath("EVOLUTION"),
    },
  };
}

function buildAgentCards(input: {
  hasProfile: boolean;
  currentAgent: CenterAgentKeyValue;
  directionsCount: number;
  topicsCount: number;
  topicCandidatesCount: number;
  pendingSuggestionsCount: number;
}): CenterAgentSummaryPayload[] {
  const styleUnlocked = input.topicCandidatesCount > 0;
  const evolutionActive = input.pendingSuggestionsCount > 0;

  return [
    {
      key: "IP_EXTRACTION",
      label: "IP提炼 Agent",
      status: input.hasProfile ? "REVISIT" : "CURRENT",
      summary: input.hasProfile
        ? "当前已经有一版提炼结果，可以随时回到对话里重做或补充。"
        : "先通过自由描述和多轮追问，把“你是谁、想做什么”讲清楚。",
      detail: input.hasProfile
        ? "当定位、目标或内容边界发生变化时，这里是最早应该回看的入口。"
        : "第一次正式使用从这里开始，系统会把模糊需求收敛成第一版 IP 提炼报告。",
      href: getAgentRoutePath("IP_EXTRACTION"),
      actionLabel: input.hasProfile ? "回到 IP 提炼" : "开始第一次 IP 提炼",
      note: "当前阶段只保留对话式提炼主路径。",
    },
    {
      key: "CREATOR_PROFILE",
      label: "创作者画像 Agent",
      status: input.hasProfile ? (input.currentAgent === "CREATOR_PROFILE" ? "CURRENT" : "REVISIT") : "LOCKED",
      summary: input.hasProfile
        ? "画像已经成形，但还需要持续固化定位、受众、边界和增长目标。"
        : "先完成 IP 提炼，画像 Agent 才会有稳定主档可维护。",
      detail: input.hasProfile
        ? "画像不是一次性填写，而是后续方向、风格和进化的共享基线。"
        : "这里会在提炼完成后接住第一版报告，并转成长期有效画像。",
      href: getAgentRoutePath("CREATOR_PROFILE"),
      actionLabel: input.hasProfile ? "打开创作者画像" : "等待画像解锁",
      note: "后续会增加画像版本对比与回写历史。",
    },
    {
      key: "TOPIC_DIRECTION",
      label: "选题方向 Agent",
      status: input.hasProfile ? (input.currentAgent === "TOPIC_DIRECTION" ? "CURRENT" : "REVISIT") : "LOCKED",
      summary: input.hasProfile
        ? `当前方向 ${input.directionsCount} 条、主题 ${input.topicsCount} 条、可推进选题 ${input.topicCandidatesCount} 条。`
        : "没有画像之前，系统不会盲目给方向和选题。",
      detail: input.hasProfile
        ? "这一层负责把画像翻译成方向、主题线和今日推荐选题。"
        : "先把创作者画像稳定下来，方向与选题才会真正贴着你走。",
      href: getAgentRoutePath("TOPIC_DIRECTION"),
      actionLabel: input.hasProfile ? "查看方向与选题" : "等待方向解锁",
      note: "方向、主题线和选题被统一收拢到同一个 Agent 工作区。",
    },
    {
      key: "STYLE_CONTENT",
      label: "风格与内容 Agent",
      status: styleUnlocked ? (input.currentAgent === "STYLE_CONTENT" ? "CURRENT" : "REVISIT") : "LOCKED",
      summary: styleUnlocked
        ? "今天已经有选题储备，下一轮重点就是把它推进成你的风格化内容包。"
        : "先跑通画像和选题，风格 skill 与内容资产层再接管执行。",
      detail: styleUnlocked
        ? "这里会接住代表作、AI 初稿和你的手改稿，沉淀成 style skill，并输出图文、短视频和直播脚本。"
        : "这一轮先把中枢壳层立起来，后续会新增 style skill、内容资产和发布准备层。",
      href: getAgentRoutePath("STYLE_CONTENT"),
      actionLabel: styleUnlocked ? "进入内容准备" : "查看内容层规划",
      note: "短视频脚本、小红书图文、公众号文章和直播脚本都在这个 Agent 下。",
    },
    {
      key: "DAILY_REVIEW",
      label: "每日复盘 Agent",
      status: "LOCKED",
      summary: "复盘链路会在内容发布记录接入后真正启动，第一版先支持人工录入和基础趋势判断。",
      detail: "当前先保留一个明确入口，后续用 ReviewSnapshot 和长期曲线把发布后反馈拉回系统。",
      href: getAgentRoutePath("DAILY_REVIEW"),
      actionLabel: "查看复盘底座",
      note: "当前先聚焦内容表现和人工回填复盘，不再暴露旧校准页作为主入口。",
    },
    {
      key: "EVOLUTION",
      label: "升级进化 Agent",
      status: evolutionActive ? "REVISIT" : "LOCKED",
      summary: evolutionActive
        ? `当前有 ${input.pendingSuggestionsCount} 条建议值得回看，它们会反向影响画像、风格和方向。`
        : "当复盘和主动学习开始写回系统后，这里会成为画像、风格和策略更新中心。",
      detail: evolutionActive
        ? "先复用现有画像进化建议链路，后续再接入跨阶段长期资产和策略调整。"
        : "这一层不会只是展示建议，而是负责把复盘结果写回长期资产。",
      href: getAgentRoutePath("EVOLUTION"),
      actionLabel: evolutionActive ? "查看升级建议" : "等待进化解锁",
      note: "现有进化建议链路会作为这一层的第一批内核。",
    },
  ];
}

function buildCoordinator(input: {
  hasProfile: boolean;
  currentAgent: CenterAgentKeyValue;
  topicCandidatesCount: number;
  pendingSuggestionsCount: number;
}): CenterCoordinatorPayload {
  const stageSentence =
    input.currentAgent === "IP_EXTRACTION"
      ? "我判断你现在最该先完成一次对话式 IP 提炼。"
      : input.currentAgent === "TOPIC_DIRECTION"
        ? "我判断你已经过了画像起步阶段，现在应该把画像落到方向、主题和选题。"
        : "我判断你已经有了可推进的方向和选题，下一步该进入风格与内容层。";

  return {
    title: "中枢协调器",
    summary: "这里不是把所有能力藏进一个机器人里，而是负责解释系统判断、承接模糊表达，并把你转到正确的阶段 Agent。",
    bullets: [
      stageSentence,
      input.hasProfile
        ? "我已经在用当前画像、方向、选题和升级建议判断你的下一步。"
        : "目前系统还没有稳定画像，所以不会直接跳到选题和内容。",
      input.topicCandidatesCount
        ? `当前已有 ${input.topicCandidatesCount} 条可推进选题，可以直接进入内容生产准备。`
        : "当前还缺少稳定的今日选题储备，因此首页会优先把你推向方向与选题层。",
      input.pendingSuggestionsCount
        ? `还有 ${input.pendingSuggestionsCount} 条升级建议处于待处理状态，后续会写回长期资产。`
        : "升级进化层会在复盘和主动学习结果接入后变成真正的长期更新机制。",
    ],
  };
}

function buildMemory(input: {
  profile: Awaited<ReturnType<typeof getActiveCreatorProfile>>;
  directions: Awaited<ReturnType<typeof getDirections>>;
  topics: Awaited<ReturnType<typeof getTopics>>;
  pendingSuggestionsCount: number;
}): CenterMemorySnapshotPayload[] {
  return [
    {
      label: "当前画像",
      value: input.profile?.positioning || "还没有稳定画像",
      detail: input.profile
        ? `${input.profile.name} · ${input.profile.audience || "受众仍可继续收敛"}`
        : "先完成 IP 提炼，系统才会形成真正的创作者主档。",
    },
    {
      label: "风格底味",
      value: input.profile?.voiceStyle || "风格 skill 尚未建立",
      detail: input.profile?.voiceStyle
        ? "现阶段先复用画像里的表达风格字段，后续会升级成持续迭代的 style skill。"
        : "上传代表作、对比 AI 初稿和你的手改稿，会成为后续 style skill 的基础。",
    },
    {
      label: "最近结论",
      value: input.directions[0]?.title || "还没有稳定方向结论",
      detail: input.directions[0]?.whyNow || "等画像和方向跑通之后，这里会沉淀阶段性结论。",
    },
    {
      label: "主动学习",
      value: input.topics[0]?.title ? `正在跟踪：${input.topics[0].title}` : "主动学习层即将接管热点与风格观察",
      detail: input.topics[0]?.summary || "当前会先复用信号、主题线和选题作为学习底盘。",
    },
    {
      label: "长期曲线",
      value: input.pendingSuggestionsCount ? `${input.pendingSuggestionsCount} 条进化建议待处理` : "复盘曲线将在内容发布后启动",
      detail: input.pendingSuggestionsCount
        ? "这一轮先复用已有进化建议链路，后续会补 ReviewSnapshot 和趋势记录。"
        : "第一版先支持人工回填数据和基础趋势判断，再扩展成长期曲线。",
    },
  ];
}

function buildQuickActions(input: { hasProfile: boolean }): CenterQuickActionPayload[] {
  return [
    {
      label: input.hasProfile ? "继续 IP 提炼" : "开始 IP 提炼",
      description: "用对话式访谈把定位、目标和边界再收敛一轮。",
      href: getAgentRoutePath("IP_EXTRACTION"),
    },
    {
      label: "打开创作者画像",
      description: "查看当前定位、人设、受众、核心议题和内容边界。",
      href: getAgentRoutePath("CREATOR_PROFILE"),
    },
    {
      label: "生成今日选题",
      description: "从方向、主题线和候选题里推进今天最值得做的内容。",
      href: getAgentRoutePath("TOPIC_DIRECTION"),
    },
    {
      label: "查看方向策略",
      description: "回看当前方向、主题线和应该加权的长期主线。",
      href: getAgentRoutePath("TOPIC_DIRECTION"),
    },
    {
      label: "回看升级建议",
      description: "检查哪些画像、风格或策略值得被系统更新。",
      href: getAgentRoutePath("EVOLUTION"),
    },
    {
      label: "进入每日复盘",
      description: "回填表现数据，给系统新的复盘和进化信号。",
      href: getAgentRoutePath("DAILY_REVIEW"),
    },
  ];
}

export async function getCenterHomeData(): Promise<CenterHomePayload> {
  const profile = await getActiveCreatorProfile();

  let directions: Awaited<ReturnType<typeof getDirections>> = [];
  let topics: Awaited<ReturnType<typeof getTopics>> = [];
  let topicCandidates: Awaited<ReturnType<typeof getTopicCandidates>> = [];
  let suggestions: Awaited<ReturnType<typeof getProfileUpdateSuggestions>> = [];

  if (profile) {
    [directions, topics, topicCandidates, suggestions] = await Promise.all([
      getDirections(profile.id),
      getTopics(profile.id),
      getTopicCandidates(profile.id),
      getProfileUpdateSuggestions(profile.id),
    ]);
  }

  const structuredProfileExists = hasProfile(profile);
  const pendingSuggestionsCount = suggestions.filter((item) => item.status === "PENDING").length;
  const currentAgent = determineCurrentAgent({
    hasProfile: structuredProfileExists,
    directionsCount: directions.length,
    topicsCount: topics.length,
    topicCandidatesCount: topicCandidates.length,
  });

  const center = {
    judgment: createJudgment({
      hasProfile: structuredProfileExists,
      directionsCount: directions.length,
      topicsCount: topics.length,
      topicCandidatesCount: topicCandidates.length,
      pendingSuggestionsCount,
    }),
    metrics: [
      {
        label: "当前方向",
        value: String(directions.length),
        detail: "方向层是否已经稳定跑起来。",
      },
      {
        label: "主题线",
        value: String(topics.length),
        detail: "从方向往下沉淀出的可持续主题。",
      },
      {
        label: "今日选题",
        value: String(topicCandidates.length),
        detail: "能直接推进到内容生产的候选题。",
      },
      {
        label: "待处理进化",
        value: String(pendingSuggestionsCount),
        detail: "值得写回画像、风格或策略的建议。",
      },
    ],
    agents: buildAgentCards({
      hasProfile: structuredProfileExists,
      currentAgent,
      directionsCount: directions.length,
      topicsCount: topics.length,
      topicCandidatesCount: topicCandidates.length,
      pendingSuggestionsCount,
    }),
    coordinator: buildCoordinator({
      hasProfile: structuredProfileExists,
      currentAgent,
      topicCandidatesCount: topicCandidates.length,
      pendingSuggestionsCount,
    }),
    memory: buildMemory({
      profile,
      directions,
      topics,
      pendingSuggestionsCount,
    }),
    quickActions: buildQuickActions({
      hasProfile: structuredProfileExists,
    }),
  } satisfies CenterHomePayload;

  try {
    const workspace = await ensureActiveCenterWorkspace({
      creatorProfileId: profile?.id ?? null,
      currentAgentKey: currentAgent,
      recommendedActionLabel: center.judgment.primaryAction.label,
      recommendedActionHref: center.judgment.primaryAction.href,
      lastStageReason: center.judgment.reason,
    });

    await syncCenterAgentThreads({
      workspace,
      currentAgentKey: currentAgent,
      agentSummaries: center.agents,
    });

    await syncHomepageMemorySnapshot({
      workspaceId: workspace.id,
      agentKey: currentAgent,
      items: center.memory,
    });

    center.memory = await getSharedMemorySnapshotProjection(workspace.id, center.memory);
  } catch {
    // Homepage should keep rendering even before migrations are applied.
  }

  return center;
}
