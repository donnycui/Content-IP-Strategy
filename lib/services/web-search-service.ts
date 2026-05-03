export type WebSearchProvider = "exa" | "google-pure-md" | "bigmodel-mcp";

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

export type BigModelWebReaderResult = {
  url: string;
  title: string | null;
  content: string;
  provider: "bigmodel-mcp";
  fetchedAt: string;
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
const BIGMODEL_SEARCH_MCP_ENDPOINT =
  process.env.BIGMODEL_SEARCH_MCP_ENDPOINT?.trim() ||
  "https://open.bigmodel.cn/api/mcp/web_search_prime/mcp";
const BIGMODEL_READER_MCP_ENDPOINT =
  process.env.BIGMODEL_READER_MCP_ENDPOINT?.trim() ||
  "https://open.bigmodel.cn/api/mcp/web_reader/mcp";
const USER_AGENT = "Mozilla/5.0 (compatible; content-ip-center-search/1.0)";
const MCP_PROTOCOL_VERSION = "2024-11-05";

type McpPostResult = {
  ok: boolean;
  status: number;
  statusText: string;
  headers: Headers;
  body: string;
};

type SearchCandidate = {
  title?: string | null;
  url?: string | null;
  snippet?: string | null;
  publishedAt?: string | null;
};

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

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function parseDateToIso(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function stripTrailingUrlPunctuation(value: string) {
  return value.replace(/[.,，。；;:：!?！？、]+$/, "");
}

function normalizeUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  const url = stripTrailingUrlPunctuation(value.trim());

  try {
    new URL(url);
    return url;
  } catch {
    return null;
  }
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

function extractMcpContentText(payload: unknown) {
  const textBlocks: string[] = [];

  if (!payload || typeof payload !== "object") {
    return textBlocks;
  }

  const record = payload as Record<string, unknown>;
  const result = record.result && typeof record.result === "object" ? (record.result as Record<string, unknown>) : null;
  const content = Array.isArray(result?.content)
    ? result.content
    : Array.isArray(record.content)
      ? record.content
      : [];

  for (const item of content) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const contentItem = item as Record<string, unknown>;

    if (contentItem.type === "text" && typeof contentItem.text === "string" && contentItem.text.trim()) {
      textBlocks.push(contentItem.text.trim());
    }
  }

  return textBlocks;
}

function extractMcpResponsePayloads(rawBody: string) {
  const payloads: unknown[] = [];
  const textBlocks: string[] = [];
  const events = parseSsePayload(rawBody);

  if (events.length) {
    for (const event of events) {
      if (event.data === "[DONE]") {
        continue;
      }

      try {
        const payload = JSON.parse(event.data) as unknown;
        payloads.push(payload);
        textBlocks.push(...extractMcpContentText(payload));
      } catch {
        if (event.data.trim()) {
          textBlocks.push(event.data.trim());
        }
      }
    }
  } else {
    try {
      const payload = JSON.parse(rawBody) as unknown;
      payloads.push(payload);
      textBlocks.push(...extractMcpContentText(payload));
    } catch {
      if (rawBody.trim()) {
        textBlocks.push(rawBody.trim());
      }
    }
  }

  return { payloads, textBlocks };
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

  return parseDateToIso(published);
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

function valueFromPath(value: unknown, path: string[]) {
  let current = value;

  for (const segment of path) {
    if (!current || typeof current !== "object") {
      return null;
    }

    current = (current as Record<string, unknown>)[segment];
  }

  return current;
}

function objectToSearchCandidate(value: Record<string, unknown>): SearchCandidate | null {
  const url = firstString(
    value.url,
    value.link,
    value.href,
    value.webpage_url,
    value.webpageUrl,
    value.web_url,
    value.webUrl,
    value.source_url,
    value.sourceUrl,
    valueFromPath(value, ["metadata", "url"]),
  );
  const normalizedUrl = normalizeUrl(url);

  if (!normalizedUrl) {
    return null;
  }

  return {
    title: firstString(
      value.title,
      value.name,
      value.site_name,
      value.siteName,
      value.webpage_title,
      value.webpageTitle,
      valueFromPath(value, ["metadata", "title"]),
    ),
    url: normalizedUrl,
    snippet: firstString(
      value.snippet,
      value.summary,
      value.description,
      value.content,
      value.text,
      value.body,
      value.abstract,
      valueFromPath(value, ["metadata", "description"]),
    ),
    publishedAt: parseDateToIso(
      firstString(
        value.publishedAt,
        value.published_at,
        value.publishTime,
        value.publish_time,
        value.date,
        value.time,
        valueFromPath(value, ["metadata", "publishedAt"]),
      ),
    ),
  };
}

function extractSearchCandidatesFromJson(value: unknown, depth = 0): SearchCandidate[] {
  if (depth > 8 || value == null) {
    return [];
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]")) ||
      (trimmed.startsWith('"') && trimmed.endsWith('"'))
    ) {
      try {
        return extractSearchCandidatesFromJson(JSON.parse(trimmed) as unknown, depth + 1);
      } catch {
        return [];
      }
    }

    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => extractSearchCandidatesFromJson(item, depth + 1));
  }

  if (typeof value !== "object") {
    return [];
  }

  const record = value as Record<string, unknown>;
  const candidates: SearchCandidate[] = [];
  const directCandidate = objectToSearchCandidate(record);

  if (directCandidate) {
    candidates.push(directCandidate);
  }

  for (const nested of Object.values(record)) {
    if (nested && (Array.isArray(nested) || typeof nested === "object")) {
      candidates.push(...extractSearchCandidatesFromJson(nested, depth + 1));
    }
  }

  return candidates;
}

function parsePublishedAtFromGenericText(text: string) {
  return parseDateToIso(
    text.match(/^(?:Published|Date|发布时间|发布日期|时间):\s*(.+)$/im)?.[1]?.trim() ?? null,
  );
}

function parseTitleNearUrl(lines: string[], url: string, lineIndex: number) {
  const markdownLinkPattern = new RegExp(`\\[([^\\]]{1,220})\\]\\(${url.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\)`);

  for (let index = Math.max(0, lineIndex - 5); index <= Math.min(lines.length - 1, lineIndex + 2); index += 1) {
    const markdownMatch = lines[index]?.match(markdownLinkPattern);

    if (markdownMatch?.[1]?.trim()) {
      return markdownMatch[1].trim();
    }
  }

  for (let index = lineIndex; index >= Math.max(0, lineIndex - 6); index -= 1) {
    const labeledTitle = lines[index]?.match(/^(?:Title|标题|网页标题|名称):\s*(.+)$/i)?.[1]?.trim();

    if (labeledTitle) {
      return labeledTitle;
    }

    const candidate = stripMarkdown(lines[index] ?? "");

    if (candidate && !candidate.includes(url) && !/^(\d+\.|-|\*)?\s*(URL|Link|链接|摘要|Snippet|网站):/i.test(candidate) && candidate.length <= 220) {
      return candidate.replace(/^(\d+\.|-|\*)\s*/, "");
    }
  }

  return inferSource(url);
}

function parseBigModelTextCandidates(text: string) {
  const candidates: SearchCandidate[] = [];
  const lines = text.split(/\r?\n/);
  const urlMatches = [...text.matchAll(/https?:\/\/[^\s)"'<>\\]+/g)];

  for (const match of urlMatches) {
    const rawUrl = match[0];
    const url = normalizeUrl(rawUrl);

    if (!url) {
      continue;
    }

    const before = text.slice(0, match.index ?? 0);
    const lineIndex = before.split(/\r?\n/).length - 1;
    const contextStart = Math.max(0, (match.index ?? 0) - 500);
    const contextEnd = Math.min(text.length, (match.index ?? 0) + rawUrl.length + 900);
    const context = text.slice(contextStart, contextEnd);
    const snippet = context
      .replace(url, "")
      .replace(rawUrl, "")
      .split(/\r?\n/)
      .map((line) => line.replace(/^(?:Title|URL|Link|标题|链接|网页标题):\s*/i, ""))
      .map((line) => stripMarkdown(line))
      .filter(Boolean)
      .slice(0, 8)
      .join(" ");

    candidates.push({
      title: parseTitleNearUrl(lines, url, lineIndex),
      url,
      snippet,
      publishedAt: parsePublishedAtFromGenericText(context),
    });
  }

  return candidates;
}

export function parseBigModelMcpSearchResponse(rawBody: string, query: string, fetchedAt = new Date().toISOString()) {
  const { payloads, textBlocks } = extractMcpResponsePayloads(rawBody);
  const candidates = [
    ...payloads.flatMap((payload) => extractSearchCandidatesFromJson(payload)),
    ...textBlocks.flatMap((text) => [
      ...extractSearchCandidatesFromJson(text),
      ...parseBigModelTextCandidates(text),
    ]),
  ];
  const seen = new Set<string>();
  const results: WebSearchResult[] = [];

  for (const candidate of candidates) {
    const url = normalizeUrl(candidate.url);

    if (!url || seen.has(url)) {
      continue;
    }

    const result = buildResult({
      title: candidate.title?.trim() || inferSource(url),
      url,
      snippet: candidate.snippet ?? null,
      provider: "bigmodel-mcp",
      query,
      fetchedAt,
      publishedAt: candidate.publishedAt ?? null,
    });

    if (result) {
      seen.add(url);
      results.push(result);
    }
  }

  return results;
}

export function parseBigModelMcpReaderResponse(
  rawBody: string,
  url: string,
  fetchedAt = new Date().toISOString(),
): BigModelWebReaderResult {
  const { payloads, textBlocks } = extractMcpResponsePayloads(rawBody);
  const candidates = payloads.flatMap((payload) => extractSearchCandidatesFromJson(payload));
  const title = candidates.find((candidate) => candidate.title?.trim())?.title?.trim() ?? null;
  const content = textBlocks.length ? textBlocks.join("\n\n") : rawBody.trim();

  return {
    url,
    title,
    content: content.slice(0, 30000),
    provider: "bigmodel-mcp",
    fetchedAt,
  };
}

function extractMcpErrorMessage(rawBody: string) {
  const { payloads } = extractMcpResponsePayloads(rawBody);

  for (const payload of payloads) {
    if (!payload || typeof payload !== "object") {
      continue;
    }

    const result = (payload as Record<string, unknown>).result;

    if (result && typeof result === "object" && (result as Record<string, unknown>).isError === true) {
      const text = extractMcpContentText(payload).join("\n").trim();

      if (text) {
        return text;
      }
    }

    const error = (payload as Record<string, unknown>).error;
    if (!error || typeof error !== "object") {
      continue;
    }

    const message = (error as Record<string, unknown>).message;

    if (typeof message === "string" && message.trim()) {
      return message.trim();
    }
  }

  return null;
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

function getBigModelApiKey() {
  return process.env.BIGMODEL_API_KEY?.trim() || process.env.ZHIPU_API_KEY?.trim() || "";
}

async function postMcpJson(
  endpoint: string,
  apiKey: string,
  body: Record<string, unknown>,
  timeoutMs: number,
  sessionId?: string | null,
): Promise<McpPostResult> {
  const headers: Record<string, string> = {
    "user-agent": USER_AGENT,
    accept: "application/json, text/event-stream",
    "content-type": "application/json",
    Authorization: `Bearer ${apiKey}`,
    "MCP-Protocol-Version": MCP_PROTOCOL_VERSION,
  };

  if (sessionId) {
    headers["Mcp-Session-Id"] = sessionId;
  }

  const response = await fetchWithTimeout(
    endpoint,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
    timeoutMs,
  );

  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
    body: await response.text(),
  };
}

async function callBigModelMcpTool(
  endpoint: string,
  toolName: "web_search_prime" | "webReader",
  args: Record<string, unknown>,
  timeoutMs: number,
) {
  const apiKey = getBigModelApiKey();

  if (!apiKey) {
    throw new Error("BIGMODEL_API_KEY is not configured.");
  }

  const toolCallBody = {
    jsonrpc: "2.0",
    id: 1,
    method: "tools/call",
    params: {
      name: toolName,
      arguments: args,
    },
  };
  const initialized = await postMcpJson(
    endpoint,
    apiKey,
    {
      jsonrpc: "2.0",
      id: 0,
      method: "initialize",
      params: {
        protocolVersion: MCP_PROTOCOL_VERSION,
        capabilities: {},
        clientInfo: {
          name: "content-ip-center-search",
          version: "1.0.0",
        },
      },
    },
    timeoutMs,
  );

  if (!initialized.ok) {
    throw new Error(`BigModel MCP initialize failed: ${initialized.status} ${initialized.statusText}`);
  }

  const sessionId = initialized.headers.get("mcp-session-id") ?? initialized.headers.get("Mcp-Session-Id");

  if (sessionId) {
    await postMcpJson(
      endpoint,
      apiKey,
      {
        jsonrpc: "2.0",
        method: "notifications/initialized",
        params: {},
      },
      timeoutMs,
      sessionId,
    ).catch(() => null);
  }

  const result = await postMcpJson(endpoint, apiKey, toolCallBody, timeoutMs, sessionId);

  if (!result.ok) {
    throw new Error(`BigModel MCP tool call failed: ${result.status} ${result.statusText}`);
  }

  const errorMessage = extractMcpErrorMessage(result.body);

  if (errorMessage) {
    throw new Error(`BigModel MCP error: ${errorMessage}`);
  }

  return result.body;
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

export async function searchWithBigModelMcp(query: string, options: WebSearchOptions = {}) {
  const body = await callBigModelMcpTool(
    BIGMODEL_SEARCH_MCP_ENDPOINT,
    "web_search_prime",
    {
      search_query: query,
      content_size: "medium",
      location: "cn",
      search_recency_filter: "noLimit",
    },
    getSearchTimeout(options.timeoutMs),
  );

  return parseBigModelMcpSearchResponse(body, query).slice(0, boundedNumResults(options.numResults));
}

export async function readWebPageWithBigModel(url: string, options: Pick<WebSearchOptions, "timeoutMs"> = {}) {
  const normalizedUrl = normalizeUrl(url);

  if (!normalizedUrl) {
    throw new Error("A valid URL is required.");
  }

  const body = await callBigModelMcpTool(
    BIGMODEL_READER_MCP_ENDPOINT,
    "webReader",
    {
      url: normalizedUrl,
      return_format: "markdown",
    },
    getSearchTimeout(options.timeoutMs),
  );

  return parseBigModelMcpReaderResponse(body, normalizedUrl);
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

  if (provider === "bigmodel-mcp") {
    return searchWithBigModelMcp(normalizedQuery, options);
  }

  try {
    return await searchWithExa(normalizedQuery, options);
  } catch {
    return searchWithGooglePureMd(normalizedQuery, options);
  }
}
