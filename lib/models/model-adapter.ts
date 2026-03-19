import {
  ModelExecutionRequest,
  ModelExecutionResult,
  ModelGatewayError,
  ModelGatewayTarget,
} from "@/lib/models/model-types";
import { invokeOpenAiChatCompletions, invokeOpenAiResponses } from "@/lib/models/gateway-client";

export async function executeModelRequest(
  target: ModelGatewayTarget,
  request: ModelExecutionRequest,
): Promise<ModelExecutionResult> {
  switch (target.protocol) {
    case "openai-chat-completions":
      return invokeOpenAiChatCompletions(target, request);
    case "openai-responses":
      return invokeOpenAiResponses(target, request);
    case "anthropic-messages":
      throw new ModelGatewayError("当前适配层尚未接入 Anthropic Messages 协议。", {
        code: "protocol_not_implemented",
      });
    default: {
      const neverProtocol: never = target.protocol;
      throw new ModelGatewayError(`不支持的模型协议：${neverProtocol}`, {
        code: "unsupported_protocol",
      });
    }
  }
}
