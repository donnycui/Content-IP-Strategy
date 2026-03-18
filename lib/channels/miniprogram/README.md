# Mini Program Channel Boundary

This folder does not implement a mini program client.

It defines the first channel boundary for a future mini program entry so the core platform can expose a small, mobile-friendly action surface without duplicating business logic.

## First-stage supported actions

- `getTodaySummary`
- `getDirections`
- `getTopicRecommendations`
- `respondToProfileUpdateSuggestion`
- `captureQuickNote`

## Design rules

- the mini program is a light action channel, not the full operating workspace
- all business logic should remain in `lib/services`
- this channel only adapts requests and responses for mobile-first use cases
- heavy editing workflows stay on Web in Phase 1

## Intended usage

The future mini program adapter should call platform services and return concise, mobile-ready payloads for:

- today's strategic snapshot
- direction review
- topic recommendation review
- quick confirmation on profile evolution suggestions
- quick idea capture

## Not in scope yet

- deep research-card editing
- full draft editing
- signal-source management
- complex calibration tables
