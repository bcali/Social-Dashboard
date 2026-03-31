# Minor Hotels Dashboard Starter

A batteries-included boilerplate for quickly bootstrapping branded dashboard projects. Comes with a sidebar layout, KPI cards, filters, sortable data table, and the Minor Hotels design system.

## Quick Start

```bash
# 1. Clone or use as GitHub template
gh repo create my-dashboard --template bcali/-web-starter --private --clone
cd my-dashboard

# 2. Run the bootstrap script
bash bootstrap.sh

# 3. Install and dev
npm install
npm run dev
```

## What's Included

### Stack
- React 19 + Vite 7 + TypeScript 5.8 (strict)
- Tailwind CSS 4 + Radix UI primitives
- Chart.js + Sonner toasts
- Vitest + Testing Library
- ESLint + Biome (formatting)

### Dashboard Skeleton
- **Layout**: Sidebar nav + header + scrollable main area
- **KPI Cards**: Config-driven metrics with sparklines, status zones, trends
- **Filter Bar**: Date range presets, toggle groups, apply/reset
- **Data Table**: Sortable columns, configurable renderers

### Theme System
Four built-in themes — swap by changing one CSS import:

| Theme | Description |
|-------|-------------|
| `minor-hotels` | Minor Hotels brand (warm white, navy, custom fonts) — **default** |
| `clean-light` | Professional blue/gray on white |
| `neutral-dark` | Muted slate/emerald on dark |
| `tron-dark` | Neon cyan/orange on black |

All themes use the same CSS variable names (`--color-primary`, `--color-success`, etc.) so components adapt automatically.

### UI Components (`src/components/ui/`)
14 components: Card, Badge, Button, Value, Input, DateInput, Select, Checkbox, Overlay, Drawer, Accordion, Sparkline, ScrollArea, ErrorBoundary

### Cloudflare Workers
| Worker | Purpose |
|--------|---------|
| `gamma-proxy` | Proxies requests to Gamma API for AI presentation generation |
| `github-proxy` | Proxies GitHub API for inline editing from the dashboard |

### CI/CD
- **GitHub Pages**: Push to main → lint → test → build → deploy
- **Vercel**: Connect repo, auto-deploys on push
- **PR checks**: Format, lint, test, build (blocks merge on failure)

## Customization

### Swap your data
Replace `data/kpis.json` and `data/records.json` with your domain data. KPI cards auto-adapt to the targets you define. Table columns are configured in `src/pages/DashboardPage.tsx`.

### Add views
1. Create a new page in `src/pages/`
2. Add a nav item to the `navItems` array in `App.tsx`
3. Add a conditional render in the Layout children

### Change theme
Edit `src/index.css` line 2:
```css
@import "./themes/clean-light.css";  /* or minor-hotels, neutral-dark, tron-dark */
```

### Add a custom theme
Create `src/themes/my-theme.css` with the same CSS variable names as existing themes, then import it.

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint
npm test             # Run tests
npm run format       # Format with Biome
npm run format:check # Check formatting
npm run preview      # Preview production build
```

## Secrets

### GitHub Secrets (for Actions)
| Secret | Purpose |
|--------|---------|
| `VITE_GAMMA_PROXY_URL` | Your deployed gamma-proxy Worker URL |
| `VITE_GITHUB_PROXY_URL` | Your deployed github-proxy Worker URL |

### Cloudflare Worker Secrets
```bash
cd workers/gamma-proxy
npx wrangler secret put GAMMA_API_KEY

cd workers/github-proxy
npx wrangler secret put GITHUB_PAT
```
