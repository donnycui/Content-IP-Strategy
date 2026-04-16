import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type {
  GatewayDeleteResponse,
  GatewayUpdateRequest,
  GatewayUpdateResponse,
} from "@/lib/domain/contracts";
import {
  deleteGatewayConnection,
  updateGatewayConnection,
} from "@/lib/services/gateway-access-admin-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as GatewayUpdateRequest;
    await updateGatewayConnection({
      ...body,
      id,
    });
    revalidatePath("/admin/gateways");
    revalidatePath("/admin/models");
    revalidatePath("/admin/routing");

    return NextResponse.json<GatewayUpdateResponse>({
      ok: true,
      data: {
        updated: true,
      },
    });
  } catch (error) {
    return NextResponse.json<GatewayUpdateResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "更新 Provider 连接失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await deleteGatewayConnection(id);
    revalidatePath("/admin/gateways");
    revalidatePath("/admin/models");
    revalidatePath("/admin/routing");

    return NextResponse.json<GatewayDeleteResponse>({
      ok: true,
      data: {
        deleted: true,
      },
    });
  } catch (error) {
    return NextResponse.json<GatewayDeleteResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "删除 Provider 连接失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
