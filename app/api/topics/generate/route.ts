import { NextResponse } from "next/server";
import { getServiceErrorStatus } from "@/lib/services/service-error";
import { regenerateTopics } from "@/lib/services/topic-service";

export async function POST() {
  try {
    const result = await regenerateTopics();

    return NextResponse.json({ ok: true, created: result.createdCount });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "生成主题线失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
