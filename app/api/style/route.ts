import { NextResponse } from "next/server";
import type { StyleSkillDashboardResponse } from "@/lib/domain/contracts";
import { getStyleSkillDashboard } from "@/lib/services/style-skill-service";

export async function GET() {
  try {
    const dashboard = await getStyleSkillDashboard();

    return NextResponse.json<StyleSkillDashboardResponse>({
      ok: true,
      data: {
        dashboard,
      },
    });
  } catch (error) {
    return NextResponse.json<StyleSkillDashboardResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "获取风格 Skill 失败。",
      },
      { status: 500 },
    );
  }
}
