import assert from "node:assert/strict";

import {
  parseBigModelMcpReaderResponse,
  parseBigModelMcpSearchResponse,
  parseExaSearchResponse,
  parsePureMdSearchResults,
} from "../lib/services/web-search-service.ts";

const exaSse = [
  "event: message",
  'data: {"result":{"content":[{"type":"text","text":"Title: Example News\\nURL: https://example.com/news\\nPublished: 2026-05-01T00:00:00.000Z\\nA useful search snippet."}]}}',
  "",
].join("\n");

const exaResults = parseExaSearchResponse(exaSse, "example query", "2026-05-03T00:00:00.000Z");

assert.equal(exaResults.length, 1);
assert.equal(exaResults[0].provider, "exa");
assert.equal(exaResults[0].title, "Example News");
assert.equal(exaResults[0].url, "https://example.com/news");
assert.equal(exaResults[0].source, "example.com");
assert.equal(exaResults[0].publishedAt, "2026-05-01T00:00:00.000Z");
assert.match(exaResults[0].snippet ?? "", /useful search snippet/i);
assert.doesNotMatch(exaResults[0].snippet ?? "", /^Title:/);

const pureMd = `
<SearchResults query="example query">
<WebPage url="https://example.org/report">
---
title: Example Report
description: A current report about the topic.
access_date: 2026-05-03T00:00:00.000Z
---

# Report body
Useful body text.
</WebPage>
</SearchResults>
`;

const pureResults = parsePureMdSearchResults(pureMd, "example query", "2026-05-03T00:00:00.000Z");

assert.equal(pureResults.length, 1);
assert.equal(pureResults[0].provider, "google-pure-md");
assert.equal(pureResults[0].title, "Example Report");
assert.equal(pureResults[0].url, "https://example.org/report");
assert.equal(pureResults[0].snippet, "A current report about the topic.");

const bigModelJson = JSON.stringify({
  result: {
    content: [
      {
        type: "text",
        text: JSON.stringify(JSON.stringify([
          {
            title: "BigModel Search Result",
            link: "https://example.net/search-result",
            content: "A result returned by BigModel MCP.",
            publishedAt: "2026-05-02T12:00:00.000Z",
          },
        ])),
      },
    ],
  },
});
const bigModelResults = parseBigModelMcpSearchResponse(
  bigModelJson,
  "bigmodel query",
  "2026-05-03T00:00:00.000Z",
);

assert.equal(bigModelResults.length, 1);
assert.equal(bigModelResults[0].provider, "bigmodel-mcp");
assert.equal(bigModelResults[0].title, "BigModel Search Result");
assert.equal(bigModelResults[0].url, "https://example.net/search-result");
assert.equal(bigModelResults[0].source, "example.net");
assert.equal(bigModelResults[0].snippet, "A result returned by BigModel MCP.");
assert.equal(bigModelResults[0].publishedAt, "2026-05-02T12:00:00.000Z");

const bigModelSse = [
  "event: message",
  'data: {"result":{"content":[{"type":"text","text":"Title: MCP Text Result\\nURL: https://example.cn/report\\n摘要：一条文本格式的搜索结果。"}]}}',
  "",
].join("\n");
const bigModelTextResults = parseBigModelMcpSearchResponse(
  bigModelSse,
  "bigmodel text query",
  "2026-05-03T00:00:00.000Z",
);

assert.equal(bigModelTextResults.length, 1);
assert.equal(bigModelTextResults[0].provider, "bigmodel-mcp");
assert.equal(bigModelTextResults[0].title, "MCP Text Result");
assert.equal(bigModelTextResults[0].url, "https://example.cn/report");
assert.match(bigModelTextResults[0].snippet ?? "", /文本格式/);

const readerResult = parseBigModelMcpReaderResponse(
  JSON.stringify({
    result: {
      content: [
        {
          type: "text",
          text: "Title: Reader Result\nhttps://example.com/page\n正文内容。",
        },
      ],
    },
  }),
  "https://example.com/page",
  "2026-05-03T00:00:00.000Z",
);

assert.equal(readerResult.provider, "bigmodel-mcp");
assert.equal(readerResult.url, "https://example.com/page");
assert.match(readerResult.content, /正文内容/);

console.log("web search service smoke checks passed");
