import { NextResponse } from "next/server";
import type { ContentProjectUpdateRequest, ContentProjectUpdateResponse } from "@/lib/domain/contracts";
import { updateContentProject } from "@/lib/services/content-project-service";

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
    const payload = (await request.json()) as ContentProjectUpdateRequest;
    const { id } = await params;
    const project = await updateContentProject({
      id,
      payload,
    });

    return NextResponse.json<ContentProjectUpdateResponse>({
      ok: true,
      data: {
        project,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "更新内容项目失败。";
    const status =
      message.includes("required") || message.includes("not found") || message.includes("At least one")
        ? 400
        : 500;

    return NextResponse.json<ContentProjectUpdateResponse>(
      {
        ok: false,
        error: message,
      },
      { status },
    );
  }
}
