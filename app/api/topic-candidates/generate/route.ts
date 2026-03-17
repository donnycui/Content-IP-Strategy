import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateTopicCandidatesForProfile } from "@/lib/topic-candidate-generation";
import { getActiveCreatorProfile } from "@/lib/profile-data";

export async function POST() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const profile = await getActiveCreatorProfile();

  if (!profile) {
    return NextResponse.json({ ok: false, error: "请先完成 IP 提炼，生成创作者画像。" }, { status: 400 });
  }

  const topics = await prisma.topic.findMany({
    where: {
      creatorProfileId: profile.id,
      status: {
        in: ["ACTIVE", "WATCHING"],
      },
    },
    take: 1,
  });

  if (!topics.length) {
    return NextResponse.json({ ok: false, error: "请先在主题台生成主题线，再刷新选题建议。" }, { status: 400 });
  }

  try {
    const drafts = await generateTopicCandidatesForProfile(profile);

    const result = await prisma.$transaction(async (tx) => {
      await tx.topicCandidate.deleteMany({
        where: {
          topic: {
            creatorProfileId: profile.id,
          },
          status: "NEW",
        },
      });

      const created = await Promise.all(
        drafts.map((draft) =>
          tx.topicCandidate.create({
            data: {
              topicId: draft.topicId,
              anchorSignalId: draft.anchorSignalId ?? null,
              title: draft.title,
              whyNow: draft.whyNow,
              fitReason: draft.fitReason,
              formatRecommendation: draft.formatRecommendation,
              priority: draft.priority,
              status: draft.status,
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
        error: error instanceof Error ? error.message : "生成选题建议失败。",
      },
      { status: 500 },
    );
  }
}
