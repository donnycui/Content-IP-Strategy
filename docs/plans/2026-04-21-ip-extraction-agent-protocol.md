# IP Extraction Agent Protocol

## Goal

Define the real bottom-layer protocol for the `IP提炼 Agent` so it behaves like a thinking agent instead of a template questionnaire.

This protocol is for the `zhaocai-IP-center` product surface, not for the old workbench.

## 1. Core Principle

The agent must not behave like:

- a form filler
- a field-by-field questionnaire
- a generic “knowledge creator” template generator

The agent must behave like:

- a creator-positioning interviewer
- a collaborative thinking partner
- a structured synthesis engine

In one sentence:

`The agent thinks first, then asks; it does not ask first and think later.`

## 2. Architecture

The agent is defined by five layers:

1. role prompt
2. turn state
3. structured output contract
4. memory contract
5. validation and retry rules

Prompt alone is not enough.

## 3. Role Prompt

### 3.1 What the agent is

The agent is:

- an IP extraction agent for creators
- responsible for helping the user discover, clarify, and name their creator direction
- allowed to challenge vague assumptions
- required to keep each turn focused on one most valuable next step

### 3.2 What the agent is not

The agent is not:

- a survey bot
- a profile form compressor
- a generic creator-archetype classifier

### 3.3 Role prompt shape

Recommended system instruction:

```text
You are the IP Extraction Agent inside zhaocai-IP-center.

Your job is to help the creator think clearly about who they are, what they should talk about, who they should serve, and what kind of creator identity is actually defensible.

You are not a questionnaire bot.
You must not ask fixed field-by-field questions unless the conversation truly needs that level of clarification.

At every turn:
1. understand what the user actually said
2. identify the most important uncertainty or contradiction
3. decide whether to stay in brainstorming mode or move into extraction mode
4. ask exactly one high-value next question
5. update the working profile draft cautiously

Do not invent polished positioning statements when the user is still unclear.
Do not collapse the creator into a generic “knowledge creator” template.
Do not ask multiple questions in one turn.
```

## 4. Turn State

Each turn must include structured state, not only raw transcript.

### 4.1 Required state

The model should receive:

- `brainstormingMode`
  - `OFF`
  - `AUTO`
  - `ON`
- `currentResponseMode`
  - `BRAINSTORMING`
  - `EXTRACTION`
- `transcript`
- `currentDraft`
- `confirmedBeliefs`
- `openQuestions`
- `detectedTensions`
- `turnCount`

### 4.2 What these fields mean

- `confirmedBeliefs`
  - things we already believe are true about the creator
- `openQuestions`
  - high-value unknowns still blocking a strong positioning
- `detectedTensions`
  - unresolved contradictions
  - example: wants traffic but hates trend-chasing

### 4.3 Example turn input

```json
{
  "brainstormingMode": "AUTO",
  "currentResponseMode": "BRAINSTORMING",
  "turnCount": 3,
  "confirmedBeliefs": [
    "The user has deep traditional manufacturing management experience",
    "The user wants to help traditional-business decision makers understand AI"
  ],
  "openQuestions": [
    "Should the creator be known for direction judgment or operational execution?",
    "Which audience segment should come first?"
  ],
  "detectedTensions": [
    "The user wants authority but dislikes slogan-like content"
  ],
  "currentDraft": {
    "positioning": "",
    "persona": "",
    "audience": "Traditional industry decision makers",
    "coreThemes": "",
    "voiceStyle": "",
    "growthGoal": "",
    "contentBoundaries": "",
    "currentStage": "EXPLORING",
    "name": ""
  },
  "transcript": [
    {
      "role": "user",
      "content": "I want to help traditional business owners understand AI, but I hate empty trend content."
    }
  ]
}
```

## 5. Structured Output Contract

The model must not return only natural language.

Each turn should return structured decision output first.

### 5.1 Required output fields

```json
{
  "currentUnderstanding": "string",
  "responseMode": "BRAINSTORMING | EXTRACTION",
  "strategy": "string",
  "primaryTension": "string | null",
  "openQuestion": "string | null",
  "nextQuestion": "string",
  "questionType": "OPENING | EXPLORATION | AUDIENCE | CAPABILITY | POSITIONING | THEMES | BOUNDARY | GOAL | STYLE | CONFIRMATION",
  "readyToFinalize": false,
  "draftProfile": {
    "name": "",
    "positioning": "",
    "persona": "",
    "audience": "",
    "coreThemes": "",
    "voiceStyle": "",
    "growthGoal": "",
    "contentBoundaries": "",
    "currentStage": "EXPLORING"
  }
}
```

### 5.2 Meanings

- `currentUnderstanding`
  - what the agent currently thinks is true
- `strategy`
  - why this next question is the best move
- `primaryTension`
  - the main contradiction if one exists
- `openQuestion`
  - the key unresolved issue
- `nextQuestion`
  - the only user-facing question shown this turn

### 5.3 UX rule

The product does not need to show all of these fields.

Default UI should show:

- `nextQuestion`
- optional short “current understanding”

The rest is for internal control, validation, and logging.

## 6. Response Mode Logic

### 6.1 BRAINSTORMING mode

Use when:

- the user is vague
- the user is conflicted
- the user has not yet named a defensible creator angle
- the conversation still needs exploration

Allowed behavior:

- expand possibilities
- compare options
- challenge assumptions
- help the user name a pattern

### 6.2 EXTRACTION mode

Use when:

- the user has already surfaced enough structure
- the main task is now to sharpen and compress
- the conversation needs precision, not more expansion

Allowed behavior:

- clarify audience
- sharpen positioning
- define themes
- define boundaries
- refine voice and goal

### 6.3 Mode switching

- `OFF` means always prefer `EXTRACTION`
- `ON` means always allow `BRAINSTORMING` unless the agent judges the creator is already very clear
- `AUTO` means the agent decides turn by turn

## 7. Validation Rules

The app must validate every turn output before accepting it.

### 7.1 Hard failures

Reject and retry if:

- `nextQuestion` is empty
- `nextQuestion` contains multiple stacked questions
- `responseMode` is missing
- JSON is invalid

### 7.2 Quality failures

Reject and retry if:

- the next question ignores the user’s last message
- the next question is nearly identical to the previous question
- the agent jumps to a polished positioning with weak evidence
- the draft uses generic archetype language with no transcript support

### 7.3 Retry rule

If the first model result fails validation:

- retry once with a stricter system reminder

If it still fails:

- surface a visible agent error
- do not silently switch to a question tree

This is critical.

The system must not silently revert to template questions.

## 8. Memory Contract

### 8.1 What to write per turn

Per turn, write:

- response mode
- current understanding
- primary tension
- open question

### 8.2 What to write into long-term memory

Only write into shared long-term memory when one of these is true:

- a real creator-positioning belief is confirmed
- a durable audience definition is confirmed
- a durable content boundary is confirmed
- a major creator tension is resolved

### 8.3 What not to write

Do not write:

- every raw message
- temporary speculation
- discarded possibilities

## 9. Finalization Rule

The agent can finalize only when:

- the creator direction is specific enough to be useful
- audience is not empty
- themes are not empty
- the positioning is not generic

If some fields are still unclear, the final draft must say:

- `待继续明确`

instead of inventing confident generic copy.

## 10. Implementation Note

The old quick extraction path and old fixed heuristic question tree should not return as primary logic.

The correct direction is:

- model-led turn generation
- app-level validation
- minimal explicit fallback only for hard error handling
