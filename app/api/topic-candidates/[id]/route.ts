import { NextResponse } from "next/server";
import type { TopicCandidateStatusUpdateRequest, TopicCandidateStatusUpdateResponse } from "@/lib/domain/contracts";
import { getServiceErrorStatus } from "@/lib/services/service-error";
import { updateTopicCandidateStatus } from "@/lib/services/topic-candidate-service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = (await request.json()) as TopicCandidateStatusUpdateRequest;

  try {
    await updateTopicCandidateStatus(id, payload.status);

    return NextResponse.json<TopicCandidateStatusUpdateResponse>({
      ok: true,
      data: {
        updated: true,
      },
    });
  } catch (error) {
    return NextResponse.json<TopicCandidateStatusUpdateResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "更新选题状态失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
