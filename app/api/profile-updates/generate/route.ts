import { NextResponse } from "next/server";
import { getServiceErrorStatus } from "@/lib/services/service-error";
import { regenerateProfileEvolutionSuggestions } from "@/lib/services/profile-evolution-service";

export async function POST() {
  try {
    const result = await regenerateProfileEvolutionSuggestions();

    return NextResponse.json({ ok: true, created: result.createdCount });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "生成画像进化建议失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
