import { NextResponse } from "next/server";
import type { TopicsListResponse } from "@/lib/domain/contracts";
import { getTopicsService } from "@/lib/services/topic-service";

export async function GET() {
  const topics = await getTopicsService();
  return NextResponse.json<TopicsListResponse>({
    ok: true,
    data: {
      topics,
    },
  });
}
