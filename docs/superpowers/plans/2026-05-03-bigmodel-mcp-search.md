# BigModel MCP Search Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add BigModel MCP search and reader support as optional backend search providers.

**Architecture:** Extend the existing `web-search-service` rather than creating a parallel search stack. BigModel MCP search normalizes into the same `WebSearchResult` contract as Exa and Google. BigModel reader is exposed as a service function for future deep-research workflows but is not used by default page loads.

**Tech Stack:** Next.js App Router, TypeScript, existing fetch-based service functions, Node test script.

---

### File Structure

- Modify: `lib/services/web-search-service.ts`
  - Add `bigmodel-mcp` provider support.
  - Add generic MCP response parsing helpers.
  - Add `searchWithBigModelMcp()`.
  - Add `readWebPageWithBigModel()`.
- Modify: `lib/domain/contracts.ts`
  - Allow `provider: "bigmodel-mcp"` in search request/response contracts.
- Modify: `app/api/search/run/route.ts`
  - Pass the provider request through to `searchWeb`.
- Modify: `.env.example`
  - Add `BIGMODEL_API_KEY`.
- Modify: `tests/web-search-service.test.mjs`
  - Add parser coverage for BigModel MCP search output.
- Modify: `docs/plans/2026-05-03-search-style-content-issue-log.md`
  - Record BigModel MCP as optional explicit provider.

### Task 1: Add Provider Contract

- [ ] **Step 1: Update types**

Add `bigmodel-mcp` to the search provider union in `lib/services/web-search-service.ts`.

- [ ] **Step 2: Update API contract**

Allow API callers to specify `provider: "bigmodel-mcp"` in `SearchRunRequest`.

- [ ] **Step 3: Update env example**

Add `BIGMODEL_API_KEY=""` and keep `SEARCH_PROVIDER="auto"` as the safe default.

### Task 2: Add Tests First

- [ ] **Step 1: Add parser fixture**

Add a BigModel-style JSON-RPC/SSE fixture to `tests/web-search-service.test.mjs`.

- [ ] **Step 2: Assert normalized output**

Verify parsed results include title, URL, source, snippet, provider, and query.

- [ ] **Step 3: Run parser test**

Run:

```bash
node --experimental-strip-types tests/web-search-service.test.mjs
```

Expected before implementation: failure or missing export.

### Task 3: Implement BigModel MCP Search

- [ ] **Step 1: Add endpoint constants**

Use BigModel MCP endpoints through environment-overridable constants:

```ts
const BIGMODEL_SEARCH_MCP_ENDPOINT =
  process.env.BIGMODEL_SEARCH_MCP_ENDPOINT?.trim() ||
  "https://open.bigmodel.cn/api/mcp/web_search_prime/mcp";
const BIGMODEL_READER_MCP_ENDPOINT =
  process.env.BIGMODEL_READER_MCP_ENDPOINT?.trim() ||
  "https://open.bigmodel.cn/api/mcp/web_reader/mcp";
```

- [ ] **Step 2: Add API key resolver**

Read `BIGMODEL_API_KEY` first, then `ZHIPU_API_KEY`.

- [ ] **Step 3: Add MCP caller**

POST JSON-RPC using BigModel's streamable HTTP MCP flow: `initialize`, `notifications/initialized`, then `tools/call` with `Mcp-Session-Id`. Use `Authorization: Bearer <key>`, accept both JSON and SSE responses, and reuse existing timeout helper.

- [ ] **Step 4: Add resilient parser**

Parse structured JSON results when present and fall back to URL extraction from text blocks.

- [ ] **Step 5: Wire provider selection**

If `provider === "bigmodel-mcp"`, call BigModel directly. Keep `auto` as Exa then Google to avoid unintended Lite quota usage.

### Task 4: Add BigModel Reader Function

- [ ] **Step 1: Add `readWebPageWithBigModel(url)`**

Validate URL, call MCP `webReader`, and return normalized plain text blocks.

Use the live `tools/list` schema:

- Search: `web_search_prime` with `search_query`.
- Reader: `webReader` with `url`.

- [ ] **Step 2: Do not call reader from default `/api/search/run`**

This avoids quota use during normal searches.

### Task 5: Verify

- [ ] **Step 1: Run parser tests**

```bash
node --experimental-strip-types tests/web-search-service.test.mjs
```

- [ ] **Step 2: Run TypeScript check**

```bash
./node_modules/.bin/tsc --noEmit --incremental false
```

- [ ] **Step 3: Run smoke test if available**

```bash
npm run test:zhaocai-center:smoke
```

### Task 6: Deploy

- [ ] **Step 1: Configure runtime env**

Set `BIGMODEL_API_KEY` only in VPS/backend runtime env.

- [ ] **Step 2: Restart backend**

Restart the PM2 process after env update.

- [ ] **Step 3: Test explicit provider**

POST `/api/vps/search/run` with `provider: "bigmodel-mcp"` and `ingest: false`.

- [ ] **Step 4: Leave production default unchanged**

Do not set `SEARCH_PROVIDER=bigmodel-mcp` unless explicitly testing BigModel usage.
