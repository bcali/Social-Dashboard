# CLAUDE.md — Social Media Performance Dashboard

## What This Is

A **social media performance dashboard** for Minor Hotels, powered by the Sprout Social API. Ranks 580+ hotel properties by engagement rate, impressions, and follower growth across Facebook, Instagram, and TikTok.

**PRD**: [docs/PRD-social-dashboard-v1.md](docs/PRD-social-dashboard-v1.md)

**Data source**: Sprout Social API via `workers/sprout-proxy` Cloudflare Worker. Dev mode uses `data/sprout-mock.json`.

## Tech Stack
- React 19 + Vite 7 + Tailwind CSS 4 + TypeScript 5.8 (strict)
- Minor Hotels theme — `src/themes/minor-hotels.css`
- Chart.js + react-chartjs-2 for trend charts
- Radix UI, lucide-react, Vitest, ESLint + Biome

## Business Rules

1. **Engagement Rate** = `total_engagements / total_impressions` (weighted calculation, NOT simple average of per-hotel rates)
2. **Global Top 4 baseline** is always computed on ALL hotels regardless of active filters. Never recompute on filtered subset.
3. Baseline row uses `ui-glow-success` styling and is always pinned at top of ranking table.
4. **Never** use hardcoded hex colors — use CSS vars or Tailwind tokens
5. Use monospace for data values (`font-mono` or `Value` component)

## Blockers & Dependencies

- **Sprout Bearer token**: Owned by Debakti. Not provisioned yet. Build with mock data (`data/sprout-mock.json`) until available.
- **Gamma API key**: Not provisioned. `gamma-proxy` worker is built but non-functional.
- **Cloudflare account**: `a8935525a25192fb592924fbf9eeb85c`

## Workers

| Worker | Purpose | Status |
|--------|---------|--------|
| `sprout-proxy` | Proxies Sprout Social API, injects bearer token, 1hr cache | Built — needs token |
| `gamma-proxy` | Proxies Gamma API for presentation generation | Built — needs API key |
| `github-proxy` | Proxies GitHub API for inline editing | Built |

### Sprout Proxy Endpoints
| Route | Method | Purpose |
|-------|--------|---------|
| `/health` | GET | Health check |
| `/profiles` | GET | List connected social profiles (24hr cache) |
| `/reporting` | POST | Aggregate metrics per profile for date range (1hr cache) |
| `/posts` | POST | Top posts by metric (1hr cache) |

## Stubbed Sections (need live API)
- `TopPostsTable` — needs Sprout token
- `InsightSummary` — needs `anthropic-proxy` worker deployment

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint
npm test             # Tests (single run)
npm run test:watch   # Tests (watch mode)
npm run format       # Biome format
npm run format:check # Biome check
```

---

## Pre-Implementation Protocol

Before writing any code, run `/plan`. This checks discoveries, hallucination log, and dead ends before creating a reviewed implementation plan.

## Context Management

- If working on the same error for 3+ iterations: STOP. State what you tried. Propose a different approach. Check `docs/discoveries/`.
- Use subagents for exploration. Keep main context for implementation.
- After completing work, run `/postmortem` if debugging took 3+ iterations.

## QA Protocol

After implementation, always run qa-fast first (`"Run qa-fast on my changes"`). Only run qa-deep if qa-fast passes.

## Cross-Project Knowledge

For general React/Vite/Tailwind/Cloudflare discoveries, see:
- https://github.com/bcali/-web-starter/tree/main/docs/discoveries/
- https://github.com/bcali/-web-starter/tree/main/docs/anti-patterns/

## MEMORY.md Review

Claude Code auto-generates MEMORY.md from learned patterns. Review monthly. Delete entries referencing workarounds for bugs that have been fixed.
Last reviewed: _not yet reviewed_
