import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateDirectionsForProfile } from "@/lib/direction-generation";
import { getActiveCreatorProfile } from "@/lib/profile-data";

export async function POST() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const profile = await getActiveCreatorProfile();

  if (!profile) {
    return NextResponse.json({ ok: false, error: "请先完成 IP 提炼，生成创作者画像。" }, { status: 400 });
  }

  try {
    const drafts = await generateDirectionsForProfile(profile);

    const result = await prisma.$transaction(async (tx) => {
      await tx.direction.updateMany({
        where: {
          creatorProfileId: profile.id,
          status: "ACTIVE",
        },
        data: {
          status: "ARCHIVED",
        },
      });

      const created = await Promise.all(
        drafts.map((draft) =>
          tx.direction.create({
            data: {
              creatorProfileId: profile.id,
              title: draft.title,
              whyNow: draft.whyNow,
              fitReason: draft.fitReason,
              priority: draft.priority,
              status: "ACTIVE",
              timeHorizon: draft.timeHorizon,
            },
          }),
        ),
      );

      return created.length;
    });

    return NextResponse.json({ ok: true, created: result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "生成方向建议失败。",
      },
      { status: 500 },
    );
  }
}

