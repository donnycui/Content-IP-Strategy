import { NextResponse } from "next/server";
import { getObservationClusterLabel, resolveObservationClusterKey } from "@/lib/observation-clusters";
import { prisma } from "@/lib/prisma";

type ResearchCardPayload = {
  signalId?: string;
  primaryObservationCluster?: string;
};

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

  const payload = (await request.json()) as ResearchCardPayload;
  const primaryObservationClusterKey = resolveObservationClusterKey(payload.primaryObservationCluster);
  const primaryObservationClusterLabel = getObservationClusterLabel(payload.primaryObservationCluster);

  if (!payload.signalId && !payload.primaryObservationCluster) {
    return NextResponse.json(
      {
        ok: false,
        error: "signalId or primaryObservationCluster is required.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const signal = payload.signalId
        ? await tx.signal.findUnique({
            where: {
              id: payload.signalId,
            },
            include: {
              scores: {
                orderBy: {
                  createdAt: "desc",
                },
                take: 1,
              },
              clusterItems: {
                include: {
                  cluster: true,
                },
                take: 1,
              },
            },
          })
        : (
            await tx.signal.findMany({
              where: {
                status: "CANDIDATE",
                scores: {
                  some: {
                    primaryObservationCluster: primaryObservationClusterKey as never,
                  },
                },
              },
              include: {
                scores: {
                  orderBy: {
                    createdAt: "desc",
                  },
                  take: 1,
                },
                clusterItems: {
                  include: {
                    cluster: true,
                  },
                  take: 1,
                },
              },
            })
          ).sort((left, right) => {
            const leftScore = left.scores[0];
            const rightScore = right.scores[0];

            const importanceDelta = (rightScore?.importanceScore ?? 0) - (leftScore?.importanceScore ?? 0);
            if (importanceDelta !== 0) {
              return importanceDelta;
            }

            const viewpointDelta = (rightScore?.viewpointScore ?? 0) - (leftScore?.viewpointScore ?? 0);
            if (viewpointDelta !== 0) {
              return viewpointDelta;
            }

            return String(right.publishedAt ?? right.ingestedAt).localeCompare(String(left.publishedAt ?? left.ingestedAt));
          })[0];

      if (!signal) {
        throw new Error("Signal not found.");
      }

      const latestScore = signal.scores?.[0];
      const clusterTitle =
        primaryObservationClusterKey && latestScore?.primaryObservationCluster === primaryObservationClusterKey
          ? primaryObservationClusterLabel ?? signal.title
          : signal.title;

      let cluster = signal.clusterItems[0]?.cluster;

      if (!cluster) {
        cluster = await tx.signalCluster.create({
          data: {
            clusterTitle,
            clusterSummary: signal.summary,
            items: {
              create: {
                signalId: signal.id,
                similarityScore: 1,
              },
            },
          },
        });
      }

      const existingCard = await tx.researchCard.findFirst({
        where: {
          clusterId: cluster.id,
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      if (existingCard) {
        return existingCard;
      }

      const card = await tx.researchCard.create({
        data: {
          clusterId: cluster.id,
          title: clusterTitle,
          eventDefinition:
            signal.summary ?? "Define what this observation cluster is accumulating and why it matters structurally.",
          mainstreamNarrative: "Document the mainstream explanation that most observers currently accept.",
          ignoredVariables: "Identify the variable that changes the interpretation when viewed through business, finance, and technology together.",
          historicalAnalogy: "List the historical parallel most worth checking before turning this into a judgment.",
          threeMonthProjection: "Outline the short-cycle consequences if this signal keeps strengthening.",
          oneYearProjection: "Describe what this implies for the larger cycle over the next year.",
          winnersLosers: "Specify who gains leverage and who loses bargaining power if this trend persists.",
          positioningJudgment: "State what a high-cognition operator should watch, change, or avoid next.",
        },
      });

      return card;
    });

    return NextResponse.json({ ok: true, researchCard: result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to create research card.",
      },
      { status: 500 },
    );
  }
}
