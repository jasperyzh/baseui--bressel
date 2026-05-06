# 260429 — Master Review & System Solidification

> **Project:** base-ui-starwind  
> **Site:** BRESSEL™ Padel Academy  
> **Stack:** Astro 6 + Tailwind v4 + Starwind UI (46 components)  
> **Sources:** Internal review + Gemini review + Headless WordPress guide  
> **Date:** 2026-04-29  
> **Status:** Brainstorm → System Design → Finalized

---

## Executive Summary

`base-ui-starwind` is both a **working BRESSEL website** and a **reusable starter template** for the Astro + Tailwind v4 + Starwind UI stack. This master review consolidates all findings from internal analysis, technical review, and WordPress integration research into one definitive system design.

---

## 1. Current State Assessment

### 1.1 Architecture Overview

```
Starwind UI (46 Astro components via @starwind-ui/core)
    ↓ CSS variable overrides
global.css (314 lines — mixing everything)
    ↓ Tailwind v4 cascade
Astro templates → Pages / Sections / Layouts
```

### 1.2 What's Working

- **Token-based theming** — Semantic tokens → brand tokens → trivial theme swaps
- **Tailwind v4 `@theme`** — No config file, no `tailwind.config.js`
- **Starwind UI as dependency** — Versioned, accessible components
- **BRESSEL brand cohesion** — Dark + red + Oswald italics reads premium athletic
- **DEVELOPMENT_RULES.md** — Good reference for "override tokens, don't rewrite markup"

### 1.3 Issues Found

| # | Issue | Severity | Source |
|---|-------|----------|--------|
| 1 | **Dual identity** — BRESSEL site vs. template, unclear which is primary | High | Internal |
| 2 | **global.css is 314 lines of mixed concerns** | High | Internal |
| 3 | **Header CTA is raw HTML** — violates DEVELOPMENT_RULES.md | High | Internal |
| 4 | **No icon system** — SVGs copy-pasted everywhere | Medium | Internal |
| 5 | **Client:load on raw HTML is invalid** — Astro hydration only works on UI framework components | High | Gemini |
| 6 | **Manual icon registry is tedious** — `Icon.astro` + `index.ts` maintenance burden | Medium | Gemini |
| 7 | **Triple-maintenance trap** — Astro → PHP → Elementor = 3x code to maintain | High | Gemini |
| 8 | **`@layer components` for typography** — Tailwind v4 has `@utility` instead | Low | Gemini |
| 9 | **No WordPress integration plan** | Strategic | Internal |
| 10 | **Layout has duplicate CSS import** | Low | Internal |

---

## 2. CSS Architecture — Engine vs. Paint

### 2.1 Philosophy

> **globals/** = the engine (Tailwind + Starwind defaults)  
> **brand/** = the paint (your brand's colors, fonts, overrides)

Think of it like a car: globals/ is the chassis and engine. brand/ is the paint job and interior trim. Swap the paint, keep the engine.

### 2.2 Final File Structure

```
src/styles/
├── globals/
│   ├── tailwind.css          ← Tailwind v4 + plugins (5-10 lines)
│   ├── starwind-ui.css       ← Starwind baseline (auto-regenerated)
│   └── reset.css             ← Minimal reset (if needed)
│
├── brand/
│   ├── tokens.css            ← Brand colors, fonts, radii, shadows
│   ├── overrides.css         ← Semantic → brand token mapping
│   ├── typography.css        ← @utility heading/body/nav classes
│   ├── components.css        ← Brand component styles (.card, etc.)
│   └── effects.css           ← Noise, scrollbars, HTML/body globals
│
└── index.css                 ← Thin entry: imports globals/ then brand/
```

### 2.3 File-by-File Breakdown

#### `globals/tailwind.css` (thin — 5-10 lines)

```css
@import "tailwindcss";
@import "tw-animate-css";
@plugin "@tailwindcss/forms";

@custom-variant dark (&:where(.dark, .dark *));
```

#### `globals/starwind-ui.css` (auto-regenerated — 80-100 lines)

```css
/* Auto-generated from Starwind defaults. Do NOT edit manually. */
/* Sync command: npm run sync:starwind */

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  /* ... all 40+ semantic tokens ... */
  --radius: 0.625rem;
}

:root {
  --background: var(--color-white);
  --foreground: var(--color-neutral-950);
  --primary: var(--color-blue-700);
  /* ... light theme defaults ... */
}

.dark {
  --background: var(--color-neutral-950);
  --foreground: var(--color-neutral-50);
  /* ... dark theme defaults ... */
}

@layer base {
  * { @apply border-border outline-outline/50; }
  body { @apply bg-background text-foreground scheme-light dark:scheme-dark; }
  button { @apply cursor-pointer; }
}
```

**Sync script** (in `package.json`):
```json
"scripts": {
  "sync:starwind": "node scripts/sync-starwind.mjs"
}
```
Copies fresh baseline from `node_modules/@starwind-ui/core` on `npm update`.

#### `brand/tokens.css` (brand source of truth — 30-40 lines)

```css
/* ==================================================
   [BRAND] Brand Tokens
   Source of truth for all brand values
   ================================================== */

@theme {
  /* Primary */
  --color-primary-brand: #ff331f;
  --color-primary-brand-hover: #e62a1a;

  /* Neutrals */
  --color-neutral-950: #090808;
  --color-neutral-900: #18181b;
  --color-neutral-50: #fbfbff;

  /* Accent */
  --color-accent: #eeff2c;
  --color-accent-dark: #c1de00;

  /* Zinc scale for borders/text */
  --color-zinc-200: #e4e4e7;
  --color-zinc-400: #a1a1aa;
  --color-zinc-600: #52525b;
  --color-zinc-800: #27272a;

  /* Typography */
  --font-header: "Oswald", sans-serif;
  --font-heading: "Oswald", sans-serif;
  --font-body: "Inter", sans-serif;
  --font-weight-bold: 700;
  --font-weight-black: 900;
  --letter-spacing-wide: 0.1em;
  --letter-spacing-wider: 0.15em;
  --letter-spacing-widest: 0.25em;
}
```

**Key principle:** Every brand color, font, spacing value lives here. Nothing is hardcoded in templates. Rename `--color-primary-brand` to `--color-primary-brand` for neutrality in the template.

#### `brand/overrides.css` (the switchboard — 20-30 lines)

```css
/* ==================================================
   Semantic Token → Brand Token Mapping
   This is where Starwind's defaults become YOUR brand
   ================================================== */

:root {
  --color-primary: var(--color-primary-brand);
  --color-primary-foreground: var(--color-neutral-50);
  --color-background: var(--color-neutral-950);
  --color-foreground: var(--color-zinc-200);
  --color-border: rgba(255, 255, 255, 0.2);
  --color-muted: rgba(255, 255, 255, 0.05);

  /* Starwind component tokens */
  --card: var(--color-neutral-900);
  --card-foreground: var(--color-zinc-200);
  --popover: var(--color-neutral-900);
  --popover-foreground: var(--color-zinc-200);
  --primary: var(--color-primary-brand);
  --primary-foreground: var(--color-neutral-50);
  --primary-accent: var(--color-primary-brand-hover);
  --secondary: var(--color-zinc-800);
  --secondary-foreground: var(--color-zinc-200);
  --muted: rgba(255, 255, 255, 0.05);
  --muted-foreground: var(--color-zinc-400);
  --accent: var(--color-zinc-800);
  --accent-foreground: var(--color-neutral-50);
  --border: var(--color-zinc-800);
  --input: rgba(255, 255, 255, 0.1);
  --outline: var(--color-zinc-600);
  --radius: 0.625rem;
}
```

**Key principle:** This file is the "switchboard." To rebrand, only edit `tokens.css` and `overrides.css`. Everything else stays untouched.

#### `brand/typography.css` (Tailwind v4 `@utility` — Gemini recommendation)

```css
/* Tailwind v4 @utility — these act like real Tailwind utilities
   (responsive, conditional, etc.) — not just static classes */

@utility heading-xl {
  font-family: var(--font-header);
  font-weight: var(--font-weight-black);
  font-style: italic;
  text-transform: uppercase;
  line-height: 0.95;
  letter-spacing: -0.02em;
  color: var(--color-neutral-50);
  font-size: clamp(2.5rem, 7vw, 6rem);
}

@utility heading-lg {
  font-family: var(--font-header);
  font-weight: var(--font-weight-black);
  font-style: italic;
  text-transform: uppercase;
  line-height: 1;
  letter-spacing: -0.01em;
  color: var(--color-neutral-50);
  font-size: clamp(1.75rem, 4vw, 4.5rem);
}

@utility heading-md {
  font-family: var(--font-header);
  font-weight: var(--font-weight-black);
  font-style: italic;
  text-transform: uppercase;
  line-height: 1.1;
  color: var(--color-neutral-50);
  font-size: clamp(1.25rem, 3vw, 2.25rem);
}

@utility heading-sm {
  font-family: var(--font-header);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  color: var(--color-neutral-50);
  font-size: 0.75rem;
}

@utility caption {
  font-family: var(--font-header);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wider);
  font-size: 0.625rem;
  color: var(--color-zinc-400);
}

@utility body-lg {
  font-family: var(--font-body);
  font-size: 1.125rem;
  line-height: 1.75;
  color: var(--color-zinc-200);
}

@utility body {
  font-family: var(--font-body);
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--color-zinc-200);
}

@utility nav-link {
  font-family: var(--font-header);
  font-weight: var(--font-weight-bold);
  text-transform: uppercase;
  letter-spacing: var(--letter-spacing-wide);
  font-size: 0.6875rem;
  color: var(--color-zinc-400);
  text-decoration: none;
  transition: color 0.2s ease;
}

@utility nav-link:hover {
  color: var(--color-neutral-50);
}

@utility container-custom {
  max-width: 80rem;
  margin-left: auto;
  margin-right: auto;
  padding-left: 1.5rem;
  padding-right: 1.5rem;
}

@media (min-width: 768px) {
  .container-custom {
    padding-left: 2rem;
    padding-right: 2rem;
  }
}
```

**Why `@utility` over `@layer components`:** In Tailwind v4, `@utility` generates actual utility classes that work with responsive prefixes (`md:`, `hover:`, etc.), whereas `@layer components` produces static CSS classes. This is the Gemini recommendation.

#### `brand/components.css` (brand-specific component styles — 40-50 lines)

```css
@layer components {
  /* --- Card (BRESSEL override of Starwind Card) --- */
  .card {
    background-color: var(--color-neutral-900);
    color: var(--color-zinc-200);
    border-radius: calc(var(--radius) + 0.25rem);
    box-shadow: 0 0 0 1px var(--color-zinc-800);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: box-shadow 0.3s ease;
  }

  .card:hover {
    box-shadow: 0 0 0 1px var(--color-zinc-600);
  }

  .card-sm { border-radius: calc(var(--radius) - 0.125rem); }
  .card-header { padding: 1.5rem; display: grid; grid-template-rows: auto; gap: 0.25rem; }
  .card-sm .card-header { padding: 1rem; }
  .card-content { padding: 0 1.5rem 1.5rem; }
  .card-sm .card-content { padding: 0 1rem 1rem; }
  .card-title { font-family: var(--font-heading); font-size: 1.25rem; font-weight: 500; line-height: 1.375; color: var(--color-neutral-50); }
  .card-sm .card-title { font-size: 1rem; }
  .card-description { font-size: 1rem; line-height: 1.5; color: var(--color-zinc-400); }
  .card-sm .card-description { font-size: 0.875rem; }
  .card-footer { display: flex; align-items: center; padding: 1.5rem; background-color: rgba(255,255,255,0.02); border-top: 1px solid var(--color-zinc-800); }
  .card-sm .card-footer { padding: 1rem; }

  /* --- Accent helpers --- */
  .text-primary-brand { color: var(--color-primary-brand); }
}
```

#### `brand/effects.css` (visual effects — 15-20 lines)

```css
/* --- Noise Overlay --- */
.noise-overlay { position: relative; }

.noise-overlay::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("/assets/textures/noise--.png");
  background-repeat: repeat;
  opacity: 0.03;
  pointer-events: none;
  z-index: 1;
}

.noise-overlay > * { position: relative; z-index: 2; }

/* --- Scrollbar (dark theme) --- */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--color-neutral-950); }
::-webkit-scrollbar-thumb {
  background: var(--color-zinc-800);
  border-radius: 0;
}
::-webkit-scrollbar-thumb:hover { background: var(--color-zinc-600); }

/* --- Body / HTML globals --- */
html {
  background-color: var(--color-neutral-950);
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-header);
  font-weight: var(--font-weight-bold);
  line-height: 1.2;
}
```

### 2.4 Entry Point: `src/styles/index.css`

```css
/* ==================================================
   [BRAND] — Style Entry Point
   Cascade: globals → brand
   ================================================== */

@import "./globals/tailwind.css";
@import "./globals/starwind-ui.css";
@import "./brand/tokens.css";
@import "./brand/overrides.css";
@import "./brand/typography.css";
@import "./brand/components.css";
@import "./brand/effects.css";
```

### 2.5 Cascade Order (visual)

```
globals/tailwind.css        ← Tailwind utilities available
    ↓
globals/starwind-ui.css     ← Starwind :root, @theme, base layer
    ↓
brand/tokens.css            ← Brand colors/fonts as new Tailwind utilities
    ↓
brand/overrides.css         ← Map Starwind semantics → brand values
    ↓
brand/typography.css        ← @utility heading/body/nav classes
    ↓
brand/components.css        ← Brand-specific component styles
    ↓
brand/effects.css           ← Noise, scrollbars, HTML/body globals
```

### 2.6 Rebrand Workflow

To create a new brand from the template:

1. **Copy** `base-ui-starwind/` → `my-project/`
2. **Edit** `brand/tokens.css` — change colors, fonts
3. **Edit** `brand/overrides.css` — map semantics to new brand
4. **Edit** `brand/typography.css` — adjust heading styles
5. **Edit** `brand/effects.css` — swap noise texture, scrollbar, etc.
6. **Done** — All pages, components, and sections automatically re-theme

**Zero changes** to `globals/`, Starwind UI, or Astro templates.

---

## 3. WordPress Integration — Headless First

### 3.1 The Core Decision: Headless Over Hybrid

The Gemini review identified the **triple-maintenance trap**: building 46 Starwind components in Astro, then rewriting them in PHP, then mapping them to Elementor widgets = **3x code to maintain**. Every button variant change requires updates across 3 tech stacks.

**Recommendation: Double down on headless.**

```
WordPress (pure CMS, API layer)
    ↓ WPGraphQL
Astro (build-time fetch, static HTML)
    ↓ Starwind UI components
Rendered pages
```

### 3.2 What Happens to WordPress Plugins?

| Category | Works? | Examples |
|----------|--------|----------|
| **Backend & Security** | ✅ Yes | Wordfence, Limit Login Attempts, backup plugins |
| **SEO** | ✅ Yes (with WPGraphQL extensions) | Yoast, RankMath |
| **Data & Custom Fields** | ✅ Yes | ACF, CPT UI |
| **Frontend & UI** | ❌ No | Elementor, Slider Revolution, Contact Form 7 |

**Key insight:** WordPress becomes a **database + API**, not a renderer. Plugins that inject CSS/JS into the frontend die. Plugins that protect the backend or manage data live.

### 3.3 The "Painless" Headless Setup

**Stack:**
- **WPGraphQL** — Exposes WordPress as GraphQL API
- **ACF Pro** (or ACF Free) — Page builder via Flexible Content
- **WPGraphQL for ACF** — Bridges ACF fields to GraphQL

### 3.4 ACF Approach: Flexible Content as Page Builder

#### Option A: ACF Pro (Recommended for BRESSEL)

```
WordPress Admin → ACF → Field Groups → "Page Builder"
├── Flexible Content field: "Page Blocks"
│   ├── Layout: Hero Section
│   │   ├── Heading (text)
│   │   ├── Subheading (text)
│   │   ├── CTA Text (text)
│   │   └── CTA Link (url)
│   ├── Layout: Call to Action
│   │   ├── Title (text)
│   │   └── Button Text (text)
│   └── Layout: Card Grid
│       ├── Title (text)
│       └── Cards (repeater → title, description, link)
```

Client sees "Add Row" → picks block type → fills in fields. Clean, structured, no confusion.

#### Option B: ACF Free (Zero Cost)

Use **fixed layout** — pre-define the page structure. No flexible content, but 100% free.

```astro
---
// src/pages/index.astro
const data = await wpQuery(`{ page(id: "home", idType: URI) { homePageFields { heroHeading heroCta promoText } } }`);
---
<Hero heading={data.heroHeading} cta={data.heroCta} />
<Promo text={data.promoText} />
```

Best for pages with strict, specific design (Homepage, Contact).

#### Option C: Carbon Fields (Free ACF Pro Replacement)

PHP-based. Has "Complex Fields" that mimic ACF Flexible Content. Requires manual WPGraphQL registration in PHP.

#### Option D: Native Gutenberg Blocks (Zero Plugins)

Use WordPress's built-in block editor. Install **WPGraphQL Content Blocks** plugin to convert block HTML to JSON. Map `core/heading` → Astro `<Heading>`, `core/button` → Astro `<Button>`.

**Recommendation:** ACF Pro for BRESSEL (structured page building), ACF Free for simpler sites, Gutenberg for future-proofing.

### 3.5 Astro → WordPress Data Flow

#### 1. GraphQL Fetcher (`src/lib/wp.ts`)

```typescript
export async function wpQuery(query: string, variables = {}) {
  const res = await fetch("https://your-wp-site.com/graphql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  return (await res.json()).data;
}
```

#### 2. Dynamic Page Template (`src/pages/[slug].astro`)

```astro
---
import Layout from '../layouts/Layout.astro';
import { wpQuery } from '../lib/wp';
import BlockMapper from '../components/BlockMapper.astro';

export async function getStaticPaths() {
  const data = await wpQuery(`{ pages { nodes { slug } } }`);
  return data.pages.nodes.map((p) => ({
    params: { slug: p.slug === 'home' ? undefined : p.slug }
  }));
}

const { slug } = Astro.params;
const pageData = await wpQuery(`
  query GetPage($slug: ID!) {
    page(id: $slug, idType: URI) {
      title
      pageBuilder {
        pageBlocks {
          ... on PageBuilderPageBlocksHeroLayout {
            fieldGroupName heading subheading ctaText ctaLink
          }
          ... on PageBuilderPageBlocksCtaLayout {
            fieldGroupName title buttonText
          }
        }
      }
    }
  }
`, { slug: slug || "/" });

const blocks = pageData.page.pageBuilder?.pageBlocks || [];
---

<Layout title={pageData.page.title}>
  {blocks.map((block) => <BlockMapper block={block} />)}
</Layout>
```

#### 3. BlockMapper (`src/components/BlockMapper.astro`)

```astro
---
import Hero from './sections/Hero.astro';
import Cta from './sections/Cta.astro';

const { block } = Astro.props;
const map = {
  'PageBuilderPageBlocksHeroLayout': Hero,
  'PageBuilderPageBlocksCtaLayout': Cta,
};

const Component = map[block.fieldGroupName];
---

{Component ? <Component {...block} /> : <div class="p-4 border border-red-500">
  Missing component: {block.fieldGroupName}
</div>}
```

#### 4. UI Component (`src/components/sections/Hero.astro`)

```astro
---
import Button from '../starwind/button/Button.astro';

const { heading, subheading, ctaText, ctaLink } = Astro.props;
---

<section class="min-h-[60vh] flex items-center justify-center text-center px-6">
  <div class="max-w-3xl mx-auto">
    <h1 class="heading-xl mb-6">{heading}</h1>
    <p class="body-lg mb-8">{subheading}</p>
    <Button href={ctaLink} variant="primary-solid" size="lg">
      {ctaText}
    </Button>
  </div>
</section>
```

### 3.6 WordPress Integration Roadmap (Finalized)

```
Phase 1 (BRESSEL): Headless Astro + WPGraphQL
  - WordPress as content backend (pure CMS)
  - Astro fetches via GraphQL at build time
  - ACF Flexible Content as page builder
  - Starwind components render everything
  - Learn what works, what doesn't

Phase 2 (Template): Neutralize BRESSEL brand layer
  - Move BRESSEL tokens from brand/ → themes/bressel/
  - Create themes/neutral/ with default tokens
  - Template becomes brand-agnostic

Phase 3 (Multisite): Theme switcher
  - themes/bressel/ ← BRESSEL brand
  - themes/fitness/ ← Fitness studio brand
  - themes/restaurant/ ← Restaurant brand
  - One codebase, many brands
```

---

## 4. BRESSEL as Learning Vehicle → Multisite Template

### 4.1 The Vision

```
BRESSEL (current, learning vehicle)
    ↓ lessons learned, brand extracted
base-ui-starwind v2.0 (neutral template)
    ↓
    ├── themes/bressel/         ← BRESSEL brand layer (tokens + overrides)
    ├── themes/fitness/         ← Fitness studio brand layer
    ├── themes/restaurant/      ← Restaurant brand layer
    └── globals/                ← Shared engine (Tailwind + Starwind)
```

### 4.2 WordPress Theme Template Hierarchy Imitation

Astro pages mirror WordPress theme structure — a unified mental model for developers managing both Astro frontend and WP backend:

```
src/
├── layouts/
│   ├── Layout.astro           ← front-page.php (single layout)
│   └── components/
│       ├── Header.astro       ← header.php
│       └── Footer.astro       ← footer.php
│
├── pages/                     ← Mirrors WordPress template hierarchy
│   ├── index.astro            ← front-page.php
│   ├── 404.astro              ← 404.php
│   ├── _headers/              ← like WordPress's templates/
│   │   └── default.astro      ← page.php
│   ├── _parts/                ← like WordPress's template-parts/
│   │   ├── hero.astro         ← template part: hero
│   │   ├── cta.astro          ← template part: call-to-action
│   │   └── cards.astro        ← template part: card grid
│   └── _templates/            ← like WordPress's custom templates
│       ├── full-width.astro   ← full-width.php
│       ├── sidebar-left.astro ← sidebar-left.php
│       └── landing.astro      ← landing-page.php
│
├── components/
│   ├── starwind/              ← Starwind UI primitives (46 components)
│   ├── ui/                    ← Project-specific UI (Icon, etc.)
│   └── sections/              ← Page building blocks
│
├── styles/
│   ├── globals/               ← Tailwind + Starwind defaults
│   ├── brand/                 ← Brand overrides (or themes/)
│   └── index.css              ← Entry point
│
├── content/                   ← Like WordPress's post types
│   ├── coaches.json           ← Custom post type: coach
│   ├── events.json            ← Custom post type: event
│   └── merch.json             ← Custom post type: product
│
└── lib/
    └── utils/                 ← Shared utilities
        └── cn.ts              ← tailwind-merge helper
```

---

## 5. Header Refactor (per DEVELOPMENT_RULES.md)

### 5.1 Issue

`Header.astro` has the "BOOK SESSION" CTA as raw HTML with inline Tailwind classes:

```astro
<!-- ❌ Violates DEVELOPMENT_RULES.md -->
<a class="hidden md:inline-flex items-center gap-2 bg-bressel-red ...">
  BOOK SESSION
</a>
```

### 5.2 Fix

```astro
<!-- ✅ Complies with DEVELOPMENT_RULES.md -->
<Button href="/contact?intent=booking" variant="primary-solid" size="md" class="hidden md:inline-flex">
  BOOK SESSION
  <Icon name="arrow-right" class="opacity-90" />
</Button>
```

**Changes:**
1. Import `Button` from Starwind
2. Import `Icon` from `ui/` (see Section 7)
3. Use `variant="primary-solid"` (already defined in Starwind Button)
4. Remove all inline brand classes

---

## 6. JavaScript Usage Guideline

### 6.1 Astro JS Patterns (ranked by preference)

| Pattern | When to Use | Notes |
|---------|-------------|-------|
| `is:inline` | Critical-first-paint, must run immediately | Dark mode init — runs before paint |
| Plain `<script>` | One-off, page-level, no hydration needed | **Gemini correction:** Vanilla JS in `.astro` is automatically bundled and executed. No wrapper needed. |
| `Client:load` | Component-scoped JS that needs hydration | Only on **UI framework components** (React, Vue, Svelte), NOT on raw HTML or `.astro` files |
| `Client:visible` | Intersection-triggered, performance-critical | Scroll-triggered animations |
| `Client:only` | Heavy UI, component-scoped | Modal, Dialog, etc. |

### 6.2 Key Correction from Gemini Review

**`<Client:load>` does NOT work on raw HTML or `.astro` files.** It only works on React/Vue/Svelte components. For vanilla JS in Astro:

```astro
<!-- ✅ Correct: Plain script in .astro is auto-bundled -->
<script>
  // Astro bundles this automatically. No wrapper needed.
  const menu = document.getElementById('mobile-menu');
  // ...
</script>

<!-- ❌ Wrong: Client:load on raw HTML -->
<Client:load>
  <div id="menu">...</div>
</Client:load>
```

**For scoped vanilla JS, use Web Components:**

```astro
<mobile-menu class="block">
  <div id="menu-overlay" class="...">...</div>
</mobile-menu>

<script>
  class MobileMenu extends HTMLElement {
    constructor() {
      super();
      const toggle = document.getElementById('menu-toggle');
      toggle?.addEventListener('click', () => {
        this.querySelector('#menu-overlay').classList.remove('translate-x-full');
      });
    }
  }
  customElements.define('mobile-menu', MobileMenu);
</script>
```

### 6.3 BRESSEL-Specific Rules

```
┌─────────────────────────────────────────────────────────────────┐
│  BRESSEL JavaScript Guidelines                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Dark mode init → is:inline (must run before paint)         │
│  2. Mobile menu → plain <script> (vanilla JS, auto-bundled)   │
│  3. Ticker/carousel → Client:visible (scroll-triggered)        │
│  4. Newsletter form → plain <script> (simple, no hydration)    │
│  5. Icon system → no JS needed (pure SVG)                      │
│                                                                 │
│  RULE: No inline onclick="..." for anything beyond 3 lines      │
│  RULE: No jQuery. Astro-native or vanilla only.                │
│  RULE: All client-side JS in .astro <script> blocks.           │
│  RULE: No global namespace pollution. Wrap in IIFE or module.  │
│  RULE: Client:load only on React/Vue/Svelte components.        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.4 Mobile Menu Implementation

```astro
---
import Button from "../starwind/button/Button.astro";
import Icon from "../ui/Icon.astro";
---

<header class="fixed top-0 left-0 right-0 z-50 bg-bressel-black/90 backdrop-blur-md border-b border-bressel-zinc-800/60 px-6 md:px-8">
  <div class="max-w-[80rem] mx-auto flex items-center justify-between h-16 md:h-20">
    <a href="/" class="flex-shrink-0" aria-label="BRESSEL Home">
      <img src="/assets/logo-bressel-white.png" alt="BRESSEL™" class="h-6 md:h-8 w-auto" />
    </a>

    <nav class="hidden md:flex items-center gap-10">
      <a href="/academy" class="nav-link">ACADEMY</a>
      <a href="/community" class="nav-link">COMMUNITY</a>
      <a href="/shop" class="nav-link">PRO GEARS</a>
    </nav>

    <div class="flex items-center gap-4">
      <Button href="/contact?intent=booking" variant="primary-solid" size="md" class="hidden md:inline-flex">
        BOOK SESSION
        <Icon name="arrow-right" class="opacity-90" />
      </Button>

      <button id="menu-toggle" class="md:hidden text-bressel-white text-2xl p-1" aria-label="Open menu">
        <Icon name="list" />
      </button>
    </div>
  </div>
</header>

<div id="mobile-menu" class="fixed inset-0 z-[200] bg-bressel-black/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 translate-x-full transition-transform duration-300">
  <button class="absolute top-6 right-6 text-bressel-white text-3xl" aria-label="Close menu" data-menu-close>
    <Icon name="x-lg" />
  </button>

  <nav class="flex flex-col items-center gap-6">
    <a href="/academy" class="nav-link text-2xl tracking-wider">ACADEMY</a>
    <a href="/community" class="nav-link text-2xl tracking-wider">COMMUNITY</a>
    <a href="/shop" class="nav-link text-2xl tracking-wider">PRO GEARS</a>
    <a href="/contact?intent=booking" class="nav-link text-2xl tracking-wider text-bressel-red">BOOK SESSION</a>
  </nav>

  <div class="flex gap-6 mt-8">
    <a href="#" aria-label="Instagram" class="text-bressel-zinc-600 hover:text-bressel-red transition-colors">
      <Icon name="instagram" />
    </a>
    <a href="#" aria-label="YouTube" class="text-bressel-zinc-600 hover:text-bressel-red transition-colors">
      <Icon name="youtube" />
    </a>
    <a href="#" aria-label="WhatsApp" class="text-bressel-zinc-600 hover:text-bressel-red transition-colors">
      <Icon name="whatsapp" />
    </a>
  </div>
</div>

<script>
  const menu = document.getElementById('mobile-menu');
  const toggle = document.getElementById('menu-toggle');
  const closers = document.querySelectorAll('[data-menu-close]');

  toggle?.addEventListener('click', () => {
    menu?.classList.remove('translate-x-full');
  });

  closers.forEach(btn => {
    btn.addEventListener('click', () => {
      menu?.classList.add('translate-x-full');
    });
  });

  menu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      menu?.classList.add('translate-x-full');
    });
  });
</script>
```

---

## 7. SVG Icon System — astro-icon

### 7.1 Decision: `astro-icon` Package (Gemini Recommendation)

**Why `astro-icon` over manual registry:**
- Dynamically pulls from **Iconify** (which includes Bootstrap + Tabler + 150+ icon sets)
- **Zero manual registry** — no `index.ts` to maintain
- **Tree-shakes automatically** — only bundles icons you actually use
- **Dual icon sets** — Bootstrap (`bi:`) + Tabler (`tabler:`) + Lucide + 148 others
- **MIT licensed**
- Already the community standard for Astro

### 7.2 Usage

```bash
npm install -D astro-icon
```

```astro
---
import { Icon } from 'astro-icon/components';
---

<!-- Bootstrap Icons -->
<Icon name="bi:arrow-right" class="size-6 text-bressel-red" />
<Icon name="bi:instagram" class="size-5" />
<Icon name="bi:youtube" class="size-5" />
<Icon name="bi:whatsapp" class="size-5" />
<Icon name="bi:list" class="size-6" />
<Icon name="bi:x-lg" class="size-7" />

<!-- Tabler Icons (for sports-specific needs) -->
<Icon name="tabler:ball-tennis" class="size-6" />
<Icon name="tabler:trophy" class="size-6" />

<!-- Lucide, Material, FontAwesome, etc. -->
<Icon name="lucide:star" class="size-5 text-yellow-400" />
```

### 7.3 Icon Rules

```
┌─────────────────────────────────────────────────────────────────┐
│  SVG Icon Guidelines                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Default: <Icon name="bi:*" /> — Bootstrap Icons            │
│  2. Alternative: <Icon name="tabler:*" /> — Tabler Icons       │
│  3. All icons: use Tailwind size classes (size-4, text-red)    │
│  4. No inline SVGs in page templates — use <Icon /> always     │
│  5. Social icons: Bootstrap Icons available (instagram, youtube,│
│     whatsapp, facebook, etc.)                                   │
│  6. Accessibility: aria-label on parent <a>, aria-hidden on    │
│     the <Icon> component                                        │
│  7. No manual registry needed — astro-icon handles everything   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.4 Bootstrap vs Tabler (Decision Finalized)

| Criteria | Bootstrap (`bi:`) | Tabler (`tabler:`) |
|----------|-------------------|-------------------|
| **Role** | Default (80% of icons) | Specialty (sports-specific, shapes) |
| **Access** | `<Icon name="bi:arrow-right" />` | `<Icon name="tabler:ball-tennis" />` |
| **No registry needed** | ✅ | ✅ |

---

## 8. System Solidification — Final Decisions

### 8.1 CSS Architecture

```
globals/
├── tailwind.css          ← Tailwind v4 + plugins
├── starwind-ui.css       ← Starwind default (auto-sync)
└── reset.css             ← Minimal reset

brand/
├── tokens.css            ← Brand colors, fonts, radii
├── overrides.css         ← Semantic → brand token mapping
├── typography.css        ← @utility heading/body/nav classes
├── components.css        ← Brand component styles
└── effects.css           ← Noise, scrollbars, HTML/body

index.css                 ← Thin entry point
```

### 8.2 JS Usage Hierarchy (Corrected)

```
is:inline      → Dark mode init (before paint)
plain script   → Mobile menu, forms (vanilla JS, auto-bundled)
Client:visible → Ticker, Carousel (scroll-triggered)
Client:only    → Heavy UI components (React/Vue/Svelte)
Client:load    → ONLY on React/Vue/Svelte components (NOT raw HTML)
```

### 8.3 Icon System

```
astro-icon package (npm install -D astro-icon)
├── Bootstrap Icons: <Icon name="bi:arrow-right" />
├── Tabler Icons:    <Icon name="tabler:ball-tennis" />
└── 148+ other icon sets available
```

### 8.4 WordPress Integration — Headless Only

```
Phase 1 (BRESSEL): Headless Astro + WPGraphQL
  - WordPress = pure CMS (database + API)
  - WPGraphQL + ACF Pro = page builder
  - Astro fetches content at build time
  - Starwind components render everything
  - Backend plugins work (Wordfence, SEO, etc.)
  - Frontend plugins die (Elementor, sliders, etc.)

Phase 2 (Template): Neutralize BRESSEL brand
  - Move BRESSEL tokens → themes/bressel/
  - Create themes/neutral/ as default
  - Template becomes brand-agnostic

Phase 3 (Multisite): Theme switcher
  - themes/bressel/
  - themes/fitness/
  - themes/restaurant/
  - One codebase, many brands
```

### 8.5 WordPress Plugin Compatibility Matrix

| Plugin | Works? | Notes |
|--------|--------|-------|
| Wordfence | ✅ | Backend security |
| Yoast SEO | ✅ | With WPGraphQL extension |
| RankMath | ✅ | With WPGraphQL extension |
| ACF Pro | ✅ | Page builder |
| ACF Free | ✅ | Fixed layout only |
| Custom Post Type UI | ✅ | Custom post types |
| Elementor | ❌ | Frontend UI plugin |
| Contact Form 7 | ❌ | Frontend UI plugin |
| Slider Revolution | ❌ | Frontend UI plugin |

### 8.6 Header Refactor Checklist

- [ ] Import `Button` from Starwind
- [ ] Import `Icon` from astro-icon
- [ ] Replace raw CTA with `<Button variant="primary-solid">`
- [ ] Replace hamburger SVG with `<Icon name="bi:list" />`
- [ ] Close button with `<Icon name="bi:x-lg" />`
- [ ] Use plain `<script>` (not `Client:load`) for mobile menu JS

---

## 9. Layout CSS Import Fix

**Issue:** `Layout.astro` imports `global.css` twice:
1. `import "../styles/global.css";` (Astro import)
2. `<link rel="stylesheet" href="/styles/global.css" />` (HTML link tag)

**Fix:** Keep only the Astro import. Remove the `<link>` tag.

---

## 10. Open Questions — Resolved

| Question | Decision | Rationale |
|----------|----------|-----------|
| Bootstrap Icons or Tabler? | **astro-icon** — both | No manual registry, both available via `bi:` and `tabler:` prefixes |
| BRESSEL primary or template primary? | **Template primary** | Move BRESSEL-specific assets to `themes/bressel/`. Core stays neutral. |
| REST API or WPGraphQL? | **WPGraphQL** | Single request for nested relational data. Better for Astro/static sites. |
| Astro files or WP templates? | **Mirror WP hierarchy in Astro** | Unified mental model for developers managing both stacks. |
| Headless or Hybrid? | **Headless first** | Avoids triple-maintenance. PHP bridge for Phase 2 if needed. |
| ACF Pro or free alternative? | **ACF Pro for BRESSEL, ACF Free for simpler** | Flexible Content is worth the cost for structured page building. |

---

## 11. Action Items — Next Session

### Priority 1: CSS Separation
- [ ] Create `globals/` directory with `tailwind.css`, `starwind-ui.css`, `reset.css`
- [ ] Create `brand/` directory with `tokens.css`, `overrides.css`, `typography.css`, `components.css`, `effects.css`
- [ ] Create `index.css` entry point
- [ ] Add `sync:starwind` script to package.json
- [ ] Migrate all content from `global.css` → new structure
- [ ] Test: rebrand to neutral, verify all pages still render

### Priority 2: Header Refactor
- [ ] Install `astro-icon`
- [ ] Refactor Header.astro: Button + Icon usage
- [ ] Fix mobile menu JS (plain `<script>`, not `Client:load`)
- [ ] Fix Layout.astro duplicate CSS import

### Priority 3: WordPress Foundation
- [ ] Create `src/lib/wp.ts` GraphQL fetcher
- [ ] Create `src/components/BlockMapper.astro`
- [ ] Create `src/pages/[slug].astro` dynamic template
- [ ] Document WordPress setup in `docs/`

---

*Master review complete. All sources consolidated. System finalized.*
