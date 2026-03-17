import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateProfileUpdateSuggestionsForProfile } from "@/lib/profile-update-suggestion-generation";
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
    const drafts = await generateProfileUpdateSuggestionsForProfile(profile);

    const result = await prisma.$transaction(async (tx) => {
      await tx.profileUpdateSuggestion.deleteMany({
        where: {
          creatorProfileId: profile.id,
          status: "PENDING",
        },
      });

      const created = await Promise.all(
        drafts.map((draft) =>
          tx.profileUpdateSuggestion.create({
            data: {
              creatorProfileId: profile.id,
              type: draft.type,
              beforeValue: draft.beforeValue ?? null,
              suggestedValue: draft.suggestedValue,
              reason: draft.reason,
              confidence: draft.confidence,
              status: "PENDING",
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
        error: error instanceof Error ? error.message : "生成画像进化建议失败。",
      },
      { status: 500 },
    );
  }
}
