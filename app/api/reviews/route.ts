import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ReviewPayload = {
  signalId?: string;
  clusterId?: string;
  reviewStatus?: "PENDING" | "KEPT" | "REJECTED" | "DEFERRED";
  adjustedImportanceScore?: number | null;
  adjustedViewpointScore?: number | null;
  adjustedConsensusStrength?: number | null;
  adjustedCompanyRoutineScore?: number | null;
  adjustedPriorityRecommendation?: "PRIORITIZE" | "WATCH" | "DEPRIORITIZE" | null;
  reasoningAcceptance?: "ACCEPTED" | "PARTIAL" | "REJECTED" | null;
  reviewNote?: string | null;
  myAngle?: string | null;
};

function mapReviewStatusToSignalStatus(reviewStatus?: ReviewPayload["reviewStatus"]) {
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

function getReviewWriteData(payload: ReviewPayload) {
  return {
    signalId: payload.signalId,
    clusterId: payload.clusterId,
    reviewStatus: payload.reviewStatus,
    adjustedImportanceScore: payload.adjustedImportanceScore,
    adjustedViewpointScore: payload.adjustedViewpointScore,
    adjustedConsensusStrength: payload.adjustedConsensusStrength,
    adjustedCompanyRoutineScore: payload.adjustedCompanyRoutineScore,
    adjustedPriorityRecommendation: payload.adjustedPriorityRecommendation,
    reasoningAcceptance: payload.reasoningAcceptance,
    reviewNote: payload.reviewNote,
    myAngle: payload.myAngle,
  };
}

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      {
        ok: false,
        error: "DATABASE_URL is not configured.",
      },
      { status: 503 },
    );
  }

  const payload = (await request.json()) as ReviewPayload;

  if (!payload.signalId && !payload.clusterId) {
    return NextResponse.json(
      {
        ok: false,
        error: "Either signalId or clusterId is required.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      if (payload.signalId) {
        const signal = await tx.signal.findUnique({
          where: {
            id: payload.signalId,
          },
          select: {
            id: true,
          },
        });

        if (!signal) {
          throw new Error("这条信号不存在或已失效，请刷新页面后重试。");
        }
      }

      const latestReview = await tx.humanReview.findFirst({
        where: payload.signalId
          ? {
              signalId: payload.signalId,
            }
          : {
              clusterId: payload.clusterId,
            },
        orderBy: {
          createdAt: "desc",
        },
      });

      const review = latestReview
        ? await tx.humanReview.update({
            where: {
              id: latestReview.id,
            },
            data: getReviewWriteData(payload),
          })
        : await tx.humanReview.create({
            data: getReviewWriteData(payload),
          });

      let signal = null;

      if (payload.signalId) {
        signal = await tx.signal.update({
          where: {
            id: payload.signalId,
          },
          data: {
            status: mapReviewStatusToSignalStatus(payload.reviewStatus),
          },
          select: {
            id: true,
            status: true,
          },
        });
      }

      return { review, signal };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "保存复核失败。",
      },
      { status: 500 },
    );
  }
}
