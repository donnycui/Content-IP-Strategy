import { NextResponse } from "next/server";
import type {
  ProfileExtractConversationStartRequest,
  ProfileExtractConversationStartResponse,
} from "@/lib/domain/contracts";
import {
  createProfileExtractionConversationSession,
  getLatestActiveProfileExtractionConversationSession,
} from "@/lib/services/profile-extraction-conversation-service";
import { getServiceErrorStatus } from "@/lib/services/service-error";

export async function GET() {
  try {
    const session = await getLatestActiveProfileExtractionConversationSession();

    return NextResponse.json<ProfileExtractConversationStartResponse>({
      ok: true,
      data: {
        session,
      },
    });
  } catch (error) {
    return NextResponse.json<ProfileExtractConversationStartResponse>(
      {
        ok: false,
        error: error instanceof Error ? error.message : "读取对话式提炼会话失败。",
      },
      { status: getServiceErrorStatus(error) },
    );
  }
}

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as ProfileExtractConversationStartRequest;

  try {
    const result = await createProfileExtractionConversationSession(payload.requestedTier, payload.brainstormingMode);

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
