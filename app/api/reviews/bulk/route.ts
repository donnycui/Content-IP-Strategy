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
      const reviews = await Promise.all(
        payload.signalIds!.map((signalId) =>
          tx.humanReview.create({
            data: {
              signalId,
              reviewStatus: payload.reviewStatus,
              reasoningAcceptance: payload.reasoningAcceptance,
            },
          }),
        ),
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

      return { reviewsCreated: reviews.length, signalsUpdated: update.count };
    });

    return NextResponse.json({ ok: true, ...result, status: mapReviewStatusToSignalStatus(payload.reviewStatus) });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to process bulk review." },
      { status: 500 },
    );
  }
}

