import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type {
  GatewayConnectionsListResponse,
  GatewayCreateRequest,
  GatewayCreateResponse,
} from "@/lib/domain/contracts";
import { getGatewayConnections } from "@/lib/model-management-data";
import { createGatewayConnection } from "@/lib/services/gateway-access-admin-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function GET() {
  try {
    const gateways = await getGatewayConnections();

    return NextResponse.json<GatewayConnectionsListResponse>({
      ok: true,
      data: {
        gateways,
      },
    });
  } catch (error) {
    return NextResponse.json<GatewayConnectionsListResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "读取 Provider 连接失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GatewayCreateRequest;
    const result = await createGatewayConnection(body);
    revalidatePath("/admin/gateways");

    return NextResponse.json<GatewayCreateResponse>({
      ok: true,
      data: {
        gatewayId: result.gatewayId,
      },
    });
  } catch (error) {
    return NextResponse.json<GatewayCreateResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "创建 Provider 连接失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
