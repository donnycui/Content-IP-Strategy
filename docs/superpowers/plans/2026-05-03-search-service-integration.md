# Search Service Integration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a first production-oriented web search layer so agents can fetch current web facts and store them as platform signals.

**Architecture:** Implement search as a backend service, not as raw CLI execution. Exa is the primary provider when `EXA_API_KEY` is configured; Google through `pure.md` is the fallback. Results are normalized and can be ingested into existing `Source` and `Signal` records for later direction, topic, and learning-insight use.

**Tech Stack:** Next.js App Router, TypeScript, Prisma, existing `Source` / `Signal` models, Node native `fetch`.

---

### Task 1: Search Provider Service

**Files:**
- Create: `lib/services/web-search-service.ts`
- Test: `tests/web-search-service.test.mjs`

- [ ] **Step 1: Write service tests**

Cover normalization, Exa SSE parsing, Google/pure.md parsing, and provider fallback shape.

- [ ] **Step 2: Implement service**

Create:

- `searchWeb(query, options)`
- `searchWithExa(query, options)`
- `searchWithGooglePureMd(query, options)`
- `parseExaResponse(text)`
- `parsePureMdSearchResults(markdown)`

The normalized result shape should include:

- `title`
- `url`
- `source`
- `snippet`
- `publishedAt`
- `provider`
- `query`
- `fetchedAt`

- [ ] **Step 3: Run focused tests**

Run: `node --experimental-strip-types tests/web-search-service.test.mjs`

Expected: PASS.

### Task 2: Signal Ingestion

**Files:**
- Create: `lib/services/search-signal-service.ts`
- Modify: `lib/domain/contracts.ts`

- [ ] **Step 1: Add response contracts**

Add `SearchRunResponse` and payload types for search results and ingested signal counts.

- [ ] **Step 2: Implement ingestion service**

Use existing schema:

- Upsert a `Source` named by provider/source.
- Upsert or create `Signal` by unique `url`.
- Store snippet/summary/raw content when available.
- Avoid destructive updates to human-reviewed signal state.

### Task 3: API Route

**Files:**
- Create: `app/api/search/run/route.ts`

- [ ] **Step 1: Add route**

POST body:

```json
{
  "query": "query text",
  "numResults": 5,
  "ingest": true
}
```

Return normalized results and ingestion counts.

- [ ] **Step 2: Validate input**

Reject empty queries and excessive `numResults`.

### Task 4: Learning Integration

**Files:**
- Modify: `lib/services/proactive-learning-service.ts`
- Modify: `components/learning/learning-generate-button.tsx`
- Modify: `components/learning/learning-insights-panel.tsx`

- [ ] **Step 1: Add manual search-backed learning**

When POST `/api/learning-insights` runs, derive one search query from active creator profile/topics/directions, call the search service, ingest results, and include a short source-backed summary in active memory.

- [ ] **Step 2: Show user feedback**

Update the refresh button feedback to include how many web results were fetched and ingested.

### Task 5: Environment and Docs

**Files:**
- Modify: `.env.example`
- Modify: `docs/plans/2026-05-03-search-style-content-issue-log.md`

- [ ] **Step 1: Add environment placeholders**

Add:

- `EXA_API_KEY=`
- `SEARCH_PROVIDER=exa`
- `SEARCH_TIMEOUT_MS=30000`

- [ ] **Step 2: Document first-slice behavior**

Explain that this is manual, not scheduled, and that Exa key must be configured on VPS/Vercel.

### Task 6: Verification and Deploy

**Files:**
- No code files expected.

- [ ] **Step 1: Run tests**

Run:

- `./node_modules/.bin/tsc --noEmit --incremental false`
- `npm run test:zhaocai-center:smoke`
- `node --experimental-strip-types tests/web-search-service.test.mjs`

- [ ] **Step 2: Commit and push**

Commit message: `feat: add search-backed learning signals`

- [ ] **Step 3: Configure environment**

Set `EXA_API_KEY` in VPS backend environment without committing it.

- [ ] **Step 4: Deploy VPS backend**

Pull latest branch, build, and restart PM2.
