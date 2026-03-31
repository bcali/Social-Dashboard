# CLAUDE.md — Minor Hotels Dashboard Starter

## What This Is
A **generic dashboard boilerplate** for Minor Hotels internal tools. Clone this repo, run `bootstrap.sh`, swap the data files, and you have a branded dashboard for any use case — TikTok tracker, social media monitoring, payment analytics, etc.

## Tech Stack
- React 19 + Vite 7 + Tailwind CSS 4 + TypeScript 5.8 (strict)
- Theme-aware component system (CSS custom properties)
- Radix UI for accessible primitives
- lucide-react for icons
- Vitest + Testing Library for tests
- ESLint + Biome for linting/formatting

## Design System

Full reference: [docs/DESIGN-SYSTEM.md](docs/DESIGN-SYSTEM.md)

### Theme System
Four themes in `src/themes/`. All implement the same CSS variable contract:
- **minor-hotels** — Minor Hotels brand (warm white, navy, custom fonts) — default
- **clean-light** — Professional blue/gray on white
- **neutral-dark** — Muted slate/emerald on dark
- **tron-dark** — Neon cyan/orange on black (legacy)

Active theme is set via `@import` in `src/index.css`.

### Color Contract
- Semantic: `--color-primary`, `--color-secondary`, `--color-success`, `--color-warning`, `--color-danger`
- Each has `-dim` and `-glow` alpha variants
- Backgrounds: `--bg-primary`, `--bg-secondary`, `--bg-card`, `--bg-elevated`, `--bg-hover`
- Text: `--text-primary`, `--text-secondary`, `--text-muted`
- Surfaces: `--surface-success`, `--surface-danger`, `--surface-warning`, `--surface-info`

### Typography (5 font stacks)
| Token | Tailwind | Usage |
|-------|----------|-------|
| `--font-heading` | `font-heading` | Page/section headings |
| `--font-script` | `font-script` | Decorative accent |
| `--font-sans` | `font-sans` | Nav, buttons, labels |
| `--font-body` | `font-body` | Body text |
| `--font-mono` | `font-mono` | Data values, code |

### UI Component Library (`src/components/ui/`)
| Component | Purpose |
|-----------|---------|
| `Card` | Card container with glow (accent border) variants |
| `Badge` | Inline label (primary/secondary/success/danger/warning) |
| `Button` | Button (default/secondary/destructive/ghost/link, sm/default/lg/icon) |
| `Value` | Monospace number display |
| `Input` | Form input with size variants (sm/default/lg) |
| `DateInput` | Styled date picker |
| `Select` / `SelectItem` | Radix dropdown select |
| `Checkbox` | Toggle switch with label |
| `Overlay` | Centered modal dialog (sm-3xl max-width) |
| `Drawer` | Right-side slide-in panel |
| `Accordion` / `AccordionItem` | Expand/collapse sections |
| `Sparkline` | SVG micro-chart |
| `ScrollArea` | Radix scroll wrapper |
| `ErrorBoundary` | Error boundary with retry |

### Dashboard Components (`src/components/dashboard/`)
| Component | Purpose |
|-----------|---------|
| `KpiCards` | Grid of KPI metric cards, fetches from `data/kpis.json` |
| `KpiCard` | Single metric card with status zone, sparkline, delta |
| `FilterBar` | Config-driven filter bar (date presets, toggle groups) |
| `DataTable` | Sortable generic table with column config |

### Layout Components (`src/components/layout/`)
| Component | Purpose |
|-----------|---------|
| `Layout` | Dashboard shell (sidebar + header + scrollable main) |
| `Sidebar` | 64px icon nav, config-driven via `navItems` prop |
| `Header` | Brand title bar with customizable title + subtitle |

### CSS Utility Classes
- Cards: `.ui-card`, `.ui-glow`, `.ui-glow-secondary`, `.ui-glow-danger`, `.ui-glow-warning`, `.ui-glow-success`
- Tables: `.ui-table`, `.ui-expanded-row`
- Badges: `.ui-badge`, `.ui-badge-primary`, `.ui-badge-secondary`, `.ui-badge-success`, `.ui-badge-danger`, `.ui-badge-warning`
- Bars: `.ui-bar-track`, `.ui-bar-segment`, `.ui-bar-primary`, `.ui-bar-secondary`, `.ui-bar-danger`, `.ui-bar-warning`, `.ui-bar-muted`, `.ui-bar-editing`
- Other: `.ui-section-title`, `.ui-value`, `.ui-input`, `.ui-pulse`

### Guidelines
1. **Never** use hardcoded hex colors — use CSS vars or Tailwind tokens
2. Use `Card` for all card containers, `Badge` for all inline labels
3. Use monospace for data values (`font-mono` or `Value`)
4. Status colors map to semantic variants: primary (complete), secondary (in progress), danger (blocked), warning (at risk), success (on track)
5. Use Overlay/Drawer for modals and detail panels, not custom implementations
6. Use Input/Select/DateInput/Checkbox for form controls

## Hooks
| Hook | Purpose |
|------|---------|
| `useFetchJson<T>(path)` | Generic JSON fetcher with loading/error states |
| `useFilters(groups)` | Filter state machine with pending/applied pattern |

## Utilities (`src/lib/`)
| File | Exports |
|------|---------|
| `types.ts` | `KpiTarget`, `KpiSnapshot`, `KpiData` |
| `kpi-utils.ts` | `getStatusZone()`, `getTrend()`, `formatValue()`, `getDelta()` |
| `format.ts` | `formatCurrency()`, `formatPercent()`, `formatNumber()`, `formatCompact()` |
| `utils.ts` | `cn()` — clsx + tailwind-merge |

## Data Files (`data/`)
| File | Schema |
|------|--------|
| `kpis.json` | `{ targets: KpiTarget[], history: KpiSnapshot[] }` — KPI definitions + weekly history |
| `records.json` | `DataRecord[]` — Table data with id, name, category, status, value, date, region |

To customize: replace these files with your domain data. KPI cards auto-adapt to the targets defined in `kpis.json`. Table columns are configured in `DashboardPage.tsx`.

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
│   └── dashboard/    # Dashboard components (KpiCards, FilterBar, DataTable)
├── hooks/            # useFetchJson, useFilters
├── lib/              # types, kpi-utils, format, utils
├── fonts/            # Custom typefaces (Minor Hotels theme)
├── themes/           # CSS theme files (4 themes)
├── pages/            # DashboardPage
├── __tests__/        # Tests
└── App.tsx           # App shell with Layout + nav config
data/                 # JSON data (synced to public/data/ by Vite plugin)
workers/              # Cloudflare Workers (gamma-proxy, github-proxy)
docs/                 # Design system documentation
```
