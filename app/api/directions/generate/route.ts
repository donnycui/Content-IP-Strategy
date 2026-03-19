import { NextResponse } from "next/server";
import type { DirectionsGenerateResponse, TieredGenerationRequest } from "@/lib/domain/contracts";
import { regenerateDirectionsWithTier } from "@/lib/services/direction-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as TieredGenerationRequest;

  try {
    const result = await regenerateDirectionsWithTier(undefined, payload.requestedTier);

    return NextResponse.json<DirectionsGenerateResponse>({
      ok: true,
      data: {
        createdCount: result.createdCount,
      },
    });
  } catch (error) {
    return NextResponse.json<DirectionsGenerateResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "生成方向建议失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
