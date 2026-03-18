import { NextResponse } from "next/server";
import { extractCreatorProfileAndActivate } from "@/lib/services/profile-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function POST(request: Request) {
  const payload = (await request.json()) as { sourceText?: string };

  try {
    const result = await extractCreatorProfileAndActivate(payload.sourceText ?? "");

    return NextResponse.json({ ok: true, profileId: result.profileId });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "IP 提炼失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
