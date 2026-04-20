import { NextResponse } from "next/server";
import type { StyleSampleCreateRequest, StyleSampleCreateResponse } from "@/lib/domain/contracts";
import { createStyleSample } from "@/lib/services/style-sample-service";
import { getActiveStyleSkill } from "@/lib/services/style-skill-service";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as StyleSampleCreateRequest;
    const result = await createStyleSample(payload);
    const skill = await getActiveStyleSkill();

    return NextResponse.json<StyleSampleCreateResponse>({
      ok: true,
      data: {
        sample: result.sample,
        skill,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "新增风格样本失败。";
    const status = message.includes("required") ? 400 : 500;

    return NextResponse.json<StyleSampleCreateResponse>(
      {
        ok: false,
        error: message,
      },
      { status },
    );
  }
}
