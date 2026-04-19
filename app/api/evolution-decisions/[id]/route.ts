import { NextResponse } from "next/server";
import type { EvolutionDecisionStatusRequest, EvolutionDecisionStatusResponse } from "@/lib/domain/contracts";
import { updateEvolutionDecisionStatus } from "@/lib/services/evolution-decision-service";

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    const payload = (await request.json()) as EvolutionDecisionStatusRequest;
    const { id } = await params;
    await updateEvolutionDecisionStatus(id, payload);

    return NextResponse.json<EvolutionDecisionStatusResponse>({
      ok: true,
      data: {
        updated: true,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新进化决策失败。";
    const status = message.includes("required") || message.includes("not found") ? 400 : 500;

    return NextResponse.json<EvolutionDecisionStatusResponse>(
      {
        ok: false,
        error: message,
      },
      { status },
    );
  }
}
