import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ResearchCardUpdatePayload = {
  title?: string;
  eventDefinition?: string | null;
  mainstreamNarrative?: string | null;
  ignoredVariables?: string | null;
  historicalAnalogy?: string | null;
  threeMonthProjection?: string | null;
  oneYearProjection?: string | null;
  winnersLosers?: string | null;
  positioningJudgment?: string | null;
  status?: "DRAFT" | "READY" | "ARCHIVED";
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const { id } = await context.params;
  const payload = (await request.json()) as ResearchCardUpdatePayload;

  try {
    const researchCard = await prisma.researchCard.update({
      where: { id },
      data: {
        title: payload.title,
        eventDefinition: payload.eventDefinition,
        mainstreamNarrative: payload.mainstreamNarrative,
        ignoredVariables: payload.ignoredVariables,
        historicalAnalogy: payload.historicalAnalogy,
        threeMonthProjection: payload.threeMonthProjection,
        oneYearProjection: payload.oneYearProjection,
        winnersLosers: payload.winnersLosers,
        positioningJudgment: payload.positioningJudgment,
        status: payload.status,
      },
    });

    return NextResponse.json({ ok: true, researchCard });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to update research card." },
      { status: 500 },
    );
  }
}

