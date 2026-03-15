import { prisma } from "@/lib/prisma";
import { createSignalWithScoring } from "@/lib/signal-write";

type IngestUrlInput = {
  sourceId: string;
  url: string;
};

function decodeHtml(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function stripTags(value: string) {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function extractMetaContent(html: string, key: string) {
  const patterns = [
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["'][^>]*>`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeHtml(match[1].trim());
    }
  }

  return null;
}

function extractTitle(html: string) {
  const ogTitle = extractMetaContent(html, "og:title");
  if (ogTitle) {
    return ogTitle;
  }

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (!titleMatch?.[1]) {
    return "Untitled signal";
  }

  return decodeHtml(stripTags(titleMatch[1])) || "Untitled signal";
}

function extractSummary(html: string) {
  return (
    extractMetaContent(html, "description") ??
    extractMetaContent(html, "og:description") ??
    extractMetaContent(html, "twitter:description")
  );
}

function extractAuthor(html: string) {
  return extractMetaContent(html, "author") ?? extractMetaContent(html, "article:author");
}

function inferPublishedAt(html: string) {
  const published =
    extractMetaContent(html, "article:published_time") ??
    extractMetaContent(html, "og:published_time") ??
    extractMetaContent(html, "pubdate");

  if (!published) {
    return null;
  }

  const date = new Date(published);
  return Number.isNaN(date.getTime()) ? null : date;
}

export async function ingestUrl(input: IngestUrlInput) {
  const source = await prisma.source.findUnique({
    where: {
      id: input.sourceId,
    },
    select: {
      id: true,
      name: true,
    },
  });

  if (!source) {
    throw new Error("Source not found.");
  }

  const existing = await prisma.signal.findUnique({
    where: {
      url: input.url,
    },
    select: {
      id: true,
    },
  });

  if (existing) {
    return {
      created: false,
      signalId: existing.id,
    };
  }

  const response = await fetch(input.url, {
    headers: {
      "User-Agent": "content-ip-research-workbench/0.1",
      Accept: "text/html,application/xhtml+xml",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.status}`);
  }

  const html = await response.text();
  const signal = await createSignalWithScoring({
    sourceId: source.id,
    sourceName: source.name,
    title: extractTitle(html),
    url: input.url,
    author: extractAuthor(html),
    language: "en",
    publishedAt: inferPublishedAt(html),
    rawContent: html.slice(0, 20000),
    summary: extractSummary(html),
  });

  return {
    created: true,
    signalId: signal.id,
  };
}
