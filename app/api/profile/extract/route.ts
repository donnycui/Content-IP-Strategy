import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { extractCreatorProfileDraft } from "@/lib/profile-extraction";

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const payload = (await request.json()) as { sourceText?: string };

  if (!payload.sourceText?.trim()) {
    return NextResponse.json({ ok: false, error: "创作者自述不能为空。" }, { status: 400 });
  }

  try {
    const draft = await extractCreatorProfileDraft({
      sourceText: payload.sourceText,
    });

    const profile = await prisma.$transaction(async (tx) => {
      await tx.creatorProfile.updateMany({
        data: {
          isActive: false,
        },
      });

      return tx.creatorProfile.create({
        data: {
          name: draft.name,
          positioning: draft.positioning,
          persona: draft.persona,
          audience: draft.audience,
          coreThemes: draft.coreThemes,
          voiceStyle: draft.voiceStyle,
          growthGoal: draft.growthGoal,
          contentBoundaries: draft.contentBoundaries,
          currentStage: draft.currentStage,
          isActive: true,
        },
        select: {
          id: true,
        },
      });
    });

    return NextResponse.json({ ok: true, profileId: profile.id });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "IP 提炼失败。",
      },
      { status: 500 },
    );
  }
}

