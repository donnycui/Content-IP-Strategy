import { NextResponse } from "next/server";
import { getActiveCreatorProfileService, updateCreatorProfile } from "@/lib/services/profile-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function GET() {
  const profile = await getActiveCreatorProfileService();
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  const payload = (await request.json()) as {
    id?: string;
    name?: string;
    positioning?: string;
    persona?: string;
    audience?: string;
    coreThemes?: string;
    voiceStyle?: string;
    growthGoal?: string;
    contentBoundaries?: string;
    currentStage?: "EXPLORING" | "EMERGING" | "SCALING" | "ESTABLISHED";
  };

  try {
    await updateCreatorProfile(payload);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "保存创作者画像失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
