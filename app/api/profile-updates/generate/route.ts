import { NextResponse } from "next/server";
import type { ProfileUpdatesGenerateResponse, TieredGenerationRequest } from "@/lib/domain/contracts";
import { getServiceErrorStatus } from "@/lib/services/service-error";
import { regenerateProfileEvolutionSuggestionsWithTier } from "@/lib/services/profile-evolution-service";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as TieredGenerationRequest;

  try {
    const result = await regenerateProfileEvolutionSuggestionsWithTier(undefined, payload.requestedTier);

    return NextResponse.json<ProfileUpdatesGenerateResponse>({
      ok: true,
      data: {
        createdCount: result.createdCount,
      },
    });
  } catch (error) {
    return NextResponse.json<ProfileUpdatesGenerateResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "生成画像进化建议失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
