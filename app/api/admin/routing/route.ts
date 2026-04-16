import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type {
  CapabilityRoutesListResponse,
  CapabilityRouteUpsertRequest,
  CapabilityRouteUpsertResponse,
} from "@/lib/domain/contracts";
import { getCapabilityRoutes } from "@/lib/model-management-data";
import { upsertCapabilityRoute } from "@/lib/services/capability-route-admin-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function GET() {
  try {
    const routes = await getCapabilityRoutes();

    return NextResponse.json<CapabilityRoutesListResponse>({
      ok: true,
      data: {
        routes,
      },
    });
  } catch (error) {
    return NextResponse.json<CapabilityRoutesListResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "读取能力路由失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CapabilityRouteUpsertRequest;
    await upsertCapabilityRoute(body);
    revalidatePath("/admin/gateways");
    revalidatePath("/admin/models");
    revalidatePath("/admin/routing");

    return NextResponse.json<CapabilityRouteUpsertResponse>({
      ok: true,
      data: {
        updated: true,
      },
    });
  } catch (error) {
    return NextResponse.json<CapabilityRouteUpsertResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "保存能力路由失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
