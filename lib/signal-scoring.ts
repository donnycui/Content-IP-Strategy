import { observationClusterLabels, type ObservationClusterKey } from "@/lib/observation-clusters";
import { executeModelRequest } from "@/lib/models/model-adapter";
import { resolveCapabilityRoute } from "@/lib/services/model-routing-service";

export type ScoringInput = {
  title: string;
  summary?: string | null;
  sourceName?: string | null;
  topicTags?: string[];
  motherTheme?: string | null;
};

export type ScoreOutput = {
  topicTags: string[];
  motherTheme: string;
  primaryObservationCluster: ObservationClusterKey;
  secondaryObservationCluster?: ObservationClusterKey | null;
  importanceScore: number;
  viewpointScore: number;
  consensusStrength: number;
  companyRoutineScore: number;
  structuralScore: number;
  impactScore: number;
  redistributionScore: number;
  durabilityScore: number;
  confidenceScore: number;
  priorityRecommendation: "PRIORITIZE" | "WATCH" | "DEPRIORITIZE";
  reasoningSummary: string;
  reasoningDetail: string;
  modelName: string;
};

export type SignalScoringProvider = {
  name: string;
  score(input: ScoringInput): Promise<ScoreOutput>;
};

type LlmScoringPayload = {
  topicTags?: string[];
  motherTheme?: string;
  primaryObservationCluster?: ObservationClusterKey;
  secondaryObservationCluster?: ObservationClusterKey | null;
  importanceScore?: number;
  viewpointScore?: number;
  consensusStrength?: number;
  companyRoutineScore?: number;
  structuralScore?: number;
  impactScore?: number;
  redistributionScore?: number;
  durabilityScore?: number;
  confidenceScore?: number;
  priorityRecommendation?: "PRIORITIZE" | "WATCH" | "DEPRIORITIZE";
  reasoningSummary?: string;
  reasoningDetail?: string;
};

type OpenAiResponsesApiResult = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

const themeKeywordMap = [
  {
    theme: "Technological revolutions rewrite power structures",
    keywords: ["ai", "semiconductor", "chip", "compute", "cloud", "model", "infrastructure", "platform"],
  },
  {
    theme: "Capital flows reveal era choices",
    keywords: ["capex", "investment", "funding", "valuation", "market", "earnings", "asset", "financing"],
  },
  {
    theme: "Business models are re-evaluated in a new cycle",
    keywords: ["margin", "pricing", "subscription", "distribution", "consumer", "advertising", "platform shift"],
  },
  {
    theme: "Individuals and organizations should reposition",
    keywords: ["labor", "workforce", "operator", "talent", "career", "organization", "productivity"],
  },
] as const;

const topicKeywordMap = [
  { tag: "AI", keywords: ["ai", "model", "llm", "agent"] },
  { tag: "Capex", keywords: ["capex", "capital expenditure", "investment"] },
  { tag: "Cloud", keywords: ["cloud", "datacenter", "compute"] },
  { tag: "Platforms", keywords: ["platform", "distribution", "app store"] },
  { tag: "Margins", keywords: ["margin", "profitability", "pricing"] },
  { tag: "Semiconductors", keywords: ["semiconductor", "chip", "fab"] },
  { tag: "Policy", keywords: ["policy", "regulation", "industrial policy", "tariff"] },
  { tag: "Markets", keywords: ["market", "valuation", "stocks", "capital"] },
] as const;

const observationClusterRules: Array<{
  key: ObservationClusterKey;
  keywords: readonly string[];
}> = [
  { key: "ai_infrastructure_power", keywords: ["ai", "compute", "datacenter", "infrastructure", "model"] },
  { key: "platform_entry_shift", keywords: ["platform", "distribution", "entry point", "search", "assistant"] },
  { key: "strategic_supply_control", keywords: ["semiconductor", "chip", "fab", "supply chain", "capacity"] },
  { key: "compute_capex_cycle", keywords: ["capex", "datacenter", "compute", "investment", "infrastructure spending"] },
  { key: "policy_capital_allocation", keywords: ["policy", "industrial policy", "subsidy", "tariff", "state support"] },
  { key: "risk_repricing_cycle", keywords: ["valuation", "repricing", "risk", "multiple", "market"] },
  { key: "profit_pool_shift", keywords: ["margin", "profit pool", "take rate", "pricing", "monetization"] },
  { key: "distribution_model_break", keywords: ["distribution", "traffic", "channel", "app store", "discovery"] },
  { key: "ai_revenue_rebuild", keywords: ["subscription", "enterprise spend", "revenue", "agent", "pricing model"] },
  { key: "org_efficiency_reorg", keywords: ["workforce", "layoff", "reorg", "efficiency", "headcount"] },
  { key: "individual_capability_shift", keywords: ["talent", "skill", "career", "operator", "productivity"] },
  { key: "sme_positioning_shift", keywords: ["smb", "small business", "mid-market", "operator", "positioning"] },
];

function clampScore(value: number) {
  return Math.max(1, Math.min(5, Number(value.toFixed(1))));
}

function countKeywordHits(text: string, keywords: readonly string[]) {
  return keywords.reduce((count, keyword) => (text.includes(keyword) ? count + 1 : count), 0);
}

function pickMotherTheme(text: string, explicitTheme?: string | null) {
  if (explicitTheme) {
    return explicitTheme;
  }

  const ranked = themeKeywordMap
    .map((entry) => ({
      theme: entry.theme,
      hits: countKeywordHits(text, entry.keywords),
    }))
    .sort((left, right) => right.hits - left.hits);

  return ranked[0]?.hits ? ranked[0].theme : "Business models are re-evaluated in a new cycle";
}

function inferTopicTags(text: string, providedTags?: string[]) {
  const inferred = topicKeywordMap
    .filter((entry) => countKeywordHits(text, entry.keywords) > 0)
    .map((entry) => entry.tag);

  return [...new Set([...(providedTags ?? []), ...inferred])];
}

function inferObservationClusters(text: string): {
  primaryObservationCluster: ObservationClusterKey;
  secondaryObservationCluster?: ObservationClusterKey | null;
} {
  const ranked = observationClusterRules
    .map((entry) => ({
      key: entry.key,
      hits: countKeywordHits(text, entry.keywords),
    }))
    .sort((left, right) => right.hits - left.hits);

  const primaryObservationCluster = ranked[0]?.hits ? ranked[0].key : "distribution_model_break";
  const secondaryObservationCluster =
    ranked[1]?.hits && ranked[1].key !== primaryObservationCluster ? ranked[1].key : null;

  return {
    primaryObservationCluster,
    secondaryObservationCluster,
  };
}

function normalizeLlmPayload(payload: LlmScoringPayload, fallback: ScoreOutput, modelName: string): ScoreOutput {
  return {
    topicTags: payload.topicTags?.length ? [...new Set(payload.topicTags)] : fallback.topicTags,
    motherTheme: payload.motherTheme ?? fallback.motherTheme,
    primaryObservationCluster: payload.primaryObservationCluster ?? fallback.primaryObservationCluster,
    secondaryObservationCluster: payload.secondaryObservationCluster ?? fallback.secondaryObservationCluster,
    importanceScore: clampScore(payload.importanceScore ?? fallback.importanceScore),
    viewpointScore: clampScore(payload.viewpointScore ?? fallback.viewpointScore),
    consensusStrength: clampScore(payload.consensusStrength ?? fallback.consensusStrength),
    companyRoutineScore: clampScore(payload.companyRoutineScore ?? fallback.companyRoutineScore),
    structuralScore: clampScore(payload.structuralScore ?? fallback.structuralScore),
    impactScore: clampScore(payload.impactScore ?? fallback.impactScore),
    redistributionScore: clampScore(payload.redistributionScore ?? fallback.redistributionScore),
    durabilityScore: clampScore(payload.durabilityScore ?? fallback.durabilityScore),
    confidenceScore: clampScore(payload.confidenceScore ?? fallback.confidenceScore),
    priorityRecommendation:
      payload.priorityRecommendation === "PRIORITIZE" ||
      payload.priorityRecommendation === "WATCH" ||
      payload.priorityRecommendation === "DEPRIORITIZE"
        ? payload.priorityRecommendation
        : fallback.priorityRecommendation,
    reasoningSummary: payload.reasoningSummary ?? fallback.reasoningSummary,
    reasoningDetail: payload.reasoningDetail ?? fallback.reasoningDetail,
    modelName,
  };
}

function extractResponsesApiText(result: OpenAiResponsesApiResult) {
  if (result.output_text?.trim()) {
    return result.output_text;
  }

  const fragments =
    result.output
      ?.flatMap((item) => item.content ?? [])
      .filter((item) => item.type === "output_text" && typeof item.text === "string")
      .map((item) => item.text?.trim())
      .filter((item): item is string => Boolean(item)) ?? [];

  return fragments.length ? fragments.join("\n") : null;
}

function inferPriorityRecommendation(scores: {
  importanceScore: number;
  viewpointScore: number;
  consensusStrength: number;
  companyRoutineScore: number;
}) {
  if (scores.companyRoutineScore >= 3.5 && scores.importanceScore < 4.6) {
    return "DEPRIORITIZE" as const;
  }

  if (
    scores.importanceScore >= 4.4 &&
    scores.viewpointScore >= 4 &&
    scores.consensusStrength <= 2.8 &&
    scores.companyRoutineScore <= 2.2
  ) {
    return "PRIORITIZE" as const;
  }

  if (scores.importanceScore >= 4 && (scores.consensusStrength >= 3.6 || scores.companyRoutineScore >= 2.8)) {
    return "WATCH" as const;
  }

  if (scores.importanceScore < 3 || scores.viewpointScore < 2.8) {
    return "DEPRIORITIZE" as const;
  }

  return "WATCH" as const;
}

const heuristicScoringProvider: SignalScoringProvider = {
  name: "heuristic-scorer-v0",
  async score(input) {
    const text = `${input.title} ${input.summary ?? ""}`.toLowerCase();
    const motherTheme = pickMotherTheme(text, input.motherTheme);
    const topicTags = inferTopicTags(text, input.topicTags);
    const { primaryObservationCluster, secondaryObservationCluster } = inferObservationClusters(text);

    const structuralBase =
      2.8 +
      (motherTheme === "Technological revolutions rewrite power structures" ? 1 : 0) +
      countKeywordHits(text, ["infrastructure", "policy", "capex", "platform", "power"]);
    const impactBase = 2.5 + countKeywordHits(text, ["market", "platform", "industry", "capital", "policy"]);
    const redistributionBase = 2.4 + countKeywordHits(text, ["margin", "pricing", "power", "distribution", "leverage"]);
    const durabilityBase = 2.5 + countKeywordHits(text, ["cycle", "longer", "structural", "policy", "infrastructure"]);
    const viewpointBase = 2.7 + countKeywordHits(text, ["hidden", "structural", "beneath", "shift", "reposition"]);
    const consensusBase = 2.2 + countKeywordHits(text, ["consensus", "widely expected", "already known", "priced in"]);
    const routineBase =
      1.8 +
      countKeywordHits(text, ["launch", "release", "partnership", "expands", "announced", "quarter", "earnings"]) -
      countKeywordHits(text, ["industry", "structural", "policy", "bottleneck", "cycle", "platform"]);

    const structuralScore = clampScore(structuralBase * 0.55);
    const impactScore = clampScore(impactBase * 0.6);
    const redistributionScore = clampScore(redistributionBase * 0.62);
    const durabilityScore = clampScore(durabilityBase * 0.6);
    const viewpointScore = clampScore(viewpointBase * 0.58);
    const consensusStrength = clampScore(consensusBase * 0.58);
    const companyRoutineScore = clampScore(routineBase * 0.8);
    const importanceScore = clampScore((structuralScore + impactScore + redistributionScore + durabilityScore) / 4);
    const confidenceScore = clampScore(
      2.8 +
        Math.min(topicTags.length, 2) * 0.4 +
        (input.summary ? 0.5 : 0.1) +
        (input.sourceName ? 0.2 : 0),
    );
    const priorityRecommendation = inferPriorityRecommendation({
      importanceScore,
      viewpointScore,
      consensusStrength,
      companyRoutineScore,
    });

    const reasoningSummary = [
      `This signal maps to "${motherTheme}".`,
      companyRoutineScore >= 4
        ? "It still looks close to company-routine news unless stronger spillover evidence appears."
        : "It does not read as routine company noise.",
      structuralScore >= 4 ? "It looks structurally meaningful rather than cosmetic." : "It carries some structural significance.",
      viewpointScore >= 4
        ? "It also has enough asymmetry to support a differentiated point of view."
        : "It can support a usable directional judgment.",
      consensusStrength >= 4 ? "The current market narrative also looks crowded." : "The narrative still appears open enough for angle-making.",
    ].join(" ");

    const reasoningDetail = [
      `Detected topics: ${topicTags.length ? topicTags.join(", ") : "none yet"}.`,
      `Structural ${structuralScore}, impact ${impactScore}, redistribution ${redistributionScore}, durability ${durabilityScore}.`,
      `Consensus ${consensusStrength}, company-routine noise ${companyRoutineScore}, priority ${priorityRecommendation}.`,
      `Use this as a first-pass score and refine it through operator review.`,
    ].join(" ");

    return {
      topicTags,
      motherTheme,
      primaryObservationCluster,
      secondaryObservationCluster,
      importanceScore,
      viewpointScore,
      consensusStrength,
      companyRoutineScore,
      structuralScore,
      impactScore,
      redistributionScore,
      durabilityScore,
      confidenceScore,
      priorityRecommendation,
      reasoningSummary,
      reasoningDetail,
      modelName: this.name,
    };
  },
};

const llmScoringProvider: SignalScoringProvider = {
  name: "llm-scorer-v0",
  async score(input) {
    const fallback = await heuristicScoringProvider.score(input);
    const prompt = [
      "You are scoring a signal for a content research workbench.",
      "Return only JSON with these keys:",
      "topicTags, motherTheme, primaryObservationCluster, secondaryObservationCluster, importanceScore, viewpointScore, consensusStrength, companyRoutineScore, structuralScore, impactScore, redistributionScore, durabilityScore, confidenceScore, priorityRecommendation, reasoningSummary, reasoningDetail.",
      "Scores must be numbers from 1 to 5.",
      "priorityRecommendation must be one of PRIORITIZE, WATCH, DEPRIORITIZE.",
      `Observation clusters must be chosen only from: ${Object.keys(observationClusterLabels).join(", ")}.`,
      "primaryObservationCluster is required and represents the dominant observation frame.",
      "secondaryObservationCluster is optional and represents a secondary spillover frame. It must not equal primaryObservationCluster.",
      "Mother theme must be one of:",
      '"Technological revolutions rewrite power structures",',
      '"Capital flows reveal era choices",',
      '"Business models are re-evaluated in a new cycle",',
      '"Individuals and organizations should reposition".',
      "Default to conservative filtering.",
      "Use a delayed PRIORITIZE rule. PRIORITIZE should be rare.",
      "Company-routine news should score high on companyRoutineScore and should usually not be prioritized unless it clearly implies industry spillover, capital reallocation, or power migration.",
      "Industry-wide spillover matters more than a company-specific development.",
      "Strong market consensus should not reduce importanceScore, but it should lower priorityRecommendation unless there is still a differentiated angle.",
      "Delay PRIORITIZE when the signal is thin, when spillover is unclear, when the mainstream narrative already looks settled, or when the angle feels sharp but the structural change is still weak.",
      "If there is no clear industry spillover, default to WATCH even when the event looks important.",
      "If the signal mainly shows company routine, default to DEPRIORITIZE unless evidence of broader power shift is explicit.",
      "Only use PRIORITIZE when structural importance is high, non-consensus viewpoint potential is high, company-routine score is low, and consensus strength is not crowded.",
      "If the information is thin, score conservatively and do not guess.",
      "Use concise, operator-facing reasoning.",
      "",
      `Title: ${input.title}`,
      `Summary: ${input.summary ?? ""}`,
      `Source: ${input.sourceName ?? ""}`,
      `Provided topic tags: ${(input.topicTags ?? []).join(", ")}`,
      `Provided mother theme: ${input.motherTheme ?? ""}`,
    ].join("\n");

    try {
      const route = await resolveCapabilityRoute("signal_scoring");

      if (!route.defaultModel.gatewayBaseUrl || !route.defaultModel.modelKey) {
        return {
          ...fallback,
          reasoningDetail: `${fallback.reasoningDetail} 模型路由不可用，已回退到启发式评分。`,
          modelName: `${fallback.modelName}+fallback`,
        };
      }

      const result = await executeModelRequest(
        {
          gatewayName: route.defaultModel.gatewayName ?? "default-environment",
          baseUrl: route.defaultModel.gatewayBaseUrl,
          gatewayConnectionId: route.defaultModel.gatewayConnectionId,
          managedModelId: route.defaultModel.id,
          authType:
            route.defaultModel.authType === "api_key" ||
            route.defaultModel.authType === "passcode" ||
            route.defaultModel.authType === "none"
              ? route.defaultModel.authType
              : "bearer",
          authSecret: route.defaultModel.authSecret,
          protocol: route.defaultModel.protocol,
          model: route.defaultModel.modelKey,
          providerKey: route.defaultModel.providerKey,
        },
        {
          capabilityKey: "signal_scoring",
          messages: [
            {
              role: "user",
              content: prompt,
            },
          ],
          responseFormat: {
            type: "json_object",
          },
        },
      );

      const outputText = result.text;

      if (!outputText) {
        return {
          ...fallback,
          reasoningDetail: `${fallback.reasoningDetail} LLM scoring returned no parsable text payload, so heuristic fallback was used.`,
          modelName: `${fallback.modelName}+fallback`,
        };
      }

      const parsed = JSON.parse(outputText) as LlmScoringPayload;
      return normalizeLlmPayload(parsed, fallback, route.defaultModel.modelKey);
    } catch (error) {
      return {
        ...fallback,
        reasoningDetail: `${fallback.reasoningDetail} LLM scoring threw an error: ${error instanceof Error ? error.message : "unknown error"}. Fallback was used.`,
        modelName: `${fallback.modelName}+fallback`,
      };
    }
  },
};

export function getSignalScoringProvider(): SignalScoringProvider {
  const provider = process.env.SIGNAL_SCORING_PROVIDER ?? "heuristic";

  switch (provider) {
    case "llm":
      return llmScoringProvider;
    case "heuristic":
    default:
      return heuristicScoringProvider;
  }
}

export async function scoreSignal(input: ScoringInput): Promise<ScoreOutput> {
  const provider = getSignalScoringProvider();
  return provider.score(input);
}
