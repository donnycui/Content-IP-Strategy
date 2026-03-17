import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type Payload = {
  status?: "ACCEPTED" | "REJECTED";
};

type CreatorStageValue = "EXPLORING" | "EMERGING" | "SCALING" | "ESTABLISHED";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const { id } = await params;
  const payload = (await request.json()) as Payload;

  if (!payload.status) {
    return NextResponse.json({ ok: false, error: "必须提供新的建议状态。" }, { status: 400 });
  }

  try {
    const suggestion = await prisma.profileUpdateSuggestion.findUnique({
      where: {
        id,
      },
    });

    if (!suggestion) {
      return NextResponse.json({ ok: false, error: "画像进化建议不存在或已失效。" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.profileUpdateSuggestion.update({
        where: {
          id,
        },
        data: {
          status: payload.status,
        },
      });

      if (payload.status !== "ACCEPTED") {
        return;
      }

      if (suggestion.type === "CORE_THEME") {
        await tx.creatorProfile.update({
          where: {
            id: suggestion.creatorProfileId,
          },
          data: {
            coreThemes: suggestion.suggestedValue,
          },
        });
      }

      if (suggestion.type === "CONTENT_BOUNDARY") {
        await tx.creatorProfile.update({
          where: {
            id: suggestion.creatorProfileId,
          },
          data: {
            contentBoundaries: suggestion.suggestedValue,
          },
        });
      }

      if (suggestion.type === "CURRENT_STAGE") {
        await tx.creatorProfile.update({
          where: {
            id: suggestion.creatorProfileId,
          },
          data: {
            currentStage: suggestion.suggestedValue as CreatorStageValue,
          },
        });
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "更新画像进化建议失败。",
      },
      { status: 500 },
    );
  }
}
