import { resolveRouteModelTarget } from "@/lib/models/route-target";
import type { ModelCapabilityKey } from "@/lib/models/model-types";
import { executeModelRequest } from "@/lib/models/model-adapter";
import { resolveCapabilityRoute } from "@/lib/services/model-routing-service";

function stripCodeFence(text: string) {
  const trimmed = text.trim();

  if (trimmed.startsWith("```")) {
    return trimmed.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  return trimmed;
}

export function parseStructuredJson<T>(text: string): T | null {
  try {
    return JSON.parse(stripCodeFence(text)) as T;
  } catch {
    return null;
  }
}

export async function executeStructuredGeneration<T>({
  capabilityKey,
  systemInstruction,
  userPrompt,
  metadata,
  requestedTier,
}: {
  capabilityKey: ModelCapabilityKey;
  systemInstruction: string;
  userPrompt: string;
  metadata?: Record<string, string | number | boolean | null>;
  requestedTier?: "FAST" | "BALANCED" | "DEEP";
}): Promise<T | null> {
  try {
    const route = await resolveCapabilityRoute(capabilityKey, {
      requestedTier: requestedTier ?? null,
    });
    const target = resolveRouteModelTarget(route.defaultModel);

    if (!target) {
      return null;
    }

    const result = await executeModelRequest(target, {
      capabilityKey,
      systemInstruction,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
      responseFormat: {
        type: "json_object",
      },
      metadata,
    });

    return parseStructuredJson<T>(result.text);
  } catch {
    return null;
  }
}
