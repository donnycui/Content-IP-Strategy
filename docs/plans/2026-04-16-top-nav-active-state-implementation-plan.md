# Top Nav Active State Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a visible active state to the top navigation so the current section is obvious.

**Architecture:** Move the top navigation rendering into a small client component that reads the current pathname with `usePathname()`. Keep the existing nav item list in `app/layout.tsx`, add matcher support for grouped routes, and define a single `pill-active` style in global CSS.

**Tech Stack:** Next.js App Router, React client component, global CSS

---

### Task 1: Add a pathname-aware top navigation component

**Files:**
- Create: `components/top-nav.tsx`
- Modify: `app/layout.tsx`

- [ ] Add a small client component that receives nav items and computes `isActive`
- [ ] Support grouped route matching through optional `matchers`
- [ ] Replace the inline nav rendering in `app/layout.tsx`

### Task 2: Add the active navigation style

**Files:**
- Modify: `app/globals.css`

- [ ] Add a `pill-active` class
- [ ] Keep the style close to the current visual language
- [ ] Avoid changing non-active navigation items
