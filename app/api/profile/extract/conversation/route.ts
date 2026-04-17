import { NextResponse } from "next/server";
import type {
  ProfileExtractConversationStartRequest,
  ProfileExtractConversationStartResponse,
} from "@/lib/domain/contracts";
import { createProfileExtractionConversationSession } from "@/lib/services/profile-extraction-conversation-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as ProfileExtractConversationStartRequest;

  try {
    const result = await createProfileExtractionConversationSession(payload.requestedTier);

    return NextResponse.json<ProfileExtractConversationStartResponse>({
      ok: true,
      data: {
        session: result.session,
      },
    });
  } catch (error) {
    return NextResponse.json<ProfileExtractConversationStartResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "启动对话式提炼失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
