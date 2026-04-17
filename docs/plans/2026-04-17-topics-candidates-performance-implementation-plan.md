# Topics And Candidates Performance Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve `/topics` and `/candidates` page responsiveness by splitting each page into lightweight shells and independently loaded list sections.

**Architecture:** Keep both pages as server-rendered shells, but move the profile anchor block and the heavy grouped list block into separate async section components. Wrap them in `Suspense` so the page header can render before the main list data resolves.

**Tech Stack:** Next.js App Router, React Suspense, TypeScript

---

### Task 1: Split the Topics page

**Files:**
- Modify: `app/topics/page.tsx`
- Create: `components/topics/topics-profile-section.tsx`
- Create: `components/topics/topics-list-section.tsx`

- [ ] Move the profile anchor panel into a separate server component
- [ ] Move the grouped topics list into a separate server component
- [ ] Wrap both sections in `Suspense`

### Task 2: Split the Candidates page

**Files:**
- Modify: `app/candidates/page.tsx`
- Create: `components/candidates/candidates-profile-section.tsx`
- Create: `components/candidates/candidates-list-section.tsx`

- [ ] Move the profile anchor panel into a separate server component
- [ ] Move the grouped candidates list into a separate server component
- [ ] Wrap both sections in `Suspense`

### Task 3: Reuse lightweight loading placeholders

**Files:**
- Reuse: `components/home/home-section-skeleton.tsx`

- [ ] Use a compact skeleton for anchor/profile sections
- [ ] Use a full skeleton for the list sections

### Task 4: Verify type safety

**Files:**
- No additional files required

- [ ] Run `tsc --noEmit`
- [ ] Confirm the pages still render the same major content blocks
