# 260429 — Site Review & System Solidification

> **Project:** base-ui-starwind  
> **Site:** BRESSEL™ Padel Academy  
> **Stack:** Astro 6 + Tailwind v4 + Starwind UI (46 components)  
> **Date:** 2026-04-29  
> **Status:** Brainstorm → System Design

---

## Executive Summary

`base-ui-starwind` is both a **working BRESSEL website** and a **reusable starter template** for the Astro + Tailwind v4 + Starwind UI stack. This review documents current state, identifies systemic issues, and proposes a solidified architecture for CSS, JS, SVG, WordPress/Elementor integration, and the path from BRESSEL (learning vehicle) → neutral multisite template.

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

- **Token-based theming** — Semantic tokens (`--color-primary`) → brand tokens (`--color-bressel-red`) → trivial theme swaps
- **Tailwind v4 `@theme`** — No config file, no `tailwind.config.js`. Direct CSS variables as the source of truth
- **Starwind UI as dependency** — Versioned, accessible components, not forked-and-forgotten
- **BRESSEL brand cohesion** — Dark + red + Oswald italics reads premium athletic consistently
- **DEVELOPMENT_RULES.md** — Good reference for "override tokens, don't rewrite markup"

### 1.3 What Needs Work

| # | Issue | Severity |
|---|-------|----------|
| 1 | **Dual identity** — Is this a BRESSEL site or a template? Both, but unclear which is primary | High |
| 2 | **global.css is 314 lines of mixed concerns** — tokens, overrides, typography, card styles, scrollbar, noise overlay | High |
| 3 | **Header CTA is raw HTML** — `BOOK SESSION` button in `Header.astro` uses inline Tailwind, not `<Button>` component | High |
| 4 | **No icon system** — SVGs copy-pasted across Header, Footer, sections. Only 1 reusable icon (`ArrowRight.astro`) | Medium |
| 5 | **No JS usage guideline** — Mobile menu uses inline `<script>`, dark mode uses `is:inline`, no standard | Medium |
| 6 | **Layout has duplicate CSS import** — `import "../styles/global.css"` AND `<link rel="stylesheet">` | Low |
| 7 | **No WordPress/Elementor path** — No plan for CMS integration | Strategic |

---

## 2. CSS File Separation Plan

### 2.1 Philosophy

> **global.css** = the engine (Tailwind + Starwind defaults)  
> **brand.css** = the paint (your brand's colors, fonts, component overrides)

Think of it like a car: global.css is the chassis and engine. brand.css is the paint job and interior trim. Swap the paint, keep the engine.

### 2.2 Proposed File Structure

```
src/styles/
├── globals/
│   ├── tailwind.css          ← Tailwind v4 + plugins import
│   ├── starwind-ui.css       ← Starwind base: :root, @theme, animations
│   └── reset.css             ← Minimal reset (if needed)
│
├── brand/
│   ├── tokens.css            ← Brand colors, fonts, radii, shadows
│   ├── overrides.css         ← Semantic token → brand token mapping
│   ├── components.css        ← Brand-specific component styles (.card, .heading-xl, etc.)
│   ├── effects.css           ← Noise overlay, scrollbars, custom animations
│   └── typography.css        ← Heading classes, body, caption, nav-link
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

#### `globals/starwind-ui.css` (auto-generated from Starwind default — 80-100 lines)

```css
/* Copy from Starwind's default output */
/* Contains: :root, .dark, @theme inline, @keyframes, @layer base */
/* Do NOT edit. This is the Starwind baseline. */

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

**Update strategy:** When `@starwind-ui/core` updates, regenerate this file from Starwind's defaults. It's the "reference" layer.

#### `brand/tokens.css` (brand-specific — 30-40 lines)

```css
/* ==================================================
   BRESSEL™ Brand Tokens
   Source of truth for all brand values
   ================================================== */

@theme {
  /* Primary */
  --color-bressel-red: #ff331f;
  --color-bressel-red-hover: #e62a1a;

  /* Neutrals */
  --color-bressel-black: #090808;
  --color-bressel-black-soft: #18181b;
  --color-bressel-white: #fbfbff;

  /* Accent */
  --color-bressel-yellow: #eeff2c;
  --color-bressel-darkyellow: #c1de00;

  /* Zinc scale for borders/text */
  --color-bressel-zinc-200: #e4e4e7;
  --color-bressel-zinc-400: #a1a1aa;
  --color-bressel-zinc-600: #52525b;
  --color-bressel-zinc-800: #27272a;

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

**Key principle:** Every brand color, font, spacing value lives here. Nothing is hardcoded in templates.

#### `brand/overrides.css` (token mapping — 20-30 lines)

```css
/* ==================================================
   Semantic Token → Brand Token Mapping
   This is where Starwind's defaults become YOUR brand
   ================================================== */

:root {
  --color-primary: var(--color-bressel-red);
  --color-primary-foreground: var(--color-bressel-white);
  --color-background: var(--color-bressel-black);
  --color-foreground: var(--color-bressel-zinc-200);
  --color-border: rgba(255, 255, 255, 0.2);
  --color-muted: rgba(255, 255, 255, 0.05);

  /* Starwind component tokens */
  --card: var(--color-bressel-black-soft);
  --card-foreground: var(--color-bressel-zinc-200);
  --popover: var(--color-bressel-black-soft);
  --popover-foreground: var(--color-bressel-zinc-200);
  --primary: var(--color-bressel-red);
  --primary-foreground: var(--color-bressel-white);
  --primary-accent: var(--color-bressel-red-hover);
  --secondary: var(--color-bressel-zinc-800);
  --secondary-foreground: var(--color-bressel-zinc-200);
  --muted: rgba(255, 255, 255, 0.05);
  --muted-foreground: var(--color-bressel-zinc-400);
  --accent: var(--color-bressel-zinc-800);
  --accent-foreground: var(--color-bressel-white);
  --border: var(--color-bressel-zinc-800);
  --input: rgba(255, 255, 255, 0.1);
  --outline: var(--color-bressel-zinc-600);
  --radius: 0.625rem;
}

/* Light theme override (if needed) */
.light {
  --card: var(--color-white);
  --card-foreground: var(--color-neutral-950);
  --primary: var(--color-bressel-red);
  /* ... */
}
```

**Key principle:** This file is the "switchboard." To rebrand, only edit this file. Global and component layers stay untouched.

#### `brand/typography.css` (heading/body classes — 40-50 lines)

```css
@layer components {
  /* --- Headings --- */
  .heading-xl {
    font-family: var(--font-header);
    font-weight: var(--font-weight-black);
    font-style: italic;
    text-transform: uppercase;
    line-height: 0.95;
    letter-spacing: -0.02em;
    color: var(--color-bressel-white);
    font-size: clamp(2.5rem, 7vw, 6rem);
  }

  .heading-lg { /* ... */ }
  .heading-md { /* ... */ }
  .heading-sm { /* ... */ }

  /* --- Body --- */
  .body-lg { /* ... */ }
  .body { /* ... */ }

  /* --- Caption --- */
  .caption { /* ... */ }

  /* --- Navigation --- */
  .nav-link { /* ... */ }

  /* --- Container --- */
  .container-custom { /* ... */ }
}
```

#### `brand/components.css` (brand-specific component styles — 40-50 lines)

```css
@layer components {
  /* --- Card (BRESSEL override of Starwind Card) --- */
  .card {
    background-color: var(--color-bressel-black-soft);
    color: var(--color-bressel-zinc-200);
    border-radius: calc(var(--radius) + 0.25rem);
    box-shadow: 0 0 0 1px var(--color-bressel-zinc-800);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    transition: box-shadow 0.3s ease;
  }

  .card:hover {
    box-shadow: 0 0 0 1px var(--color-bressel-zinc-600);
  }

  .card-sm { /* ... */ }
  .card-header { /* ... */ }
  .card-content { /* ... */ }
  .card-title { /* ... */ }
  .card-description { /* ... */ }
  .card-footer { /* ... */ }

  /* --- Accent helpers --- */
  .text-red { color: var(--color-bressel-red); }
}
```

#### `brand/effects.css` (visual effects — 15-20 lines)

```css
/* --- Noise Overlay --- */
.noise-overlay {
  position: relative;
}

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

.noise-overlay > * {
  position: relative;
  z-index: 2;
}

/* --- Scrollbar (dark theme) --- */
::-webkit-scrollbar { width: 8px; height: 8px; }
::-webkit-scrollbar-track { background: var(--color-bressel-black); }
::-webkit-scrollbar-thumb {
  background: var(--color-bressel-zinc-800);
  border-radius: 0;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--color-bressel-zinc-600);
}

/* --- Body / HTML globals --- */
html {
  background-color: var(--color-bressel-black);
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
   BRESSEL™ — Style Entry Point
   Cascade: globals → brand
   ================================================== */

/* 1. Tailwind v4 */
@import "./globals/tailwind.css";

/* 2. Starwind UI default baseline */
@import "./globals/starwind-ui.css";

/* 3. Brand tokens (source of truth) */
@import "./brand/tokens.css";

/* 4. Token overrides (semantic → brand mapping) */
@import "./brand/overrides.css";

/* 5. Typography utilities */
@import "./brand/typography.css";

/* 6. Component styles */
@import "./brand/components.css";

/* 7. Effects */
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
brand/typography.css        ← Custom heading/body classes
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

## 3. WordPress / Elementor Integration Strategy

### 3.1 The Challenge

Starwind UI components are **Astro-first** — they rely on:
- `.astro` file syntax (component composition, props, slots)
- Tailwind v4 CSS variables at build time
- Astro's `tv()` (tailwind-variants) for variant management

WordPress/Elementor don't natively understand `.astro` files or Tailwind v4.

### 3.2 Three Integration Paths

#### Path A: **Standalone Astro Frontend + WordPress REST (Headless)**

```
WordPress (CMS, content, Elementor editor)
    ↓ REST API / WPGraphQL
Astro (build-time fetch, static HTML)
    ↓ Starwind UI components
Rendered pages
```

**Pros:**
- Full WordPress content management
- Elementor for page editing
- Astro builds fast, ships static
- Starwind components stay intact

**Cons:**
- Build-time only (no real-time preview)
- Content changes require rebuild
- Not truly "live" editing

**Best for:** Marketing sites where content changes are infrequent (BRESSEL use case).

#### Path B: **PHP Component Bridge (Hybrid)**

Create PHP equivalents of Starwind components that output the same HTML + Tailwind classes.

```
WordPress Theme (Child Theme)
├── functions.php          ← Enqueue Tailwind CSS
├── starwind/
│   ├── button.php         ← Outputs <button class="bg-primary ...">
│   ├── card.php           ← Outputs <div class="card ...">
│   ├── badge.php          ← Outputs <span class="badge ...">
│   └── ... (core components)
├── templates/
│   ├── header.php
│   ├── footer.php
│   └── page-*.php
└── styles/
    └── starwind.css       ← Tailwind v4 build output
```

**PHP component pattern:**

```php
<?php
/**
 * Starwind Button Component
 * Usage: <?php starwind_button(['variant' => 'primary', 'size' => 'lg'], 'Book Session'); ?>
 */
function starwind_button( array $args = [], string $content = '' ): void {
    $defaults = [
        'variant' => 'default',
        'size'    => 'md',
        'href'    => '',
        'class'   => '',
        'disabled' => false,
    ];
    $args = wp_parse_args( $args, $defaults );

    $classes = join( ' ', [
        'inline-flex', 'items-center', 'justify-center', 'gap-1.5',
        'rounded-md', 'font-medium', 'whitespace-nowrap',
        'transition-all', 'outline-none',
        'focus-visible:ring-3',
        "variant-{$args['variant']}",
        "size-{$args['size']}",
        $args['class'],
    ] );

    $tag = $args['href'] ? 'a' : 'button';
    $disabled = $args['disabled'] ? ' disabled' : '';

    echo "<{$tag} class=\"{$classes}\"{$disabled}>{$content}</{$tag}>";
}
```

**Pros:**
- True WordPress integration
- Elementor can render PHP components via custom widgets
- Client can edit content in WP admin
- No build step for content changes

**Cons:**
- Must maintain PHP ↔ Astro component parity
- No `tv()` variant management in PHP (must hardcode class strings)
- CSS still needs Tailwind build (or compile for WP)

#### Path C: **Elementor Custom Widget Library**

Build Elementor widgets that output Starwind-compatible HTML + classes.

```
Elementor Widget: "Starwind Button"
├── Renders: <button class="bg-primary text-primary-foreground ...">
├── Controls: variant (select), size (select), href (URL), text (text)
└── CSS: inherits from enqueued Starwind/Tailwind stylesheet
```

**Pros:**
- Client sees "Starwind Button" in Elementor
- WYSIWYG editing with brand-consistent output
- No raw HTML in Elementor panels

**Cons:**
- One widget per component (46 widgets to maintain)
- Props mapping must stay in sync with Astro components
- Limited to what Elementor's control API supports

### 3.3 Recommended Approach: **Path A + Path B Hybrid**

```
Phase 1 (BRESSEL): Headless Astro site
  - WordPress as content backend
  - Astro fetches content via WP REST API
  - Starwind components render everything
  - Learn what works, what doesn't

Phase 2 (Template): PHP component bridge
  - Extract Starwind components to PHP equivalents
  - Create WordPress child theme with PHP components
  - Maintain Astro ↔ PHP parity

Phase 3 (Elementor): Custom widget library
  - Wrap PHP components in Elementor widgets
  - Client can edit in Elementor, get Starwind output
```

### 3.4 Difficulty Assessment

| Challenge | Severity | Mitigation |
|-----------|----------|------------|
| **No `tv()` in PHP** | High | Pre-compute variant class strings in PHP; no runtime variant resolution |
| **CSS delivery** | Medium | Ship compiled Tailwind CSS as theme asset; no build step needed for WP |
| **Component parity** | Medium | Use shared JSON config (`starwind.config.json`) for variant/size definitions |
| **Elementor widget maintenance** | Medium | Auto-generate widgets from component definitions; don't hand-code 46 widgets |
| **Build vs. live mismatch** | Low | Accept that Astro build output ≠ WP live output; document differences |

### 3.5 PHP Concerns

1. **No CSS `@theme` in PHP** — Tailwind v4 `@theme` is a build-time feature. In WordPress, ship the **compiled** CSS with all brand tokens baked in.
2. **No Astro `<slot>`** — PHP uses function parameters + output buffering or direct echo.
3. **No TypeScript types** — PHP uses docblocks for documentation.
4. **CSS variable delivery** — WordPress must enqueue the CSS file with `:root` overrides. Best done via `wp_enqueue_style` in `functions.php`.
5. **Tailwind build for WP** — Use `@tailwindcss/vite` for the build, output to `theme/styles/starwind.css`. WordPress theme just enqueues this file.

---

## 4. BRESSEL as Learning Vehicle → Multisite Template

### 4.1 The Vision

```
BRESSEL (current)
    ↓ lessons learned
base-ui-starwind v2.0 (neutral template)
    ↓
    ├── bressel-theme.css      ← BRESSEL brand layer
    ├── fitness-theme.css      ← Fitness studio brand layer
    ├── restaurant-theme.css   ← Restaurant brand layer
    └── ...
```

### 4.2 WordPress Theme Template Hierarchy Imitation

Astro pages should mirror WordPress theme structure:

```
src/
├── layouts/
│   ├── Layout.astro           ← Single layout (like WordPress's header/footer)
│   └── components/
│       ├── Header.astro
│       └── Footer.astro
│
├── pages/                     ← Mirrors WordPress template hierarchy
│   ├── index.astro            ← front-page.php
│   ├── 404.astro              ← 404.php
│   ├── _headers/              ← like WordPress's templates/ directory
│   │   └── default.astro      ← page.php (default page template)
│   ├── _parts/                ← like WordPress's template-parts/
│   │   ├── hero.astro         ← template part: hero
│   │   ├── cta.astro          ← template part: call-to-action
│   │   └── cards.astro        ← template part: card grid
│   └── _templates/            ← like WordPress's custom template files
│       ├── full-width.astro   ← full-width.php
│       ├── sidebar-left.astro ← sidebar-left.php
│       └── landing.astro      ← landing-page.php
│
├── components/
│   ├── starwind/              ← Starwind UI primitives (46 components)
│   ├── ui/                    ← Project-specific UI components
│   │   ├── Button.astro       ← Thin wrapper around Starwind Button
│   │   ├── Card.astro         ← Thin wrapper around Starwind Card
│   │   └── Section.astro      ← Semantic page section wrapper
│   └── sections/              ← Page building blocks
│       ├── Hero.astro
│       ├── AcademyCards.astro
│       └── ...
│
├── styles/
│   ├── globals/               ← Tailwind + Starwind defaults
│   ├── brand/                 ← Brand-specific overrides
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

This gives BRESSEL the learning ground while establishing a structure that maps to WordPress concepts.

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

**Changes needed:**
1. Import `Button` from `../starwind/button/Button.astro`
2. Import `Icon` from `../components/ui/Icon.astro` (new, see SVG section)
3. Use `variant="primary-solid"` (already defined in Starwind Button)
4. Remove all inline `bg-bressel-red`, `text-bressel-white`, etc.

---

## 6. JavaScript Usage Guideline

### 6.1 Astro JS Patterns (ranked by preference)

| Pattern | When to Use | Example |
|---------|-------------|---------|
| `Client:only` | Heavy UI, component-scoped JS | `Client:only("./Modal.astro")` |
| `Client:visible` | Intersection-triggered, performance-critical | `Client:visible("./Ticker.astro")` |
| `Client:load` | Needs to run on hydration | `Client:load("./Carousel.astro")` |
| `is:inline` | Critical-first-paint, must run immediately | Dark mode init script |
| Plain `<script>` | One-off, page-level, no hydration needed | Mobile menu toggle |

### 6.2 BRESSEL-Specific Rules

```
┌─────────────────────────────────────────────────────────────────┐
│  BRESSEL JavaScript Guidelines                                 │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Mobile menu → Client:load (needs DOM access on mount)      │
│  2. Dark mode init → is:inline (must run before paint)         │
│  3. Ticker/carousel → Client:visible (scroll-triggered)        │
│  4. Newsletter form → plain <script> (simple, no hydration)    │
│  5. Icon system → no JS needed (pure SVG)                      │
│                                                                 │
│  RULE: No inline onclick="..." for anything beyond 3 lines      │
│  RULE: No jQuery. Astro-native or vanilla only.                │
│  RULE: All client-side JS in .astro <script> blocks.           │
│  RULE: No global namespace pollution. Wrap in IIFE or module.  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 6.3 Mobile Menu Refactor

```astro
---
import Button from "./Button.astro";
---

<header class="fixed top-0 left-0 right-0 z-50 bg-bressel-black/90 backdrop-blur-md border-b border-bressel-zinc-800/60 px-6 md:px-8">
  <div class="max-w-[80rem] mx-auto flex items-center justify-between h-16 md:h-20">
    <!-- Logo -->
    <a href="/" class="flex-shrink-0" aria-label="BRESSEL Home">
      <img src="/assets/logo-bressel-white.png" alt="BRESSEL™" class="h-6 md:h-8 w-auto" />
    </a>

    <!-- Desktop Nav -->
    <nav class="hidden md:flex items-center gap-10">
      <a href="/academy" class="nav-link">ACADEMY</a>
      <a href="/community" class="nav-link">COMMUNITY</a>
      <a href="/shop" class="nav-link">PRO GEARS</a>
    </nav>

    <!-- Right: CTA + Hamburger -->
    <div class="flex items-center gap-4">
      <Button href="/contact?intent=booking" variant="primary-solid" size="md" class="hidden md:inline-flex">
        BOOK SESSION
        <Icon name="arrow-right" class="opacity-90" />
      </Button>

      <button
        id="menu-toggle"
        class="md:hidden text-bressel-white text-2xl p-1"
        aria-label="Open menu"
      >
        <Icon name="list" />
      </button>
    </div>
  </div>
</header>

<!-- Mobile Menu -->
<Client:load>
  <div
    id="mobile-menu"
    class="fixed inset-0 z-[200] bg-bressel-black/95 backdrop-blur-md flex flex-col items-center justify-center gap-8 translate-x-full transition-transform duration-300"
  >
    <button
      class="absolute top-6 right-6 text-bressel-white text-3xl"
      aria-label="Close menu"
      data-menu-close
    >
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
</Client:load>

<Client:load>
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

    // Close on link click
    menu?.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        menu?.classList.add('translate-x-full');
      });
    });
  </script>
</Client:load>
```

---

## 7. SVG Icon Guideline

### 7.1 Decision: Bootstrap Icons as Default

**Why Bootstrap Icons:**
- 2,000+ icons, consistent design language
- MIT licensed — no attribution required
- Well-maintained, SVG-optimized
- Named intuitively (`arrow-right`, `x-lg`, `list`, `instagram`, etc.)
- Directly usable as inline SVG (no font rendering)

### 7.2 Icon Component Pattern

```
src/components/ui/
├── Icon.astro          ← Universal icon wrapper
├── icons/
│   ├── ArrowRight.astro
│   ├── X.astro
│   ├── List.astro
│   └── ... (Bootstrap Icons subset)
```

#### `Icon.astro` — Universal Wrapper

```astro
---
/**
 * Icon — Universal SVG icon component
 * Uses Bootstrap Icons as the default icon pack.
 *
 * @param {string} name — Bootstrap Icons name (e.g., "arrow-right", "x-lg")
 * @param {string} [class] — Optional Tailwind classes
 * @param {number} [size=24] — Icon size in px
 */
import { icons } from './icons';

const { name, class: className = '', size = 24 } = Astro.props;
const IconSVG = icons[name];
const iconClass = `icon icon-${name} ${className}`.trim();
---

{IconSVG ? (
  <svg
    class={iconClass}
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="currentColor"
    viewBox="0 0 16 16"
    aria-hidden="true"
  >
    <use href={`#bi-${name}`} />
  </svg>
) : (
  <svg class={iconClass} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <title>Unknown icon: {name}</title>
  </svg>
)}
```

#### `icons/index.ts` — Icon Registry

```typescript
// src/components/ui/icons/index.ts
import ArrowRight from './ArrowRight.astro';
import ArrowUp from './ArrowUp.astro';
import X from './X.astro';
import List from './List.astro';
import Instagram from './Instagram.astro';
import Youtube from './Youtube.astro';
import WhatsApp from './WhatsApp.astro';
import Envelope from './Envelope.astro';

export const icons = {
  'arrow-right': ArrowRight,
  'arrow-up': ArrowUp,
  'x': X,
  'list': List,
  'instagram': Instagram,
  'youtube': Youtube,
  'whatsapp': WhatsApp,
  'envelope': Envelope,
};
```

### 7.3 SVG Rules

```
┌─────────────────────────────────────────────────────────────────┐
│  SVG Icon Guidelines                                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  1. Default icon pack: Bootstrap Icons (bi-*)                   │
│  2. Custom icons: src/components/ui/icons/Name.astro           │
│  3. All icons: fill="currentColor" for CSS color control        │
│  4. All icons: viewBox="0 0 16 16" (Bootstrap) or              │
│     viewBox="0 0 24 24" (custom)                               │
│  5. No inline SVGs in page templates — use <Icon /> always     │
│  6. Social icons: use Bootstrap Icons when available,          │
│     otherwise custom SVG in icons/ directory                   │
│  7. Icon sizing: use Tailwind size utilities (size-4, etc.)    │
│     or the size prop on <Icon>                                 │
│  8. Accessibility: aria-label on parent <a>, aria-hidden on   │
│     the <svg> itself                                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 7.4 Bootstrap Icons vs. Tabler Icons (dependency already installed)

`@tabler/icons` is already in `package.json`. Decision needed:

| Criteria | Bootstrap Icons | Tabler Icons |
|----------|----------------|--------------|
| Count | ~2,000 | ~5,000+ |
| Style | Classic, familiar | Modern, geometric |
| Naming | `arrow-right` | `arrow-right` |
| License | MIT | MIT |
| Astro integration | Lightweight (icon-only) | Heavier (full icon lib) |

**Recommendation:** Use **Bootstrap Icons** for the 80% common cases (social, arrows, UI). Use **Tabler Icons** for specific needs (padel/sports-specific, custom shapes). Create a hybrid icon registry.

---

## 8. System Solidification — Summary of Decisions

### 8.1 CSS Architecture

```
globals/
├── tailwind.css          ← Tailwind v4 + plugins
├── starwind-ui.css       ← Starwind default baseline
└── reset.css             ← Minimal reset

brand/
├── tokens.css            ← Brand colors, fonts, radii
├── overrides.css         ← Semantic → brand token mapping
├── typography.css        ← Heading/body/nav classes
├── components.css        ← Brand component styles (.card, etc.)
└── effects.css           ← Noise, scrollbars, HTML/body

index.css                 ← Thin entry point
```

### 8.2 JS Usage Hierarchy

```
is:inline      → Dark mode init (before paint)
Client:load    → Mobile menu (DOM access)
Client:visible → Ticker, Carousel (scroll-triggered)
Client:only    → Heavy components (Modal, Dialog)
plain script   → Simple one-offs (newsletter form)
```

### 8.3 Icon System

```
src/components/ui/
├── Icon.astro          ← Universal wrapper (<Icon name="arrow-right" />)
└── icons/
    ├── index.ts        ← Icon registry
    ├── ArrowRight.astro
    ├── X.astro
    └── ... (Bootstrap Icons + Tabler Icons subset)
```

### 8.4 WordPress Integration Roadmap

```
Phase 1: BRESSEL (headless Astro)
  - WordPress as content backend
  - Astro fetches via REST API
  - Learn what works

Phase 2: PHP Component Bridge
  - Starwind → PHP equivalents
  - WordPress child theme
  - Astro ↔ PHP parity

Phase 3: Elementor Widgets
  - Wrap PHP components as Elementor widgets
  - Client WYSIWYG editing
  - Starwind output guaranteed
```

### 8.5 Header Refactor Checklist

- [ ] Import `Button` from Starwind
- [ ] Import `Icon` from ui/icons
- [ ] Replace raw CTA with `<Button variant="primary-solid">`
- [ ] Replace hamburger SVG with `<Icon name="list" />`
- [ ] Close button SVG with `<Icon name="x-lg" />`
- [ ] Move mobile menu JS to `<Client:load>`

---

## 9. Open Questions

| Question | Options | Recommendation |
|----------|---------|----------------|
| Bootstrap Icons or Tabler Icons? | Bootstrap (lighter) / Tabler (more icons) | Hybrid: Bootstrap default, Tabler for specific needs |
| BRESSEL primary or template primary? | Keep dual / commit to one | Dual for now, but document clearly |
| WordPress: REST API or WPGraphQL? | REST (simple) / GraphQL (flexible) | REST for BRESSEL; GraphQL for complex multisite |
| Nav structure: Astro files or WordPress templates? | Astro pages (static) / WP theme files (dynamic) | Astro pages for BRESSEL; mirror WP hierarchy for template |

---

*End of review. Next session: implement CSS file separation + header refactor.*
