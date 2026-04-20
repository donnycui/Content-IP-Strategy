import { NextResponse } from "next/server";
import type { StyleRevisionCreateRequest, StyleRevisionCreateResponse } from "@/lib/domain/contracts";
import { createStyleRevision } from "@/lib/services/style-revision-service";
import { getActiveStyleSkill } from "@/lib/services/style-skill-service";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as StyleRevisionCreateRequest;
    const result = await createStyleRevision(payload);
    const skill = await getActiveStyleSkill();

    return NextResponse.json<StyleRevisionCreateResponse>({
      ok: true,
      data: {
        revision: result.revision,
        skill,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "记录风格修订失败。";
    const status = message.includes("required") ? 400 : 500;

    return NextResponse.json<StyleRevisionCreateResponse>(
      {
        ok: false,
        error: message,
      },
      { status },
    );
  }
}
