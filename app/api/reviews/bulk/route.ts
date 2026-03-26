import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type BulkReviewPayload = {
  signalIds?: string[];
  reviewStatus?: "KEPT" | "REJECTED" | "DEFERRED";
  reasoningAcceptance?: "ACCEPTED" | "PARTIAL" | "REJECTED";
};

function mapReviewStatusToSignalStatus(reviewStatus?: BulkReviewPayload["reviewStatus"]) {
  switch (reviewStatus) {
    case "KEPT":
      return "CANDIDATE" as const;
    case "DEFERRED":
      return "DEFERRED" as const;
    case "REJECTED":
      return "IGNORED" as const;
    default:
      return "REVIEWED" as const;
  }
}

function getBulkReviewWriteData(payload: BulkReviewPayload) {
  return {
    reviewStatus: payload.reviewStatus,
    reasoningAcceptance: payload.reasoningAcceptance,
  };
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const payload = (await request.json()) as BulkReviewPayload;

  if (!payload.signalIds?.length || !payload.reviewStatus) {
    return NextResponse.json({ ok: false, error: "signalIds and reviewStatus are required." }, { status: 400 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingSignals = await tx.signal.findMany({
        where: {
          id: {
            in: payload.signalIds,
          },
        },
        select: {
          id: true,
        },
      });

      const existingSignalIds = new Set(existingSignals.map((signal) => signal.id));
      const missingSignalIds = payload.signalIds!.filter((signalId) => !existingSignalIds.has(signalId));

      if (missingSignalIds.length > 0) {
        throw new Error("有部分信号已经失效或不是线上真实数据，请刷新页面后重试。");
      }

      const latestReviews = await tx.humanReview.findMany({
        where: {
          signalId: {
            in: payload.signalIds,
          },
        },
        select: {
          id: true,
          signalId: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      const latestReviewIdBySignalId = new Map<string, string>();

      for (const review of latestReviews) {
        if (!review.signalId || latestReviewIdBySignalId.has(review.signalId)) {
          continue;
        }

        latestReviewIdBySignalId.set(review.signalId, review.id);
      }

      const reviews = await Promise.all(
        payload.signalIds!.map((signalId) => {
          const latestReviewId = latestReviewIdBySignalId.get(signalId);

          if (latestReviewId) {
            return tx.humanReview.update({
              where: {
                id: latestReviewId,
              },
              data: getBulkReviewWriteData(payload),
            });
          }

          return tx.humanReview.create({
            data: {
              signalId,
              ...getBulkReviewWriteData(payload),
            },
          });
        }),
      );

      const update = await tx.signal.updateMany({
        where: {
          id: {
            in: payload.signalIds,
          },
        },
        data: {
          status: mapReviewStatusToSignalStatus(payload.reviewStatus),
        },
      });

      return { reviewsSaved: reviews.length, signalsUpdated: update.count };
    });

    return NextResponse.json({ ok: true, ...result, status: mapReviewStatusToSignalStatus(payload.reviewStatus) });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "批量复核失败。" },
      { status: 500 },
    );
  }
}
