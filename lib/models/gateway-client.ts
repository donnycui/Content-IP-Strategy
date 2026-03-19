import {
  ModelExecutionRequest,
  ModelExecutionResult,
  ModelGatewayError,
  ModelGatewayTarget,
  ModelUsage,
} from "@/lib/models/model-types";

type OpenAiChatCompletionsResponse = {
  id?: string;
  model?: string;
  choices?: Array<{
    finish_reason?: string | null;
    message?: {
      role?: string;
      content?: string | null;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: {
    message?: string;
    code?: string;
    type?: string;
  };
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

function buildGatewayHeaders(target: ModelGatewayTarget) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (!target.authSecret) {
    return headers;
  }

  switch (target.authType ?? "bearer") {
    case "none":
      return headers;
    case "api_key":
      headers["x-api-key"] = target.authSecret;
      return headers;
    case "passcode":
      headers["x-passcode"] = target.authSecret;
      return headers;
    case "bearer":
    default:
      headers.Authorization = `Bearer ${target.authSecret}`;
      return headers;
  }
}

function normalizeUsage(usage?: OpenAiChatCompletionsResponse["usage"]): ModelUsage | undefined {
  if (!usage) {
    return undefined;
  }

  return {
    inputTokens: usage.prompt_tokens,
    outputTokens: usage.completion_tokens,
    totalTokens: usage.total_tokens,
  };
}

export async function invokeOpenAiChatCompletions(
  target: ModelGatewayTarget,
  request: ModelExecutionRequest,
): Promise<ModelExecutionResult> {
  const endpoint = `${trimTrailingSlash(target.baseUrl)}/v1/chat/completions`;

  const messages = [
    ...(request.systemInstruction
      ? [
          {
            role: "system",
            content: request.systemInstruction,
          },
        ]
      : []),
    ...request.messages,
  ];

  const body: Record<string, unknown> = {
    model: target.model,
    messages,
  };

  if (typeof request.temperature === "number") {
    body.temperature = request.temperature;
  }

  if (typeof request.maxOutputTokens === "number") {
    body.max_tokens = request.maxOutputTokens;
  }

  if (request.responseFormat?.type === "json_object") {
    body.response_format = { type: "json_object" };
  }

  if (request.metadata && Object.keys(request.metadata).length > 0) {
    body.metadata = request.metadata;
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: buildGatewayHeaders(target),
    body: JSON.stringify(body),
  });

  const payload = (await response.json().catch(() => null)) as OpenAiChatCompletionsResponse | null;

  if (!response.ok) {
    throw new ModelGatewayError(payload?.error?.message ?? "模型网关调用失败。", {
      code: payload?.error?.code ?? "gateway_request_failed",
      status: response.status,
      details: payload,
    });
  }

  const text = payload?.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new ModelGatewayError("模型网关返回了空内容。", {
      code: "empty_model_response",
      status: response.status,
      details: payload,
    });
  }

  return {
    text,
    finishReason: payload?.choices?.[0]?.finish_reason ?? null,
    usage: normalizeUsage(payload?.usage),
    raw: payload,
  };
}
