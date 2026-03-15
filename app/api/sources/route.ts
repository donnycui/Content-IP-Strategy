import { NextResponse } from "next/server";
import { getSources } from "@/lib/source-data";
import { prisma } from "@/lib/prisma";

type SourcePayload = {
  name?: string;
  type?: "RSS" | "WEBSITE" | "NEWSLETTER" | "MANUAL_URL" | "SOCIAL_LINK" | "DISCLOSURE" | "BLOG";
  baseUrl?: string | null;
  feedUrl?: string | null;
  isActive?: boolean;
  qualityScore?: number | null;
  notes?: string | null;
};

export async function GET() {
  const sources = await getSources();
  return NextResponse.json({ sources });
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

  const payload = (await request.json()) as SourcePayload;

  if (!payload.name || !payload.type) {
    return NextResponse.json(
      {
        ok: false,
        error: "Both name and type are required.",
      },
      { status: 400 },
    );
  }

  try {
    const source = await prisma.source.create({
      data: {
        name: payload.name,
        type: payload.type,
        baseUrl: payload.baseUrl ?? null,
        feedUrl: payload.feedUrl ?? null,
        isActive: payload.isActive ?? true,
        qualityScore: payload.qualityScore ?? null,
        notes: payload.notes ?? null,
      },
    });

    return NextResponse.json({ ok: true, source });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Failed to create source.",
      },
      { status: 500 },
    );
  }
}
