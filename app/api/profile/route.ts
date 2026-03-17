import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getActiveCreatorProfile } from "@/lib/profile-data";

export async function GET() {
  const profile = await getActiveCreatorProfile();
  return NextResponse.json({ profile });
}

export async function PATCH(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const payload = (await request.json()) as {
    id?: string;
    name?: string;
    positioning?: string;
    persona?: string;
    audience?: string;
    coreThemes?: string;
    voiceStyle?: string;
    growthGoal?: string;
    contentBoundaries?: string;
    currentStage?: "EXPLORING" | "EMERGING" | "SCALING" | "ESTABLISHED";
  };

  if (!payload.id) {
    return NextResponse.json({ ok: false, error: "创作者画像 ID 缺失。" }, { status: 400 });
  }

  try {
    await prisma.creatorProfile.update({
      where: {
        id: payload.id,
      },
      data: {
        name: payload.name,
        positioning: payload.positioning,
        persona: payload.persona,
        audience: payload.audience,
        coreThemes: payload.coreThemes,
        voiceStyle: payload.voiceStyle,
        growthGoal: payload.growthGoal,
        contentBoundaries: payload.contentBoundaries,
        currentStage: payload.currentStage,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "保存创作者画像失败。",
      },
      { status: 500 },
    );
  }
}

