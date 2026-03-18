import { NextResponse } from "next/server";
import type { TopicCandidatesListResponse } from "@/lib/domain/contracts";
import { getTopicCandidatesService } from "@/lib/services/topic-candidate-service";

export async function GET() {
  const candidates = await getTopicCandidatesService();
  return NextResponse.json<TopicCandidatesListResponse>({
    ok: true,
    data: {
      candidates,
    },
  });
}
