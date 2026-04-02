import { GatewayAuthType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  syncGatewayAliasCatalog,
  testGatewayAliasAccess,
} from "@/lib/services/gateway-alias-integration";
import { ServiceError } from "@/lib/services/service-error";

type CreateGatewayInput = {
  name?: string;
  baseUrl?: string;
  authType?: GatewayAuthType;
  authSecretRef?: string;
};

type UpdateGatewayInput = {
  id?: string;
  isActive?: boolean;
};

export async function createGatewayConnection(input: CreateGatewayInput) {
  if (!process.env.DATABASE_URL) {
    throw new ServiceError("DATABASE_URL is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const name = input.name?.trim();
  const baseUrl = input.baseUrl?.trim();

  if (!name || !baseUrl) {
    throw new ServiceError("Please provide a gateway name and base URL.", 400, "GATEWAY_FIELDS_REQUIRED");
  }

  const gateway = await prisma.gatewayConnection.create({
    data: {
      name,
      baseUrl: baseUrl.replace(/\/$/, ""),
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

export async function updateGatewayConnection(input: UpdateGatewayInput) {
  if (!process.env.DATABASE_URL) {
    throw new ServiceError("DATABASE_URL is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  if (!input.id || typeof input.isActive !== "boolean") {
    throw new ServiceError("Gateway update payload is incomplete.", 400, "GATEWAY_UPDATE_FIELDS_REQUIRED");
  }

  const gateway = await prisma.gatewayConnection.findUnique({
    where: {
      id: input.id,
    },
    include: {
      managedModels: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!gateway) {
    throw new ServiceError("Gateway access not found.", 404, "GATEWAY_NOT_FOUND");
  }

  if (!input.isActive) {
    const modelIds = gateway.managedModels.map((model) => model.id);

    if (modelIds.length) {
      const referencedRoute = await prisma.capabilityRoute.findFirst({
        where: {
          OR: [
            {
              defaultModelId: {
                in: modelIds,
              },
            },
            {
              fallbackModelId: {
                in: modelIds,
              },
            },
          ],
        },
        select: {
          capabilityKey: true,
        },
      });

      if (referencedRoute) {
        throw new ServiceError(
          `This gateway access is still referenced by capability route ${referencedRoute.capabilityKey}. Switch the route first.`,
          409,
          "GATEWAY_IN_USE",
        );
      }
    }
  }

  await prisma.gatewayConnection.update({
    where: {
      id: input.id,
    },
    data: {
      isActive: input.isActive,
    },
  });

  return { updated: true as const };
}

export async function deleteGatewayConnection(gatewayConnectionId: string) {
  if (!process.env.DATABASE_URL) {
    throw new ServiceError("DATABASE_URL is not configured.", 503, "DATABASE_UNAVAILABLE");
  }

  const gateway = await prisma.gatewayConnection.findUnique({
    where: {
      id: gatewayConnectionId,
    },
    include: {
      managedModels: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!gateway) {
    throw new ServiceError("Gateway access not found.", 404, "GATEWAY_NOT_FOUND");
  }

  const modelIds = gateway.managedModels.map((model) => model.id);

  if (modelIds.length) {
    const referencedRoute = await prisma.capabilityRoute.findFirst({
      where: {
        OR: [
          {
            defaultModelId: {
              in: modelIds,
            },
          },
          {
            fallbackModelId: {
              in: modelIds,
            },
          },
        ],
      },
      select: {
        capabilityKey: true,
      },
    });

    if (referencedRoute) {
      throw new ServiceError(
        `This gateway access still has aliases referenced by capability route ${referencedRoute.capabilityKey}. Switch the route first.`,
        409,
        "GATEWAY_IN_USE",
      );
    }
  }

  await prisma.gatewayConnection.delete({
    where: {
      id: gatewayConnectionId,
    },
  });

  return { deleted: true as const };
}

export async function testGatewayConnection(gatewayConnectionId: string) {
  return testGatewayAliasAccess(gatewayConnectionId);
}

export async function syncGatewayConnection(gatewayConnectionId: string) {
  return syncGatewayAliasCatalog(gatewayConnectionId);
}
