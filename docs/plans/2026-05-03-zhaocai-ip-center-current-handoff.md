# zhaocai-IP-center Current Handoff

Date: 2026-05-03
Branch: `codex/vps-deploy-test`
Status: Active handoff

## 1. What This Document Covers

This is the current handoff for the `zhaocai-IP-center` rebuild after the VPS backend split and search capability work.

Use this document as the current ground truth for:

- frontend on Vercel, backend on VPS
- search capability architecture
- `zhaocai-gateway` alias sync state
- remaining product issues around content projects, export package display, and style skill learning

Older March and April handoff documents are useful as history, but this document should be checked first for the current May 2026 state.

## 2. Runtime Shape

Current deployment direction:

- Vercel is responsible for the frontend shell.
- VPS backend is responsible for API execution, database access, model calls, and search calls.
- Supabase Postgres remains the current database.
- `zhaocai-gateway` remains the model alias and routing layer.

VPS validation endpoint:

- `GET http://18.166.225.96/api/health`

Expected healthy response shape:

```json
{
  "ok": true,
  "service": "content-ip-research-workbench",
  "timestamp": "..."
}
```

## 3. Search Capability Architecture

The current search design has two separate layers.

### 3.1 Tool Layer

The backend search service is implemented in:

- `lib/services/web-search-service.ts`
- `app/api/search/run/route.ts`
- `lib/services/search-signal-service.ts`

Supported providers:

- `exa`: preferred provider when `EXA_API_KEY` is configured.
- `google-pure-md`: fallback search through `pure.md`.
- `bigmodel-mcp`: explicit BigModel MCP provider.
- `auto`: default behavior, currently Exa first, then Google/pure.md fallback.

Important behavior:

- BigModel MCP is not part of default `auto` because the current account plan is quota-sensitive.
- BigModel MCP is used only when explicitly requested through API payload or `SEARCH_PROVIDER=bigmodel-mcp`.
- The BigModel reader function exists for future deep research, but it is not called during normal page load or default learning refresh.

BigModel MCP endpoints:

- Search: `https://open.bigmodel.cn/api/mcp/web_search_prime/mcp`
- Reader: `https://open.bigmodel.cn/api/mcp/web_reader/mcp`

BigModel MCP call mode:

- send `initialize`
- send `notifications/initialized`
- call `tools/call` with returned `Mcp-Session-Id`

Live validation result:

- `/api/search/run` with provider `bigmodel-mcp` returned normalized search results successfully on VPS.
- `/api/search/run` without explicit provider still returns Exa-backed results when Exa is configured.

### 3.2 Model Layer

The `zhaocai-gateway` alias list now includes:

- `search model`
- model key in this project: `search`
- current tier: `BALANCED`
- visible to users: `false`

Meaning:

- `search model` is a model alias for search-result reasoning, summarization, or citation synthesis.
- It is not the web-search tool itself.
- Tool fetching should stay in the backend search service.
- Model judgment over fetched material can later route through the `search` model alias.

Gateway alias sync note:

- Gateway sync was fixed to avoid long Prisma interactive transactions against the pooler.
- Latest sync returned 19 managed models and includes `search`.

Relevant implementation file:

- `lib/services/gateway-alias-integration.ts`

## 4. Environment Variables

Do not commit real secrets.

Required runtime groups:

### Database

- `DATABASE_URL`
- `DIRECT_URL`

### Gateway

- `MODEL_ROUTER_GATEWAY_BASE_URL`
- `MODEL_ROUTER_GATEWAY_CLIENT_KEY`
- `MODEL_ROUTER_GATEWAY_ADMIN_TOKEN`
- `ZHAOCAI_GATEWAY_BASE_URL`
- `ZHAOCAI_GATEWAY_CLIENT_KEY`
- `ZHAOCAI_GATEWAY_ADMIN_TOKEN`

### Search

- `EXA_API_KEY`
- `BIGMODEL_API_KEY`
- `SEARCH_PROVIDER`
- `SEARCH_TIMEOUT_MS`

Safe defaults:

```bash
SEARCH_PROVIDER=auto
SEARCH_TIMEOUT_MS=30000
```

Optional overrides:

- `BIGMODEL_SEARCH_MCP_ENDPOINT`
- `BIGMODEL_READER_MCP_ENDPOINT`

## 5. Verified Work

Recent commits on the active branch:

- `a9a5401 feat: add search-backed learning signals`
- `3ae6648 fix: normalize exa search result metadata`
- `04af1d7 fix: clean exa search snippets`
- `8eb91e3 feat: add bigmodel mcp search provider`
- `ad42647 fix: use bigmodel streamable mcp sessions`
- `523f9a8 fix: make gateway alias sync pooler safe`

Verification already passed:

- `node --experimental-strip-types tests/web-search-service.test.mjs`
- `./node_modules/.bin/tsc --noEmit --incremental false`
- `npm run test:zhaocai-center:smoke`
- VPS build through `npm run build`
- PM2 restart for backend service

## 6. May 3 Product Follow-up Status

These were the remaining items from the May 3 issue review. They have now been implemented on the active branch and still need browser/product acceptance testing after deploy.

### 6.1 Content Project Output Quality

Previous issue:

- Content projects produce direction-level material.
- Output is not yet platform-ready copy for Xiaohongshu, short video, WeChat article, or livestream.

Implemented behavior:

- The fallback asset generator now creates platform-ready first drafts.
- The model instruction explicitly forbids outline-only or direction-only responses.
- Generated drafts now require platform-specific parts:
  - Xiaohongshu: title options, cover copy, body, closing interaction, tags.
  - Short video: opening hook, segmented voiceover, visual notes, closing interaction.
  - WeChat article: title, intro, sections, closing action guidance.
  - Livestream: opening, segment flow, interaction questions, closing script.

Primary files:

- `lib/content/content-asset-draft-logic.ts`
- `lib/services/content-asset-service.ts`
- `lib/services/content-project-service.ts`
- `components/content/content-project-panel.tsx`

### 6.2 Export Package Display

Previous issue:

- Recent content projects show package/export metadata too prominently.
- The display feels technical and distracts from copywriting.

Implemented behavior:

- Export metadata is kept for future publishing workflows.
- Recent content projects now fold publish/export state under "发布准备".
- The package component no longer presents raw package fields as the primary workflow.
- Human-readable labels are used for known package fields.

Primary files:

- `components/content/content-project-panel.tsx`
- `components/content/content-project-detail.tsx`
- `components/content/publish-record-package.tsx`

### 6.3 Style Skill Learning

Previous issue:

- Uploaded style samples and AI-draft-vs-user-revision records are stored.
- They are counted, but not yet converted into updated style rules.

Implemented behavior:

- Path A and Path B are now explained in the UI.
- Adding samples or revisions now updates style skill counts plus synthesized summary/rules.
- The style skill update no longer gets overwritten by `ensureActiveStyleSkill`.
- The current synthesis is deterministic and heuristic; a later version can route deeper summarization through the `search` or draft model alias if needed.

Primary files:

- `lib/style/style-skill-learning-logic.ts`
- `lib/services/style-skill-service.ts`
- `lib/services/style-sample-service.ts`
- `lib/services/style-revision-service.ts`
- `components/style/style-skill-summary.tsx`
- `components/style/style-sample-upload-form.tsx`
- `components/style/style-revision-form.tsx`

## 7. Recommended Execution Order

1. Product test the style/content page in browser.
2. Create one new content project and verify generated assets are complete editable drafts.
3. Add one style sample and one manual revision, then verify style summary/rules update.
4. Deploy to VPS backend if acceptance looks correct.
5. Re-run production/VPS smoke after deployment.

## 8. Local Verification Notes

Passed locally:

- `node --experimental-strip-types tests/content-style-learning.test.mjs`
- `node --experimental-strip-types tests/web-search-service.test.mjs`
- `./node_modules/.bin/tsc --noEmit --incremental false`
- `npm run test:zhaocai-center:smoke`

Local build note:

- `npm run build` reached Next.js production build but failed with `ETIMEDOUT: connection timed out, read` while webpack read `app/globals.css`.
- `app/globals.css` itself is readable and unchanged.
- Treat this as a local build environment timeout until reproduced on VPS or Vercel.

## 9. What Not To Do

- Do not call BigModel MCP on every page load.
- Do not put web-search fetching inside frontend components.
- Do not route MCP tool calls through `zhaocai-gateway`; gateway is for model aliases.
- Do not expose raw package metadata as the main user workflow.
- Do not treat stored style samples as learned style until a synthesis step updates the style skill.
