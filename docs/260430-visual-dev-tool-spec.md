# Visual Dev Tool — Full Specification

> **Version:** 1.0  
> **Date:** 2026-04-30  
> **Status:** DRAFT — For analysis & iteration  
> **Project:** base-ui-starwind (Astro.js + Starwind UI)  
> **Purpose:** Developer tool to ease photo/visual development workflow for Astro sites

---

## Executive Summary

A floating dev panel that lets developers **swap images on their live Astro site in real-time** without copy/paste-refresh cycles. Supports drag-and-drop, URL paste, keyboard cycling, and image library browsing. Exports changes as both JSON config and copy-paste-ready Astro code snippets. Uses a hybrid config file system for fast, stable updates.

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

### Image Slots Inventory (base-ui-starwind)

| Component | Slot ID | Type | Current Path |
|-----------|---------|------|--------------|
| Hero.astro | hero-bg | video poster | /assets/hero-bg.jpg |
| Hero.astro | hero-video | video source | /assets/background-video.mp4 |
| AcademyCards.astro | academy-card | img-src | /assets/academy-card.jpg |
| AcademyCards.astro | community-card | img-src | /assets/community-card.jpg |
| ProgramPillars.astro | professional | img-src | /assets/20260402_115035.webp |
| ProgramPillars.astro | competition | img-src | /assets/FA-Junior-Padel-League-Logo-ICON.webp |
| ProgramPillars.astro | coaches | img-src | /assets/20260402_115214.webp |
| NewsletterCTA.astro | cta-bg | img-src | /assets/cta-bg-overlay.jpg |
| Quotes.astro | quote-bg-1 | img-src | /assets/quote-bg-silhouette.jpg |
| Quotes.astro | quote-bg-2 | img-src | /assets/quote-bg-silhouette.jpg |
| Quotes.astro | quote-bg-3 | img-src | /assets/quote-bg-silhouette.jpg |
| Centers.astro | court-1 | img-src | /assets/20260227_195629.webp |
| Centers.astro | court-2 | img-src | /assets/20260402_115248.webp |
| Centers.astro | court-3 | img-src | /assets/20260402_120037.webp |
| Shop.astro | product-0 to product-3 | img-src | /assets/*.webp (4 products) |
| Header.astro | logo | img-src | /assets/logo-bressel-white.png |
| Footer.astro | logo | img-src | /assets/logo-bressel-white.png |

**Total: ~17+ visual swap targets across the project.**

---

## Solution Overview

### The Visual Dev Panel

A floating, toggleable panel that appears as a small button in the bottom-right corner. When opened, it slides in from the right showing all image slots organized by component/page.

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│  🎨 Visual Dev Tool [≡] [×]                                                                                               │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│  Pages: [Homepage ▼]   │  Mode: [List ▼]   │  [📷 Library] [🔍 Search] [≡ Group by Page] [≡ Group by Component]          │
├─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                                                             │
│  ─── Hero.astro ───────────────────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                                             │
│  ┌─ img #1: hero-bg ────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │                                                                                                                     │  │
│  │  [📷 thumbnail 48x48]    /assets/hero-bg.jpg                                                                        │  │
│  │                                                                                                                     │  │
│  │  [📷 Browse Library]  [🔗 Paste URL]  [↩ Reset]  ← → cycle                                                        │  │
│  │                                                                                                                     │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                             │
│  ┌─ video #1: hero-video ───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  /assets/background-video.mp4                                                                                         │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                             │
│  ─── AcademyCards.astro ─────────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                                             │
│  ┌─ img #1: academy-card ───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  /assets/academy-card.jpg                                                                             │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                             │
│  ┌─ img #2: community-card ─────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  /assets/community-card.jpg                                                                           │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                             │
│  ─── ProgramPillars.astro ───────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                                             │
│  ┌─ img #1: professional ───────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  /assets/20260402_115035.webp                                                                        │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                             │
│  ┌─ img #2: competition ────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  /assets/FA-Junior-Padel-League-Logo-ICON.webp                                                       │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                             │
│  ┌─ img #3: coaches ────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  /assets/20260402_115214.webp                                                                        │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                             │
│  ─── NewsletterCTA.astro ────────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                                             │
│  ┌─ img #1: cta-bg ─────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  /assets/cta-bg-overlay.jpg                                                                           │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                             │
│  ─── Quotes.astro ───────────────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                                             │
│  ┌─ img #1: quote-bg-1 ─────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  /assets/quote-bg-silhouette.jpg                                                                      │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                             │
│  ┌─ img #2: quote-bg-2 ─────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  /assets/quote-bg-silhouette.jpg                                                                      │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                             │
│  ┌─ img #3: quote-bg-3 ─────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  /assets/quote-bg-silhouette.jpg                                                                      │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                             │
│  ─── Centers.astro ──────────────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                                             │
│  ┌─ img #1: court-1 ────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  /assets/20260227_195629.webp                                                                        │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                             │
│  ┌─ img #2: court-2 ────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  /assets/20260402_115248.webp                                                                        │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                             │
│  ┌─ img #3: court-3 ────────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  /assets/20260402_120037.webp                                                                        │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                             │
│  ─── Shop.astro ─────────────────────────────────────────────────────────────────────────────────────────────────────────  │
│                                                                                                                             │
│  ┌─ img #1: product-0 ──────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  /assets/20260402_115248.webp                                                                        │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                             │
│  ┌─ img #2: product-1 ──────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  /assets/20260402_120136.webp                                                                        │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                             │
│  ┌─ img #3: product-2 ──────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  /assets/20260402_115921.webp                                                                        │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                             │
│  ┌─ img #4: product-3 ──────────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │  [📷 thumbnail]  /assets/20260402_115809.webp                                                                        │  │
│  │  [📷 Browse]  [🔗 Paste]  [↩ Reset]  ← → cycle                                                                      │  │
│  └─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                             │
│  ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────  │
│  [📤 Export JSON]  [📋 Copy JSON]  [📋 Copy Code]  [📥 Import]  [🗑 Clear All]                                                                          │
└─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
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

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `V` | Toggle panel open/closed |
| `ESC` | Close panel / clear selection |
| `←` / `→` | Cycle through library images (when a slot is selected) |
| `R` | Reset selected slot to original |
| `G` | Toggle ghost mode |
| `M` | Toggle minimize (compact mode) |
| `E` | Export JSON (downloads file) |
| `C` | Copy JSON to clipboard |
| `X` | Copy code snippets to clipboard |
| `1-9` | Select slot by number in current view |

---

## Architecture

### File Structure

```
base-ui-starwind/
├── public/
│   └── data/
│       ├── visual-dev.json       ← Dev tool writes here (JSON config)
│       └── visual-dev.mjs        ← Generated JS module (Astro importable)
├── src/
│   ├── components/
│   │   └── visual-dev/
│   │       ├── VisualDev.astro   ← Floating button component
│   │       └── visual-dev-panel.js  ← Client-side panel logic
│   └── layouts/
│       └── Layout.astro           ← Imports VisualDev in DEV mode
├── scripts/
│   └── build-config.mjs           ← Converts JSON → .mjs before build
├── astro.config.mjs               ← Hook into build process
└── docs/
    └── 260430-visual-dev-tool-spec.md  ← This document
```

### Component Flow

```
Developer opens panel
       │
       ▼
┌──────────────────┐
│  VisualDev.astro │  ← Floating button, injected into Layout.astro
│  (DEV only)      │     in DEV mode via {import.meta.env.DEV}
└────────┬─────────┘
         │
         │  Click
         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  Panel (visual-dev-panel.js)                                                      │
│                                                                                     │
│  1. Scan DOM for all <img>, <video>, [style*="background-image"]                  │
│  2. Extract: component file, slot ID, current path, element selector               │
│  3. Scan public/assets/ for image library                                          │
│  4. Render organized list of slots with thumbnails                                 │
│  5. Listen for drag-drop, paste, keyboard, click events                            │
│  6. On swap: write to visual-dev.json + update DOM                                 │
│  7. On export: format as JSON or code snippets                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
         │
         │  Write
         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  public/data/visual-dev.json                                                        │
│                                                                                     │
│  {                                                                                   │
│    "project": "base-ui-starwind",                                                   │
│    "exported": "2026-04-30T12:00:00Z",                                             │
│    "swaps": [                                                                        │
│      {                                                                               │
│        "component": "src/components/sections/Hero.astro",                            │
│        "slot_id": "hero-bg",                                                         │
│        "original": "/assets/hero-bg.jpg",                                           │
│        "new": "/assets/hero-bg-v3.webp",                                            │
│        "type": "img-src"                                                             │
│      }                                                                               │
│    ]                                                                                 │
│  }                                                                                   │
└─────────────────────────────────────────────────────────────────────────────────────┘
         │
         │  scripts/build-config.mjs (runs before astro build)
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  public/data/visual-dev.mjs                                                         │
│                                                                                     │
│  const config = {                                                                   │
│    "hero-bg": "/assets/hero-bg-v3.webp",                                           │
│    "academy-card": "/assets/academy-hero.webp",                                    │
│  };                                                                                  │
│                                                                                     │
│  export function getImage(key) {                                                    │
│    return config[key] || `/assets/${key}.jpg`;                                      │
│  }                                                                                  │
│                                                                                     │
│  export default config;                                                             │
└─────────────────────────────────────────────────────────────────────────────────────┘
         │
         │  import { getImage } from '/data/visual-dev.mjs'
         │
         ▼
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  Components read from config                                                          │
│                                                                                     │
│  import { getImage } from '/data/visual-dev.mjs';                                  │
│                                                                                     │
│  <img src={getImage('hero-bg')} alt="Hero" class="..." />                          │
│                                                                                     │
│  If key exists in config → returns new path                                         │
│  If key doesn't exist → returns default /assets/{key}.jpg                          │
│                                                                                     │
│  Result: No changes needed to components. Config controls everything.               │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## Config File System

### Why Hybrid JSON + .mjs?

Astro reads files at **build time**, not runtime. A plain JSON file can't be `import`ed directly in Astro without a plugin. The hybrid approach solves this:

| Aspect | JSON only | .mjs only | **Hybrid (chosen)** |
|--------|-----------|-----------|---------------------|
| Human readable | ✅ Yes | ❌ No | ✅ Yes (JSON) |
| Astro importable | ❌ No | ✅ Yes | ✅ Yes (.mjs) |
| Fast writes | ✅ Yes | ⚠️ Slower | ✅ Yes (JSON) |
| No plugin needed | ✅ Yes | ✅ Yes | ✅ Yes |
| Tree-shakeable | ❌ No | ✅ Yes | ✅ Yes (.mjs) |

### File Formats

#### visual-dev.json (Human-readable, written by dev tool)

```json
{
  "project": "base-ui-starwind",
  "version": "1.0",
  "exported": "2026-04-30T12:00:00Z",
  "swaps": [
    {
      "component": "src/components/sections/Hero.astro",
      "slot_id": "hero-bg",
      "original": "/assets/hero-bg.jpg",
      "new": "/assets/hero-bg-v3.webp",
      "type": "img-src"
    },
    {
      "component": "src/components/sections/AcademyCards.astro",
      "slot_id": "academy-card",
      "original": "/assets/academy-card.jpg",
      "new": "/assets/academy-hero.webp",
      "type": "img-src"
    }
  ]
}
```

#### visual-dev.mjs (Generated, Astro importable)

```js
// Auto-generated by scripts/build-config.mjs
// Do not edit manually

const config = {
  "hero-bg": "/assets/hero-bg-v3.webp",
  "academy-card": "/assets/academy-hero.webp",
};

export function getImage(key) {
  return config[key] || `/assets/${key}.jpg`;
}

export default config;
```

### Build Process

```
npm run build
       │
       ▼
┌──────────────────────────────────────┐
│  scripts/build-config.mjs            │
│                                      │
│  1. Read public/data/visual-dev.json │
│  2. Map swaps → key-value config     │
│  3. Write public/data/visual-dev.mjs │
│  4. Continue with astro build        │
└──────────────────────────────────────┘
       │
       ▼
  Astro build uses visual-dev.mjs
```

#### build-config.mjs Implementation

```js
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

// Read JSON config
const jsonPath = join(root, 'public/data/visual-dev.json');
const config = JSON.parse(readFileSync(jsonPath, 'utf-8'));

// Map swaps to key-value object
const keyValues = {};
for (const swap of config.swaps) {
  keyValues[swap.slot_id] = swap.new;
}

// Generate .mjs content
const mjsContent = `// Auto-generated by scripts/build-config.mjs\n// Do not edit manually\n\nconst config = ${JSON.stringify(keyValues, null, 2)};\n\nexport function getImage(key) {\n  return config[key] || \`/assets/\${key}.jpg\`;\n}\n\nexport default config;\n`;

// Write .mjs
const mjsPath = join(root, 'public/data/visual-dev.mjs');
writeFileSync(mjsPath, mjsContent);

console.log(`[visual-dev] Generated visual-dev.mjs with ${Object.keys(keyValues).length} entries`);
```

### Astro Config Hook

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  vite: {
    plugins: [tailwindcss()],
  },
  hooks: {
    'astro:build:before': async ({ logger }) => {
      const { execSync } = await import('child_process');
      execSync('node scripts/build-config.mjs', { stdio: 'inherit' });
    },
  },
});
```

### Dev Mode Behavior

In dev mode, the JSON is written directly by the dev panel (no build step needed). The `.mjs` file is either:
- **Pre-generated** from a previous build
- **Generated on-demand** when a component first imports it
- **Manually run** via `npm run build-config`

For dev-mode live updates, the panel can use a **Vite HMR** approach or simply rely on the JSON being read during the Astro build.

---

## Panel Features Detail

### Auto-Detection

On panel open, the tool scans the current page for all visual elements:

```javascript
function scanPageForImages() {
  const slots = [];
  
  // Scan <img> tags
  document.querySelectorAll('img').forEach((img, index) => {
    const src = img.getAttribute('src');
    if (src && src.startsWith('/assets/')) {
      slots.push({
        type: 'img-src',
        element: img,
        selector: `img:nth-of-type(${index + 1})`,
        component: detectComponentFile(),  // heuristic-based
        slot_id: generateSlotId(img, index),
        current_path: src,
        thumbnail: createThumbnail(img)
      });
    }
  });
  
  // Scan <video> sources
  document.querySelectorAll('video source').forEach((source, index) => {
    const src = source.getAttribute('src');
    if (src && src.startsWith('/assets/')) {
      slots.push({
        type: 'video-src',
        element: source,
        selector: `video source:nth-of-type(${index + 1})`,
        component: detectComponentFile(),
        slot_id: generateSlotId(source, index),
        current_path: src,
        thumbnail: createThumbnailFromVideo(source)
      });
    }
  });
  
  // Scan background images
  document.querySelectorAll('*').forEach((el) => {
    const bg = el.style.backgroundImage;
    if (bg && bg.includes('/assets/')) {
      const match = bg.match(/url\(['"]?([^'")]+)['"]?\)/);
      if (match) {
        slots.push({
          type: 'background-image',
          element: el,
          selector: getClosestComponentSelector(el),
          component: detectComponentFile(),
          slot_id: generateSlotId(el, slots.length),
          current_path: match[1],
          thumbnail: createThumbnailFromBg(el)
        });
      }
    }
  });
  
  return slots;
}
```

### Image Library Scanner

Scans `public/assets/` recursively:

```javascript
function scanImageLibrary() {
  // Returns array of { name, path, size, type, folder }
  const files = [];
  
  // In dev: use a manifest file or fetch directory listing
  // In build: generate manifest from glob
  const manifest = {
    "images/": [
      { name: "hero-bg-v1.webp", path: "/assets/images/hero-bg-v1.webp", size: 128000, type: "image/webp" },
      { name: "hero-bg-v2.webp", path: "/assets/images/hero-bg-v2.webp", size: 134000, type: "image/webp" },
    ],
    "products/": [
      { name: "racket-front.webp", path: "/assets/products/racket-front.webp", size: 95000, type: "image/webp" },
    ]
  };
  
  return files;
}
```

**Implementation options:**
1. **Pre-generated manifest** — Run `scripts/generate-manifest.mjs` to scan `public/assets/` and write `public/data/image-manifest.json`
2. **Fetch directory listing** — Use a simple Node server to list files (more complex)
3. **Glob at dev start** — Read filesystem directly in dev mode (fastest for local dev)

### Swap Workflow

```
Developer clicks a slot in the panel
       │
       ▼
┌─────────────────────────────────────────────────────┐
│  ┌─ img #1: hero-bg ───────────────────────────┐  │
│  │  [📷 thumbnail]  /assets/hero-bg.jpg         │  │
│  │                                               │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐    │  │
│  │  │ 📷       │ │ 🔗       │ │ ↩        │    │  │
│  │  │ Browse   │ │ Paste    │ │ Reset    │    │  │
│  │  └──────────┘ └──────────┘ └──────────┘    │  │
│  │                                               │  │
│  │  ← → cycle through library images            │  │
│  └───────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Swap methods:**

1. **Browse Library** — Opens image gallery, click any image → preview → "Apply"
2. **Paste URL** — Input field for URL → preview → "Apply"
3. **Drag & Drop** — Drop image from desktop → instant swap
4. **Keyboard Cycle** — ← → keys to cycle through library images
5. **Click thumbnail** — Click slot thumbnail → opens swap options

### Preview System

When swapping, show a live preview:

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

The panel supports multiple views:

**View 1: Group by Component (default)**
```
── Hero.astro ──
  img #1: hero-bg
  video #1: hero-video

── AcademyCards.astro ──
  img #1: academy-card
  img #2: community-card
```

**View 2: Group by Page**
```
── Homepage ──
  Hero.astro → hero-bg
  AcademyCards.astro → academy-card
  ProgramPillars.astro → professional

── About ──
  ...
```

**View 3: Flat List**
```
All slots in one scrollable list, sorted alphabetically
```

---

## Export Formats

### Export 1: JSON (Structured)

```json
{
  "project": "base-ui-starwind",
  "version": "1.0",
  "exported": "2026-04-30T12:00:00Z",
  "swaps": [
    {
      "component": "src/components/sections/Hero.astro",
      "slot_id": "hero-bg",
      "original": "/assets/hero-bg.jpg",
      "new": "/assets/hero-bg-v3.webp",
      "type": "img-src"
    },
    {
      "component": "src/components/sections/AcademyCards.astro",
      "slot_id": "academy-card",
      "original": "/assets/academy-card.jpg",
      "new": "/assets/academy-hero.webp",
      "type": "img-src"
    }
  ]
}
```

### Export 2: Copy-Paste Code (Astro-Ready)

```astro
// Hero.astro — swap these lines:
<source src="/assets/hero-bg-v3.webp" type="video/mp4" />

// AcademyCards.astro — swap these lines:
<img src="/assets/academy-hero.webp"
  alt="BRESSEL Academy"
  class="w-full h-full object-cover"
/>
```

### Export 3: Config Snippet (For Manual Paste)

```js
// Add to your visual-dev.json swaps array:
{
  "hero-bg": "/assets/hero-bg-v3.webp",
  "academy-card": "/assets/academy-hero.webp"
}
```

### Import

Load a previously exported JSON file to restore all swaps. Useful for:
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
2. Panel scans the page and highlights matching slots
3. Swap still writes to global config (shared across pages)
4. Export can be per-page or all-pages

**Why page-by-page?**
- Keeps panel clean (not 15+ slots crammed together)
- Focus on one page at a time
- Matches how developers work (one page → one review session)

---

## Keyboard Shortcuts Reference

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

---

## Performance Considerations

### Config File Performance

| Aspect | Strategy |
|--------|----------|
| **File size** | JSON stays small — only key→path pairs, no metadata |
| **Write speed** | Synchronous file write (tiny file, <1ms) |
| **Read speed** | .mjs is a JS object — zero parsing, instant import |
| **Build impact** | build-config.mjs runs once before build — <100ms |
| **Dev mode** | JSON written on every swap — negligible overhead |

### Panel Performance

| Aspect | Strategy |
|--------|----------|
| **Image scan** | Scan on panel open only — cached until close |
| **Library scan** | On-demand or periodic — not on every swap |
| **DOM scanning** | Only scan visible page — not entire site |
| **Thumbnail generation** | Canvas-based, lazy-loaded |
| **Memory** | No image data stored — only paths |

### Component Read Performance

| Aspect | Strategy |
|--------|----------|
| **Import overhead** | Single `import { getImage }` — one file, cached |
| **Runtime cost** | Object lookup — O(1), negligible |
| **Build time** | .mjs is pre-compiled — no runtime parsing |
| **Tree-shake** | Only imports what components use |

---

## Component Integration Pattern

### Option A: Direct Import (Recommended)

```astro
---
import { getImage } from '/data/visual-dev.mjs';
---

<img src={getImage('hero-bg')} alt="Hero" class="w-full h-full object-cover" />
```

**Pros:**
- Clean, minimal code
- Zero changes to existing components
- Config controls everything

**Cons:**
- Requires modifying all components that use images

### Option B: Wrapper Component

```astro
---
import VisualImage from '/components/visual-dev/Image.astro';
---

<VisualImage
  slot_id="hero-bg"
  alt="Hero"
  class="w-full h-full object-cover"
  fallback="/assets/hero-bg.jpg"
/>
```

**Pros:**
- Single import per component
- More flexible (supports img, video, background)

**Cons:**
- Adds a component dependency
- Slightly more verbose

### Option C: Astro Asset Collection (Future)

```astro
---
import { defineImage } from '/data/visual-dev.mjs';
---

{defineImage('hero-bg', '/assets/hero-bg.jpg')}
{defineImage('academy-card', '/assets/academy-card.jpg')}

<img src={getImage('hero-bg')} alt="Hero" />
```

**Pros:**
- Explicit declaration of image slots
- Easier to scan for images

**Cons:**
- More setup per component

---

## Migration Path

### Phase 1: Current State (No Config)

```astro
<img src="/assets/hero-bg.jpg" alt="Hero" />
```

### Phase 2: Add getImage Import

```astro
---
import { getImage } from '/data/visual-dev.mjs';
---

<img src={getImage('hero-bg')} alt="Hero" />
```

### Phase 3: Full Visual Dev Integration

```
1. Visual Dev tool scans all components
2. Developer swaps images via panel
3. Export writes visual-dev.json
4. Build generates visual-dev.mjs
5. All components read from config
6. Final export = save config file
```

---

## Future Enhancements

### 1. Visual Diff Mode
Show before/after side-by-side on the actual page.

### 2. A/B Testing
Toggle between two image sets to compare.

### 3. Multi-Page Export
Export swaps for all pages at once with per-page organization.

### 4. Image Optimization Integration
Auto-optimize swapped images (resize, compress, convert to WebP).

### 5. Team Sharing
Push config to a shared location (GitHub, S3, etc.) for team access.

### 6. AI Suggestions
Connect to AI image generation API for in-panel generation.

### 7. CSS Background Inspector
Deep-inspect CSS background properties (object-fit, position, size).

### 8. Color Palette Extraction
Extract dominant colors from swapped images for design reference.

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Config file missing at build | High | Fallback to default paths, warn in console |
| .mjs not regenerated | Medium | Build hook auto-regenerates, manual fallback |
| Slot ID conflicts | Low | Use component+index as ID (e.g., "Hero-0") |
| Large asset folders slow scan | Medium | Limit scan depth, use manifest |
| Dev vs prod inconsistency | Medium | Config only active in DEV mode |
| Build time increase | Low | <100ms for tiny file |

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Swap time (current) | 5-10 seconds (copy/paste/refresh) |
| Swap time (with tool) | <2 seconds (click/drop) |
| Image slots detected | 100% of /assets/ images |
| Config write time | <1ms per swap |
| Build impact | <100ms |
| Learning curve | <5 minutes to use |

---

## Open Questions

1. **Config naming** — `visual-dev.json` vs shorter name?
2. **Image library scan scope** — `public/assets/` recursive or top-level only?
3. **Default fallback** — When key missing: `/{key}.{ext}` or explicit defaults?
4. **Build hook** — Auto-run in config or manual `npm run build-config`?
5. **Multi-page export** — Per-page or "all swaps" (config is shared anyway)?
6. **Team workflow** — Should config be git-tracked or in `.gitignore`?
7. **Production behavior** — Should config be stripped in production or kept?
8. **Component detection** — How reliably can we map DOM → component file?
9. **Image manifest** — Pre-generate or scan on-demand?
10. **CSS background** — Should tool support CSS `background-image` from stylesheets (not just inline)?

---

## Appendix A: Current Component Image Paths

| Component | Slot ID | Current Path | Type |
|-----------|---------|--------------|------|
| Hero.astro | hero-bg | /assets/hero-bg.jpg | video poster |
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

---

## Appendix B: Glossary

| Term | Definition |
|------|------------|
| **Slot** | A specific image location in a component (e.g., "hero-bg" in Hero.astro) |
| **Swap** | Replacing an image slot with a new image |
| **Config** | visual-dev.json — the human-readable source of truth |
| **Manifest** | visual-dev.mjs — the Astro-importable JS module |
| **Library** | The collection of available images from public/assets/ |
| **Ghost Mode** | Semi-transparent panel that allows clicking through to the site |
| **Export JSON** | Structured JSON file with all swap data |
| **Export Code** | Copy-paste-ready Astro code snippets for each swap |
| **Slot ID** | Unique identifier for an image slot (e.g., "hero-bg") |

---

*Document version: 1.0 — 2026-04-30 — For analysis and iteration*
