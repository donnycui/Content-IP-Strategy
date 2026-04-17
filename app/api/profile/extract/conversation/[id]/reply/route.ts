import { NextResponse } from "next/server";
import type {
  ProfileExtractConversationReplyRequest,
  ProfileExtractConversationReplyResponse,
} from "@/lib/domain/contracts";
import { replyToProfileExtractionConversationSession } from "@/lib/services/profile-extraction-conversation-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const payload = (await request.json().catch(() => ({}))) as ProfileExtractConversationReplyRequest;
  const { id } = await context.params;

  try {
    const result = await replyToProfileExtractionConversationSession({
      id,
      ...payload,
    });

    return NextResponse.json<ProfileExtractConversationReplyResponse>({
      ok: true,
      data: {
        session: result.session,
      },
    });
  } catch (error) {
    return NextResponse.json<ProfileExtractConversationReplyResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "对话式提炼追问失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}
