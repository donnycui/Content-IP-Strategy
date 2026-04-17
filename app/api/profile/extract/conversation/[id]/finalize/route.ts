import { NextResponse } from "next/server";
import type { ProfileExtractConversationFinalizeResponse } from "@/lib/domain/contracts";
import { finalizeProfileExtractionConversationSession } from "@/lib/services/profile-extraction-conversation-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;

  try {
    const result = await finalizeProfileExtractionConversationSession(id);

    return NextResponse.json<ProfileExtractConversationFinalizeResponse>({
      ok: true,
      data: result,
    });
  } catch (error) {
    return NextResponse.json<ProfileExtractConversationFinalizeResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "生成最终画像失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
