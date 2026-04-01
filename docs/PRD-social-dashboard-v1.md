# PRD: Social Media Performance Dashboard — V1

**Status:** Draft  
**Owner:** Brian Clark  
**Last Updated:** 2026-04-01  
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
**Auth:** Bearer token (org-wide). Tokens provided by Debakti.  
**Customer scope:** Single `customer_id` for the entire org. One Worker instance covers all brands and regions.

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

> **Locked:** Engagement Rate is always calculated by impressions (`engagement_rate_by_impressions_percentage`), not by reach. This must match the manual calculation method used by the team for UAT to be valid.

### Channel Aggregation

All metrics are raw-summed across FB + IG + TikTok per property. No normalization by channel count in V1. If a property has 2 channels connected and another has 3, that discrepancy shows up in the data — it is not corrected. This will be revisited in Phase 2 if it distorts rankings materially.

**Implication for dev:** When fetching profile-level data, group by `hotel_id` (from `hotels.json` mapping), sum all `profile_id` rows belonging to that hotel, regardless of channel.

### Property Mapping — ⚠️ BLOCKER

Each Sprout profile maps to one property + one channel. The `hotels.json` mapping file is the source of truth for:

- `profile_id` → `hotel_name`
- `hotel_name` → `region` (AMEA / MEA / Europe / Americas / etc.)
- `hotel_name` → `brand` (AN / AV / NH / Other)

**The hotel directory from Debakti has not been received yet.** It is unknown whether it already contains Sprout `profile_id` values. 

**Dev strategy before the directory arrives:**
1. Hit `GET /v1/{customer_id}/analytics/profiles` with the live token
2. Dump the full profile list to `data/sprout-profiles-raw.json`
3. Manually map profile names → hotel names → region/brand in `data/hotels.json`
4. This manual mapping becomes the permanent source of truth; update it as new properties are added to Sprout

Do not block dev start on receiving the directory. Start with the raw Sprout profile list and build the mapping incrementally.

### API Proxy

All Sprout API calls route through `workers/sprout-proxy.ts` to avoid CORS and keep the token server-side. The worker handles:

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
| Engagement Rate | Weighted avg by impressions across scope | `formatPercent()` |
| Video Views | Sum across selected scope | `formatCompact()` |
| Follower Growth | Net sum across selected scope | `formatCompact()` with +/- |

> **Note on Engagement Rate aggregation:** Do NOT simple-average engagement rates across properties. Calculate as `total_engagements ÷ total_impressions` across all properties in scope. This matches how Sprout calculates it at group level and will pass UAT validation.

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
- All hotels shown by default in a scrollable frame (480px max height)
- Table header and baseline row stay pinned during scroll
- Toggle sort metric via column header click
- Expand button opens a near-fullscreen overlay (95vw) for full review
- At Global level: ranks all properties. At Region level: ranks within region only.
- **Baseline row (always global top 4):** Pinned row at top showing the average of the top 4 globally-ranked properties by engagement rate — regardless of what region/brand filter is active. Highlighted with `ui-glow-success`. Label: "Global Top 4 Avg". This is the benchmark every property is measured against.
- Search/filter by hotel name inline

**Baseline calculation:**
```
globalTop4 = allProperties
  .sort(desc by engagement_rate_by_impressions)
  .slice(0, 4)

baseline = {
  engagement_rate: sum(globalTop4.engagements) / sum(globalTop4.impressions),
  impressions: avg(globalTop4.impressions),
  follower_growth: avg(globalTop4.net_follower_growth)
}
```

Baseline is always computed on the same date range as the current filter. It does not change when region/brand filter changes.

#### Baseline Methodology — Detailed

**Data source:** All hotels in `data/hotels.json` with mapped Sprout Social profile IDs. Each hotel's metrics are the sum of all its social profiles (Facebook, Instagram, TikTok) across the selected date range.

**Step-by-step calculation (`useSproutData.ts:computeGlobalTop4`):**

1. **Input:** All hotels (unfiltered — region/brand selection is ignored)
2. **Per-hotel engagement rate:** Each hotel's `engagement_rate` = `hotel.engagements / hotel.impressions × 100`. This is a weighted rate across all channels for that hotel.
3. **Selection:** Sort all hotels descending by engagement rate. Take the top 4.
4. **Baseline engagement rate:** `sum(top4.engagements) / sum(top4.impressions) × 100` — this is **impression-weighted**, not a simple average of the 4 rates. A hotel with more impressions has more influence on the baseline.
5. **Baseline impressions:** Simple average of the 4 hotels' impressions.
6. **Baseline follower growth:** Simple average of the 4 hotels' net follower growth.

**Why impression-weighted engagement rate?** A simple average of rates would give equal weight to a hotel with 100 impressions and one with 1,000,000. Weighting by impressions reflects the overall engagement quality of the top-performing hotels at scale, which is more meaningful for benchmarking.

**Open questions for review:**
1. _Minimum impressions threshold:_ A hotel with very few impressions could appear in the top 4 with an artificially high engagement rate (e.g., 10 engagements / 100 impressions = 10%). Should a minimum impressions floor apply?
2. _Channel normalization:_ Hotels with 3 channels naturally accumulate more impressions than hotels with 2. No normalization is applied — this is intentional (total reach matters regardless of channel count) but should be validated.
3. _Fixed top N:_ The "4" is fixed. With 580+ hotels this is <1% of the dataset. Consider whether this should be configurable.

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

**Component:** Summary stats grid (diagnostic only — not used for ranking)

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

**Component:** Collapsible panel (`Accordion`)

2–3 automated insight bullets generated via Claude API (`claude-sonnet-4-20250514`) using the current period's aggregated metrics as context.

**Prompt structure:**

```
You are a social media analyst for a luxury hotel chain with 580+ properties.
Given the following performance data for [period], [region/global], write 2-3 
concise, executive-friendly insight bullets (max 20 words each). Focus on what 
changed, why it likely changed, and one actionable recommendation.

Data: {current_period_summary_json}
```

Routed through `workers/anthropic-proxy.ts` (mirror existing proxy pattern). Cache per filter state hash (date + region + brand → SHA-256 key), TTL 4 hours.

---

## 7. Gamma Export — ⚠️ BLOCKER

**Trigger:** "Export to Gamma" button in header

**Behavior:**
1. Collect current state: KPI scorecards, top 5 ranking table, trend direction, insight bullets
2. Call `workers/gamma-proxy` with structured slide content
3. Gamma generates a 5-slide deck: cover, KPIs, rankings, top content, insights
4. Return Gamma URL → open in new tab

**Status:** Gamma API key is NOT yet provisioned. Before building the export button, provision the key and add `GAMMA_API_KEY` to Cloudflare secrets. The button can be built and stubbed (disabled + tooltip "Coming soon") until the key is in place — do not block the rest of V1 on this.

Slide count: 5 fixed. No customization in V1.

---

## 8. Data Files

### `data/hotels.json`

Built from Sprout `/profiles` endpoint dump + manual mapping. Schema:

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

> Start by dumping `GET /v1/{customer_id}/analytics/profiles` → save as `data/sprout-profiles-raw.json`. Use that to build `hotels.json` mapping manually.

### `data/social-targets.json`

Baseline thresholds for `KpiCard` status zones:

```json
{
  "engagement_rate": { "good": 3.0, "warning": 1.5 },
  "follower_growth_pct": { "good": 2.0, "warning": 0.5 },
  "impressions_wow_growth": { "good": 5.0, "warning": 0 }
}
```

Defaults are conservative. Adjust after first real month of data.

---

## 9. API Layer Architecture

```
Browser (React)
    ↓
Cloudflare Worker (/workers/sprout-proxy)
    ↓  [injects Bearer token, 1hr cache]
Sprout Social API (api.sproutsocial.com/v1)

Browser (React)
    ↓
Cloudflare Worker (/workers/anthropic-proxy)
    ↓  [injects Anthropic API key, 4hr insight cache]
Anthropic Claude API

Browser (React) [Gamma Export only]
    ↓
Cloudflare Worker (/workers/gamma-proxy)  ← KEY NOT YET PROVISIONED
    ↓
Gamma API
```

**Workers:**
- `sprout-proxy` — **Deployed** at `sprout-proxy.brianc-uw.workers.dev`. Live with real Sprout API credentials (Customer ID: 1313096). Uses Sprout filter DSL for `/analytics/profiles` and `/metadata/customer` endpoints.
- `anthropic-proxy` — Not yet built
- `gamma-proxy` — Built, blocked on `GAMMA_API_KEY` provisioning

**Cloudflare secrets to add:**
- `SPROUT_BEARER_TOKEN`
- `SPROUT_CUSTOMER_ID`
- `ANTHROPIC_API_KEY`
- `GAMMA_API_KEY` ← blocked

---

## 10. New Components Needed

| Component | Location | Notes |
|---|---|---|
| `SocialKpiBar` | `src/components/dashboard/` | 5-card KPI row for social metrics |
| `TrendChart` | `src/components/dashboard/` | Recharts `LineChart` with metric toggle + period overlay |
| `PropertyRankingTable` | `src/components/dashboard/` | `DataTable` extended with pinned baseline row + rank column |
| `TopPostsTable` | `src/components/dashboard/` | Post thumbnail + metrics table |
| `ActivityGrid` | `src/components/dashboard/` | 2×3 diagnostic stats grid |
| `InsightSummary` | `src/components/dashboard/` | `Accordion` wrapping Claude API insight bullets |
| `useSproutData` | `src/hooks/` | Fetches via `sprout-proxy`; accepts filter params; returns normalized hotel-grouped data |

Reuse existing: `KpiCard`, `FilterBar`, `DataTable`, `Card`, `Badge`, `Value`, `Select`, `DateInput`, `Accordion`.

---

## 11. New Page

`src/pages/SocialDashboardPage.tsx`

Wire into `App.tsx` as the default route (replace or alongside `DashboardPage`).

---

## 12. Build Sequence (Recommended for Claude Code)

Build in this order to unblock validation early:

1. `workers/sprout-proxy.ts` — get the data pipeline live first
2. `data/sprout-profiles-raw.json` + `data/hotels.json` — build the mapping
3. `useSproutData` hook — normalized data layer
4. Section 1 (KPI Scorecard) — earliest validation checkpoint
5. Section 3 (Rankings) — core value prop; validate against Dena's manual calc
6. Section 2 (Trends) — visualization layer
7. Section 4 (Content) — post API integration
8. Section 5 (Activity) — diagnostic; derived from existing data
9. Footer AI Insights — `workers/anthropic-proxy.ts` + `InsightSummary`
10. Gamma Export — last; blocked on key provisioning

---

## 13. Validation Checklist (UAT)

- [ ] Rankings output for a given month matches Dena's manual top-4 global baseline calc
- [ ] Engagement Rate (%) = `total_engagements ÷ total_impressions` (not simple avg) — verify against Sprout Group Report
- [ ] KPI totals for a selected region match Sprout's own export for same date range
- [ ] Delta on KPI cards = current period vs. immediately prior same-length window (not YoY)
- [ ] Switching Region filter updates all 5 sections; global top 4 baseline does NOT change
- [ ] Hotel view scopes all sections to single property
- [ ] Gamma export generates valid URL (once key provisioned)
- [ ] AI insights render within 5 seconds; fallback "Insights unavailable" if timeout

---

## 14. Resolved Decisions

| # | Question | Decision |
|---|---|---|
| 2 | Channel coverage | Raw aggregate across all connected channels (FB+IG+TT). No normalization in V1. |
| 3 | Sprout customer ID | Single org-wide `customer_id`. One Worker covers everything. |
| 4 | Engagement Rate definition | `engagement_rate_by_impressions_percentage`. Locked. |
| 5 | Baseline definition | Always global top **4** — not filtered scope. Pinned row regardless of active region/brand filter. |

---

## 15. Open Blockers

| # | Blocker | Owner | Required Before |
|---|---|---|---|
| 1 | Hotel directory / Sprout profile ID mapping | Debakti | `data/hotels.json` build. Workaround: dump raw profile list from API and map manually. **Do not block dev start.** |
| 6 | Gamma API key provisioning | Brian | Gamma Export button. Stub the button as disabled until resolved. **Does not block V1 core.** |

---

## 16. Success Metrics — V1

| Metric | Target |
|---|---|
| Manual reporting hours eliminated | ≥ 4 hrs/week |
| Ranking accuracy vs. manual | 100% match on Dena spot-check |
| Exec report generation time | < 2 min end-to-end (Gamma export) |
| Team adoption | Social leads using weekly within 30 days of launch |
