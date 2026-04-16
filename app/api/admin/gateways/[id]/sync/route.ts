import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type { GatewaySyncResponse } from "@/lib/domain/contracts";
import { syncGatewayConnection } from "@/lib/services/gateway-access-admin-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const result = await syncGatewayConnection(id);
    revalidatePath("/admin/gateways");
    revalidatePath("/admin/models");
    revalidatePath("/admin/routing");

    return NextResponse.json<GatewaySyncResponse>({
      ok: true,
      data: {
        modelsCount: result.modelsCount,
        upsertedCount: result.upsertedCount,
      },
    });
  } catch (error) {
    return NextResponse.json<GatewaySyncResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "同步 Provider 模型失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
