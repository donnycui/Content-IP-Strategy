import { NextResponse } from "next/server";
import type {
  ReviewDashboardResponse,
  ReviewSnapshotCreateRequest,
  ReviewSnapshotCreateResponse,
} from "@/lib/domain/contracts";
import { createReviewSnapshot, getReviewDashboard } from "@/lib/services/review-snapshot-service";

export async function GET() {
  try {
    const dashboard = await getReviewDashboard();

    return NextResponse.json<ReviewDashboardResponse>({
      ok: true,
      data: {
        dashboard,
      },
    });
  } catch (error) {
    return NextResponse.json<ReviewDashboardResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "获取复盘数据失败。",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as ReviewSnapshotCreateRequest;
    const review = await createReviewSnapshot(payload);

    return NextResponse.json<ReviewSnapshotCreateResponse>({
      ok: true,
      data: {
        review,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "新增复盘记录失败。";
    const status = message.includes("required") ? 400 : 500;

    return NextResponse.json<ReviewSnapshotCreateResponse>(
      {
        ok: false,
        error: message,
      },
      { status },
    );
  }
}
