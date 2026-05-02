export type WebSearchProvider = "exa" | "google-pure-md";

export type WebSearchResult = {
  title: string;
  url: string;
  source: string;
  snippet: string | null;
  publishedAt: string | null;
  provider: WebSearchProvider;
  query: string;
  fetchedAt: string;
};

export type WebSearchOptions = {
  numResults?: number;
  timeoutMs?: number;
  provider?: WebSearchProvider | "auto";
};

type ExaPayload = {
  result?: {
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  };
};

const DEFAULT_TIMEOUT_MS = 30000;
const DEFAULT_NUM_RESULTS = 5;
const EXA_ENDPOINT = "https://mcp.exa.ai/mcp";
const SEARCH_BASE_URL = "https://pure.md/https://www.google.com/search";
const USER_AGENT = "Mozilla/5.0 (compatible; content-ip-center-search/1.0)";

function boundedNumResults(value?: number) {
  if (!Number.isFinite(value)) {
    return DEFAULT_NUM_RESULTS;
  }

  return Math.min(10, Math.max(1, Math.round(value ?? DEFAULT_NUM_RESULTS)));
}

function getSearchTimeout(input?: number) {
  const fromEnv = Number.parseInt(process.env.SEARCH_TIMEOUT_MS ?? "", 10);
  const value = input ?? (Number.isFinite(fromEnv) ? fromEnv : DEFAULT_TIMEOUT_MS);

  return Math.min(60000, Math.max(3000, value));
}

function inferSource(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

function compactWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function stripMarkdown(value: string) {
  return compactWhitespace(
    value
      .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
      .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
      .replace(/[#*_`>]/g, ""),
  );
}

function buildResult(input: {
  title: string;
  url: string;
  snippet?: string | null;
  provider: WebSearchProvider;
  query: string;
  fetchedAt: string;
  publishedAt?: string | null;
}): WebSearchResult | null {
  const title = stripMarkdown(input.title);
  const url = input.url.trim();

  if (!title || !url) {
    return null;
  }

  try {
    new URL(url);
  } catch {
    return null;
  }

  return {
    title,
    url,
    source: inferSource(url),
    snippet: input.snippet ? stripMarkdown(input.snippet).slice(0, 1200) : null,
    publishedAt: input.publishedAt ?? null,
    provider: input.provider,
    query: input.query,
    fetchedAt: input.fetchedAt,
  };
}

function parseSsePayload(rawBody: string) {
  const events: Array<{ event: string; data: string }> = [];
  const blocks = rawBody.split(/\r?\n\r?\n/);

  for (const block of blocks) {
    if (!block.trim()) {
      continue;
    }

    const lines = block.split(/\r?\n/);
    let eventType = "message";
    const dataLines: string[] = [];

    for (const line of lines) {
      if (!line || line.startsWith(":")) {
        continue;
      }

      const index = line.indexOf(":");
      const field = index === -1 ? line : line.slice(0, index);
      const value = index === -1 ? "" : line.slice(index + 1).replace(/^ /, "");

      if (field === "event") {
        eventType = value;
      }

      if (field === "data") {
        dataLines.push(value);
      }
    }

    if (dataLines.length) {
      events.push({ event: eventType, data: dataLines.join("\n") });
    }
  }

  return events;
}

function extractTextFromExaPayload(payload: ExaPayload) {
  const content = payload.result?.content;

  if (!Array.isArray(content)) {
    return [];
  }

  return content
    .filter((item) => item?.type === "text" && typeof item.text === "string")
    .map((item) => item.text?.trim() ?? "")
    .filter(Boolean);
}

function parseUrlFromText(text: string) {
  return text.match(/^URL:\s*(https?:\/\/\S+)/im)?.[1]?.replace(/[.,，。]+$/, "") ?? text.match(/https?:\/\/[^\s)\]]+/)?.[0]?.replace(/[.,，。]+$/, "") ?? null;
}

function parseLabeledField(text: string, label: string) {
  const match = text.match(new RegExp(`^${label}:\\s*(.+)$`, "im"));

  return match?.[1]?.trim() ?? null;
}

function parsePublishedAtFromText(text: string) {
  const published = parseLabeledField(text, "Published");

  if (!published) {
    return null;
  }

  const parsed = new Date(published);

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function cleanExaSnippet(text: string) {
  return text
    .split(/\r?\n/)
    .filter((line) => !/^(Title|URL|Published|Author):\s*/i.test(line.trim()))
    .map((line) => line.replace(/^Highlights:\s*/i, ""))
    .join("\n")
    .trim();
}

function parseTitleFromText(text: string, url: string) {
  const labeledTitle = parseLabeledField(text, "Title");

  if (labeledTitle) {
    return labeledTitle;
  }

  const lines = text
    .split(/\r?\n/)
    .map((line) => stripMarkdown(line))
    .filter(Boolean);

  return lines.find((line) => !line.includes(url) && line.length <= 180) ?? inferSource(url);
}

export function parseExaSearchResponse(rawBody: string, query: string, fetchedAt = new Date().toISOString()) {
  const textBlocks: string[] = [];
  const events = parseSsePayload(rawBody);

  if (events.length) {
    for (const event of events) {
      if (event.data === "[DONE]") {
        continue;
      }

      try {
        textBlocks.push(...extractTextFromExaPayload(JSON.parse(event.data) as ExaPayload));
      } catch {
        // Exa occasionally emits non-JSON keepalive chunks.
      }
    }
  } else {
    try {
      textBlocks.push(...extractTextFromExaPayload(JSON.parse(rawBody) as ExaPayload));
    } catch {
      textBlocks.push(rawBody);
    }
  }

  return textBlocks
    .map((text) => {
      const url = parseUrlFromText(text);

      if (!url) {
        return null;
      }

      return buildResult({
        title: parseTitleFromText(text, url),
        url,
        snippet: cleanExaSnippet(text),
        provider: "exa",
        query,
        fetchedAt,
        publishedAt: parsePublishedAtFromText(text),
      });
    })
    .filter((item): item is WebSearchResult => Boolean(item));
}

export function parsePureMdSearchResults(markdown: string, query: string, fetchedAt = new Date().toISOString()) {
  const results: WebSearchResult[] = [];
  const pageBlocks = markdown.matchAll(/<WebPage url="([^"]+)">([\s\S]*?)<\/WebPage>/g);

  for (const match of pageBlocks) {
    const url = match[1];
    const body = match[2] ?? "";
    const title = body.match(/title:\s*(.+)/)?.[1]?.trim() ?? inferSource(url);
    const description = body.match(/description:\s*(.+)/)?.[1]?.trim() ?? null;
    const contentSnippet = body
      .replace(/---[\s\S]*?---/, "")
      .split(/\r?\n/)
      .map((line) => stripMarkdown(line))
      .filter(Boolean)
      .slice(0, 8)
      .join(" ");

    const result = buildResult({
      title,
      url,
      snippet: description ?? contentSnippet,
      provider: "google-pure-md",
      query,
      fetchedAt,
    });

    if (result) {
      results.push(result);
    }
  }

  return results;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function searchWithExa(query: string, options: WebSearchOptions = {}) {
  const apiKey = process.env.EXA_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("EXA_API_KEY is not configured.");
  }

  const endpoint = new URL(EXA_ENDPOINT);
  endpoint.searchParams.set("exaApiKey", apiKey);

  const response = await fetchWithTimeout(
    endpoint.toString(),
    {
      method: "POST",
      headers: {
        "user-agent": USER_AGENT,
        accept: "application/json, text/event-stream",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: {
          name: "web_search_exa",
          arguments: {
            query,
            type: "auto",
            numResults: boundedNumResults(options.numResults),
            livecrawl: "fallback",
          },
        },
      }),
    },
    getSearchTimeout(options.timeoutMs),
  );

  const body = await response.text();

  if (!response.ok) {
    throw new Error(`Exa search failed: ${response.status} ${response.statusText}`);
  }

  return parseExaSearchResponse(body, query).slice(0, boundedNumResults(options.numResults));
}

export async function searchWithGooglePureMd(query: string, options: WebSearchOptions = {}) {
  const searchUrl = `${SEARCH_BASE_URL}?q=${encodeURIComponent(query)}`;
  const response = await fetchWithTimeout(
    searchUrl,
    {
      headers: {
        "user-agent": USER_AGENT,
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    },
    getSearchTimeout(options.timeoutMs),
  );

  if (!response.ok) {
    throw new Error(`Google/pure.md search failed: ${response.status} ${response.statusText}`);
  }

  return parsePureMdSearchResults(await response.text(), query).slice(0, boundedNumResults(options.numResults));
}

export async function searchWeb(query: string, options: WebSearchOptions = {}) {
  const normalizedQuery = query.trim();

  if (!normalizedQuery) {
    throw new Error("Search query is required.");
  }

  const provider = options.provider ?? (process.env.SEARCH_PROVIDER as WebSearchOptions["provider"]) ?? "auto";

  if (provider === "exa") {
    return searchWithExa(normalizedQuery, options);
  }

  if (provider === "google-pure-md") {
    return searchWithGooglePureMd(normalizedQuery, options);
  }

  try {
    return await searchWithExa(normalizedQuery, options);
  } catch {
    return searchWithGooglePureMd(normalizedQuery, options);
  }
}
