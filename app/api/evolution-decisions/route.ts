import { NextResponse } from "next/server";
import type { EvolutionDashboardResponse, EvolutionDecisionGenerateResponse } from "@/lib/domain/contracts";
import { generateEvolutionDecisions, getEvolutionDashboard } from "@/lib/services/evolution-decision-service";

export async function GET() {
  try {
    const dashboard = await getEvolutionDashboard();

    return NextResponse.json<EvolutionDashboardResponse>({
      ok: true,
      data: {
        dashboard,
      },
    });
  } catch (error) {
    return NextResponse.json<EvolutionDashboardResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "获取进化决策失败。",
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const result = await generateEvolutionDecisions();

    return NextResponse.json<EvolutionDecisionGenerateResponse>({
      ok: true,
      data: {
        createdCount: result.createdCount,
      },
    });
  } catch (error) {
    return NextResponse.json<EvolutionDecisionGenerateResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "生成进化决策失败。",
      },
      { status: 500 },
    );
  }
}
