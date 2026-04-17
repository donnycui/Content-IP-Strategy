# Conversational Profile Extraction Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a conversational profile-extraction flow that asks dynamic follow-up questions, maintains a live draft profile, and only finalizes into `CreatorProfile` when the interview is sufficiently complete.

**Architecture:** Keep the current quick extraction endpoint as a fallback path. Add a new session-based conversational flow with a dedicated persistence model, new API routes, and a dual-mode UI on `/profile/extract`. Reuse the existing final profile save path so the rest of the application continues to read from the same `CreatorProfile` table.

**Tech Stack:** Next.js App Router, React client state, TypeScript, Prisma, existing model routing/execution stack

---

### Task 1: Add conversational extraction persistence

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/<timestamp>_profile_extraction_sessions/migration.sql`

- [ ] Add a `ProfileExtractionSession` model
- [ ] Include session status, transcript, draft profile, current question, and turn count
- [ ] Add indexes for recent session lookup

### Task 2: Add service-layer conversation orchestration

**Files:**
- Create: `lib/services/profile-extraction-conversation-service.ts`
- Modify: `lib/profile-extraction.ts` if shared extraction helpers are reused

- [ ] Create a session start function
- [ ] Create a reply handler that updates transcript and draft
- [ ] Create a finalize handler that writes `CreatorProfile`
- [ ] Add conservative fallback behavior for per-turn failures

### Task 3: Add conversation API routes

**Files:**
- Create: `app/api/profile/extract/conversation/route.ts`
- Create: `app/api/profile/extract/conversation/[id]/reply/route.ts`
- Create: `app/api/profile/extract/conversation/[id]/finalize/route.ts`
- Modify: `lib/domain/contracts.ts`

- [ ] Define request/response payloads
- [ ] Expose create/reply/finalize endpoints
- [ ] Keep `/api/profile/extract` unchanged for quick mode

### Task 4: Add dual-mode extraction UI

**Files:**
- Modify: `components/profile-extract-form.tsx`
- Create: `components/profile-extract-conversation.tsx`
- Create: `components/profile-extract-draft-preview.tsx`
- Modify: `app/profile/extract/page.tsx` if needed

- [ ] Add a mode switch between conversational and quick extraction
- [ ] Render one-question-at-a-time conversational UI
- [ ] Render a live draft profile preview
- [ ] Add finalize and skip actions

### Task 5: Verification

**Files:**
- No new files required unless issues are found

- [ ] Run `tsc --noEmit`
- [ ] Run `npm run build`
- [ ] Verify quick extraction still works
- [ ] Verify conversational extraction can complete and save a `CreatorProfile`
