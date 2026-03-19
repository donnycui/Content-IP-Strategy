import { NextResponse } from "next/server";
import type { TieredGenerationRequest, TopicCandidatesGenerateResponse } from "@/lib/domain/contracts";
import { getServiceErrorStatus } from "@/lib/services/service-error";
import { regenerateTopicCandidatesWithTier } from "@/lib/services/topic-candidate-service";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as TieredGenerationRequest;

  try {
    const result = await regenerateTopicCandidatesWithTier(undefined, payload.requestedTier);

    return NextResponse.json<TopicCandidatesGenerateResponse>({
      ok: true,
      data: {
        createdCount: result.createdCount,
      },
    });
  } catch (error) {
    return NextResponse.json<TopicCandidatesGenerateResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "生成选题建议失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
