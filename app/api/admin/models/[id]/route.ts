import { NextRequest, NextResponse } from "next/server";
import type { ManagedModelUpdateRequest, ManagedModelUpdateResponse } from "@/lib/domain/contracts";
import { updateManagedModel } from "@/lib/services/model-admin-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as ManagedModelUpdateRequest;
    await updateManagedModel({
      ...body,
      id,
    });

    return NextResponse.json<ManagedModelUpdateResponse>({
      ok: true,
      data: {
        updated: true,
      },
    });
  } catch (error) {
    return NextResponse.json<ManagedModelUpdateResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "更新模型失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
