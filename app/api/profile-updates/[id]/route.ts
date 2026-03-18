import { NextResponse } from "next/server";
import type { ProfileUpdateStatusRequest, ProfileUpdateStatusResponse } from "@/lib/domain/contracts";
import { getServiceErrorStatus } from "@/lib/services/service-error";
import { updateProfileEvolutionSuggestionStatus } from "@/lib/services/profile-evolution-service";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const payload = (await request.json()) as ProfileUpdateStatusRequest;

  try {
    await updateProfileEvolutionSuggestionStatus(id, payload.status);

    return NextResponse.json<ProfileUpdateStatusResponse>({
      ok: true,
      data: {
        updated: true,
      },
    });
  } catch (error) {
    return NextResponse.json<ProfileUpdateStatusResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "更新画像进化建议失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
