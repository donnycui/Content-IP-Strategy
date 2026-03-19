import type { ModelCapabilityKey, ModelGatewayTarget } from "@/lib/models/model-types";
import { executeModelRequest } from "@/lib/models/model-adapter";
import { resolveCapabilityRoute } from "@/lib/services/model-routing-service";

function normalizeTarget(route: Awaited<ReturnType<typeof resolveCapabilityRoute>>["defaultModel"]): ModelGatewayTarget | null {
  if (!route.gatewayBaseUrl || !route.modelKey) {
    return null;
  }

  return {
    gatewayName: route.gatewayName ?? "default-environment",
    baseUrl: route.gatewayBaseUrl,
    gatewayConnectionId: route.gatewayConnectionId,
    managedModelId: route.id,
    authType:
      route.authType === "api_key" || route.authType === "passcode" || route.authType === "none"
        ? route.authType
        : "bearer",
    authSecret: route.authSecret,
    protocol: route.protocol,
    model: route.modelKey,
    providerKey: route.providerKey,
  };
}

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
}: {
  capabilityKey: ModelCapabilityKey;
  systemInstruction: string;
  userPrompt: string;
  metadata?: Record<string, string | number | boolean | null>;
}): Promise<T | null> {
  try {
    const route = await resolveCapabilityRoute(capabilityKey);
    const target = normalizeTarget(route.defaultModel);

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
