import { NextResponse } from "next/server";
import type { TopicsGenerateResponse } from "@/lib/domain/contracts";
import { getServiceErrorStatus } from "@/lib/services/service-error";
import { regenerateTopics } from "@/lib/services/topic-service";

export async function POST() {
  try {
    const result = await regenerateTopics();

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
