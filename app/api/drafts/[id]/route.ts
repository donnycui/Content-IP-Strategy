import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type DraftUpdatePayload = {
  title?: string | null;
  content?: string;
  status?: "DRAFT" | "READY" | "PUBLISHED" | "ARCHIVED";
};

export async function PATCH(request: Request, context: RouteContext) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ ok: false, error: "DATABASE_URL is not configured." }, { status: 503 });
  }

  const { id } = await context.params;
  const payload = (await request.json()) as DraftUpdatePayload;

  if (typeof payload.content !== "string") {
    return NextResponse.json({ ok: false, error: "content is required." }, { status: 400 });
  }

  try {
    const draft = await prisma.contentDraft.update({
      where: { id },
      data: {
        title: payload.title ?? undefined,
        content: payload.content,
        status: payload.status,
      },
    });

    return NextResponse.json({ ok: true, draft });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to update draft." },
      { status: 500 },
    );
  }
}

