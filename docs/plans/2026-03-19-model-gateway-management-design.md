# Model Gateway / Model Management Design

## Goal

Define how Creator OS should evolve from a single-model configuration into a routed multi-model system that can:

- support different model choices for different sub-agents
- expose user-facing model tiers or quality levels
- enable future pricing differentiation
- let administrators manage model access without hardcoding API details into business logic
- integrate with `zhaocai-gateway` as the preferred model infrastructure layer

## Core Decision

The system should not build a second full model-control plane inside Creator OS.

Instead:

- `zhaocai-gateway` is the model infrastructure layer
- `Creator OS` is the model business-strategy layer

This means:

- provider truth lives in `zhaocai-gateway`
- model truth lives in `zhaocai-gateway`
- Creator OS owns capability routing, access control, pricing policy, and user experience

## Product Principle

Model management should not be treated as a generic settings page.

It is a platform control surface that answers:

- which sub-agent should use which model
- which users can access which quality level
- when fallback is allowed
- how cost and quality are balanced across Creator OS workflows

## System Roles

### zhaocai-gateway

Responsible for:

- provider management
- model registration
- API key and base URL management
- routing and failover
- model health
- unified inference entry

### Creator OS

Responsible for:

- capability-level routing
- plan/tier access policy
- user-facing model-tier UX
- cost and usage visibility
- mapping sub-agent needs to model strategy

### Channel Layer

Applies the same model policy through:

- `Web`
- `Mini Program`
- later: `OpenClaw`

Channels should never directly own provider or API-key truth.

## Why This Matters

The current system is still effectively single-model.

Today, major generation paths read environment variables directly and call a fixed protocol. This prevents:

- capability-specific model routing
- controlled fallback
- user-visible model tiers
- flexible pricing strategy
- clean integration with `zhaocai-gateway`

The platform therefore needs a dedicated model layer before expanding more AI-driven workflows.

## Core Objects

### 1. GatewayConnection

Represents a configured model gateway.

Suggested fields:

- `name`
- `baseUrl`
- `authType`
- `authSecretRef`
- `isActive`
- `healthStatus`
- `lastSyncedAt`

Primary early instance:

- `zhaocai-gateway`

### 2. ManagedModel

Represents a model synchronized into Creator OS and annotated for product usage.

Suggested fields:

- `gatewayConnectionId`
- `providerKey`
- `modelKey`
- `displayName`
- `capabilityTags`
- `tier`
- `enabled`
- `visibleToUsers`

This is not the system of record for provider truth. It is a product-facing model cache with local annotations.

### 3. CapabilityRoute

Represents routing policy from a Creator OS capability to a model strategy.

Suggested fields:

- `capabilityKey`
- `defaultModelId`
- `fallbackModelId`
- `allowFallback`
- `allowUserOverride`
- `notes`

Example capabilities:

- `signal_scoring`
- `ip_extraction_interview`
- `ip_strategy_report`
- `direction_generation`
- `topic_generation`
- `topic_candidate_generation`
- `profile_evolution`
- `draft_generation`

### 4. PlanModelAccess

Represents what plans or product tiers can use.

Suggested fields:

- `planKey`
- `allowedTiers`
- `allowedCapabilities`
- `canSelectModel`
- `canUsePremiumReasoning`

### 5. ModelUsageLog

Represents one routed model call.

Suggested fields:

- `creatorProfileId`
- `capabilityKey`
- `modelId`
- `gatewayConnectionId`
- `channel`
- `latencyMs`
- `estimatedCost`
- `success`
- `errorCode`

This becomes essential for:

- pricing strategy
- cost control
- quality analysis
- operational debugging

## Information Architecture

The model-management module should be organized as four admin surfaces.

### 1. Gateway Management

Purpose:

- connect Creator OS to `zhaocai-gateway`
- verify health
- sync available providers and models

### 2. Model Registry

Purpose:

- show synchronized models
- add product labels and tiers
- enable or disable models for Creator OS usage

### 3. Capability Routing

Purpose:

- assign model policy to each Creator OS capability or sub-agent
- define fallback behavior
- define whether user override is allowed

This is the most important admin view.

### 4. Plans and Access

Purpose:

- decide which user tiers can access which model tiers
- support future commercialization

This can be staged after the first three views.

## Admin UX Boundary

Creator OS should have a management backend, but not a separate heavyweight admin product in the first phase.

Recommended first-phase structure inside the current web app:

- `/admin/gateways`
- `/admin/models`
- `/admin/routing`
- later: `/admin/plans`

This keeps admin control close to the current Web host while preserving the future ability to split administration if needed.

## Runtime Architecture

The current runtime pattern should evolve from:

- business capability -> env vars -> direct model protocol

to:

- capability -> capability route -> model adapter -> gateway client -> model

### Capability Resolver

Resolves which model strategy applies for:

- a capability
- a user plan
- an optional user-selected quality level

### Model Adapter

Normalizes protocol differences between:

- OpenAI Responses
- OpenAI Chat Completions
- Anthropic Messages
- future provider-specific protocols

This is the key precondition for clean `zhaocai-gateway` integration.

### Gateway Client

Handles actual outbound calls to:

- `zhaocai-gateway`
- or later, additional gateways/providers if needed

Business code should not know or care which transport protocol is used at runtime.

## User-Facing Product Strategy

Most users should not select raw model names in the first phase.

Recommended first-phase UX:

- expose quality tiers such as `快速`, `平衡`, `深度`
- or commercial product tiers such as `标准`, `专业`, `旗舰`

Real model names should remain primarily visible in admin and debugging contexts.

This supports:

- cleaner UX
- easier pricing
- easier backend model replacement without changing the product surface

## Relationship to Creator OS Agent Structure

Creator OS should be treated as one main agentic system with multiple sub-agents.

Model routing should therefore be designed around sub-agent needs rather than page needs.

Examples:

- `IP extraction sub-agent` needs deep reasoning and long-context interviewing
- `Direction and topic sub-agent` needs structured synthesis and prioritization
- `Creation sub-agent` needs strong writing and transformation quality
- `Review and evolution sub-agent` needs disciplined diagnosis and boundary correction

The model layer should express these needs through capability routing rather than ad hoc per-page overrides.

## MVP Scope

### Must Do

1. Connect Creator OS to `zhaocai-gateway`
2. Sync providers and models into local managed records
3. Define capability routing for core Creator OS capabilities
4. Add a model adapter layer
5. Route selected high-value capabilities through the adapter
6. Record usage logs

### Do Not Do Yet

1. full pricing engine
2. full RBAC admin system
3. free-form user selection of every raw model
4. multi-gateway optimization marketplace
5. automatic cost optimizer
6. advanced experimentation system

## Implementation Priorities

Recommended order:

1. add data model support
2. add runtime model adapter
3. refactor current direct model callers
4. add admin pages for gateway/model/routing
5. add usage logging
6. add plan/tier mapping

## Success Criteria

This module is successful when:

- Creator OS no longer hardcodes one model configuration for multiple capabilities
- at least the key Creator OS sub-agents route through explicit capability policies
- `zhaocai-gateway` can act as the model truth source
- admins can change routing without rewriting business logic
- the platform can later price model quality by tier without redesigning the system
