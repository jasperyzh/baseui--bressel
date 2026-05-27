# baseui--bressel — BRESSEL™ Astro Frontend

> **Stack:** Astro 6 + Tailwind v4 + Starwind UI
> **Architecture:** Headless — Astro static site + WordPress CMS (WPGraphQL)
> **Parent:** [bressel--](../README.md)

---

## Quick Start

```bash
npm install
npm run dev        # Astro dev server (localhost:4321)
npm run build      # Production build
npm run verify     # Full validator suite (architecture + system + brand)
```

## Architecture

- `src/pages/` — 8 static pages + dynamic `[slug].astro` for WP pages + blog routes
- `src/components/starwind/` — Starwind UI primitives (LOCK, never modify)
- `src/components/sections/` — BRESSEL-specific sections (Hero, Pricing, etc.)
- `src/lib/wordpress.ts` — WPGraphQL data layer (typed, single source of truth)
- `src/styles/global.css` — Brand tokens (`@theme`), semantic HTML (`@layer base`), brand utilities (`@layer components`)

## Pages

| Route | Component | Data Source |
|-------|-----------|------------|
| `/` | `index.astro` | Static (composer) |
| `/about` | `about.astro` | Static |
| `/academy` | `academy.astro` | WPGraphQL (`getCoaches()`) |
| `/community` | `community.astro` | WPGraphQL (`getEvents()`) |
| `/contact` | `contact.astro` | Static |
| `/shop` | `shop.astro` | WPGraphQL (`getMerch()`) |
| `/blog` | `blog/index.astro` | WPGraphQL (`getAllPosts()`) |
| `/blog/[slug]` | `blog/[slug].astro` | WPGraphQL (`getPostBySlug()`) |
| `/*` | `[slug].astro` | WPGraphQL (`getPageBySlug()`) |

## Guardrails

```bash
npm run verify     # Full suite (check:ai + verify:system + verify:brand)
npm run check:ai   # Architectural guardrails (no React, no component replacement)
npm run verify:system  # System compliance (@theme, @layer base, Starwind)
npm run verify:brand   # Brand compliance (fonts, colors, gradients)
```
