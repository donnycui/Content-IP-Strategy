import { NextResponse } from "next/server";
import { getServiceErrorStatus } from "@/lib/services/service-error";
import { updateProfileEvolutionSuggestionStatus } from "@/lib/services/profile-evolution-service";

type Payload = {
  status?: "ACCEPTED" | "REJECTED";
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = (await request.json()) as Payload;

  try {
    await updateProfileEvolutionSuggestionStatus(id, payload.status);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "更新画像进化建议失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
