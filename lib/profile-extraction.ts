import type { CreatorProfileDraft } from "@/lib/profile-data";
import { executeModelRequest } from "@/lib/models/model-adapter";
import { resolveCapabilityRoute } from "@/lib/services/model-routing-service";

type ExtractionInput = {
  sourceText: string;
};

function buildFallbackDraft(sourceText: string): CreatorProfileDraft {
  const trimmed = sourceText.trim();
  const summary = trimmed.length > 140 ? `${trimmed.slice(0, 140)}...` : trimmed;

  return {
    name: "未命名创作者",
    positioning: `基于现有输入，系统判断你适合成为一个以知识提炼和判断输出为核心的创作者。${summary ? ` 当前输入重点是：${summary}` : ""}`,
    persona: "结构化、重判断、强调长期方向与行动建议的知识型创作者。",
    audience: "希望提升认知密度、判断质量和内容持续性的高认知受众。",
    coreThemes: "长期议题、结构性变化、方向判断、主题积累、个人品牌增长。",
    voiceStyle: "清晰、克制、结论先行，强调因果链和行动方向。",
    growthGoal: "建立稳定的知识型个人品牌内容系统。",
    contentBoundaries: "不做纯热点搬运，不做情绪驱动表达，不做与长期定位无关的泛内容。",
    currentStage: "EXPLORING",
  };
}

function parseJsonDraft(text: string): CreatorProfileDraft | null {
  try {
    const parsed = JSON.parse(text) as Partial<CreatorProfileDraft>;

    if (!parsed.positioning || !parsed.persona || !parsed.audience) {
      return null;
    }

    return {
      name: parsed.name ?? "未命名创作者",
      positioning: parsed.positioning,
      persona: parsed.persona,
      audience: parsed.audience,
      coreThemes: parsed.coreThemes ?? "",
      voiceStyle: parsed.voiceStyle ?? "",
      growthGoal: parsed.growthGoal ?? "",
      contentBoundaries: parsed.contentBoundaries ?? "",
      currentStage: parsed.currentStage ?? "EXPLORING",
    };
  } catch {
    return null;
  }
}

function extractTextFromResponse(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const record = payload as Record<string, unknown>;

  if (typeof record.output_text === "string" && record.output_text.trim()) {
    return record.output_text.trim();
  }

  if (Array.isArray(record.output)) {
    for (const item of record.output as Array<Record<string, unknown>>) {
      if (!Array.isArray(item.content)) {
        continue;
      }

      for (const content of item.content as Array<Record<string, unknown>>) {
        if (typeof content.text === "string" && content.text.trim()) {
          return content.text.trim();
        }
      }
    }
  }

  return null;
}

export async function extractCreatorProfileDraft({ sourceText }: ExtractionInput): Promise<CreatorProfileDraft> {
  const fallback = buildFallbackDraft(sourceText);

  try {
    const route = await resolveCapabilityRoute("ip_extraction_interview");

    if (!route.defaultModel.gatewayBaseUrl || !route.defaultModel.modelKey) {
      return fallback;
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
      },
      {
        capabilityKey: "ip_extraction_interview",
        systemInstruction:
          "You are an IP extraction assistant for knowledge creators. Return strict JSON with fields: name, positioning, persona, audience, coreThemes, voiceStyle, growthGoal, contentBoundaries, currentStage. currentStage must be one of EXPLORING, EMERGING, SCALING, ESTABLISHED.",
        messages: [
          {
            role: "user",
            content: `请根据下面的创作者自述，提炼成一份知识型创作者画像草案：\n\n${sourceText}`,
          },
        ],
        responseFormat: {
          type: "json_object",
        },
      },
    );

    const text = result.text ? extractTextFromResponse({ output_text: result.text }) : null;
    const parsed = text ? parseJsonDraft(text) : null;

    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}
