import { NextResponse } from "next/server";
import type { GatewaySyncResponse } from "@/lib/domain/contracts";
import { syncGatewayConnection } from "@/lib/services/gateway-admin-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const result = await syncGatewayConnection(id);

    return NextResponse.json<GatewaySyncResponse>({
      ok: true,
      data: {
        providersCount: result.providersCount,
        modelsCount: result.modelsCount,
        upsertedCount: result.upsertedCount,
      },
    });
  } catch (error) {
    return NextResponse.json<GatewaySyncResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "同步网关模型失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
