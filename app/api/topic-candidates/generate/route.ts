import { NextResponse } from "next/server";
import type { TopicCandidatesGenerateResponse } from "@/lib/domain/contracts";
import { getServiceErrorStatus } from "@/lib/services/service-error";
import { regenerateTopicCandidates } from "@/lib/services/topic-candidate-service";

export async function POST() {
  try {
    const result = await regenerateTopicCandidates();

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
