import { NextResponse } from "next/server";
import type { TieredGenerationRequest } from "@/lib/domain/contracts";
import { generateResearchCardStrategyReportWithTier } from "@/lib/research-card-strategy-report";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const payload = (await request.json().catch(() => ({}))) as TieredGenerationRequest;
  const { id } = await context.params;

  try {
    const card = await prisma.researchCard.findUnique({
      where: {
        id,
      },
      include: {
        cluster: {
          include: {
            items: {
              include: {
                signal: {
                  include: {
                    source: true,
                    scores: {
                      orderBy: {
                        createdAt: "desc",
                      },
                      take: 1,
                    },
                  },
                },
              },
              take: 5,
            },
          },
        },
      },
    });

    if (!card) {
      return NextResponse.json({ ok: false, error: "Research card not found." }, { status: 404 });
    }

    const generated = await generateResearchCardStrategyReportWithTier({
      title: card.title,
      eventDefinition: card.eventDefinition,
      mainstreamNarrative: card.mainstreamNarrative,
      ignoredVariables: card.ignoredVariables,
      historicalAnalogy: card.historicalAnalogy,
      threeMonthProjection: card.threeMonthProjection,
      oneYearProjection: card.oneYearProjection,
      winnersLosers: card.winnersLosers,
      positioningJudgment: card.positioningJudgment,
      clusterTitle: card.cluster.clusterTitle,
      clusterSummary: card.cluster.clusterSummary,
      signals: card.cluster.items.map((item) => ({
        title: item.signal.title,
        source: item.signal.source.name,
        reasoningSummary: item.signal.scores[0]?.reasoningSummary ?? item.signal.summary ?? "",
        importanceScore: item.signal.scores[0]?.importanceScore ?? 0,
      })),
    }, payload.requestedTier);

    if (!generated) {
      return NextResponse.json({ ok: false, error: "战略报告生成失败。" }, { status: 502 });
    }

    const updated = await prisma.researchCard.update({
      where: {
        id,
      },
      data: {
        title: generated.title,
        eventDefinition: generated.eventDefinition,
        mainstreamNarrative: generated.mainstreamNarrative,
        ignoredVariables: generated.ignoredVariables,
        historicalAnalogy: generated.historicalAnalogy,
        threeMonthProjection: generated.threeMonthProjection,
        oneYearProjection: generated.oneYearProjection,
        winnersLosers: generated.winnersLosers,
        positioningJudgment: generated.positioningJudgment,
      },
    });

    return NextResponse.json({
      ok: true,
      data: {
        researchCard: updated,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "生成战略报告失败。" },
      { status: 500 },
    );
  }
}
