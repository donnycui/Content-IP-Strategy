# Gateway Alias Cutover

> Update on 2026-04-02: the latest execution and handoff status is now
> documented in `docs/plans/2026-04-02-gateway-alias-cutover-handoff.md`.
> This file should be treated as the implementation note and cutover design
> baseline.

**Date:** 2026-03-31
**Project:** `content-ip-research-workbench`

## Goal

Cut `Content-IP-Strategy` over from direct provider-managed routing to the current
`zhaocai-gateway-v2` access model:

- one gateway `baseUrl`
- one gateway client key
- capability -> alias routing

After this cutover, `Content-IP-Strategy` should no longer need to know the real
upstream provider URL, real upstream API key, or real upstream model fallback order.

## Minimal Implementation

This round keeps the existing admin/database shell in place:

- `GatewayConnection`
  now represents a project-facing access point to `zhaocai-gateway-v2`
- `ManagedModel`
  is reused as the local alias catalog
- `CapabilityRoute`
  still owns the business capability routing relationship

This avoids a schema rewrite while still moving runtime traffic to:

`capability -> alias -> zhaocai-gateway-v2 -> real upstream targets`

## Runtime Rules

### Database-backed routing

If `CapabilityRoute` exists:

1. resolve the selected `ManagedModel`
2. treat its `modelKey` as a gateway alias
3. send runtime traffic to the configured gateway `baseUrl`
4. authenticate with the configured gateway client key env var

### Environment fallback

If the database route is unavailable, prefer the new gateway envs:

- `MODEL_ROUTER_GATEWAY_BASE_URL`
- `MODEL_ROUTER_GATEWAY_CLIENT_KEY`
- `MODEL_ROUTER_GATEWAY_AUTH_TYPE`
- `MODEL_ROUTER_GATEWAY_PROTOCOL`
- `MODEL_ROUTER_ALIAS_<CAPABILITY>`

Default alias suggestions:

- `signal_scoring -> signal/deep`
- `draft_generation -> draft/deep`
- all other current capabilities -> `balanced`

Legacy direct-provider env fallback is still preserved for rollback safety:

- `SIGNAL_SCORING_BASE_URL`
- `SIGNAL_SCORING_MODEL`
- `SIGNAL_SCORING_PROTOCOL`
- `OPENAI_API_KEY`

## Admin Flow

### Gateway access

The gateway admin page should now be used to configure a `zhaocai-gateway-v2`
runtime entry instead of a real upstream provider.

Recommended values:

- name: `zhaocai-gateway-v2`
- auth secret ref: `MODEL_ROUTER_GATEWAY_CLIENT_KEY`

### Alias sync

Alias sync now pulls from the existing gateway admin API:

- `GET /admin/gateway/aliases`

Required env:

- `MODEL_ROUTER_GATEWAY_ADMIN_TOKEN`

The synced alias catalog is stored into local `ManagedModel` rows so the existing
routing backend can keep working without a new admin surface.

### Capability routing

Business capability routing stays where it already lives:

- `signal_scoring`
- `topic_generation`
- `topic_candidate_generation`
- `draft_generation`
- `profile_evolution`
- `ip_extraction_interview`
- `ip_strategy_report`
- `direction_generation`

The important change is semantic:

- the selected item should now be a gateway alias
- not a real upstream model name

## Manual Cutover Checklist

1. Configure `MODEL_ROUTER_GATEWAY_BASE_URL`.
2. Configure `MODEL_ROUTER_GATEWAY_CLIENT_KEY`.
3. Configure `MODEL_ROUTER_GATEWAY_ADMIN_TOKEN`.
4. In admin, create or reuse a gateway access row for `zhaocai-gateway-v2`.
5. Run alias sync.
6. Preview the recommended routing bootstrap:

```bash
npm run bootstrap:gateway-alias-routing
```

7. Persist the recommended capability -> alias routes when the preview looks correct:

```bash
npm run bootstrap:gateway-alias-routing:write
```

8. Repoint any exceptions manually if a capability should use a different alias.
9. Smoke test signal scoring, topic generation, draft generation, and profile evolution.

The bootstrap script currently assumes:

- `signal_scoring -> signal/deep`
- `draft_generation -> draft/deep`
- all other current capabilities -> `balanced`

It also clears local capability-level fallback alias routing so that real upstream fallback stays owned by `zhaocai-gateway-v2`.

## Remaining Follow-up

- Clean up old provider-oriented copy on the admin pages.
- Optionally rename `ManagedModel` / `GatewayConnection` to alias- and gateway-access-specific names in a later migration.
- Add automated tests around gateway alias env fallback and admin alias sync.
