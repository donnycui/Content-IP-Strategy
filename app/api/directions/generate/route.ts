import { NextResponse } from "next/server";
import { regenerateDirections } from "@/lib/services/direction-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function POST() {
  try {
    const result = await regenerateDirections();

    return NextResponse.json({ ok: true, created: result.createdCount });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "生成方向建议失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
