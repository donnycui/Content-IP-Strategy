import { NextResponse } from "next/server";
import { getServiceErrorStatus } from "@/lib/services/service-error";
import { regenerateTopicCandidates } from "@/lib/services/topic-candidate-service";

export async function POST() {
  try {
    const result = await regenerateTopicCandidates();

    return NextResponse.json({ ok: true, created: result.createdCount });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "生成选题建议失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
