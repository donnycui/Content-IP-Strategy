import type { ModelGatewayTarget } from "@/lib/models/model-types";
import type { resolveCapabilityRoute } from "@/lib/services/model-routing-service";

export type ResolvedRouteModel = Awaited<ReturnType<typeof resolveCapabilityRoute>>["defaultModel"];

export function resolveRouteModelTarget(routeModel: ResolvedRouteModel): ModelGatewayTarget | null {
  if (!routeModel.gatewayBaseUrl || !routeModel.modelKey) {
    return null;
  }

  return {
    gatewayName: routeModel.gatewayName ?? "default-environment",
    baseUrl: routeModel.gatewayBaseUrl,
    gatewayConnectionId: routeModel.gatewayConnectionId,
    managedModelId: routeModel.id,
    authType:
      routeModel.authType === "api_key" || routeModel.authType === "passcode" || routeModel.authType === "none"
        ? routeModel.authType
        : "bearer",
    authSecret: routeModel.authSecret,
    protocol: routeModel.protocol,
    model: routeModel.modelKey,
    providerKey: routeModel.providerKey,
  };
}
