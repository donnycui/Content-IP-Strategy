import {
  ModelExecutionRequest,
  ModelExecutionResult,
  ModelGatewayError,
  ModelGatewayTarget,
} from "@/lib/models/model-types";
import { invokeOpenAiChatCompletions, invokeOpenAiResponses } from "@/lib/models/gateway-client";
import { prisma } from "@/lib/prisma";

async function recordModelUsage(args: {
  target: ModelGatewayTarget;
  request: ModelExecutionRequest;
  latencyMs: number;
  success: boolean;
  errorCode?: string;
}) {
  if (!process.env.DATABASE_URL || !args.target.gatewayConnectionId || !args.target.managedModelId) {
    return;
  }

  try {
    await prisma.modelUsageLog.create({
      data: {
        gatewayConnectionId: args.target.gatewayConnectionId,
        modelId: args.target.managedModelId,
        capabilityKey: args.request.capabilityKey,
        channel:
          typeof args.request.metadata?.channel === "string"
            ? args.request.metadata.channel
            : "web",
        latencyMs: args.latencyMs,
        success: args.success,
        errorCode: args.errorCode,
      },
    });
  } catch {
    // Usage logging must never break the calling workflow.
  }
}

export async function executeModelRequest(
  target: ModelGatewayTarget,
  request: ModelExecutionRequest,
): Promise<ModelExecutionResult> {
  const startedAt = Date.now();

  try {
    let result: ModelExecutionResult;

    switch (target.protocol) {
      case "openai-chat-completions":
        result = await invokeOpenAiChatCompletions(target, request);
        break;
      case "openai-responses":
        result = await invokeOpenAiResponses(target, request);
        break;
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

    await recordModelUsage({
      target,
      request,
      latencyMs: Date.now() - startedAt,
      success: true,
    });

    return result;
  } catch (error) {
    await recordModelUsage({
      target,
      request,
      latencyMs: Date.now() - startedAt,
      success: false,
      errorCode: error instanceof ModelGatewayError ? error.code : "unknown_error",
    });

    throw error;
  }
}
