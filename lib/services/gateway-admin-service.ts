import { GatewayAuthType, GatewayHealthStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { syncGatewayConnectionModels } from "@/lib/services/gateway-sync-service";
import { ServiceError } from "@/lib/services/service-error";

type CreateGatewayInput = {
  name?: string;
  baseUrl?: string;
  authType?: GatewayAuthType;
  authSecretRef?: string;
};

function trimTrailingSlash(value: string) {
  return value.replace(/\/$/, "");
}

function buildGatewayHeaders(authType: GatewayAuthType, authSecretRef?: string | null) {
  const headers: Record<string, string> = {};

  if (!authSecretRef) {
    return headers;
  }

  const secret = process.env[authSecretRef];

  if (!secret) {
    throw new ServiceError(`网关密钥变量 ${authSecretRef} 未配置。`, 500, "GATEWAY_SECRET_MISSING");
  }

  switch (authType) {
    case "NONE":
      return headers;
    case "API_KEY":
      headers["x-api-key"] = secret;
      return headers;
    case "PASSCODE":
      headers["x-passcode"] = secret;
      return headers;
    case "BEARER":
    default:
      headers.Authorization = `Bearer ${secret}`;
      return headers;
  }
}

export async function createGatewayConnection(input: CreateGatewayInput) {
  if (!process.env.DATABASE_URL) {
    throw new ServiceError("DATABASE_URL is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const name = input.name?.trim();
  const baseUrl = input.baseUrl?.trim();

  if (!name || !baseUrl) {
    throw new ServiceError("请填写网关名称和 Base URL。", 400, "GATEWAY_FIELDS_REQUIRED");
  }

  const gateway = await prisma.gatewayConnection.create({
    data: {
      name,
      baseUrl: trimTrailingSlash(baseUrl),
      authType: input.authType ?? "NONE",
      authSecretRef: input.authSecretRef?.trim() || null,
      isActive: true,
      healthStatus: "UNKNOWN",
    },
    select: {
      id: true,
    },
  });

  return { gatewayId: gateway.id };
}

export async function testGatewayConnection(gatewayConnectionId: string) {
  if (!process.env.DATABASE_URL) {
    throw new ServiceError("DATABASE_URL is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const gateway = await prisma.gatewayConnection.findUnique({
    where: {
      id: gatewayConnectionId,
    },
  });

  if (!gateway) {
    throw new ServiceError("网关连接不存在。", 404, "GATEWAY_NOT_FOUND");
  }

  const headers = buildGatewayHeaders(gateway.authType, gateway.authSecretRef);
  const baseUrl = trimTrailingSlash(gateway.baseUrl);

  try {
    const [providersResponse, modelsResponse] = await Promise.all([
      fetch(`${baseUrl}/v1/providers`, { headers }),
      fetch(`${baseUrl}/v1/models`, { headers }),
    ]);

    const healthy = providersResponse.ok && modelsResponse.ok;

    await prisma.gatewayConnection.update({
      where: {
        id: gateway.id,
      },
      data: {
        healthStatus: healthy ? GatewayHealthStatus.HEALTHY : GatewayHealthStatus.DEGRADED,
      },
    });

    return {
      healthy,
      providersStatus: providersResponse.status,
      modelsStatus: modelsResponse.status,
    };
  } catch (error) {
    await prisma.gatewayConnection.update({
      where: {
        id: gateway.id,
      },
      data: {
        healthStatus: GatewayHealthStatus.ERROR,
      },
    });

    throw new ServiceError(
      error instanceof Error ? `网关测试失败：${error.message}` : "网关测试失败。",
      502,
      "GATEWAY_TEST_FAILED",
    );
  }
}

export async function syncGatewayConnection(gatewayConnectionId: string) {
  return syncGatewayConnectionModels(gatewayConnectionId);
}
