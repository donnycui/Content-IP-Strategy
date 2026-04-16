import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type {
  ManagedModelCreateRequest,
  ManagedModelCreateResponse,
  ManagedModelsListResponse,
} from "@/lib/domain/contracts";
import { getManagedModels } from "@/lib/model-management-data";
import { createManagedModel } from "@/lib/services/model-admin-service";
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

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ManagedModelCreateRequest;
    await createManagedModel(body);
    revalidatePath("/admin/gateways");
    revalidatePath("/admin/models");
    revalidatePath("/admin/routing");

    return NextResponse.json<ManagedModelCreateResponse>({
      ok: true,
      data: {
        created: true,
      },
    });
  } catch (error) {
    return NextResponse.json<ManagedModelCreateResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "新增模型失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
