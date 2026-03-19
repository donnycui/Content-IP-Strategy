import { executeStructuredGeneration } from "@/lib/services/structured-generation-service";

type StrategyReportPayload = {
  title?: string;
  eventDefinition?: string;
  mainstreamNarrative?: string;
  ignoredVariables?: string;
  historicalAnalogy?: string;
  threeMonthProjection?: string;
  oneYearProjection?: string;
  winnersLosers?: string;
  positioningJudgment?: string;
};

type ResearchCardInput = {
  title: string;
  eventDefinition: string | null;
  mainstreamNarrative: string | null;
  ignoredVariables: string | null;
  historicalAnalogy: string | null;
  threeMonthProjection: string | null;
  oneYearProjection: string | null;
  winnersLosers: string | null;
  positioningJudgment: string | null;
  clusterTitle?: string | null;
  clusterSummary?: string | null;
  signals?: Array<{
    title: string;
    source?: string | null;
    reasoningSummary?: string | null;
    importanceScore?: number | null;
  }>;
};

export async function generateResearchCardStrategyReport(input: ResearchCardInput) {
  return generateResearchCardStrategyReportWithTier(input);
}

export async function generateResearchCardStrategyReportWithTier(
  input: ResearchCardInput,
  requestedTier?: "FAST" | "BALANCED" | "DEEP",
) {
  const payload = await executeStructuredGeneration<StrategyReportPayload>({
    capabilityKey: "ip_strategy_report",
    systemInstruction:
      "你是知识型创作者平台里的 IP 战略报告助手。请基于研究卡和支撑信号，输出一份更完整、更结构化的战略判断结果。返回严格 JSON，字段为 title, eventDefinition, mainstreamNarrative, ignoredVariables, historicalAnalogy, threeMonthProjection, oneYearProjection, winnersLosers, positioningJudgment。内容必须使用中文，不要输出多余解释。",
    userPrompt: JSON.stringify(
      {
        researchCard: input,
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

  if (!payload) {
    return null;
  }

  return {
    title: payload.title?.trim() || input.title,
    eventDefinition: payload.eventDefinition?.trim() || input.eventDefinition || "",
    mainstreamNarrative: payload.mainstreamNarrative?.trim() || input.mainstreamNarrative || "",
    ignoredVariables: payload.ignoredVariables?.trim() || input.ignoredVariables || "",
    historicalAnalogy: payload.historicalAnalogy?.trim() || input.historicalAnalogy || "",
    threeMonthProjection: payload.threeMonthProjection?.trim() || input.threeMonthProjection || "",
    oneYearProjection: payload.oneYearProjection?.trim() || input.oneYearProjection || "",
    winnersLosers: payload.winnersLosers?.trim() || input.winnersLosers || "",
    positioningJudgment: payload.positioningJudgment?.trim() || input.positioningJudgment || "",
  };
}
