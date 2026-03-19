export type ModelCapabilityKey =
  | "signal_scoring"
  | "ip_extraction_interview"
  | "ip_strategy_report"
  | "direction_generation"
  | "topic_generation"
  | "topic_candidate_generation"
  | "profile_evolution"
  | "draft_generation";

export type ModelProtocol =
  | "openai-chat-completions"
  | "openai-responses"
  | "anthropic-messages";

export type ModelMessageRole = "system" | "user" | "assistant";

export type ModelMessage = {
  role: ModelMessageRole;
  content: string;
};

export type ModelResponseFormat =
  | {
      type: "text";
    }
  | {
      type: "json_object";
    };

export type ModelExecutionRequest = {
  capabilityKey: ModelCapabilityKey;
  systemInstruction?: string;
  messages: ModelMessage[];
  responseFormat?: ModelResponseFormat;
  temperature?: number;
  maxOutputTokens?: number;
  metadata?: Record<string, string | number | boolean | null>;
};

export type ModelUsage = {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
};

export type ModelExecutionResult = {
  text: string;
  finishReason?: string | null;
  usage?: ModelUsage;
  raw?: unknown;
};

export type ModelGatewayTarget = {
  gatewayName: string;
  baseUrl: string;
  gatewayConnectionId?: string;
  managedModelId?: string;
  authType?: "none" | "bearer" | "api_key" | "passcode";
  authSecret?: string;
  protocol: ModelProtocol;
  model: string;
  providerKey?: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export class ModelGatewayError extends Error {
  code: string;
  status?: number;
  details?: unknown;

  constructor(message: string, options: { code: string; status?: number; details?: unknown }) {
    super(message);
    this.name = "ModelGatewayError";
    this.code = options.code;
    this.status = options.status;
    this.details = options.details;
  }
}
