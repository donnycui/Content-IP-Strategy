import { NextResponse } from "next/server";
import type { ContentAssetUpdateRequest, ContentAssetUpdateResponse } from "@/lib/domain/contracts";
import { updateContentAsset } from "@/lib/services/content-asset-service";

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const payload = (await request.json()) as ContentAssetUpdateRequest;
    const { id } = await params;
    const asset = await updateContentAsset({
      id,
      payload,
    });

    return NextResponse.json<ContentAssetUpdateResponse>({
      ok: true,
      data: {
        asset,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新内容资产失败。";
    const status =
      message.includes("required") || message.includes("not found") || message.includes("At least one")
        ? 400
        : 500;

    return NextResponse.json<ContentAssetUpdateResponse>(
      {
        ok: false,
        error: message,
      },
      { status },
    );
  }
}
