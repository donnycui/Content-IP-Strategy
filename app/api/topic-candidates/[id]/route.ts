import { NextResponse } from "next/server";
import { getServiceErrorStatus } from "@/lib/services/service-error";
import { updateTopicCandidateStatus } from "@/lib/services/topic-candidate-service";

type Payload = {
  status?: "KEPT" | "DEFERRED" | "REJECTED";
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = (await request.json()) as Payload;

  try {
    await updateTopicCandidateStatus(id, payload.status);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "更新选题状态失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
