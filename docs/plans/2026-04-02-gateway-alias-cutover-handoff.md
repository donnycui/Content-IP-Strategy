# Gateway Alias Cutover Handoff

**Date:** 2026-04-02
**Project:** `content-ip-research-workbench`

## 1. Current Status

`Content-IP-Strategy` has already been cut over at the code-path level to the
`zhaocai-gateway-v2` access model:

- one gateway `baseUrl`
- one gateway client key
- capability -> alias routing

This round did **not** require code changes in `zhaocai-gateway`. The existing
gateway runtime and admin APIs were reused as-is:

- runtime: `/v1/chat/completions`, `/v1/responses`
- admin: `/admin/gateway/aliases`

The live cutover is still **partially operational** until alias sync and route
bootstrap are executed against a reachable database/environment.

## 2. What Already Landed

### 2.1 Runtime routing

Runtime now prefers gateway alias routing in `Content-IP-Strategy`:

- `CapabilityRoute -> ManagedModel.modelKey`
- `ManagedModel.modelKey` is treated as a gateway alias
- traffic is sent to the configured gateway `baseUrl`
- authentication uses the configured gateway client key

Gateway env fallback is centralized in:

- `lib/services/model-routing-env.ts`

Supported envs:

- `MODEL_ROUTER_GATEWAY_BASE_URL`
- `MODEL_ROUTER_GATEWAY_CLIENT_KEY`
- `MODEL_ROUTER_GATEWAY_AUTH_TYPE`
- `MODEL_ROUTER_GATEWAY_PROTOCOL`
- `MODEL_ROUTER_ALIAS_<CAPABILITY>`

Compatibility envs are also accepted:

- `ZHAOCAI_GATEWAY_BASE_URL`
- `ZHAOCAI_GATEWAY_CLIENT_KEY`
- `ZHAOCAI_GATEWAY_AUTH_TYPE`
- `ZHAOCAI_GATEWAY_PROTOCOL`

Legacy direct-provider fallback is still preserved for rollback safety:

- `SIGNAL_SCORING_BASE_URL`
- `SIGNAL_SCORING_MODEL`
- `SIGNAL_SCORING_PROTOCOL`
- `OPENAI_API_KEY`

### 2.2 Gateway alias admin integration

Gateway access test and sync no longer expect real upstream provider catalogs.
They now use the gateway alias admin API:

- `GET /admin/gateway/aliases`

Local alias catalog behavior:

- aliases are synced into `ManagedModel`
- `providerKey` defaults to `gateway-alias`
- alias tier is inferred from the alias key

Required admin token env:

- `MODEL_ROUTER_GATEWAY_ADMIN_TOKEN`
- or `ZHAOCAI_GATEWAY_ADMIN_TOKEN`

### 2.3 Admin UI semantics

The existing backend shell is preserved, but the active admin UI now uses alias-
oriented semantics:

- `/admin/gateways` -> `Gateway Access`
- `/admin/models` -> `Alias Catalog`
- `/admin/routing` -> `Capability -> Alias`

The active v2 components are:

- `components/admin-gateway-create-form-v2.tsx`
- `components/admin-gateway-actions-v2.tsx`
- `components/admin-model-create-form-v2.tsx`
- `components/admin-model-update-form-v2.tsx`
- `components/admin-capability-route-form-v2.tsx`

The page-level copy cleanup is already complete on:

- `/admin/gateways`
- `/admin/models`
- `/admin/routing`

These pages now consistently use `Gateway Access`, `Alias Catalog`, and
`Capability Routing` wording.

### 2.4 Bootstrap and smoke coverage

A bootstrap script is available to initialize recommended capability -> alias
routes:

```bash
npm run bootstrap:gateway-alias-routing
npm run bootstrap:gateway-alias-routing:write
```

The default bootstrap mapping is:

- `signal_scoring -> signal/deep`
- `draft_generation -> draft/deep`
- all other current capabilities -> `balanced`

There is also a small regression check for gateway env fallback:

```bash
npm run test:gateway-cutover
```

## 3. Capability Coverage

The following capabilities now support the gateway client key + alias runtime
path:

- `signal_scoring`
- `ip_extraction_interview`
- `ip_strategy_report`
- `direction_generation`
- `topic_generation`
- `topic_candidate_generation`
- `profile_evolution`
- `draft_generation`

Important clarification:

- code-path support is already in place
- live routing is only complete after alias sync and route bootstrap/write are run

## 4. Verified In This Session

The following commands completed successfully:

- `npm ci`
- `npm run test:gateway-cutover`
- `.\node_modules\.bin\tsc.cmd --noEmit`
- `npm run build`
- `npm run bootstrap:gateway-alias-routing -- --help`

An actual bootstrap dry-run against:

- `postgresql://postgres:postgres@localhost:5432/content_ip_workbench`

did **not** complete in this session because the database server was not
reachable at `localhost:5432`.

## 5. Operator Checklist

### 5.1 Environment

Configure these envs before final cutover:

- `MODEL_ROUTER_GATEWAY_BASE_URL`
- `MODEL_ROUTER_GATEWAY_CLIENT_KEY`
- `MODEL_ROUTER_GATEWAY_ADMIN_TOKEN`

Optional overrides:

- `MODEL_ROUTER_GATEWAY_AUTH_TYPE`
- `MODEL_ROUTER_GATEWAY_PROTOCOL`
- `MODEL_ROUTER_ALIAS_<CAPABILITY>`

### 5.2 Database and bootstrap

1. Start the local or target database.
2. If using the repo default local stack, run:

```bash
npm run db:up
```

3. Ensure there is a gateway access row for `zhaocai-gateway-v2`.
4. Run alias sync from the admin page or API.
5. Preview the recommended capability routing bootstrap:

```bash
npm run bootstrap:gateway-alias-routing
```

6. Persist the routes when the preview looks correct:

```bash
npm run bootstrap:gateway-alias-routing:write
```

### 5.3 Manual smoke test

Minimum smoke coverage after bootstrap:

- `signal_scoring`
- `topic_generation`
- `draft_generation`
- `profile_evolution`

Recommended additional check:

- verify alias sync results on `/admin/models`
- verify capability -> alias selections on `/admin/routing`

## 6. Remaining Follow-up

- Run the real bootstrap dry-run and write in a DB-connected environment.
- Complete a manual smoke test against the target environment.
- If needed, do optional form-level copy polish only. The page-level alias
  terminology cleanup is already done.
- Optionally rename `GatewayConnection` and `ManagedModel` in a later schema/API
  cleanup once the cutover is stable.

## 7. Key Files

Primary handoff and plan docs:

- `docs/plans/2026-04-02-gateway-alias-cutover-handoff.md`
- `docs/plans/2026-03-31-gateway-alias-cutover.md`
- `docs/plans/2026-03-26-provider-cutover-handoff.md`

Key runtime and admin files:

- `lib/services/model-routing-env.ts`
- `lib/services/model-routing-service.ts`
- `lib/services/gateway-alias-integration.ts`
- `lib/services/gateway-access-admin-service.ts`
- `lib/services/model-admin-service.ts`
- `app/api/admin/gateways/[id]/sync/route.ts`
- `app/api/admin/gateways/[id]/test/route.ts`
- `scripts/bootstrap-gateway-alias-routing.ts`
- `tests/model-routing-env.test.mjs`

## 8. Rollback Notes

Rollback is still straightforward because the legacy direct-provider fallback was
not deleted:

- env fallback still exists
- old database rows were not hard-removed by this round

If final cutover fails, the quickest rollback is to repoint capability routes to
the previous rows or rely on the preserved direct-provider env fallback while the
gateway alias setup is corrected.
