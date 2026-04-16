import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import type {
  ManagedModelDeleteResponse,
  ManagedModelUpdateRequest,
  ManagedModelUpdateResponse,
} from "@/lib/domain/contracts";
import { deleteManagedModel, updateManagedModel } from "@/lib/services/model-admin-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as ManagedModelUpdateRequest;
    await updateManagedModel({
      ...body,
      id,
    });
    revalidatePath("/admin/gateways");
    revalidatePath("/admin/models");
    revalidatePath("/admin/routing");

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

export async function DELETE(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    await deleteManagedModel(id);
    revalidatePath("/admin/gateways");
    revalidatePath("/admin/models");
    revalidatePath("/admin/routing");

    return NextResponse.json<ManagedModelDeleteResponse>({
      ok: true,
      data: {
        deleted: true,
      },
    });
  } catch (error) {
    return NextResponse.json<ManagedModelDeleteResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "删除模型失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
