# BigModel MCP Search Design

## Goal

Add BigModel MCP search and reader access to the existing search layer without replacing the current Exa-first search pipeline.

## Context

The project already has a backend search service in `lib/services/web-search-service.ts`. It can search through Exa and fall back to Google via `pure.md`, then optionally ingest normalized results into `Source` and `Signal`.

BigModel provides two MCP tools that are relevant here:

- `webSearchPrime`: searches the web and returns candidate result material.
- `webReader`: reads a known URL and returns page content.

The current BigModel plan is Lite, so MCP usage is quota-sensitive. These tools should not be called on every page load or every automatic learning run by default.

## Design

Keep Exa as the default production search provider. Add BigModel MCP as an explicit provider named `bigmodel-mcp`. It is called only when:

- `SEARCH_PROVIDER=bigmodel-mcp`, or
- an API caller passes `provider: "bigmodel-mcp"` to `/api/search/run`.

The BigModel API key is read from `BIGMODEL_API_KEY` or `ZHIPU_API_KEY`. It must stay in runtime environment variables and must not be committed.

The search service will normalize BigModel MCP output into the same `WebSearchResult` shape already used by Exa and Google:

- `title`
- `url`
- `source`
- `snippet`
- `publishedAt`
- `provider`
- `query`
- `fetchedAt`

Add a separate `readWebPageWithBigModel(url)` function for URL reading. It is intentionally not used by the default search endpoint yet. Later, a deep-research workflow can search first, select a few URLs, then call reader only for selected pages.

## Non-Goals

- Do not add a new Prisma model capability enum for search.
- Do not route MCP through `zhaocai-gateway`; gateway remains the model alias layer.
- Do not make BigModel MCP part of default `auto` search while the project is on a low quota plan.
- Do not change the existing Exa ingestion behavior.

## Error Handling

If `BIGMODEL_API_KEY` is missing and BigModel MCP is requested explicitly, return a clear configuration error.

If BigModel MCP returns an unfamiliar response shape, the parser should still extract URLs from text when possible.

If no URL can be extracted, return an empty result list instead of throwing after a successful MCP response.

## Verification

- Unit tests cover BigModel JSON-RPC/SSE response parsing.
- TypeScript compilation must pass.
- Existing Exa and Google parser tests must continue to pass.
- Manual API test can call `/api/search/run` with `provider: "bigmodel-mcp"` after runtime env is configured.

## Live Validation Note

`tools/list` confirms that BigModel exposes:

- Search tool: `web_search_prime`, required argument `search_query`.
- Reader tool: `webReader`, required argument `url`.

The initially provided key returned `MCP error -401: Api key not found, please get your apikey` on `tools/call`. The code now surfaces that error explicitly instead of returning an empty result set.
