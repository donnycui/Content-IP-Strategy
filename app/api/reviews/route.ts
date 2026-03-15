import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type ReviewPayload = {
  signalId?: string;
  clusterId?: string;
  reviewStatus?: "PENDING" | "KEPT" | "REJECTED" | "DEFERRED";
  adjustedImportanceScore?: number;
  adjustedViewpointScore?: number;
  adjustedConsensusStrength?: number;
  adjustedCompanyRoutineScore?: number;
  adjustedPriorityRecommendation?: "PRIORITIZE" | "WATCH" | "DEPRIORITIZE";
  reasoningAcceptance?: "ACCEPTED" | "PARTIAL" | "REJECTED";
  reviewNote?: string;
  myAngle?: string;
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
      const review = await tx.humanReview.create({
        data: {
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
        },
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
        error: error instanceof Error ? error.message : "Failed to create review.",
      },
      { status: 500 },
    );
  }
}
