# Signals Page Performance Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve the Signals page by splitting form loading and table loading into separate async sections.

**Architecture:** Keep the page shell server-rendered, but move the ingest/create forms and the signal table into separate server components. Wrap both sections in `Suspense` so the page header can render immediately while the heavier data waits in the background.

**Tech Stack:** Next.js App Router, React Suspense, TypeScript

---

### Task 1: Split the Signals page into section components

**Files:**
- Modify: `app/signals/page.tsx`
- Create: `components/signals/signals-forms-section.tsx`
- Create: `components/signals/signals-table-section.tsx`

- [ ] Move the forms block into its own server component
- [ ] Move the table block into its own server component
- [ ] Keep the existing page header in `app/signals/page.tsx`

### Task 2: Add loading fallbacks

**Files:**
- Reuse: `components/home/home-section-skeleton.tsx`

- [ ] Wrap the forms section in `Suspense`
- [ ] Wrap the table section in `Suspense`
- [ ] Use a compact skeleton fallback that fits the Signals layout

### Task 3: Verify the page still behaves correctly

**Files:**
- No new files required

- [ ] Run a TypeScript no-emit check
- [ ] Verify `/signals` still renders the header, forms, and table
- [ ] Verify the page shell appears before the full table data is ready
