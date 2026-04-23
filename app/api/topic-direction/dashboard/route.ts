import { NextResponse } from "next/server";
import type { TopicDirectionDashboardResponse } from "@/lib/domain/contracts";
import { getTopicDirectionDashboard } from "@/lib/services/topic-direction-dashboard-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function GET() {
  try {
    const dashboard = await getTopicDirectionDashboard();

    return NextResponse.json<TopicDirectionDashboardResponse>({
      ok: true,
      data: {
        dashboard,
      },
    });
  } catch (error) {
    return NextResponse.json<TopicDirectionDashboardResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "读取方向与选题工作区失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
