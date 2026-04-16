# Homepage Performance Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve homepage navigation responsiveness by replacing the single heavy workspace query with independently loading homepage sections.

**Architecture:** Keep the homepage as a server-rendered page shell, but split data loading into independent section-level server components wrapped in `Suspense`. Add a new lightweight service module for homepage queries instead of forcing `app/page.tsx` to await a single all-in-one workspace object.

**Tech Stack:** Next.js App Router, React Suspense, TypeScript, Prisma

---

### Task 1: Add lightweight homepage queries

**Files:**
- Create: `lib/services/homepage-service.ts`

- [ ] Add a summary query for counts only
- [ ] Add a directions query for the visible homepage subset
- [ ] Add a candidates query for the visible homepage subset
- [ ] Add an output query for latest research card + draft count

### Task 2: Split the homepage into independently loaded sections

**Files:**
- Modify: `app/page.tsx`
- Create: `components/home/home-summary-section.tsx`
- Create: `components/home/home-directions-section.tsx`
- Create: `components/home/home-candidates-section.tsx`
- Create: `components/home/home-output-section.tsx`

- [ ] Keep the existing headline shell in `app/page.tsx`
- [ ] Replace direct `getTodayWorkspace()` usage with section components
- [ ] Wrap each section in `Suspense`

### Task 3: Add localized loading placeholders

**Files:**
- Create: `components/home/home-section-skeleton.tsx`

- [ ] Add a reusable lightweight skeleton for homepage sections
- [ ] Use the skeleton as the `fallback` for each `Suspense` boundary

### Task 4: Verify homepage still renders correct content

**Files:**
- No new files required

- [ ] Run a TypeScript no-emit check
- [ ] Run a production build check
- [ ] Verify the homepage still shows the expected four sections
- [ ] Verify loading behavior is localized rather than page-blocking
