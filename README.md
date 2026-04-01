# Social Media Performance Dashboard

Automated social media performance reporting for Minor Hotels' 580+ properties. Pulls data from Sprout Social API and ranks properties by engagement rate, impressions, and follower growth across Facebook, Instagram, and TikTok.

**Replaces**: Manual CSV exports, hand-calculated rankings, spreadsheet-based reporting

## Quick Start

```bash
npm install
npm run dev
```

The dashboard loads mock data from `data/sprout-mock.json` in development. To connect live data, deploy the `sprout-proxy` Cloudflare Worker and set the `VITE_SPROUT_PROXY_URL` environment variable.

## Dashboard Sections

1. **KPI Scorecard** — Impressions, Engagements, Engagement Rate %, Video Views, Follower Growth
2. **Performance Trends** — Weekly line chart with metric toggle
3. **Property Rankings** — Sortable table with pinned Global Top 4 baseline row
4. **Content Performance** — Top posts by engagement (coming soon)
5. **Activity & Discipline** — Posting consistency diagnostics
6. **AI Insights** — Claude-generated performance insights (coming soon)

## Stack

- React 19 + Vite 7 + TypeScript 5.8 (strict)
- Tailwind CSS 4 + Minor Hotels design system
- Chart.js + react-chartjs-2
- Radix UI primitives
- Vitest + Testing Library
- ESLint + Biome

## Cloudflare Workers

| Worker | Purpose | Status |
|--------|---------|--------|
| `sprout-proxy` | Proxies Sprout Social API | Built |
| `gamma-proxy` | Proxies Gamma API for presentation export | Needs API key |
| `github-proxy` | Proxies GitHub API for inline editing | Built |

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run tests
npm run format       # Format with Biome
npm run format:check # Check formatting
```

## Secrets

### GitHub Secrets (for Actions)
| Secret | Purpose |
|--------|---------|
| `VITE_SPROUT_PROXY_URL` | Your deployed sprout-proxy Worker URL |
| `VITE_GAMMA_PROXY_URL` | Your deployed gamma-proxy Worker URL |
| `VITE_GITHUB_PROXY_URL` | Your deployed github-proxy Worker URL |

### Cloudflare Worker Secrets
```bash
cd workers/sprout-proxy
npx wrangler secret put SPROUT_BEARER_TOKEN
npx wrangler secret put SPROUT_CUSTOMER_ID

cd workers/gamma-proxy
npx wrangler secret put GAMMA_API_KEY

cd workers/github-proxy
npx wrangler secret put GITHUB_PAT
```

## PRD

Full product requirements: [docs/PRD-social-dashboard-v1.md](docs/PRD-social-dashboard-v1.md)
