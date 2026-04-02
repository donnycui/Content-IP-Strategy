import { NextResponse } from "next/server";
import type { GatewayTestResponse } from "@/lib/domain/contracts";
import { testGatewayConnection } from "@/lib/services/gateway-access-admin-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const result = await testGatewayConnection(id);

    return NextResponse.json<GatewayTestResponse>({
      ok: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json<GatewayTestResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "测试 Provider 连接失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
