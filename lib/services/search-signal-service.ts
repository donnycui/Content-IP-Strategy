import { prisma } from "@/lib/prisma";
import type { WebSearchResult } from "@/lib/services/web-search-service";

export type SearchSignalIngestionResult = {
  ingestedCount: number;
  skippedCount: number;
};

function parseDate(value: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function sourceNameForResult(result: WebSearchResult) {
  return `${result.provider}:${result.source}`;
}

async function ensureSource(result: WebSearchResult) {
  const name = sourceNameForResult(result);
  const existing = await prisma.source.findFirst({
    where: {
      name,
    },
  });

  if (existing) {
    return existing;
  }

  return prisma.source.create({
    data: {
      name,
      type: "WEBSITE",
      baseUrl: `https://${result.source}`,
      qualityScore: result.provider === "exa" ? 0.8 : 0.65,
      notes: `Auto-created from ${result.provider} search results.`,
    },
  });
}

export async function ingestSearchResults(results: WebSearchResult[]): Promise<SearchSignalIngestionResult> {
  if (!process.env.DATABASE_URL || !results.length) {
    return {
      ingestedCount: 0,
      skippedCount: results.length,
    };
  }

  let ingestedCount = 0;
  let skippedCount = 0;

  for (const result of results) {
    try {
      const source = await ensureSource(result);
      await prisma.signal.upsert({
        where: {
          url: result.url,
        },
        update: {
          title: result.title,
          summary: result.snippet,
          rawContent: result.snippet,
          language: /[\u4e00-\u9fff]/.test(`${result.title} ${result.snippet ?? ""}`) ? "zh" : null,
          publishedAt: parseDate(result.publishedAt),
        },
        create: {
          sourceId: source.id,
          title: result.title,
          url: result.url,
          language: /[\u4e00-\u9fff]/.test(`${result.title} ${result.snippet ?? ""}`) ? "zh" : null,
          publishedAt: parseDate(result.publishedAt),
          rawContent: result.snippet,
          summary: result.snippet,
          status: "NEW",
        },
      });
      ingestedCount += 1;
    } catch {
      skippedCount += 1;
    }
  }

  return {
    ingestedCount,
    skippedCount,
  };
}
