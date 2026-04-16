import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type {
  PlanModelAccessListResponse,
  PlanModelAccessUpsertRequest,
  PlanModelAccessUpsertResponse,
} from "@/lib/domain/contracts";
import { getPlanModelAccessRows } from "@/lib/model-management-data";
import { upsertPlanModelAccess } from "@/lib/services/plan-model-access-admin-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function GET() {
  try {
    const scopes = await getPlanModelAccessRows();

    return NextResponse.json<PlanModelAccessListResponse>({
      ok: true,
      data: {
        scopes,
      },
    });
  } catch (error) {
    return NextResponse.json<PlanModelAccessListResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "读取套餐模型权限失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PlanModelAccessUpsertRequest;

    await upsertPlanModelAccess({
      planKey: body.planKey,
      capabilityKey: body.capabilityKey ?? null,
      allowedTiers: body.allowedTiers,
      canSelectModel: body.canSelectModel,
      canUsePremiumReasoning: body.canUsePremiumReasoning,
    });
    revalidatePath("/admin/plans");

    return NextResponse.json<PlanModelAccessUpsertResponse>({
      ok: true,
      data: {
        updated: true,
      },
    });
  } catch (error) {
    return NextResponse.json<PlanModelAccessUpsertResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "保存套餐模型权限失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
