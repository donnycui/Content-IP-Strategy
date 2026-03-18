# OpenClaw Integration Boundary

This folder does not implement a full OpenClaw plugin yet.

It defines the first integration boundary so the Creator OS core can later be exposed through OpenClaw as an agentic channel without changing the core platform model.

## Channel role

OpenClaw is not the primary runtime in Phase 1.

Its role is:

- conversational entry for higher-level creator workflows
- trigger surface for temporary sub-agents
- reminder and orchestration channel
- future home for skill-aware task execution

Web remains the primary runtime and full operating workspace.

## First tool set

- `extract_ip_profile`
- `generate_directions`
- `generate_topics`
- `generate_topic_candidates`
- `generate_profile_updates`

Later additions:

- `draft_content`
- `run_review`
- `distribute_content`

## Design rules

- OpenClaw should call platform services or thin API contracts, not duplicate business logic
- sub-agents should be temporary workflow helpers, not long-lived systems of record
- creator state stays in the main platform data model
- web continues to own the heavy editing surfaces

## Main-agent / sub-agent split

- the main agent decides which creator workflow to enter next
- sub-agents handle bounded tasks such as IP extraction, direction generation, or review
- after a sub-agent completes, state is written back into the core platform objects

## Not in scope yet

- actual OpenClaw plugin registration
- real tool transport wiring
- background reminder jobs
- skill packaging
