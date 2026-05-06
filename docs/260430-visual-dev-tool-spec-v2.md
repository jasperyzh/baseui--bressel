# Visual Dev Tool — Full Specification (v2)

> **Version:** 2.0  
> **Date:** 2026-04-30  
> **Status:** DRAFT — For analysis & iteration  
> **Project:** base-ui-starwind (Astro.js + Starwind UI)  
> **Purpose:** Developer tool to ease photo/visual development workflow for Astro sites  
> **Design Philosophy:** Drop-in, zero-config, single-file. No build hooks. No imports. No abstractions.

---

## Executive Summary

A floating dev panel that lets developers **swap images on their live Astro site in real-time** without copy/paste-refresh cycles. Uses standard HTML `data-swap` attributes — no build scripts, no imports, no abstractions. Saves swaps to `localStorage` for persistence during dev. Exports changes as both JSON and copy-paste-ready code snippets.

**The key difference from v1:** No config file system. No `.mjs` generation. No `getImage()` wrapper. Just `data-swap` attributes + vanilla JS + `localStorage`.

---

## Problem Statement

### Current Workflow (Pain Points)

```
1. Developer has AI-generated images saved locally
2. Open astro dev server (npm run dev)
3. Go to component file → find <img src="..."> or background-image property
4. Copy new path → paste into component
5. Switch to browser → see if it looks good
6. If not, repeat from step 3
7. Repeat for every image slot across every page
```

**Pain points:**
- **Copy/paste → switch tabs → refresh cycle** — takes 5-10 seconds per swap
- **No visual preview** of what the new image looks like before committing
- **No bulk management** — each image is swapped in isolation
- **No export mechanism** — when happy with swaps, need to manually update 10+ components
- **No organized view** — can't see all image slots on a page at once

### Why v1's Approach Was Too Heavy

| v1 Approach | Problem |
|-------------|---------|
| `visual-dev.json` + `visual-dev.mjs` | Two files, one generated, one hand-written. Why maintain two? |
| `getImage('hero-bg')` import in every component | Invasive — every component must change. Not project-agnostic. |
| `build-config.mjs` build hook | Adds a build step. What if you don't use Astro? |
| `component: detectComponentFile()` heuristic | DOM has no component boundaries. Reversing DOM → file is fragile regex. |
| `public/assets/` folder scanning | Requires Node.js, Vite middleware, or directory listing API. Friction. |
| JSON export requires file write | Writing to filesystem from browser needs API endpoint or download blob. |

### The v2 Insight

> **"If you force the developer to change how they write image tags, you've built a framework, not a tool."**

The better approach: **Tag what you want to track, swap what you see, export what you need. Nothing else.**

---

## Solution Overview

### The Core Concept

```
Developer adds ONE attribute to images they want to manage:
  <img src="/assets/old.jpg" data-swap="hero-bg" />

The tool works entirely in the browser:
  1. Scans DOM for [data-swap] elements
  2. Lets you swap via drag-drop, paste, or library
  3. Saves to localStorage (persists across refresh)
  4. Exports changes when you're done
```

### The Visual Dev Panel

A floating, toggleable panel that appears as a small button in the bottom-right corner. When opened, it slides in from the right showing all `data-swap` tagged elements organized by page.

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│  🎨 Visual Dev Tool [≡] [×]                                                             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│  Pages: [Homepage ▼]   🔍 Search: [____________]   [📷 Library]   [🔎 Inspect Mode]    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                         │
│  ─── Hero.astro ───────────────────────────────────────────────────────────────────────  │
│                                                                                         │
│  ┌─ img: hero-bg ─────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                   │  │
│  │  [📷 thumbnail 48x48]    src="/assets/hero-bg.jpg"                                │  │
│  │  [📷 thumbnail 48x48]    poster="/assets/hero-bg.jpg"                             │  │
│  │                                                                                   │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle  [📋 Copy Path]                   │  │
│  │                                                                                   │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ─── AcademyCards.astro ───────────────────────────────────────────────────────────────  │
│                                                                                         │
│  ┌─ img: academy-card ────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  src="/assets/academy-card.jpg"                                     │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle  [📋 Copy Path]                     │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ┌─ img: community-card ──────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  src="/assets/community-card.jpg"                                   │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle  [📋 Copy Path]                     │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ─── ProgramPillars.astro ─────────────────────────────────────────────────────────────  │
│                                                                                         │
│  ┌─ img: professional ────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  src="/assets/20260402_115035.webp"                                  │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle  [📋 Copy Path]                     │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ┌─ img: competition ─────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  src="/assets/FA-Junior-Padel-League-Logo-ICON.webp"                 │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle  [📋 Copy Path]                     │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ┌─ img: coaches ─────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  src="/assets/20260402_115214.webp"                                  │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle  [📋 Copy Path]                     │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ─── NewsletterCTA.astro ─────────────────────────────────────────────────────────────  │
│                                                                                         │
│  ┌─ img: cta-bg ──────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  src="/assets/cta-bg-overlay.jpg"                                    │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle  [📋 Copy Path]                     │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ─── Quotes.astro ─────────────────────────────────────────────────────────────────────  │
│                                                                                         │
│  ┌─ img: quote-bg-1 ──────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  src="/assets/quote-bg-silhouette.jpg"                                │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle  [📋 Copy Path]                     │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ┌─ img: quote-bg-2 ──────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  src="/assets/quote-bg-silhouette.jpg"                                │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle  [📋 Copy Path]                     │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ┌─ img: quote-bg-3 ──────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  src="/assets/quote-bg-silhouette.jpg"                                │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle  [📋 Copy Path]                     │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ─── Centers.astro ───────────────────────────────────────────────────────────────────  │
│                                                                                         │
│  ┌─ img: court-1 ─────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  src="/assets/20260227_195629.webp"                                  │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle  [📋 Copy Path]                     │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ┌─ img: court-2 ─────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  src="/assets/20260402_115248.webp"                                  │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle  [📋 Copy Path]                     │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ┌─ img: court-3 ─────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  src="/assets/20260402_120037.webp"                                  │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle  [📋 Copy Path]                     │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ─── Shop.astro ──────────────────────────────────────────────────────────────────────  │
│                                                                                         │
│  ┌─ img: product-0 ───────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  src="/assets/20260402_115248.webp"                                  │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle  [📋 Copy Path]                     │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ┌─ img: product-1 ───────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  src="/assets/20260402_120136.webp"                                  │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle  [📋 Copy Path]                     │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ┌─ img: product-2 ───────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  src="/assets/20260402_115921.webp"                                  │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle  [📋 Copy Path]                     │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ┌─ img: product-3 ───────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  src="/assets/20260402_115809.webp"                                  │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle  [📋 Copy Path]                     │  │
│  └───────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                         │
│  ─────────────────────────────────────────────────────────────────────────────────────  │
│  [📤 Export All JSON]  [📋 Copy JSON]  [📋 Copy Code]  [📥 Import]  [🗑 Clear All]    │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

### Three Toggle Modes

```
Mode 1: FLOATING BUTTON (default, minimal)
┌──────────────────┐
│  🎨              │  ← Tiny button, bottom-right corner
│                  │
└──────────────────┘
  - Unobtrusive, never blocks the site
  - Click to expand to panel mode

Mode 2: SLIDING PANEL (full)
┌────────────────────────────────────────────────────────────────────┐
│  🎨 Visual Dev Tool [×]                                          │
├────────────────────────────────────────────────────────────────────┤
│  [Full panel content — see wireframe above]                      │
└────────────────────────────────────────────────────────────────────┘
  - 600px wide, 80vh tall
  - Slides in from right
  - Click [×] or press ESC to collapse

Mode 3: GHOST MODE (overlay, click-through)
┌────────────────────────────────────────────────────────────────────┐
│  🎨 Visual Dev Tool (ghost) [×]                                │
├────────────────────────────────────────────────────────────────────┤
│  [Panel is semi-transparent + pointer-events: none]              │
│  You can click on the website behind it while panel is open      │
│  Perfect for reviewing swapped images with the panel visible     │
└────────────────────────────────────────────────────────────────────┘
  - Toggle with [G] key or button
  - Opacity: 50%
  - Click-through enabled
```

### Inspect Mode

A point-and-click way to tag and swap untagged images:

```
Developer clicks "🔎 Inspect Mode"
       │
       ▼
Cursor becomes a crosshair
       │
       ▼
Hover over any image → pink dashed outline highlights it
       │
       ▼
Click → panel opens a swap interface for that specific image
       │
       ▼
Swap it → it gets a [data-swap] attribute added automatically
       │
       ▼
Click "Inspect Mode" again to exit
```

This is the **fastest way to tag images** — no need to go into component files.

---

## Architecture (v2: Lean & Drop-in)

### File Structure

```
base-ui-starwind/
├── src/
│   └── components/
│       └── visual-dev/
│           └── VisualDev.astro   ← Single file. Everything in one place.
├── astro.config.mjs              ← One line change to include VisualDev
└── docs/
    └── 260430-visual-dev-tool-spec-v2.md
```

**That's it.** One component. No scripts. No build hooks. No config files.

### Setup (Two Steps)

**Step 1: Drop the component into Layout**

```astro
---
// Layout.astro
import VisualDev from '../components/visual-dev/VisualDev.astro';
---

<body>
  <slot />
  {import.meta.env.DEV && <VisualDev />}
</body>
```

**Step 2: Tag your images (one-time setup)**

```astro
<!-- Before -->
<img src="/assets/hero-bg.jpg" alt="Hero" class="..." />

<!-- After -->
<img src="/assets/hero-bg.jpg" alt="Hero" class="..." data-swap="hero-bg" />
```

**That's it.** The tool works immediately. No build, no config, nothing.

### How It Works — The Complete Flow

```
Developer tags images with data-swap attribute
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  Developer adds data-swap to images they want to manage:                                   │
│                                                                                             │
│  <img src="/assets/hero-bg.jpg" data-swap="hero-bg" />                                    │
│  <source src="/assets/background-video.mp4" data-swap="hero-video" />                      │
│  <div style="background-image: url('/assets/bg.jpg')" data-swap="hero-bg-image" />         │
│                                                                                             │
│  No imports. No config. No build hooks. Just an HTML attribute.                            │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  VisualDev.astro runs in DEV mode (only). It does THREE things:                            │
│                                                                                             │
│  1. SCAN: Finds all [data-swap] elements on the page                                      │
│  2. RESTORE: Checks localStorage for saved swaps → reapplies them                           │
│  3. LISTEN: Sets up drag-drop, paste, keyboard listeners                                   │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  Developer opens panel → sees list of tagged elements                                      │
│                                                                                             │
│  For each element:                                                                           │
│  - Shows current thumbnail                                                                 │
│ - Shows current src/path                                                                    │
│  - Swap buttons: [Browse] [Paste] [Reset] [Copy Path]                                      │
│  - Keyboard: ← → cycle, R reset, 1-9 select                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  Developer swaps images → changes saved to localStorage                                    │
│                                                                                             │
│  localStorage key: "visual-dev-swaps"                                                       │
│  Value: {                                                                                    │
│    "hero-bg": "/assets/hero-bg-v3.webp",                                                   │
│    "academy-card": "/assets/academy-hero.webp",                                            │
│    "cta-bg": "/assets/cta-bg-new.jpg"                                                      │
│  }                                                                                          │
│                                                                                             │
│  The script finds the element by its data-swap attribute and updates it directly:           │
│                                                                                             │
│  const el = document.querySelector(`[data-swap="${slotId}"]`);                              │
│  if (el && el.tagName === 'IMG') { el.src = newUrl; }                                      │
│  if (el && el.tagName === 'VIDEO SOURCE') { el.src = newUrl; }                              │
│  if (el && el.style) { el.style.backgroundImage = `url(${newUrl})`; }                       │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│  Developer clicks "Export" → gets clipboard-ready output                                     │
│                                                                                             │
│  Option A: JSON (structured, shareable)                                                    │
│  { "hero-bg": "/assets/hero-bg-v3.webp", "academy-card": "/assets/academy-hero.webp" }    │
│                                                                                             │
│  Option B: Code (copy-paste into components)                                               │
│  <img src="/assets/hero-bg-v3.webp" data-swap="hero-bg" />                                │
│  <img src="/assets/academy-hero.webp" data-swap="academy-card" />                          │
│                                                                                             │
│  Option C: Diff (show what changed)                                                        │
│  hero-bg: /assets/hero-bg.jpg → /assets/hero-bg-v3.webp                                   │
│  academy-card: /assets/academy-card.jpg → /assets/academy-hero.webp                        │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## The `data-swap` Attribute System

### Why `data-swap`?

| Approach | Pros | Cons |
|----------|------|------|
| `data-swap` (chosen) | Standard HTML, zero deps, works everywhere | Developer must add it manually |
| `getImage()` import | No manual tagging | Invasive — every component changes |
| Auto-detect all `/assets/` paths | Zero setup | Fragile — can't distinguish intentional vs incidental paths |

**The `data-swap` approach is the sweet spot:**
- **Developer-controlled** — you tag what you care about
- **Zero dependencies** — just an HTML attribute
- **Project-agnostic** — works in Astro, HTML, PHP, whatever
- **No build hooks** — works in pure browser
- **Explicit** — no magic, no heuristics

### Tagging Examples

```astro
<!-- Standard img -->
<img src="/assets/hero-bg.jpg" data-swap="hero-bg" alt="Hero" class="w-full" />

<!-- Video source -->
<source src="/assets/background-video.mp4" data-swap="hero-video" type="video/mp4" />

<!-- Video poster -->
<video poster="/assets/hero-bg.jpg" data-swap="hero-bg" ...>

<!-- Background image -->
<div style="background-image: url('/assets/bg.jpg')" data-swap="hero-bg-image" ...>

<!-- CSS background (via data-swap-path for external stylesheets) -->
<div class="hero-section" data-swap="hero-bg-css" data-swap-path="/assets/hero-bg.css">
```

### Tag Naming Convention

```
{component}-{element}-{variant}
```

Examples:
- `hero-bg` — Hero section, background image
- `academy-card` — Academy card image
- `court-1` — Centers section, court image 1
- `product-0` — Shop, product image 0
- `cta-bg` — Newsletter CTA, background image
- `quote-bg` — Quotes section, background image

**Rules:**
- Lowercase, hyphens
- Component name first
- Element type second
- Variant number if multiple
- Max 3 parts

---

## Panel Features Detail

### Auto-Detection

On panel open, the tool scans for `data-swap` elements:

```javascript
function scanPageForSwappableElements() {
  const slots = [];
  
  // Find all [data-swap] elements
  document.querySelectorAll('[data-swap]').forEach((el) => {
    const slotId = el.getAttribute('data-swap');
    const slotType = detectSlotType(el);
    const currentPath = getCurrentPath(el, slotType);
    
    slots.push({
      id: slotId,
      type: slotType,        // 'img-src', 'video-src', 'video-poster', 'bg-image'
      element: el,
      current_path: currentPath,
      component: detectParentComponent(el),
      page: detectCurrentPage(el),
      thumbnail: createThumbnail(el, slotType)
    });
  });
  
  return slots;
}

function detectSlotType(el) {
  if (el.tagName === 'IMG') return 'img-src';
  if (el.tagName === 'VIDEO' && el.hasAttribute('poster')) return 'video-poster';
  if (el.tagName === 'SOURCE') return 'video-src';
  if (el.style?.backgroundImage) return 'bg-image';
  return 'unknown';
}

function getCurrentPath(el, type) {
  switch (type) {
    case 'img-src': return el.getAttribute('src');
    case 'video-poster': return el.getAttribute('poster');
    case 'video-src': return el.getAttribute('src');
    case 'bg-image': {
      const match = el.style?.backgroundImage?.match(/url\(['"]?([^'"]+)['"]?\)/);
      return match?.[1] || '';
    }
    default: return '';
  }
}
```

### Image Library Scanner

**Simplified approach:** No automatic scanning. Developer passes library manually if needed.

```astro
<VisualDev library={['/assets/hero-v1.jpg', '/assets/hero-v2.jpg', '/assets/hero-v3.jpg']} />
```

Or use **drag-drop** as the primary workflow (fastest for local files).

### Swap Workflow

```
Developer clicks a slot in the panel
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  ┌─ img: hero-bg ───────────────────────────────┐  │
│  │  [📷 thumbnail]  src="/assets/hero-bg.jpg"    │  │
│  │                                                 │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐      │  │
│  │  │ 📷       │ │ 🔗       │ │ ↩        │      │  │
│  │  │ Browse   │ │ Paste    │ │ Reset    │      │  │
│  │  └──────────┘ └──────────┘ └──────────┘      │  │
│  │                                                 │  │
│  │  ← → cycle  [📋 Copy Path]                     │  │
│  └─────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Swap methods:**

1. **Drag & Drop** (primary) — Drop image from desktop → instant swap
2. **Paste URL** — Type URL → preview → swap
3. **Browse Library** — If `library` prop is provided, shows image picker
4. **Keyboard Cycle** — ← → keys to cycle through library images
5. **Inspect Mode** — Point-and-click to tag + swap untagged images

### Preview System

```
┌─────────────────────────────────────────────────────┐
│  Preview: hero-bg                                    │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌─────────────────┐    ┌─────────────────┐        │
│  │  BEFORE          │    │  AFTER          │        │
│  │  [thumbnail]     │    │  [thumbnail]    │        │
│  │  hero-bg.jpg     │    │  hero-bg-v3.webp│        │
│  └─────────────────┘    └─────────────────┘        │
│                                                     │
│  [←] [▶ Preview on Site] [←]                        │
│                                                     │
│  [✓ Apply to Slot]  [✗ Cancel]                      │
└─────────────────────────────────────────────────────┘
```

### Grouping & Organization

**View 1: Group by Component (default)**
```
── Hero.astro ──
  img: hero-bg
  video: hero-video

── AcademyCards.astro ──
  img: academy-card
  img: community-card
```

**View 2: Group by Page**
```
── Homepage ──
  Hero → hero-bg
  AcademyCards → academy-card

── About ──
  ...
```

**View 3: Flat List**
```
All slots in one scrollable list
```

---

## Export Formats

### Export 1: JSON (Structured)

```json
{
  "project": "base-ui-starwind",
  "version": "2.0",
  "exported": "2026-04-30T12:00:00Z",
  "swaps": {
    "hero-bg": "/assets/hero-bg-v3.webp",
    "academy-card": "/assets/academy-hero.webp"
  }
}
```

### Export 2: Copy-Paste Code (Astro-Ready)

```astro
<!-- Hero.astro -->
<img src="/assets/hero-bg-v3.webp" data-swap="hero-bg" alt="Hero" class="w-full" />

<!-- AcademyCards.astro -->
<img src="/assets/academy-hero.webp" data-swap="academy-card" alt="BRESSEL Academy" class="w-full h-full object-cover" />
```

### Export 3: Diff (What Changed)

```
hero-bg:          /assets/hero-bg.jpg       → /assets/hero-bg-v3.webp
academy-card:     /assets/academy-card.jpg  → /assets/academy-hero.webp
```

### Import

Load a JSON file to restore all swaps. Useful for:
- Sharing swaps between team members
- Reverting to a previous design state
- Migrating swaps between projects

---

## Page-by-Page Scope

The panel has a page selector at the top:

```
┌─────────────────────────────────────────────────────┐
│  Pages: [Homepage ▼]                                │
│    src/pages/index.astro                            │
│    src/pages/about.astro                            │
│    src/pages/academy.astro                          │
│    src/pages/community.astro                        │
│    src/pages/shop.astro                             │
│    src/pages/contact.astro                          │
│    src/pages/404.astro                              │
│    src/pages/homepage.astro                         │
└─────────────────────────────────────────────────────┘
```

**When a page is selected:**
1. Panel shows only slots on that page
2. Swap still uses global `localStorage` (shared across pages)
3. Export can be per-page or all-pages

**Why page-by-page?**
- Keeps panel clean (not 15+ slots crammed together)
- Focus on one page at a time
- Matches how developers work (one page → one review session)

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `V` | Toggle panel open/closed |
| `ESC` | Close panel / clear selection |
| `←` | Previous library image (when slot selected) |
| `→` | Next library image (when slot selected) |
| `R` | Reset selected slot to original |
| `G` | Toggle ghost mode |
| `M` | Toggle minimize (compact mode) |
| `E` | Export JSON (downloads file) |
| `C` | Copy JSON to clipboard |
| `X` | Copy code snippets to clipboard |
| `1-9` | Select slot by number in current view |
| `F` | Focus search/filter |
| `.` | Open image library browser |
| `I` | Toggle Inspect Mode |

---

## localStorage Schema

```
Key: "visual-dev-swaps"
Scope: localStorage (persists across page refreshes)
Value: {
  "hero-bg": "/assets/hero-bg-v3.webp",
  "academy-card": "/assets/academy-hero.webp",
  "cta-bg": "/assets/cta-bg-new.jpg"
}
```

**How it works:**
1. Developer swaps an image → script writes to `localStorage`
2. Developer refreshes page → script reads `localStorage` → reapplies swaps
3. Developer clicks "Clear All" → removes from `localStorage`
4. Developer clicks "Export" → formats `localStorage` data for clipboard

**No server-side state. No file writes. No build hooks.**

---

## Component API

### VisualDev.astro Props

```astro
<VisualDev
  library={[
    '/assets/hero-v1.jpg',
    '/assets/hero-v2.jpg',
    '/assets/hero-v3.jpg'
  ]}
  pageGrouping={true}
  defaultView="component"
  ghostOpacity={0.5}
  panelWidth={600}
  panelHeight={80}
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `library` | `string[]` | `[]` | Optional array of available images for Browse picker |
| `pageGrouping` | `boolean` | `true` | Group slots by page in panel |
| `defaultView` | `'component' \| 'page' \| 'flat'` | `'component'` | Default grouping mode |
| `ghostOpacity` | `number` | `0.5` | Ghost mode opacity (0-1) |
| `panelWidth` | `number` | `600` | Panel width in pixels |
| `panelHeight` | `number` | `80` | Panel height as percentage of viewport |

---

## Performance

| Aspect | Strategy |
|--------|----------|
| **Scan speed** | Only scans `[data-swap]` elements — not all images |
| **Panel open** | On-demand scan, cached until close |
| **Swap speed** | Direct DOM update via `querySelector` — instant |
| **localStorage** | Tiny object — <1KB, negligible |
| **Memory** | No image data stored — only paths |
| **Browser** | Single `<script>` tag, no dependencies |

---

## Component Integration Pattern

### Step 1: Add data-swap to images

```astro
---
// Hero.astro — add data-swap to images you want to manage
---

<section>
  <video poster="/assets/hero-bg.jpg" data-swap="hero-bg" ...>
    <source src="/assets/background-video.mp4" data-swap="hero-video" type="video/mp4" />
  </video>
</section>
```

### Step 2: Drop in Layout

```astro
---
// Layout.astro
import VisualDev from '../components/visual-dev/VisualDev.astro';
---

<body>
  <slot />
  {import.meta.env.DEV && <VisualDev />}
</body>
```

### Step 3: Done

That's it. No build scripts. No imports. No config files.

---

## Migration Path

### Phase 1: Current State (No Tool)

```astro
<img src="/assets/hero-bg.jpg" alt="Hero" />
```

### Phase 2: Add data-swap (One-time)

```astro
<img src="/assets/hero-bg.jpg" data-swap="hero-bg" alt="Hero" />
```

### Phase 3: Use Visual Dev (Ongoing)

```
1. Run dev server
2. Drop VisualDev into Layout
3. Tag images with data-swap
4. Swap images via panel
5. Export when happy
6. Copy-paste exported code into components
7. Keep data-swap attributes for future swaps
```

**No config files. No build hooks. No imports.**

---

## Image Slots Inventory (base-ui-starwind)

| Component | Slot ID | Current Path | Type |
|-----------|---------|--------------|------|
| Hero.astro | hero-bg | /assets/hero-bg.jpg | img/poster |
| Hero.astro | hero-video | /assets/background-video.mp4 | video source |
| AcademyCards.astro | academy-card | /assets/academy-card.jpg | img |
| AcademyCards.astro | community-card | /assets/community-card.jpg | img |
| ProgramPillars.astro | professional | /assets/20260402_115035.webp | img |
| ProgramPillars.astro | competition | /assets/FA-Junior-Padel-League-Logo-ICON.webp | img |
| ProgramPillars.astro | coaches | /assets/20260402_115214.webp | img |
| NewsletterCTA.astro | cta-bg | /assets/cta-bg-overlay.jpg | img |
| Quotes.astro | quote-bg-1 | /assets/quote-bg-silhouette.jpg | img |
| Quotes.astro | quote-bg-2 | /assets/quote-bg-silhouette.jpg | img |
| Quotes.astro | quote-bg-3 | /assets/quote-bg-silhouette.jpg | img |
| Centers.astro | court-1 | /assets/20260227_195629.webp | img |
| Centers.astro | court-2 | /assets/20260402_115248.webp | img |
| Centers.astro | court-3 | /assets/20260402_120037.webp | img |
| Shop.astro | product-0 | /assets/20260402_115248.webp | img |
| Shop.astro | product-1 | /assets/20260402_120136.webp | img |
| Shop.astro | product-2 | /assets/20260402_115921.webp | img |
| Shop.astro | product-3 | /assets/20260402_115809.webp | img |
| Header.astro | logo | /assets/logo-bressel-white.png | img |
| Footer.astro | logo | /assets/logo-bressel-white.png | img |

**Total: ~20 visual targets. Tag the ones you care about.**

---

## Open Questions

1. **Should `data-swap` be added automatically?** — Could scan for `/assets/` paths and auto-tag, but risks false positives
2. **Image library scanning** — Pre-generate manifest or rely on drag-drop?
3. **Production behavior** — `data-swap` attributes stay in HTML (harmless) but panel only shows in DEV
4. **Team workflow** — Should `data-swap` be git-tracked? (Yes, it's a real attribute)
5. **CSS background support** — Should tool support external stylesheet backgrounds (not just inline)?
6. **Page detection** — How to reliably map DOM → page? (Use file path from DevTools, or manual page selector)

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Swap time (current) | 5-10 seconds (copy/paste/refresh) |
| Swap time (with tool) | <2 seconds (click/drop) |
| Setup time | <2 minutes (tag + drop in Layout) |
| File count | 1 file (VisualDev.astro) |
| Build impact | Zero (no build hooks) |
| Learning curve | <5 minutes to use |

---

## v1 → v2 Comparison

| Feature | v1 (Heavy) | v2 (Lean) | Winner |
|---------|------------|-----------|--------|
| Config files | JSON + .mjs | localStorage | **v2** — simpler |
| Build hooks | Yes (build-config.mjs) | No | **v2** — zero overhead |
| Component imports | `import { getImage }` | None | **v2** — no changes |
| Tagging | Auto-detect (fragile) | `data-swap` (explicit) | **v2** — developer control |
| File scanning | Node.js + manifest | Drag-drop primary | **v2** — less setup |
| Persistence | File write | localStorage | **v2** — instant |
| Project-agnostic | Astro-only | Any HTML/Astro/Vite/PHP | **v2** — universal |
| File count | 5+ files | 1 file | **v2** — minimal |
| Export JSON | ✅ Yes | ✅ Yes | Tie |
| Export Code | ✅ Yes | ✅ Yes | Tie |
| Panel UI | ✅ Full | ✅ Full | Tie |
| Ghost mode | ✅ Yes | ✅ Yes | Tie |
| Keyboard shortcuts | ✅ Yes | ✅ Yes | Tie |

---

## Appendix: Glossary

| Term | Definition |
|------|------------|
| **Slot** | A tagged image location identified by `data-swap` value |
| **data-swap** | HTML attribute marking an element as swappable |
| **Swap** | Replacing an image with a new one |
| **localStorage** | Browser-native storage for swap state |
| **Library** | Optional array of available images passed via `library` prop |
| **Ghost Mode** | Semi-transparent panel overlay |
| **Inspect Mode** | Point-and-click to tag + swap untagged images |
| **Export JSON** | Structured swap data for sharing |
| **Export Code** | Copy-paste-ready Astro snippets |
| **Slot ID** | The `data-swap` attribute value |

---

*Document version: 2.0 — 2026-04-30 — For analysis and iteration*
