# OpenClaw Integration Scope

Date: 2026-03-18
Status: Draft
Owner: cuijunpeng

## Purpose

Define the first OpenClaw integration boundary for Creator OS without implementing the real plugin yet.

The goal is to prepare a clean agentic channel so the system can later expose strategic creator workflows through OpenClaw while keeping Web as the primary runtime.

## Channel Position

- `Web` remains the main operating workspace
- `Mini Program` is the first lightweight action channel
- `OpenClaw` is a future agentic channel for deep conversation, orchestration, reminders, and sub-agent execution

## Why OpenClaw Fits

OpenClaw is a better fit for:

- deep IP extraction conversations
- strategic direction prompts
- periodic creator check-ins
- sub-agent style task routing
- skill-aware workflow execution

It is not the best first home for:

- dense table workflows
- long-form editing surfaces
- full dashboard-style operations

## First Tool Set

The first Creator OS capability set that maps naturally to OpenClaw is:

- `extract_ip_profile`
- `generate_directions`
- `generate_topics`
- `generate_topic_candidates`
- `generate_profile_updates`

These are the strategy and workflow triggers that benefit from an agentic surface before deeper drafting or distribution is added.

## Main Agent and Sub-Agents

### Main agent

The main agent should:

- understand current creator context
- decide which workflow is most relevant now
- route the request into the right capability or temporary sub-agent

### Temporary sub-agents

Sub-agents should be short-lived and task-specific, for example:

- IP extraction interview agent
- direction generation agent
- topic recommendation agent
- profile evolution review agent

They should not become systems of record. Their output should always write back into the core platform objects.

## Backing Capabilities

The first OpenClaw tool layer should map to the existing platform services:

- `extractCreatorProfileAndActivate`
- `regenerateDirections`
- `regenerateTopics`
- `regenerateTopicCandidates`
- `regenerateProfileEvolutionSuggestions`

This keeps the platform core stable while allowing the agentic channel to grow later.

## Not in Scope Yet

- real plugin registration in OpenClaw
- background reminder scheduling
- skill packaging and skill marketplace behavior
- content drafting tools
- review and distribution tools

## Success Criteria

The OpenClaw boundary is considered correct when:

- the initial tool set is explicit
- the main-agent / sub-agent split is clear
- the backing platform capabilities are already identified
- OpenClaw can later be added without rewriting the core platform
