# Visual Dev Tool — Finalized Plan

> **Version:** FINAL  
> **Date:** 2026-04-30  
> **Status:** READY TO BUILD  
> **Project:** base-ui-starwind (Astro.js + Starwind UI)  
> **Design Philosophy:** Drop-in, zero-config, single-file. No build hooks. No imports. No abstractions.

---

## What It Is

A single `.astro` component you drop into your Layout. It adds a floating 🎨 button that opens a panel for swapping images on your live site — no copy/paste/refresh cycles.

**One file. Two steps. Done.**

---

## Setup (Two Steps)

### Step 1: Drop into Layout

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

### Step 2: Tag images you want to manage

```astro
<img src="/assets/hero-bg.jpg" data-swap="hero-bg" alt="Hero" />
<source src="/assets/video.mp4" data-swap="hero-video" type="video/mp4" />
<div data-swap="hero-bg" style="background-image: url('/assets/bg.jpg')" />
```

**That's it.** The tool works immediately. No build, no config, no imports.

---

## The File

```
src/components/visual-dev/VisualDev.astro
```

**One file containing:**
1. Panel UI (HTML)
2. Logic (vanilla JS in IIFE)
3. Styles (scoped CSS with `all: initial`)

No dependencies. No scripts. No build hooks.

---

## Core Architecture

### The Mental Model

> **"The tool temporarily overrides my UI until I copy-paste the changes."**

The tool does NOT manage your files. It does NOT write to the filesystem. It does NOT generate config files. It acts as a **temporary visual layer** that cleanly steps out of the way when the job is done.

### The Flow

```
Tag image with data-swap attribute
       │
       ▼
Tool scans DOM for [data-swap] elements
       │
       ▼
Developer opens panel → sees list of slots
       │
       ▼
Swap via drag-drop / paste / browse / keyboard
       │
       ▼
Changes saved to localStorage (persists across refresh)
       │
       ▼
Export → clipboard-ready JSON or code
       │
       ▼
Developer copies export → pastes into components
       │
       ▼
Tool steps out. Done.
```

---

## Gemini v2 Analysis — Key Decisions

### 1. Blob URLs vs Base64 (Critical)

**Problem:** Dragging a local file creates a Blob URL (`blob:http://localhost:4321/...`) that dies on page refresh. `localStorage` can't store Blob URLs.

**Solution — Dual-mode persistence:**

```
Drag-drop local file:
  → Convert to Base64 via canvas → save to localStorage
  → Survives hard refresh (F5)
  → ~2KB overhead per image (acceptable for dev)

Paste URL (http/https):
  → Save URL directly → save to localStorage
  → No conversion needed
  → Works for remote images
```

**Why not IndexedDB?** Overkill for a single-file dev tool. Base64 is simpler and good enough for dev use.

**Note on Vite HMR:** Normal dev saves (Ctrl+S) trigger HMR → DOM updates → Blob URLs survive. Only **hard refresh (F5)** breaks Blob URLs. So the Base64 conversion mainly helps developers who refresh the page.

### 2. CSS Backgrounds — Keep It Simple

No `data-swap-path` needed. Inline `style.backgroundImage` overrides any CSS class.

```html
<!-- Just this is enough -->
<div class="hero-section" data-swap="hero-bg">
```

The tool applies: `el.style.backgroundImage = "url('...')";` — inline styles win.

### 3. Inspect Mode — Auto-Generated IDs

When swapping an untagged image via Inspect Mode:
- Generate `auto-img-1`, `auto-img-2`, etc.
- Add `data-swap="auto-img-N"` to the element
- Export notes: `<!-- Add data-swap="auto-img-1" to your source -->`

### 4. File Structure

```
src/components/visual-dev/VisualDev.astro
├── HTML: Panel UI, floating button
├── Script: IIFE with all logic
└── CSS: Scoped with #visual-dev-wrapper
```

---

## Panel Features

### Three Toggle Modes

| Mode | Description | Toggle |
|------|-------------|--------|
| **Floating Button** | Tiny 🎨 button, bottom-right | Default |
| **Sliding Panel** | 600px wide, 80vh tall | Click button or `V` |
| **Ghost Mode** | Semi-transparent, click-through | `G` key or button |

### Swap Methods

| Method | How | When |
|--------|-----|------|
| **Drag & Drop** (primary) | Drop file from desktop | Local files |
| **Paste URL** | Type/paste URL | Remote images |
| **Browse Library** | Click images from `library` prop | Pre-defined options |
| **Keyboard Cycle** | ← → keys | When library is set |
| **Inspect Mode** | Click any untagged image | One-off swaps |

### Export Formats

| Format | Output | Use Case |
|--------|--------|----------|
| **JSON** | `{ "slot-id": "/path/to/new.jpg" }` | Share, import, version control |
| **Code** | `<img src="/new.jpg" data-swap="slot-id" />` | Copy-paste into components |
| **Diff** | `slot-id: old.jpg → new.jpg` | Quick review of changes |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `V` | Toggle panel |
| `ESC` | Close / clear |
| `←` / `→` | Cycle library images |
| `R` | Reset slot to original |
| `G` | Toggle ghost mode |
| `E` | Export JSON |
| `C` | Copy JSON to clipboard |
| `X` | Copy code to clipboard |
| `1-9` | Select slot by number |
| `I` | Toggle Inspect Mode |
| `F` | Focus search |
| `.` | Open library browser |

---

## localStorage Schema

```
Key: "visual-dev-swaps"
Value: {
  "hero-bg": "data:image/webp;base64,..."  // Base64 for local drops
  "academy-card": "/assets/academy-hero.webp"  // URL for remote
  "cta-bg": "/assets/cta-bg-new.jpg"
}
```

**Rules:**
- Local file drops → Base64 (canvas-converted)
- URL pastes → direct URL string
- Max size: localStorage ~5MB. Each Base64 image ~100-500KB. Practical limit: ~10-20 swapped images before clearing.

---

## Component API

```astro
<VisualDev
  library={['/assets/hero-v1.jpg', '/assets/hero-v2.jpg']}
  pageGrouping={true}
  defaultView="component"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `library` | `string[]` | `[]` | Optional image picker options |
| `pageGrouping` | `boolean` | `true` | Group slots by page |
| `defaultView` | `'component' \| 'page' \| 'flat'` | `'component'` | Default grouping mode |

---

## Image Slots to Tag (base-ui-starwind)

| Component | data-swap ID | Current | Type |
|-----------|-------------|---------|------|
| Hero.astro | `hero-bg` | /assets/hero-bg.jpg | img/poster |
| Hero.astro | `hero-video` | /assets/background-video.mp4 | video source |
| AcademyCards.astro | `academy-card` | /assets/academy-card.jpg | img |
| AcademyCards.astro | `community-card` | /assets/community-card.jpg | img |
| ProgramPillars.astro | `professional` | /assets/20260402_115035.webp | img |
| ProgramPillars.astro | `competition` | /assets/FA-Junior-Padel-League-Logo-ICON.webp | img |
| ProgramPillars.astro | `coaches` | /assets/20260402_115214.webp | img |
| NewsletterCTA.astro | `cta-bg` | /assets/cta-bg-overlay.jpg | img |
| Quotes.astro | `quote-bg` | /assets/quote-bg-silhouette.jpg | img (×3) |
| Centers.astro | `court-1`, `court-2`, `court-3` | /assets/*.webp | img |
| Shop.astro | `product-0` through `product-3` | /assets/*.webp | img (×4) |
| Header/Footer | `logo` | /assets/logo-bressel-white.png | img |

**Total: ~20 targets. Tag the ones you care about.**

---

## Building Order

1. **VisualDev.astro** — Core component (panel + logic + styles)
2. **Tag images** in the 8 section components
3. **Drop into Layout.astro**
4. **Test** — drag-drop, paste, keyboard, export

---

## Success Criteria

| Metric | Target |
|--------|--------|
| File count | 1 file |
| Setup time | <2 minutes |
| Swap time | <2 seconds |
| Build impact | Zero |
| Learnability | <5 minutes |

---

*Finalized: 2026-04-30 — Ready to build*
