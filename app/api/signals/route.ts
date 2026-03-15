import { NextResponse } from "next/server";
import { getSignals } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { createSignalWithScoring } from "@/lib/signal-write";

type SignalPayload = {
  sourceId?: string;
  title?: string;
  url?: string;
  author?: string | null;
  language?: string | null;
  publishedAt?: string | null;
  rawContent?: string | null;
  summary?: string | null;
  topicTags?: string[];
  motherTheme?: string | null;
};

export async function GET() {
  const signals = await getSignals();
  return NextResponse.json({ signals });
}

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

  const payload = (await request.json()) as SignalPayload;

  if (!payload.sourceId || !payload.title || !payload.url) {
    return NextResponse.json(
      {
        ok: false,
        error: "sourceId, title, and url are required.",
      },
      { status: 400 },
    );
  }

  try {
    const source = await prisma.source.findUnique({
      where: {
        id: payload.sourceId,
      },
      select: {
        name: true,
      },
    });

    if (!source) {
      return NextResponse.json({ ok: false, error: "Source not found." }, { status: 404 });
    }

    const signal = await createSignalWithScoring({
      sourceId: payload.sourceId,
      sourceName: source.name,
      title: payload.title,
      url: payload.url,
      author: payload.author ?? null,
      language: payload.language ?? null,
      publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : null,
      rawContent: payload.rawContent ?? null,
      summary: payload.summary ?? null,
      topicTags: payload.topicTags,
      motherTheme: payload.motherTheme,
    });

    return NextResponse.json({ ok: true, signal });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to create signal.",
      },
      { status: 500 },
    );
  }
}
