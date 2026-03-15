import { XMLParser } from "fast-xml-parser";
import { prisma } from "@/lib/prisma";
import { createSignalWithScoring } from "@/lib/signal-write";

type ParsedFeedItem = {
  title: string;
  url: string;
  summary: string | null;
  author: string | null;
  publishedAt: Date | null;
};

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  trimValues: true,
});

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function pickText(value: unknown): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value.trim() || null;
  }

  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const candidates = ["#text", "text", "content", "href"];

    for (const candidate of candidates) {
      const picked = record[candidate];
      if (typeof picked === "string" && picked.trim()) {
        return picked.trim();
      }
    }
  }

  return null;
}

function parseDate(value: unknown): Date | null {
  const text = pickText(value);

  if (!text) {
    return null;
  }

  const date = new Date(text);
  return Number.isNaN(date.getTime()) ? null : date;
}

function normalizeRssItems(xml: string): ParsedFeedItem[] {
  const parsed = parser.parse(xml) as Record<string, unknown>;

  if (parsed.rss && typeof parsed.rss === "object") {
    const channel = (parsed.rss as Record<string, unknown>).channel as Record<string, unknown> | undefined;
    const items = toArray(channel?.item as Record<string, unknown> | Record<string, unknown>[] | undefined);

    return items
      .map((item) => ({
        title: pickText(item.title) ?? "Untitled signal",
        url: pickText(item.link) ?? "",
        summary: pickText(item.description) ?? pickText(item["content:encoded"]),
        author: pickText(item.author) ?? pickText(item["dc:creator"]),
        publishedAt: parseDate(item.pubDate),
      }))
      .filter((item) => item.url);
  }

  if (parsed.feed && typeof parsed.feed === "object") {
    const feed = parsed.feed as Record<string, unknown>;
    const entries = toArray(feed.entry as Record<string, unknown> | Record<string, unknown>[] | undefined);

    return entries
      .map((entry) => {
        const links = toArray(entry.link as Record<string, unknown> | Record<string, unknown>[] | undefined);
        const alternateLink =
          (links.find((link) => link.rel === "alternate" && typeof link.href === "string")?.href as string | undefined) ??
          (links.find((link) => typeof link.href === "string")?.href as string | undefined) ??
          pickText(entry.link) ??
          "";

        return {
          title: pickText(entry.title) ?? "Untitled signal",
          url: alternateLink,
          summary: pickText(entry.summary) ?? pickText(entry.content),
          author: pickText((entry.author as Record<string, unknown> | undefined)?.name) ?? pickText(entry.author),
          publishedAt: parseDate(entry.updated) ?? parseDate(entry.published),
        };
      })
      .filter((item) => item.url);
  }

  return [];
}

export async function ingestRssSources(sourceId?: string) {
  const sources = await prisma.source.findMany({
    where: {
      isActive: true,
      type: "RSS",
      feedUrl: {
        not: null,
      },
      ...(sourceId ? { id: sourceId } : {}),
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  const results: Array<{
    sourceId: string;
    sourceName: string;
    feedUrl: string;
    created: number;
    skipped: number;
  }> = [];

  for (const source of sources) {
    const response = await fetch(source.feedUrl!, {
      headers: {
        "User-Agent": "content-ip-research-workbench/0.1",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch feed for ${source.name}: ${response.status}`);
    }

    const xml = await response.text();
    const items = normalizeRssItems(xml).slice(0, 20);

    let created = 0;
    let skipped = 0;

    for (const item of items) {
      const existing = await prisma.signal.findUnique({
        where: {
          url: item.url,
        },
        select: {
          id: true,
        },
      });

      if (existing) {
        skipped += 1;
        continue;
      }

      await createSignalWithScoring({
        sourceId: source.id,
        sourceName: source.name,
        title: item.title,
        url: item.url,
        author: item.author,
        language: "en",
        publishedAt: item.publishedAt,
        summary: item.summary,
      });

      created += 1;
    }

    results.push({
      sourceId: source.id,
      sourceName: source.name,
      feedUrl: source.feedUrl!,
      created,
      skipped,
    });
  }

  return results;
}
