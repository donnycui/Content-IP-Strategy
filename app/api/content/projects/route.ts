import { NextResponse } from "next/server";
import type { ContentProjectCreateRequest, ContentProjectCreateResponse, StyleContentDashboardResponse } from "@/lib/domain/contracts";
import { createContentProjectFromTopicCandidate, getStyleContentDashboard } from "@/lib/services/content-project-service";

export async function GET() {
  try {
    const dashboard = await getStyleContentDashboard();

    return NextResponse.json<StyleContentDashboardResponse>({
      ok: true,
      data: {
        dashboard,
      },
    });
  } catch (error) {
    return NextResponse.json<StyleContentDashboardResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "获取内容项目失败。",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ContentProjectCreateRequest;
    const result = await createContentProjectFromTopicCandidate(payload.topicCandidateId);

    return NextResponse.json<ContentProjectCreateResponse>({
      ok: true,
      data: {
        project: result.project,
        assets: result.assets,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "创建内容项目失败。";
    const status = message.includes("No topic candidate") ? 400 : 500;

    return NextResponse.json<ContentProjectCreateResponse>(
      {
        ok: false,
        error: message,
      },
      { status },
    );
  }
}
