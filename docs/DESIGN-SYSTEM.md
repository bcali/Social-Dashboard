# Design System Reference

This document covers the complete design system used by web-starter projects. It is theme-agnostic — all components and classes work with any theme that implements the CSS variable contract.

---

## Theme System

### How Themes Work

Each theme is a single CSS file in `src/themes/` that sets CSS custom properties on `:root`. The active theme is imported in `src/index.css`:

```css
@import "./themes/minor-hotels.css";
```

To switch themes, change the import path. Components and CSS classes automatically adapt because they reference variables, never hardcoded colors.

### Available Themes

| Theme | File | Style |
|-------|------|-------|
| **Minor Hotels** | `minor-hotels.css` | Warm white base, navy text, brand custom fonts |
| Clean Light | `clean-light.css` | Professional blue/gray on white |
| Neutral Dark | `neutral-dark.css` | Muted slate/emerald on dark |
| Tron Dark | `tron-dark.css` | Neon cyan/orange on black (legacy) |

### Creating a New Theme

Create a CSS file in `src/themes/` that defines all required variables. Use any existing theme as a template. Every variable listed in the contract below must be defined.

---

## Color Token Contract

Every theme must define these CSS custom properties:

### Backgrounds

| Variable | Purpose |
|----------|---------|
| `--bg-primary` | Page background |
| `--bg-secondary` | Secondary/alternating background |
| `--bg-card` | Card surfaces |
| `--bg-elevated` | Elevated surfaces, form inputs |
| `--bg-hover` | Hover state background |

### Text

| Variable | Purpose |
|----------|---------|
| `--text-primary` | Headings, primary content |
| `--text-secondary` | Body text, descriptions |
| `--text-muted` | Labels, hints, disabled text |

### Borders

| Variable | Purpose |
|----------|---------|
| `--border` | Primary borders |
| `--border-subtle` | Subtle dividers |

### Semantic Colors

Each semantic color has three variants:

| Variable | Purpose |
|----------|---------|
| `--color-primary` | Primary accent (links, active states, Complete status) |
| `--color-primary-dim` | Low-opacity primary background (badges, surfaces) |
| `--color-primary-glow` | Medium-opacity primary (focus rings, accents) |
| `--color-secondary` | Secondary accent (In Progress status) |
| `--color-secondary-dim` / `--color-secondary-glow` | Dim/glow variants |
| `--color-success` | Success/on-track indicators |
| `--color-success-dim` / `--color-success-glow` | Dim/glow variants |
| `--color-warning` | Warning/at-risk indicators |
| `--color-warning-dim` / `--color-warning-glow` | Dim/glow variants |
| `--color-danger` | Error/blocked indicators |
| `--color-danger-dim` / `--color-danger-glow` | Dim/glow variants |

### Surfaces

| Variable | Purpose |
|----------|---------|
| `--surface-success` | Light success tint background |
| `--surface-danger` | Light danger tint background |
| `--surface-warning` | Light warning tint background |
| `--surface-info` | Light info tint background |

### Layout

| Variable | Default | Purpose |
|----------|---------|---------|
| `--radius` | `10px` | Primary border radius |
| `--radius-sm` | `6px` | Small border radius |
| `--color-grid` | varies | Grid pattern color (set to `transparent` to disable) |
| `--color-grid-line` | varies | Grid line color |

### Typography

| Variable | Minor Hotels | Other Themes |
|----------|-------------|--------------|
| `--font-heading` | Manuka, Plus Jakarta Sans | Inter, system-ui |
| `--font-script` | Amorfatti, cursive | Inter, system-ui |
| `--font-sans` | Plus Jakarta Sans, Inter | Inter, system-ui |
| `--font-body` | Newsreader, Georgia | Inter, system-ui |
| `--font-mono` | SF Mono, Fira Code | SF Mono, Fira Code |

### Brand Aliases (Minor Hotels theme only)

These are supplementary tokens available when using the Minor Hotels theme:

| Variable | Hex | Purpose |
|----------|-----|---------|
| `--brand-navy` | `#13213c` | Navy text color |
| `--brand-dark-blue` | `#0d4877` | Primary brand blue |
| `--brand-sky` | `#90cef1` | Light blue accent |
| `--brand-sand` | `#e6dfce` | Sand background |
| `--brand-gold` | `#b0a078` | Gold/warning |
| `--brand-yellow` | `#f3d958` | Bright yellow |
| `--brand-white` | `#fbf6f0` | Warm white |
| `--brand-danger` | `#c0392b` | Brand red |

---

## Tailwind Tokens

All CSS variables are exposed as Tailwind classes:

### Colors

```
bg-bg-primary, bg-bg-card, bg-bg-elevated, bg-bg-hover
text-color-primary, text-color-danger, text-color-warning
border-border-theme
bg-surface-success, bg-surface-danger
bg-brand-navy, text-brand-dark-blue (with semantic fallbacks)
```

### Font Families

```
font-heading  — Display/headings
font-script   — Decorative/accent
font-sans     — UI labels, nav, buttons
font-body     — Body copy, descriptions
font-mono     — Data values, code
```

### Border Radius

```
rounded-theme     — var(--radius)
rounded-theme-sm  — var(--radius-sm)
```

---

## Components

All components live in `src/components/ui/` and are exported from the barrel `index.ts`. They use CVA (class-variance-authority) for variant management and `cn()` for class merging.

### Card

Container with optional accent border.

```tsx
import { Card } from "@/components/ui";

<Card>Basic card</Card>
<Card glow="primary">Primary accent border</Card>
<Card glow="danger">Danger accent border</Card>
```

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `glow` | string | `"none"` | `none`, `primary`, `secondary`, `danger`, `warning`, `success` |

### Badge

Inline status/category label.

```tsx
import { Badge } from "@/components/ui";

<Badge color="primary">Complete</Badge>
<Badge color="danger">Blocked</Badge>
```

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `color` | string | `"primary"` | `primary`, `secondary`, `success`, `danger`, `warning` |

### Button

Interactive button with variants.

```tsx
import { Button } from "@/components/ui";

<Button>Default</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="ghost">Cancel</Button>
<Button variant="link">Learn more</Button>
<Button size="sm">Small</Button>
<Button size="icon"><X size={16} /></Button>
```

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `variant` | string | `"default"` | `default`, `secondary`, `destructive`, `ghost`, `link` |
| `size` | string | `"default"` | `default`, `sm`, `lg`, `icon` |
| `asChild` | boolean | `false` | Render as Radix Slot |

### Value

Monospace number display.

```tsx
import { Value } from "@/components/ui";

<Value color="primary">82.4%</Value>
<Value color="danger">-3.2%</Value>
```

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `color` | string | `"primary"` | `primary`, `secondary`, `success`, `danger`, `warning`, `muted` |

### Input

Form text input with size variants.

```tsx
import { Input } from "@/components/ui";

<Input placeholder="Enter value..." />
<Input size="sm" placeholder="Small" />
<Input size="lg" placeholder="Large" />
```

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `size` | string | `"default"` | `default`, `sm`, `lg` |

### DateInput

Styled date picker.

```tsx
import { DateInput } from "@/components/ui";

<DateInput value={date} onChange={handleChange} min="2026-01-01" />
```

### Select / SelectItem

Dropdown select using Radix.

```tsx
import { Select, SelectItem } from "@/components/ui";

<Select value={value} onValueChange={setValue} placeholder="Choose...">
  <SelectItem value="a">Option A</SelectItem>
  <SelectItem value="b">Option B</SelectItem>
</Select>
```

### Checkbox

Toggle switch with optional label.

```tsx
import { Checkbox } from "@/components/ui";

<Checkbox checked={enabled} onCheckedChange={setEnabled} label="Enable feature" />
```

### Overlay

Centered modal dialog.

```tsx
import { Overlay } from "@/components/ui";

<Overlay open={isOpen} onClose={() => setOpen(false)} title="Details" maxWidth="2xl">
  <p>Modal content here</p>
</Overlay>
```

| Prop | Type | Default | Options |
|------|------|---------|---------|
| `maxWidth` | string | `"2xl"` | `sm`, `md`, `lg`, `xl`, `2xl`, `3xl` |

### Drawer

Right-side slide-in panel.

```tsx
import { Drawer } from "@/components/ui";

<Drawer open={isOpen} onClose={() => setOpen(false)} title="Epic Detail" width="480px">
  <p>Drawer content here</p>
</Drawer>
```

### Accordion / AccordionItem

Expandable sections.

```tsx
import { Accordion, AccordionItem } from "@/components/ui";

<Accordion>
  <AccordionItem title="Section 1" defaultOpen>
    <p>Content visible by default</p>
  </AccordionItem>
  <AccordionItem title="Section 2">
    <p>Collapsed by default</p>
  </AccordionItem>
</Accordion>
```

### Sparkline

SVG micro-chart.

```tsx
import { Sparkline } from "@/components/ui";

<Sparkline data={[10, 20, 15, 30, 25]} color="var(--color-primary)" width={80} height={24} />
```

### ScrollArea

Radix-based scrollable container.

```tsx
import { ScrollArea } from "@/components/ui";

<ScrollArea className="h-[300px]">
  {/* scrollable content */}
</ScrollArea>
```

### ErrorBoundary

React error boundary with retry.

```tsx
import { ErrorBoundary } from "@/components/ui";

<ErrorBoundary>
  <RiskyComponent />
</ErrorBoundary>
```

---

## CSS Utility Classes

These classes are defined in `src/index.css` and work with any theme.

### `.ui-card`

Card container with border, radius, and subtle shadow.

### `.ui-glow`, `.ui-glow-secondary`, `.ui-glow-danger`, `.ui-glow-warning`, `.ui-glow-success`

Left-border accent (3px solid) in the corresponding color. Apply alongside `.ui-card`.

### `.ui-section-title`

Section header: 11px, uppercase, bold, primary color, bottom border.

### `.ui-table`

Full-width table with styled headers, monospace cells, and row hover.

```html
<div class="overflow-x-auto">
  <table class="ui-table">
    <thead><tr><th>Header</th></tr></thead>
    <tbody><tr><td>Data</td></tr></tbody>
  </table>
</div>
```

### `.ui-badge`, `.ui-badge-primary`, `.ui-badge-secondary`, `.ui-badge-success`, `.ui-badge-danger`, `.ui-badge-warning`

Inline badge with colored background, border, and monospace font.

### `.ui-value`

Monospace, bold text for numeric values.

### `.ui-bar-track`, `.ui-bar-segment`

Progress/timeline bar container and segments.

### `.ui-bar-primary`, `.ui-bar-secondary`, `.ui-bar-danger`, `.ui-bar-warning`, `.ui-bar-muted`

Status-colored bar fills.

### `.ui-bar-editing`

Dashed border with pulse animation for edit mode.

### `.ui-expanded-row`

Table row styling for expanded detail rows (background tint, left border accent).

### `.ui-input`

Form input: elevated background, border, focus ring, monospace font.

### `.ui-pulse`

Gentle opacity pulse animation (2s cycle).

### Animation Classes

- `.animate-in` — 200ms animation wrapper
- `.fade-in` — Opacity fade
- `.zoom-in-95` — Scale from 95%
- `.slide-in-from-bottom-10` — Slide up 10px

---

## Status Color Mapping

Map domain-specific statuses to semantic design system variants:

| Status | Variant | Badge | Glow | Bar |
|--------|---------|-------|------|-----|
| Complete | `primary` | `ui-badge-primary` | `ui-glow` | `ui-bar-primary` |
| In Progress | `secondary` | `ui-badge-secondary` | `ui-glow-secondary` | `ui-bar-secondary` |
| Blocked | `danger` | `ui-badge-danger` | `ui-glow-danger` | `ui-bar-danger` |
| At Risk | `warning` | `ui-badge-warning` | `ui-glow-warning` | `ui-bar-warning` |
| On Track | `success` | `ui-badge-success` | `ui-glow-success` | N/A |
| Not Started | `muted` | N/A | none | `ui-bar-muted` |

---

## Typography Guide

### When to Use Each Font

| Element | Font Variable | Tailwind Class | Example |
|---------|--------------|----------------|---------|
| Page titles, section headings | `--font-heading` | `font-heading` | "Payment Roadmap" |
| Decorative accent words | `--font-script` | `font-script` | Signature-style text |
| Nav, buttons, labels, subheadings | `--font-sans` | `font-sans` | "Apply Filters" |
| Body text, descriptions, paragraphs | `--font-body` | `font-body` | Long-form content |
| Data values, IDs, dates, code | `--font-mono` | `font-mono` | "82.4%", "ORCH-001" |

### Font Size Scale

| Class | Size | Usage |
|-------|------|-------|
| `text-[10px]` | 10px | Labels, secondary metadata |
| `text-[11px]` | 11px | Badge text, section titles |
| `text-xs` | 12px | Small text |
| `text-[13px]` | 13px | Table cells |
| `text-sm` | 14px | Body text, form labels |
| `text-base` | 16px | Standard body |
| `text-lg` | 18px | Subheadings |
| `text-xl` | 20px | Card headings |
| `text-2xl` | 24px | KPI values |

---

## Spacing Scale

Standardized spacing values used throughout:

### Padding

| Pattern | Pixels | Usage |
|---------|--------|-------|
| `p-1` / `p-1.5` | 4-6px | Minimal (icon buttons) |
| `px-2 py-1.5` | 8/6px | Small inputs |
| `px-3 py-2` | 12/8px | Default inputs, badges |
| `px-4 py-2.5` | 16/10px | Buttons, card padding |
| `px-5 py-4` | 20/16px | Large cards |
| `px-6 py-5` | 24/20px | Overlay headers |

### Gaps

| Class | Pixels | Usage |
|-------|--------|-------|
| `gap-0.5` | 2px | Icon + text inline |
| `gap-1` / `gap-1.5` | 4-6px | Tight grouping, button groups |
| `gap-2` | 8px | Standard spacing |
| `gap-3` | 12px | Card grid columns |
| `gap-4` | 16px | Section grouping |

---

## Icons

This system uses **lucide-react** exclusively.

### Sizing Convention

| Context | Size | Example |
|---------|------|---------|
| Inline with small text | `10-12` | Badge icons, trend indicators |
| Standard UI elements | `14-16` | Buttons, list items, nav |
| Section headers | `18-20` | Page headers, empty states |

### Common Icons

| Icon | Usage |
|------|-------|
| `AlertTriangle` | Warning, at-risk status |
| `Check` / `CheckCircle` | Success, complete, apply |
| `ChevronDown` / `ChevronUp` | Expand/collapse |
| `ChevronRight` | Navigation, "more" indicator |
| `Filter` | Filter toggle |
| `Loader2` | Loading spinner (with `animate-spin`) |
| `Pencil` | Edit action |
| `Plus` | Add new item |
| `Shield` | Risk/security |
| `Trash2` | Delete |
| `X` | Close/dismiss |
| `Zap` | Impact/win indicator |

---

## Form Patterns

### Standard Input

```tsx
<Input placeholder="Enter value..." />
```

### Filter Bar Construction

Build filter bars by composing form components in a flex container:

```tsx
<Card className="px-4 py-3">
  <div className="flex items-center gap-4 flex-wrap">
    <DateInput value={from} onChange={setFrom} />
    <DateInput value={to} onChange={setTo} />
    <Select value={filter} onValueChange={setFilter} placeholder="Filter by...">
      <SelectItem value="all">All</SelectItem>
      <SelectItem value="active">Active</SelectItem>
    </Select>
    <div className="flex-1" />
    <Button size="sm">Apply</Button>
    <Button size="sm" variant="ghost">Reset</Button>
  </div>
</Card>
```

### Loading State

```tsx
<Button disabled>
  <Loader2 size={14} className="animate-spin" />
  Loading...
</Button>
```

### Error Banner

```tsx
<div className="px-3 py-2 bg-[var(--surface-danger)] border border-[color-mix(in_srgb,var(--color-danger)_30%,transparent)] rounded-lg text-xs text-[var(--color-danger)]">
  {errorMessage}
</div>
```

---

## Layout Patterns

### Page with Sticky Footer

```tsx
<div className="h-full flex flex-col">
  <div className="flex-1 min-h-0 overflow-auto">
    {/* Scrollable content */}
  </div>
  <div className="border-t border-[var(--border)]">
    {/* Sticky footer bar */}
  </div>
</div>
```

### Sidebar + Main

```tsx
<div className="flex h-screen">
  <nav className="w-16 bg-[var(--bg-secondary)] border-r border-[var(--border)]">
    {/* Sidebar */}
  </nav>
  <main className="flex-1 overflow-auto p-4">
    {/* Content */}
  </main>
</div>
```

### Card Grid

```tsx
<div className="grid grid-cols-2 gap-2">
  <Card className="px-4 py-2.5">...</Card>
  <Card className="px-4 py-2.5">...</Card>
</div>
```

---

## Migration from Tron

If migrating from the old `tron-*` class naming:

| Old Class | New Class |
|-----------|-----------|
| `.tron-card` | `.ui-card` |
| `.tron-glow` | `.ui-glow` |
| `.tron-glow-orange` | `.ui-glow-secondary` |
| `.tron-glow-red` | `.ui-glow-danger` |
| `.tron-glow-yellow` | `.ui-glow-warning` |
| `.tron-glow-green` | `.ui-glow-success` |
| `.tron-section-title` | `.ui-section-title` |
| `.tron-table` | `.ui-table` |
| `.tron-badge` | `.ui-badge` |
| `.tron-badge-cyan` | `.ui-badge-primary` |
| `.tron-badge-orange` | `.ui-badge-secondary` |
| `.tron-badge-green` | `.ui-badge-success` |
| `.tron-badge-red` | `.ui-badge-danger` |
| `.tron-badge-yellow` | `.ui-badge-warning` |
| `.tron-value` | `.ui-value` |
| `.tron-pulse` | `.ui-pulse` |
| `.tron-bar-track` | `.ui-bar-track` |
| `.tron-bar-segment` | `.ui-bar-segment` |
| `.tron-bar-complete` | `.ui-bar-primary` |
| `.tron-bar-in-progress` | `.ui-bar-secondary` |
| `.tron-bar-blocked` | `.ui-bar-danger` |
| `.tron-bar-at-risk` | `.ui-bar-warning` |
| `.tron-bar-not-started` | `.ui-bar-muted` |
| `.tron-bar-editing` | `.ui-bar-editing` |
| `.tron-expanded-row` | `.ui-expanded-row` |
| `.tron-circuit-bg` | (removed) |
| `.tron-scanline` | (removed) |

### CSS Variable Migration

| Old Variable | New Variable |
|-------------|-------------|
| `--tron-cyan` | `--color-primary` |
| `--tron-orange` | `--color-secondary` |
| `--tron-red` | `--color-danger` |
| `--tron-yellow` | `--color-warning` |
| `--tron-green` | `--color-success` |

### Component Variant Migration

| Old Variant | New Variant |
|------------|-------------|
| `cyan` | `primary` |
| `orange` | `secondary` |
| `green` | `success` |
| `red` | `danger` |
| `yellow` | `warning` |
