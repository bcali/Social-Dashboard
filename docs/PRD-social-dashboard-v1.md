# PRD: Social Media Performance Dashboard — V1

**Status:** Draft  
**Owner:** Brian Clark  
**Last Updated:** 2026-03-31  
**Repo:** `bcali/Social-Dashboard`  
**Data Source:** Sprout Social API  

---

## 1. Problem

The social media team manually extracts top-performing properties from each channel (Facebook, Instagram, TikTok), averages the results, and compiles rankings by hand. This process:

- Cannot rank individual properties across channels simultaneously
- Cannot filter by region or brand without re-running exports
- Cannot be benchmarked against a baseline without spreadsheet work
- Takes hours of analyst time that should be zero

The result: social performance is invisible to leadership in real time, and property-level coaching is reactive rather than proactive.

---

## 2. Goal — V1

Build a single-screen dashboard that:

1. Pulls live data from the Sprout Social API (no manual CSV exports)
2. Ranks properties by engagement rate, impressions, or follower growth — across all channels combined
3. Shows KPI scorecards, trend lines, top content, and activity discipline in one view
4. Scales from Global → Region → Hotel without layout changes
5. Exports a summary to Gamma for executive reporting

**V1 is internal tooling only.** No auth wall required if deployed behind VPN/internal access. Ship fast, validate against manual calcs, iterate.

---

## 3. Out of Scope — V1

| Feature | Phase |
|---|---|
| Competitor / comp set benchmarking | Phase 2 |
| Multi-property comp set comparison | Phase 2 |
| Paid vs organic split | Phase 2 |
| TikTok Business API (if not in Sprout) | Phase 2 |
| Property-level user login / permissions | Phase 3 |
| Automated Gamma push on schedule | Phase 3 |

---

## 4. Users

| User | Goal |
|---|---|
| Global Social Lead | Rank all properties; identify top/bottom performers; export for exec reporting |
| Regional Manager | Filter to their region; coach underperforming hotels |
| Property Social Manager | See their single hotel vs. regional peers |

---

## 5. Data Source: Sprout Social API

**Base URL:** `https://api.sproutsocial.com/v1/`  
**Auth:** Bearer token (per-customer profile). Tokens provided by Debakti.

### Key Endpoints

```
GET /v1/{customer_id}/analytics/profiles
  → List all connected social profiles (mapped to hotel + channel)

GET /v1/{customer_id}/analytics/reporting/profiles
  → Aggregate metrics per profile for a date range

POST /v1/{customer_id}/analytics/post
  → Top posts by metric (for Section 4 — Content Performance)
```

### Metric Fields (Sprout API names)

| Dashboard Label | Sprout Field |
|---|---|
| Impressions | `impressions` |
| Engagements | `engagements` |
| Engagement Rate (%) | `engagement_rate_by_impressions_percentage` |
| Follower Growth | `net_follower_growth` |
| Video Views | `video_views` |
| Posts Published | `messages_sent` |

### Property Mapping

Each Sprout profile maps to one property + one channel. The hotel directory (to be shared by Debakti) is the source of truth for:

- `profile_id` → `hotel_name`
- `hotel_name` → `region` (AMEA / MEA / Europe / Americas / etc.)
- `hotel_name` → `brand` (AN / AV / NH / Other)

This mapping lives in `data/hotels.json` (see Section 8).

### API Proxy

All Sprout API calls route through the existing Cloudflare Worker at `workers/` to avoid CORS and keep the token server-side. The worker handles:

- Bearer token injection
- Response caching (TTL: 1 hour for analytics, 24 hours for profile list)
- Error normalization

---

## 6. Dashboard Layout

One layout. Same sections at Global, Region, and Hotel view levels. Filter context changes what data populates — not the structure.

### Header (Always Visible)

```
[Minor Hotels Logo]  Social Media Performance Overview
                     [Date Range ▼] [View Level ▼] [Region ▼] [Brand ▼]
```

**Filters:**
- **Date Range:** This Month / Last Month / Last 3 Months / Custom (date picker)
- **View Level:** Global | Region | Hotel (drives what Section 3 shows)
- **Region:** AMEA / MEA / Europe / Americas / All (populated from `hotels.json`)
- **Brand:** AN / AV / NH / Other / All

All filters use the existing `useFilters` hook with pending/applied pattern.

---

### Section 1 — KPI Scorecard

**Question answered:** Is social performing at a glance?

Five metric cards in a row using the existing `KpiCard` component:

| Card | Metric | Format |
|---|---|---|
| Impressions | Sum across selected scope | `formatCompact()` (e.g. 4.2M) |
| Engagements | Sum across selected scope | `formatCompact()` |
| Engagement Rate | Avg across selected scope | `formatPercent()` |
| Video Views | Sum across selected scope | `formatCompact()` |
| Follower Growth | Net sum across selected scope | `formatCompact()` with +/- |

Each card shows:
- Current period value
- Delta vs previous period (same duration, prior window) with ▲/▼ indicator
- Sparkline (last 8 weeks)

Use `KpiCard` with `status` zone driven by engagement rate vs. brand baseline (define baseline in `data/social-targets.json`).

---

### Section 2 — Performance Trends

**Question answered:** Are we improving or declining?

**Component:** Line chart (Recharts `LineChart`)

- **Default metric:** Engagement Rate (%) — primary quality signal
- **Toggle:** Impressions | Follower Growth
- **X-axis:** Weeks within the selected date range
- **Comparison:** Optional toggle — overlay previous period as dashed line
- **Scope:** Aggregated across all hotels in current filter context

One line = aggregate. If View Level = Hotel, one line = that hotel.

---

### Section 3 — Rankings & Benchmarking

**Question answered:** Who is winning and who needs help?

**Component:** Sortable `DataTable`

Columns:

| Column | Notes |
|---|---|
| Rank | Auto-computed based on sort metric |
| Hotel Name | From `hotels.json` |
| Region | From `hotels.json` |
| Engagement Rate | Primary sort default |
| Impressions | Secondary sortable |
| Follower Growth | Tertiary sortable |
| ▲/▼ | vs. previous period |

**Behavior:**
- Default: Top 10 by Engagement Rate, all regions
- Toggle sort metric via column header click (standard DataTable behavior)
- "Show all" expands table
- At Global level: ranks all properties. At Region level: ranks within region only
- **Baseline row:** Pinned row showing average of top 5 performers (auto-calculated) — highlighted differently with `ui-glow-success`. This is the benchmark line.
- Search/filter by hotel name inline

**Validation note:** This ranking output must be manually spot-checked by Dena against hand-calculated results during UAT. Flag discrepancies in `docs/validation-log.md`.

---

### Section 4 — Content Performance

**Question answered:** What content is driving results?

**Component:** Table of top posts

Columns:

| Column | Notes |
|---|---|
| Thumbnail | Post image (if available via API) |
| Hotel | Source property |
| Channel | FB / IG / TT badge |
| Format | Video / Image / Carousel |
| Engagement Rate | Primary metric |
| Views | Video only |
| Comments / Shares | Secondary engagement signals |

**Behavior:**
- Default: Top 5 posts by Engagement Rate in selected scope + date range
- Filter by Format (Video / Image / All)
- Purpose: identify what content to replicate and coach lower-performing hotels

---

### Section 5 — Activity & Discipline

**Question answered:** Are we doing enough, consistently?

**Component:** Summary stats grid (not a chart — diagnostic only, not used for ranking)

Metrics:

| Label | Value |
|---|---|
| Posts Published | Count in period |
| Avg Engagement / Post | Total engagements ÷ posts |
| Video vs Static Split | % video of total posts |
| Campaign-tagged Posts | Count (if Sprout tags available) |
| Posting Consistency | Posts/week variance (low = consistent) |

Display as a 2×3 card grid using `Card` + `Value` components.

---

### Footer — AI Insight Summary

**Component:** Collapsible panel (Accordion)

3 automated insight bullets generated by calling the Claude API (`claude-sonnet-4-20250514`) with the current period's aggregated metrics as context.

**Prompt structure (passed to Claude API):**

```
You are a social media analyst for a luxury hotel chain with 580+ properties.
Given the following performance data for [period], [region/global], write 2-3 
concise, executive-friendly insight bullets (max 20 words each). Focus on what 
changed, why it likely changed, and one actionable recommendation.

Data: {current_period_summary_json}
```

Use the existing Anthropic API proxy pattern in `workers/` (same pattern as `gamma-proxy`). Cache insights per filter state (hash of date+region+brand = cache key, TTL 4 hours).

---

## 7. Gamma Export

**Trigger:** "Export to Gamma" button in header

**Behavior:**
1. Collects current state: KPI scorecards, top 5 ranking table, trend direction, insight bullets
2. Calls `workers/gamma-proxy` with structured slide content
3. Gamma generates a deck: cover slide, KPI slide, rankings slide, top content slide, insights slide
4. Returns Gamma URL — opens in new tab

Slide count: 5 fixed. No customization in V1.

---

## 8. Data Files

### `data/hotels.json`

Source: Hotel directory doc from Debakti. Structure:

```json
[
  {
    "hotel_id": "minor_001",
    "name": "Anantara Seminyak Bali Resort",
    "brand": "AN",
    "region": "AMEA",
    "country": "ID",
    "sprout_profiles": [
      { "profile_id": "123456", "channel": "instagram" },
      { "profile_id": "789012", "channel": "facebook" }
    ]
  }
]
```

### `data/social-targets.json`

Baseline targets for KPI status zones (drives `KpiCard` color):

```json
{
  "engagement_rate": { "good": 3.0, "warning": 1.5 },
  "follower_growth_pct": { "good": 2.0, "warning": 0.5 },
  "impressions_wow_growth": { "good": 5.0, "warning": 0 }
}
```

Set conservative defaults for launch. Adjust after first month of real data.

---

## 9. API Layer Architecture

```
Browser (React)
    ↓
Cloudflare Worker (/workers/sprout-proxy)
    ↓  [injects Bearer token, caches response]
Sprout Social API (api.sproutsocial.com/v1)
```

New worker: `workers/sprout-proxy.ts`  
Mirrors pattern of existing `gamma-proxy` and `github-proxy`.

**Environment variables needed (Cloudflare secrets):**
- `SPROUT_BEARER_TOKEN`
- `SPROUT_CUSTOMER_ID`

**Do not commit tokens to repo.** Use `.env.example` pattern already in place.

---

## 10. New Components Needed

| Component | Location | Notes |
|---|---|---|
| `SocialKpiBar` | `src/components/dashboard/` | Extends `KpiCards` for social metrics |
| `TrendChart` | `src/components/dashboard/` | Recharts wrapper with toggle + period overlay |
| `PropertyRankingTable` | `src/components/dashboard/` | Extends `DataTable` with baseline row + rank column |
| `TopPostsTable` | `src/components/dashboard/` | Post thumbnail + metrics table |
| `ActivityGrid` | `src/components/dashboard/` | 2×3 diagnostic stats grid |
| `InsightSummary` | `src/components/dashboard/` | Accordion wrapping Claude API insight bullets |
| `useSproutData` | `src/hooks/` | Fetcher hook for Sprout proxy — wraps `useFetchJson` with filter params |

Reuse existing: `KpiCard`, `FilterBar`, `DataTable`, `Card`, `Badge`, `Value`, `Select`, `DateInput`.

---

## 11. New Page

`src/pages/SocialDashboardPage.tsx`

This is the V1 page. Wire it into `App.tsx` as the default route (replace or alongside `DashboardPage`).

---

## 12. Validation Checklist (UAT)

Before shipping to the team:

- [ ] Rankings output for a given month matches Dena's manual top-5 calculation
- [ ] KPI totals for a selected region match Sprout's own "Group Report" export for same date range
- [ ] Engagement Rate card delta correctly reflects prior period (not prior year)
- [ ] Filters: switching Region correctly updates all 5 sections simultaneously
- [ ] Hotel view: scopes all sections to single property
- [ ] Gamma export generates a valid deck URL and opens correctly
- [ ] AI insights generate within 5 seconds; fallback message if API timeout

---

## 13. Open Questions

Before dev starts, need answers on:

1. **Hotel directory format:** What does Debakti's hotel directory look like? Does it already include Sprout profile IDs, or do we need to map them manually from the Sprout `/profiles` endpoint?

2. **Channel coverage:** Are all 3 channels (FB, IG, TikTok) connected in Sprout for most properties, or is coverage patchy? If TikTok is missing for many hotels, the cross-channel aggregate will be skewed — we may need to normalize by "channels connected."

3. **Sprout customer ID:** Single `customer_id` for the entire org, or one per brand/region? This determines whether one Worker instance covers everything.

4. **Engagement Rate definition:** Sprout offers `engagement_rate_by_impressions_percentage` and `engagement_rate_by_reach_percentage`. Which does the team currently use in manual reports? Must match for validation to work.

5. **Baseline definition for benchmarking:** The wireframe calls for comparing selected properties against "the top 5 performers." Top 5 of what — the current filter scope, or always global top 5? Clarify with Brian before building Section 3.

6. **Gamma credentials:** Does `workers/gamma-proxy` already have a working Gamma API key, or does that need to be provisioned?

---

## 14. Success Metrics — V1

| Metric | Target |
|---|---|
| Manual reporting hours eliminated | ≥ 4 hrs/week |
| Ranking output accuracy vs. manual | 100% match on spot-check |
| Time to generate exec report (Gamma export) | < 2 minutes end-to-end |
| Team adoption | Social leads using it weekly within 30 days of launch |
