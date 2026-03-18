import { NextResponse } from "next/server";
import type { ProfileGetResponse, ProfileUpdateRequest, ProfileUpdateResponse } from "@/lib/domain/contracts";
import { getActiveCreatorProfileService, updateCreatorProfile } from "@/lib/services/profile-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function GET() {
  const profile = await getActiveCreatorProfileService();
  return NextResponse.json<ProfileGetResponse>({
    ok: true,
    data: {
      profile,
    },
  });
}

export async function PATCH(request: Request) {
  const payload = (await request.json()) as ProfileUpdateRequest;

  try {
    await updateCreatorProfile(payload);

    return NextResponse.json<ProfileUpdateResponse>({
      ok: true,
      data: {
        updated: true,
      },
    });
  } catch (error) {
    return NextResponse.json<ProfileUpdateResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "保存创作者画像失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
