import { NextResponse } from "next/server";
import type { LearningInsightsDashboardResponse, LearningInsightsGenerateResponse } from "@/lib/domain/contracts";
import { generateLearningInsights, getLearningInsightsDashboard } from "@/lib/services/proactive-learning-service";

export async function GET() {
  try {
    const dashboard = await getLearningInsightsDashboard();

    return NextResponse.json<LearningInsightsDashboardResponse>({
      ok: true,
      data: {
        dashboard,
      },
    });
  } catch (error) {
    return NextResponse.json<LearningInsightsDashboardResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "获取主动学习洞察失败。",
      },
      { status: 500 },
    );
  }
}

export async function POST() {
  try {
    const result = await generateLearningInsights();

    return NextResponse.json<LearningInsightsGenerateResponse>({
      ok: true,
      data: {
        createdCount: result.createdCount,
      },
    });
  } catch (error) {
    return NextResponse.json<LearningInsightsGenerateResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "生成主动学习洞察失败。",
      },
      { status: 500 },
    );
  }
}
