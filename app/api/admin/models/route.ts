import { NextResponse } from "next/server";
import type { ManagedModelsListResponse } from "@/lib/domain/contracts";
import { getManagedModels } from "@/lib/model-management-data";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function GET() {
  try {
    const models = await getManagedModels();

    return NextResponse.json<ManagedModelsListResponse>({
      ok: true,
      data: {
        models,
      },
    });
  } catch (error) {
    return NextResponse.json<ManagedModelsListResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "读取模型列表失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
