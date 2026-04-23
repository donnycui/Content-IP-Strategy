# VPS Backend Split Test Design

## Goal

Validate a simpler architecture where:

- Vercel serves the frontend shell
- a VPS serves selected backend APIs
- the heaviest workflows stop depending on Vercel server functions

This is a test branch, not yet the final production architecture.

## Test Scope

Only move the most expensive creator-facing workflows first:

1. `IP提炼`
2. `方向与选题`

Keep everything else unchanged for now.

## Proposed Architecture

### Frontend

- stays in the current Next.js app
- renders fast shells
- uses an external backend base URL when configured

### Backend

- a lightweight Node server inside this repo
- calls the existing service layer directly
- exposes REST endpoints for:
  - IP extraction session get/create/reply/finalize
  - model-tier access
  - directions generate
  - topics generate
  - topic-candidates generate
  - lightweight topic-direction dashboard read

## Why This Test Is Useful

This test answers one practical question:

`Does moving the heavy business logic off Vercel noticeably improve creator-facing response time?`

If yes:

- continue migrating more workflow endpoints

If no:

- the biggest remaining problem is not Vercel, but the backend data/model chain itself

## Constraints

- no new framework required
- reuse the current Prisma + service layer
- keep the frontend changes small and reversible
