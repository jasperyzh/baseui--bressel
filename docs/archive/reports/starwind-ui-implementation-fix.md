# Starwind UI — Implementation Fix Report

> **Date:** 2026-05-06
> **Context:** Audit of `baseui--bressel` vs reference `baseui--astro` Starwind implementation

---

## Problem Found

The BRESSEL project's Starwind Card components had been manually simplified — losing the `tailwind-variants` integration that the reference implementation uses. Every Card on the site was rendering with dead class names (`card-default`, `card-sm`) that didn't map to any actual CSS.

### Root Cause

Someone had rewritten the Card components from the reference's `tv()` variant system to manual string concatenation:

| Component | Reference | Current (before fix) |
|-----------|-----------|---------------------|
| `Card.astro` | `card({ size, class: className })` — `tv()` with `group-data-[]` selectors | `["card", "card-"+size].join(" ")` — dead classes |
| `CardHeader.astro` | `cardHeader({ class })` — auto-detects action/description via CSS | Same pattern but no `tv()` |
| `CardTitle.astro` | Proper `data-slot="card-title"` + variant CSS | Same but no CSS backing |
| `CardDescription.astro` | Proper `data-slot="card-description"` + variant CSS | Same but no CSS backing |
| `CardContent.astro` | `px-6` with size-responsive `group-data-` | Same but dead classes |
| `CardFooter.astro` | `bg-muted/50 flex items-center rounded-b-xl border-t p-6` | Same but dead classes |

### What Was Affected

- Academy Cards (2 cards)
- Program Pillars (3 full-bleed cards)
- Shop Products (4 cards with footer)
- Pricing table (implicit card layout)

**9 total Card instances on the homepage** — all rendering without proper Starwind styling.

---

## Fixes Applied

### 1. Card Components Synced from Reference

All 7 Card files (`Card.astro`, `CardHeader.astro`, `CardTitle.astro`, `CardDescription.astro`, `CardContent.astro`, `CardFooter.astro`, `index.ts`) synced from `~/Desktop/baseui--astro/src/components/starwind/card/`.

Now uses `tailwind-variants` `tv()` properly:
- `Card` generates: `bg-card text-card-foreground group/card ring-border flex flex-col rounded-xl ring-1 has-data-[slot=card-footer]:pb-0...`
- `CardHeader` uses CSS `@container/card-header` with `has-data-[]` auto-detection
- Size variants work: `data-size="sm"` → `gap-4 py-4 text-sm`, `data-size="default"` → `gap-6 py-6`

### 2. BRESSEL Component Overrides Added to `global.css`

Starwind defaults are a neutral design system. BRESSEL needs athletic/industrial overrides:

```css
/* Cards: sharp industrial (no rounded corners) */
[data-slot="card"] {
  border-radius: 0 !important;
  border-color: var(--color-border);
  transition: border-color 0.2s ease;
}

/* Full-bleed image cards: zero padding */
[data-slot="card"].card-full-bleed {
  padding: 0 !important;
}

/* Buttons: athletic font, uppercase, tracked */
[data-slot="button"] {
  font-family: var(--font-header);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
```

### 3. ProgramPillar Cards Marked as Full-Bleed

Added `card-full-bleed` class to all 3 pillar cards so they render with zero padding (they use absolutely-positioned background images).

### 4. Layer Cascade Fix

Tailwind v4 stores utilities in `@layer utilities` which comes **after** `@layer components`. CSS overrides in the components layer were being overridden by Tailwind utility classes. Fixed with `!important` where needed (`border-radius`, `padding`).

---

## Verification Results

| Check | Result |
|-------|--------|
| **Build** | ✅ 8 pages, 1.26s, zero errors |
| **Card `bg-card` class** | ✅ All 9 cards |
| **Card `ring-1` border** | ✅ All 9 cards |
| **Card `border-radius: 0`** | ✅ Sharp/industrial |
| **Full-bleed cards `padding: 0`** | ✅ 3 ProgramPillar cards |
| **Card sub-components** | ✅ 9 headers, 9 titles, 9 descriptions, 4 footers |
| **Button uppercase** | ✅ `text-transform: uppercase` |
| **Noise overlays** | ✅ 2 sections (Centers, Shop) |
| **AOS animations** | ✅ 20 elements, AOS loaded |
| **Typography hierarchy** | ✅ 2 heading-xl (normal), 6 heading-lg (no transform) |
| **Diagonal divider** | ✅ Present |
| **Header shrink** | ✅ Script active |
| **Video opacity** | ✅ 0.65 |
| **`data-aos` on Cards** | ✅ Passed through `...rest` spread |
| **`tailwind-variants` integrated** | ✅ All cards use `tv()` |

---

## Files Changed

```
src/components/starwind/card/Card.astro          ← synced from reference
src/components/starwind/card/CardHeader.astro      ← synced from reference
src/components/starwind/card/CardTitle.astro       ← synced from reference
src/components/starwind/card/CardDescription.astro ← synced from reference
src/components/starwind/card/CardContent.astro     ← synced from reference
src/components/starwind/card/CardFooter.astro      ← synced from reference
src/components/starwind/card/index.ts              ← synced from reference
src/components/sections/ProgramPillars.astro       ← card-full-bleed classes
src/styles/global.css                              ← Starwind component overrides + !important fixes
```

---

## What Stayed the Same (Intentionally)

| Decision | Rationale |
|----------|-----------|
| No `jy-design-system.css` | User preference — Tailwind + Starwind + Bressel theme CSS only |
| No multi-theme system | Bressel is single-theme (`data-theme="bressel"`) |
| Monolithic `global.css` | Simpler than splitting into `theme-bressel.css` + `section-base.css` |
| Button kept BRESSEL variants | `primary-outline`, `primary-solid` custom variants preserved |
| No additional Starwind components imported | Only Card needed fixing; Badge, Separator were already identical |

---

## Before/After — Key Improvements

| Aspect | Before | After |
|--------|--------|-------|
| Card background | `bg-bressel-black-soft` (manual across sections) | `bg-card` (uses `--color-card` token, consistent) |
| Card border | Manual `border border-bressel-zinc-800` | `ring-1 ring-border` (Starwind standard) |
| Card padding | Manual per-section Tailwind classes | `gap-6 py-6` (default) / `p-0` (full-bleed) |
| CardHeader layout | Custom inline classes | `@container/card-header grid` with `has-data-[]` auto-detection |
| CardTitle style | Inline `font-header font-black italic` | Uses `--font-heading` token + `data-slot` selector |
| CardFooter | Inline classes | `bg-muted/50 rounded-b-xl border-t p-6` (Starwind standard) |
| Responsive card sizes | Manual breakpoints | `group-data-[size=sm]/card:` CSS variants |
