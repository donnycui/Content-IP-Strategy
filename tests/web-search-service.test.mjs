import assert from "node:assert/strict";

import { parseExaSearchResponse, parsePureMdSearchResults } from "../lib/services/web-search-service.ts";

const exaSse = [
  "event: message",
  'data: {"result":{"content":[{"type":"text","text":"Example News\\nhttps://example.com/news\\nA useful search snippet."}]}}',
  "",
].join("\n");

const exaResults = parseExaSearchResponse(exaSse, "example query", "2026-05-03T00:00:00.000Z");

assert.equal(exaResults.length, 1);
assert.equal(exaResults[0].provider, "exa");
assert.equal(exaResults[0].url, "https://example.com/news");
assert.equal(exaResults[0].source, "example.com");
assert.match(exaResults[0].snippet ?? "", /useful search snippet/i);

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

console.log("web search service smoke checks passed");
