# CLAUDE.md — Social Media Performance Dashboard

## What This Is
A **social media performance dashboard** for Minor Hotels, powered by the Sprout Social API. Ranks 580+ hotel properties by engagement rate, impressions, and follower growth across Facebook, Instagram, and TikTok. Replaces manual CSV-export reporting with a live, filterable dashboard.

**PRD**: [docs/PRD-social-dashboard-v1.md](docs/PRD-social-dashboard-v1.md)

**Data source**: Sprout Social API via `workers/sprout-proxy` Cloudflare Worker. Dev mode uses `data/sprout-mock.json`.

## Tech Stack
- React 19 + Vite 7 + Tailwind CSS 4 + TypeScript 5.8 (strict)
- Minor Hotels theme (CSS custom properties) — `src/themes/minor-hotels.css`
- Chart.js + react-chartjs-2 for trend charts
- Radix UI for accessible primitives
- lucide-react for icons
- Vitest + Testing Library for tests
- ESLint + Biome for linting/formatting

## Dashboard Sections

### Section 1 — KPI Scorecard (`SocialKpiBar`)
5 metric cards: Impressions, Engagements, Engagement Rate %, Video Views, Follower Growth. Each with sparkline and delta vs previous period. Engagement Rate uses weighted calculation: `total_engagements / total_impressions` (NOT simple average).

### Section 2 — Performance Trends (`TrendChart`)
Chart.js line chart with metric toggle (Engagement Rate / Impressions / Follower Growth). Weekly x-axis, aggregated across filtered scope.

### Section 3 — Rankings (`PropertyRankingTable`)
Sortable hotel ranking table with pinned "Global Top 4 Avg" baseline row (`ui-glow-success`). Default: top 10 by engagement rate. Baseline always computed on ALL hotels regardless of active filters. Includes hotel search and show all toggle.

### Section 4 — Content Performance (`TopPostsTable`) — Stubbed
Top posts table. Requires live Sprout token to populate.

### Section 5 — Activity & Discipline (`ActivityGrid`)
2x4 stats grid: Posts Published, Avg Engagement/Post, Video Share, Posting Consistency.

### Section 6 — AI Insights (`InsightSummary`) — Stubbed
Claude-generated insight bullets. Requires `anthropic-proxy` worker deployment.

## Design System

### Theme
Active theme: **minor-hotels** (warm white, navy, custom fonts). Set via `@import` in `src/index.css`.

### Color Contract
- Semantic: `--color-primary`, `--color-secondary`, `--color-success`, `--color-warning`, `--color-danger`
- Each has `-dim` and `-glow` alpha variants
- Backgrounds: `--bg-primary`, `--bg-secondary`, `--bg-card`, `--bg-elevated`, `--bg-hover`
- Text: `--text-primary`, `--text-secondary`, `--text-muted`

### Typography (5 font stacks)
| Token | Tailwind | Usage |
|-------|----------|-------|
| `--font-heading` | `font-heading` | Page/section headings (Manuka Bold) |
| `--font-script` | `font-script` | Decorative accent (Amorfatti) |
| `--font-sans` | `font-sans` | Nav, buttons, labels (Plus Jakarta Sans) |
| `--font-body` | `font-body` | Body text (Newsreader) |
| `--font-mono` | `font-mono` | Data values, code |

### UI Component Library (`src/components/ui/`)
14 components: Card, Badge, Button, Value, Input, DateInput, Select/SelectItem, Checkbox, Overlay, Drawer, Accordion/AccordionItem, Sparkline, ScrollArea, ErrorBoundary

### CSS Utility Classes
- Cards: `.ui-card`, `.ui-glow`, `.ui-glow-secondary`, `.ui-glow-danger`, `.ui-glow-warning`, `.ui-glow-success`
- Tables: `.ui-table`, `.ui-expanded-row`
- Badges: `.ui-badge`, `.ui-badge-primary`, `.ui-badge-secondary`, `.ui-badge-success`, `.ui-badge-danger`, `.ui-badge-warning`

### Guidelines
1. **Never** use hardcoded hex colors — use CSS vars or Tailwind tokens
2. Use `Card` for all card containers, `Badge` for all inline labels
3. Use monospace for data values (`font-mono` or `Value`)
4. Engagement Rate = `total_engagements / total_impressions` (weighted, NOT simple avg)
5. Global Top 4 baseline is always computed on unfiltered data

## Dashboard Components (`src/components/dashboard/`)
| Component | Purpose |
|-----------|---------|
| `SocialKpiBar` | 5-card KPI scorecard with sparklines and deltas |
| `SocialFilterBar` | Date presets + Region/Brand selects |
| `PropertyRankingTable` | Hotel rankings with pinned baseline row |
| `TrendChart` | Chart.js line chart with metric toggle |
| `ActivityGrid` | 2x4 diagnostic stats grid |
| `TopPostsTable` | Top posts table (stubbed — needs Sprout token) |
| `InsightSummary` | AI insight accordion (stubbed — needs anthropic-proxy) |
| `KpiCard` | Single metric card (from boilerplate) |
| `KpiCards` | KPI grid container (from boilerplate) |
| `FilterBar` | Generic config-driven filter bar (from boilerplate) |
| `DataTable` | Generic sortable table (from boilerplate) |

## Hooks
| Hook | Purpose |
|------|---------|
| `useSproutData(filters)` | Fetches hotel data, filters by region/brand, computes aggregates + global top 4 baseline |
| `useFetchJson<T>(path)` | Generic JSON fetcher with loading/error states |
| `useFilters(groups)` | Filter state machine with pending/applied pattern |

## Utilities (`src/lib/`)
| File | Exports |
|------|---------|
| `social-types.ts` | `HotelEntry`, `HotelMetrics`, `WeeklySnapshot`, `AggregateMetrics`, `GlobalTop4Baseline`, `ViewLevel` |
| `types.ts` | `KpiTarget`, `KpiSnapshot`, `KpiData` |
| `kpi-utils.ts` | `getStatusZone()`, `getTrend()`, `formatValue()`, `getDelta()` |
| `format.ts` | `formatCurrency()`, `formatPercent()`, `formatNumber()`, `formatCompact()` |
| `utils.ts` | `cn()` — clsx + tailwind-merge |

## Data Files (`data/`)
| File | Schema |
|------|--------|
| `sprout-mock.json` | `HotelEntry[]` — 10 hotels with metrics + 8 weeks weekly_history |
| `social-targets.json` | KPI zone thresholds (engagement_rate, follower_growth, impressions growth) |

## Cloudflare Workers (`workers/`)
| Worker | Purpose | Status |
|--------|---------|--------|
| `sprout-proxy` | Proxies Sprout Social API, injects bearer token, 1hr cache | **Built** |
| `gamma-proxy` | Proxies Gamma API for presentation generation | Needs API key |
| `github-proxy` | Proxies GitHub API for inline editing | Built |

### Sprout Proxy Endpoints
| Route | Method | Purpose |
|-------|--------|---------|
| `/health` | GET | Health check |
| `/profiles` | GET | List all connected social profiles (24hr cache) |
| `/reporting` | POST | Aggregate metrics per profile for date range (1hr cache) |
| `/posts` | POST | Top posts by metric (1hr cache) |

### Worker Secrets
```bash
# sprout-proxy
npx wrangler secret put SPROUT_BEARER_TOKEN
npx wrangler secret put SPROUT_CUSTOMER_ID

# gamma-proxy (blocked — key not provisioned)
npx wrangler secret put GAMMA_API_KEY
```

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

## File Structure
```
src/
├── components/
│   ├── ui/           # Design system components (14 components)
│   ├── layout/       # Layout shell (Layout, Sidebar, Header)
│   └── dashboard/    # Social dashboard components (11 components)
├── hooks/            # useSproutData, useFetchJson, useFilters
├── lib/              # social-types, types, kpi-utils, format, utils
├── fonts/            # Custom typefaces (Minor Hotels theme)
├── themes/           # CSS theme files (minor-hotels active)
├── pages/            # SocialDashboardPage
├── __tests__/        # Tests
└── App.tsx           # App shell with Layout + nav config
data/                 # sprout-mock.json, social-targets.json
workers/              # Cloudflare Workers (sprout-proxy, gamma-proxy, github-proxy)
docs/                 # PRD, design system documentation
```
