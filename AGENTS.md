# Bressel AGENTS.md

> **Inherits:** `~/Desktop/AGENTS.md`
> **Last Updated:** 260615

## Design System

This project uses the **baseui design system** with a **single-brand, dark-only** configuration.

**Core Philosophy:** `CSS handles styling. Tailwind handles layout. Components handle interaction.`

---

## Current State (260615)

| Metric | Value |
|--------|-------|
| KISE Score | 94% green (260614 audit) |
| Pages | 9 (index, academy, community, shop, about, contact, blog, dynamic [slug], 404) |
| Live URL | https://baseui--bressel.pages.dev |
| WP Backend | https://cms.bresselsports.com (DO droplet, headless CMS) |
| Deploy | Cloudflare Pages (Astro SSG) |

---

## Known Issues (P0-P1)

| Issue | Severity | Status |
|-------|----------|--------|
| **Mixed Content:** ~~2 shop product images blocked on HTTPS~~ | ✅ P0 | RESOLVED 260623 — WP now serves HTTPS images via cms.bresselsports.com; fix-image-url.ts is a passthrough |
| **50+ barrel `index.ts` files** in `starwind/*/` | 🟡 P1 | Both AGENTS.md say delete — still present |
| **Footer form is `alert('Subscribed!')`** | 🟡 P1 | Fluent Forms not integrated |
| **Docs missing DocMesh frontmatter** | 🟡 P1 | `docs/sessions/`, `docs/references/` lack frontmatter |

---

## Key Conventions

### 1. Starwind Components
- **LOCK** — `src/components/starwind/` is LOCK. Never modify Starwind source files.
- **Imports** — Use explicit sibling imports: `import { Button } from "@starwind/ui/button"`
- **No barrel files** — Delete `index.ts`/`index.js` from Starwind component dirs
- **No React** — No `className`, no `onClick`. Use Astro patterns.

### 2. Theme Pattern
- **Single-brand mode** — Inline `@theme` tokens (no `[data-theme]` switching)
- **Dark-only** — No dark mode override needed (always dark)
- **Brand tokens** — `--color-bressel-*` for red, yellow, black palette

### 3. CSS Architecture
- `@theme` block — Brand tokens + Starwind overrides
- `@layer base` — Semantic HTML elements (h1-h6, p, a, hr, code, table, etc.)
- `@layer components` — Brand utilities (headings, cards, ticker)
- Tailwind inline — Layout/grids ONLY

### 4. Image URL Fix (Temporary)
- `src/lib/fix-image-url.ts` rewrites HTTP WP IP URLs to Cloudflare Pages proxy
- **POST-LAUNCH:** Remove all calls and delete proxy stubs
- **Current gap:** Some paths bypass the regex — audit `Shop.astro` vs `shop.astro` rendering

## Verification

```bash
# Full suite (architecture + system + brand)
npm run verify

# Individual checks
npm run check:ai       # Architectural guardrails
npm run verify:system  # System compliance
npm run verify:brand   # Brand compliance
```

> Validators live in `baseui--/scripts/`. This project calls them via npm scripts.

## Pages

| Route | Template | Data Source | Notes |
|-------|-----------|-----------|-------|
| `/` | `index.astro` | WPGraphQL (merch only) | 10 sections, hero video background |
| `/academy` | `academy.astro` | WPGraphQL (coaches CPT) | Coaches grid + 3 program cards (static) |
| `/shop` | `shop.astro` | WPGraphQL (merch CPT) | Full product catalog |
| `/community` | `community.astro` | Static | Community page |
| `/about` | `about.astro` | Static | About page |
| `/contact` | `contact.astro` | Static | Contact page |
| `/blog` | `blog/index.astro` | WPGraphQL (posts) | Blog archive |
| `/blog/[slug]` | `blog/[slug].astro` | WPGraphQL (post by slug) | Single post + event CMB2 fields |
| `/[slug]` | `[slug].astro` | WPGraphQL (page by slug) | Dynamic WP pages (excludes reserved slugs) |
| `/404` | `404.astro` | Static | Error page |

## Starwind Components

| Component | Status |
|-----------|--------|
| button | ✅ Installed |
| card | ✅ Installed |
| badge | ✅ Installed |
| progress | ✅ Installed |
| theme-toggle | ✅ Installed (unused — dark-only) |
| carousel | ✅ Installed |
| dialog | ✅ Installed |
| hover-card | ✅ Installed |
| input | ✅ Installed |
| select | ✅ Installed |
| tabs | ✅ Installed |
| textarea | ✅ Installed |
| tooltip | ✅ Installed |

## Data Layer

| File | Purpose |
|------|---------|
| `src/lib/wordpress.ts` | GraphQL queries: coaches, merch, events, posts, pages |
| `src/lib/config.ts` | WhatsApp number, social links, brand email |
| `src/lib/fix-image-url.ts` | Passthrough (since 260623 domain go-live; images serve HTTPS directly) |

## Guardrails (via `npm run verify`)

| Check | Script | Status |
|-------|--------|--------|
| Architecture | `validator--baseui.mjs` | ✅ Active |
| System | `verify-system.sh` | ✅ 90/100 |
| Brand | `verify-brand-compliance.js` | ✅ Passed |

> Validators live in `baseui--/scripts/`. This project calls them via npm scripts.

---

**Inherits:** `~/Desktop/AGENTS.md`
**Last Updated:** 260615 — Gap analysis pass, known issues documented
