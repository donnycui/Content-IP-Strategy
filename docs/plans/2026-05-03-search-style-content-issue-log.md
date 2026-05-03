# Search and Style Content Issue Log

Date: 2026-05-03
Status: Active
Branch: codex/vps-deploy-test

## Issues

### 1. Agent search capability

Current state:

- The current agents do not have productized live web search.
- The existing "learning insights" layer summarizes internal topics, directions, style skill, and review data.
- It does not fetch real-time web facts, industry updates, trending topics, or source citations.

Reference checked:

- Local folder: `/Users/cuijunpeng/Downloads/skills/openclaw 搜索skill`
- Available skills:
  - `google-search`: uses `pure.md` to proxy Google search pages into Markdown.
  - `exa-search`: calls Exa MCP over `text/event-stream`; optionally uses `EXA_API_KEY`.
  - `fetch-webpage`: fetches pages into Markdown through `pure.md`, `defuddle.md`, `markdown.new`, or `r.jina.ai`.
  - `fetch-url`: fetches raw API, RSS, XML, JSON, CSV, text, or other non-HTML responses.

Assessment:

- The folder is usable as a prototype for this project's search layer.
- It should not be copied in as-is because it is CLI-oriented, has no persistence, no citation schema, no cache, no rate limit, and no product workflow.
- The practical path is to extract the search/fetch logic into backend services, then store normalized results as searchable signals for direction and topic generation.

### 2. Content project output quality

Current state:

- Creating a content project generates multiple content assets.
- The generated assets are too directional and outline-like.
- They are not yet complete, platform-ready drafts for Xiaohongshu posts, short video scripts, WeChat articles, or livestream scripts.

Expected direction:

- Generated assets should become editable first drafts with complete copy, platform-specific structure, hooks, body text, and calls to action.

### 3. Export package information

Current state:

- Export package information is shown prominently in recent content projects.
- It currently contains technical package metadata such as asset type, target platform, title, and status.

Assessment:

- This is useful for future publishing/export integration.
- It is too noisy for the main user workflow and should be moved, folded, or renamed as publishing preparation status.

### 4. Style skill learning paths

Current state:

- The page has style sample input and AI-draft-vs-user-revision input.
- These records are stored and counted.
- The system does not yet summarize them into updated style skill rules automatically.

Expected direction:

- Path A: no prior assets. Generate AI drafts, let the user edit them, and learn style from the differences.
- Path B: existing assets. Upload representative assets first, build an initial style skill, then strengthen it through future AI draft revisions.

## First Issue Recommendation

Implement search as a backend service, not as a raw agent-side CLI command.

Recommended first slice:

- Add a `search-provider` service that wraps Google/pure.md first, with Exa as optional premium fallback.
- Add a `fetch-provider` service for article/RSS/page expansion.
- Normalize results into a stable internal shape: title, url, source, publishedAt, snippet, fetchedText, provider, query, fetchedAt.
- Store selected results as signal records or a new search-result table.
- Use those records to feed direction generation, topic generation, and learning insights.

Open decision:

- Whether the first search slice should be manual button-driven only, or include scheduled background refresh.

## 2026-05-03 Execution Decision

Approved first slice:

- Use Exa as the preferred search provider through `EXA_API_KEY`.
- Keep Google through `pure.md` as fallback when Exa is unavailable.
- Implement search as a backend service and API route.
- Let the existing "刷新主动学习" action run one search query, ingest returned web results into `Source` / `Signal`, and write source references into active learning memory.
- Do not implement scheduled background search yet.

## 2026-05-03 BigModel MCP Decision

Approved follow-up slice:

- Add BigModel MCP search as an explicit provider named `bigmodel-mcp`.
- Read the runtime secret from `BIGMODEL_API_KEY` or `ZHIPU_API_KEY`.
- Keep `SEARCH_PROVIDER=auto` as Exa then Google/pure.md. Do not call BigModel MCP by default while the account is on a low quota plan.
- Add BigModel web reader as a service function for later deep-research workflows, but do not call it from normal page loads or default search runs.
- Keep `zhaocai-gateway` for model aliases such as `qwen3.6-plus-search`; MCP search remains in the backend search service layer.

Validation note:

- BigModel MCP `tools/list` succeeds and reports search tool `web_search_prime` with required argument `search_query`.
- BigModel MCP reader `tools/list` succeeds and reports reader tool `webReader` with required argument `url`.
- The provided runtime key returned `MCP error -401: Api key not found, please get your apikey` during `tools/call`, so full live search execution depends on fixing the BigModel key or MCP entitlement.
