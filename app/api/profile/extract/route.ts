import { NextResponse } from "next/server";
import type { ProfileExtractRequest, ProfileExtractResponse } from "@/lib/domain/contracts";
import { extractCreatorProfileAndActivateWithTier } from "@/lib/services/profile-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function POST(request: Request) {
  const payload = (await request.json()) as ProfileExtractRequest;

  try {
    const result = await extractCreatorProfileAndActivateWithTier(payload.sourceText ?? "", payload.requestedTier);

    return NextResponse.json<ProfileExtractResponse>({
      ok: true,
      data: {
        profileId: result.profileId,
      },
    });
  } catch (error) {
    return NextResponse.json<ProfileExtractResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "IP 提炼失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
