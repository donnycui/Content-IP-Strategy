import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getDirections } from "@/lib/direction-data";
import { getActiveCreatorProfile } from "@/lib/profile-data";
import { generateTopicsForProfile } from "@/lib/topic-generation";

export async function POST() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const profile = await getActiveCreatorProfile();

  if (!profile) {
    return NextResponse.json({ ok: false, error: "请先完成 IP 提炼，生成创作者画像。" }, { status: 400 });
  }

  const persistedDirections = await prisma.direction.findMany({
    where: {
      creatorProfileId: profile.id,
      status: "ACTIVE",
    },
    orderBy: [{ priority: "asc" }, { updatedAt: "desc" }],
  });

  if (!persistedDirections.length) {
    return NextResponse.json({ ok: false, error: "请先在方向台生成并确认方向，再刷新主题线。" }, { status: 400 });
  }

  try {
    const directionRows = (await getDirections(profile.id)).filter((direction) =>
      persistedDirections.some((item) => item.id === direction.id),
    );
    const drafts = await generateTopicsForProfile(profile, directionRows);

    const result = await prisma.$transaction(async (tx) => {
      await tx.topic.updateMany({
        where: {
          creatorProfileId: profile.id,
          status: {
            in: ["ACTIVE", "WATCHING"],
          },
        },
        data: {
          status: "ARCHIVED",
        },
      });

      const created = await Promise.all(
        drafts.map((draft) =>
          tx.topic.create({
            data: {
              creatorProfileId: profile.id,
              directionId: draft.directionId ?? null,
              title: draft.title,
              summary: draft.summary,
              status: draft.status,
              heatScore: draft.heatScore,
              signalCount: draft.signalCount,
              primaryObservationCluster: draft.primaryObservationCluster,
              secondaryObservationCluster: draft.secondaryObservationCluster ?? null,
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
        error: error instanceof Error ? error.message : "生成主题线失败。",
      },
      { status: 500 },
    );
  }
}
