# Provider-Managed Model Routing Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the runtime dependency on `zhaocai-gateway` and let this app manage provider connections and model routing directly.

**Architecture:** Reuse the existing `GatewayConnection`/`ManagedModel`/`CapabilityRoute` schema, but reinterpret `GatewayConnection` as a provider connection. Update admin flows to manage direct provider connections and update the runtime execution layer to work against OpenAI-compatible base URLs without assuming a custom gateway.

**Tech Stack:** Next.js App Router, TypeScript, Prisma, PostgreSQL, OpenAI-compatible HTTP APIs

---

### Task 1: Reframe admin gateway UI as provider management

**Files:**
- Modify: `app/admin/gateways/page.tsx`
- Modify: `components/admin-gateway-create-form.tsx`
- Modify: `components/admin-gateway-actions.tsx`
- Modify: `app/admin/models/page.tsx`

- [ ] Update page copy to describe provider connections instead of `zhaocai-gateway`
- [ ] Remove zhaocai-specific default name and secret placeholder from the create form
- [ ] Make sync/test action feedback speak in provider/model terms
- [ ] Update model page empty states to reference provider sync rather than gateway sync

### Task 2: Make provider test/sync depend on `/v1/models`, not `/v1/providers`

**Files:**
- Modify: `lib/services/gateway-admin-service.ts`
- Modify: `lib/services/gateway-sync-service.ts`
- Modify: `lib/domain/contracts.ts`
- Modify: `app/api/admin/gateways/[id]/test/route.ts`
- Modify: `app/api/admin/gateways/[id]/sync/route.ts`

- [ ] Change connection testing to validate model-list accessibility
- [ ] Change model sync to use `/v1/models` as the primary discovery endpoint
- [ ] Stop requiring provider-list availability for a connection to be considered usable
- [ ] Keep response payloads aligned with the new provider-oriented semantics

### Task 3: Normalize runtime API endpoint construction for direct providers

**Files:**
- Modify: `lib/models/gateway-client.ts`
- Create: `lib/models/openai-endpoints.ts` (if a shared helper keeps the code simpler)

- [ ] Introduce a single helper for building OpenAI-compatible endpoints
- [ ] Support both root URLs and `/v1` URLs without duplicating or dropping the version segment
- [ ] Route `chat/completions`, `responses`, and `models` through the same normalization rule

### Task 4: Verify runtime routing assumptions still hold

**Files:**
- Modify: `lib/services/model-routing-service.ts` (only if needed for naming/comments)
- Modify: `docs/plans/2026-03-26-provider-managed-model-routing-design.md` (if implementation decisions shift)

- [ ] Confirm direct provider auth still resolves via `authSecretRef -> process.env[...]`
- [ ] Keep current capability routing and plan-tier logic intact
- [ ] Ensure the design doc still matches the implemented behavior

### Task 5: Release checks

**Files:**
- No code changes required unless issues are found

- [ ] Run a production-oriented build check
- [ ] Run a TypeScript no-emit check
- [ ] Start a local dev server if possible
- [ ] Smoke-test one admin page and one model-backed workflow if the environment allows it
- [ ] Record what passed, what was blocked by the harness, and what still needs manual verification
