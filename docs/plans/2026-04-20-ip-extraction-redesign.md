# IP Extraction Redesign

## Goal

Replace the old template-like conversational extraction behavior with a more adaptive creator interview flow.

The new flow should:

- support `Brainstorming` mode as a first-class product control
- avoid fixed field-by-field interview behavior
- reduce generic fallback wording in the final profile draft
- keep the existing gateway-routed model execution path

## Product Decision

The IP extraction page now exposes a `Brainstorming` switch:

- `OFF`
- `AUTO`
- `ON`

Default:

- `AUTO`

Meaning:

- `OFF`: go directly into extraction-style clarification
- `AUTO`: system decides whether the user needs brainstorming first
- `ON`: start with collaborative divergence/convergence before structured extraction

## Behavioral Change

Previous behavior:

- ask the next missing field
- silently fall back to fixed heuristic questions
- auto-fill final profile with generic “knowledge creator” defaults

New behavior:

- infer whether the current turn should be `BRAINSTORMING` or `EXTRACTION`
- guide the user through exploration when the input is ambiguous
- only then compress into profile fields
- keep incomplete fields visibly incomplete instead of auto-fabricating a polished generic identity

## Acceptance Impact

After this change:

- IP extraction should feel less like a questionnaire
- brainstorming mode should be visible and adjustable in the UI
- final draft wording should no longer auto-collapse into one generic creator archetype
