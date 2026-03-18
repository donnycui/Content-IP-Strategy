import { NextResponse } from "next/server";
import type { ProfileUpdatesGenerateResponse } from "@/lib/domain/contracts";
import { getServiceErrorStatus } from "@/lib/services/service-error";
import { regenerateProfileEvolutionSuggestions } from "@/lib/services/profile-evolution-service";

export async function POST() {
  try {
    const result = await regenerateProfileEvolutionSuggestions();

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
