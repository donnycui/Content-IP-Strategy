import { NextResponse } from "next/server";
import type { TieredGenerationRequest, TopicsGenerateResponse } from "@/lib/domain/contracts";
import { getServiceErrorStatus } from "@/lib/services/service-error";
import { regenerateTopicsWithTier } from "@/lib/services/topic-service";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as TieredGenerationRequest;

  try {
    const result = await regenerateTopicsWithTier(undefined, payload.requestedTier);

    return NextResponse.json<TopicsGenerateResponse>({
      ok: true,
      data: {
        createdCount: result.createdCount,
      },
    });
  } catch (error) {
    return NextResponse.json<TopicsGenerateResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "生成主题线失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
