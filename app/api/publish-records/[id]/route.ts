import { NextResponse } from "next/server";
import type { PublishRecordUpdateRequest, PublishRecordUpdateResponse } from "@/lib/domain/contracts";
import { updatePublishRecord } from "@/lib/services/publish-record-service";

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
    const payload = (await request.json()) as PublishRecordUpdateRequest;
    const { id } = await params;
    await updatePublishRecord({
      id,
      payload,
    });

    return NextResponse.json<PublishRecordUpdateResponse>({
      ok: true,
      data: {
        updated: true,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新发布记录失败。";
    const status = message.includes("required") ? 400 : 500;

    return NextResponse.json<PublishRecordUpdateResponse>(
      {
        ok: false,
        error: message,
      },
      { status },
    );
  }
}
