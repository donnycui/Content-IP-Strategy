export type SignalRow = {
  id: string;
  title: string;
  source: string;
  publishedAt: string;
  topicTags: string[];
  motherTheme: string;
  primaryObservationCluster: string;
  secondaryObservationCluster?: string | null;
  importanceScore: number;
  viewpointScore: number;
  consensusStrength: number;
  companyRoutineScore: number;
  priorityRecommendation: "PRIORITIZE" | "WATCH" | "DEPRIORITIZE";
  reasoningSummary: string;
  status: "NEW" | "REVIEWED" | "CANDIDATE" | "DEFERRED" | "IGNORED" | "ARCHIVED";
};

export const mockSignals: SignalRow[] = [
  {
    id: "signal-ai-capex",
    title: "云厂商资本开支加速，说明 AI 基础设施正在成为新的权力瓶颈",
    source: "金融时报",
    publishedAt: "2026-03-14 08:20",
    topicTags: ["人工智能", "资本开支", "云计算"],
    motherTheme: "资本流向如何预示时代选择",
    primaryObservationCluster: "AI 基础设施权力集中",
    secondaryObservationCluster: "算力与基础设施资本开支",
    importanceScore: 4.8,
    viewpointScore: 4.5,
    consensusStrength: 2.4,
    companyRoutineScore: 1.4,
    priorityRecommendation: "PRIORITIZE",
    reasoningSummary: "这不是一个产品故事，而是隐藏在基础设施投入背后的权力集中故事。",
    status: "CANDIDATE",
  },
  {
    id: "signal-platform-margin",
    title: "消费互联网利润率承压，分发权力正在向新的 AI 原生入口迁移",
    source: "The Information",
    publishedAt: "2026-03-14 07:45",
    topicTags: ["平台", "利润率", "人工智能"],
    motherTheme: "商业模式如何在新周期里重估",
    primaryObservationCluster: "平台利润池迁移",
    secondaryObservationCluster: "平台入口权迁移",
    importanceScore: 4.2,
    viewpointScore: 4.7,
    consensusStrength: 2.8,
    companyRoutineScore: 2.1,
    priorityRecommendation: "PRIORITIZE",
    reasoningSummary: "这条信号的重要性在于，它把利润率压力重新定义为结构性的分发位移，而不是暂时性疲弱。",
    status: "NEW",
  },
  {
    id: "signal-policy-semiconductor",
    title: "新一轮半导体政策组合，指向更长周期的产业集中趋势",
    source: "路透",
    publishedAt: "2026-03-14 06:10",
    topicTags: ["半导体", "政策", "产业"],
    motherTheme: "技术革命如何改写权力结构",
    primaryObservationCluster: "半导体与关键供给控制",
    secondaryObservationCluster: "政策驱动型产业投资",
    importanceScore: 4.6,
    viewpointScore: 4.1,
    consensusStrength: 4.4,
    companyRoutineScore: 1.6,
    priorityRecommendation: "WATCH",
    reasoningSummary: "具体政策细节并不是最重要的，更关键的是战略产能会持续被政治化定价。",
    status: "DEFERRED",
  },
];

export const mockResearchCard = {
  title: "AI 基础设施正在成为重组议价权的稀缺层",
  eventDefinition:
    "云与算力提供商的资本开支加速，指向的是一场围绕基础设施控制权的结构性竞争，而不是短期投入脉冲。",
  mainstreamNarrative:
    "主流叙事通常把它理解为一个与短期模型采用相关的业绩和需求故事。",
  ignoredVariables:
    "被忽略的变量是议价权。谁掌握瓶颈基础设施，谁就能重塑定价权、平台杠杆和下游利润池。",
  historicalAnalogy:
    "这一局面类似过去网络与移动平台建设期：在应用层趋于常态化之前，稀缺层率先拿走超额战略控制权。",
  threeMonthProjection:
    "接下来三个月，市场叙事仍会聚焦需求侧，但真正的竞争会转向供给锁定、融资能力和战略合作。",
  oneYearProjection:
    "一年维度看，赢家更可能是那些能把资本开支转化成切换成本与跨软件、企业分发协调权的基础设施提供者。",
  winnersLosers:
    "基础设施拥有者和关键供应商将获得更强杠杆；缺少分发能力或资本厚度的薄层应用公司会失去可选性。",
  positioningJudgment:
    "高认知个体真正该盯的是基础设施控制权，而不是 headline 级别的模型发布，因为权力整合正在那里发生。",
};
