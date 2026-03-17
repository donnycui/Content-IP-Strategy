import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Payload = {
  status?: "KEPT" | "DEFERRED" | "REJECTED";
};

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const { id } = await params;
  const payload = (await request.json()) as Payload;

  if (!payload.status) {
    return NextResponse.json({ ok: false, error: "必须提供新的选题状态。" }, { status: 400 });
  }

  try {
    const existing = await prisma.topicCandidate.findUnique({
      where: {
        id,
      },
    });

    if (!existing) {
      return NextResponse.json({ ok: false, error: "选题建议不存在或已失效。" }, { status: 404 });
    }

    await prisma.topicCandidate.update({
      where: {
        id,
      },
      data: {
        status: payload.status,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "更新选题状态失败。",
      },
      { status: 500 },
    );
  }
}
