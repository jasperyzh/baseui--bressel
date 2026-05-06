# PLAN — baseui--bressel Design System Adoption

> **Goal:** Transform `baseui--bressel` into a production-ready standalone BRESSEL™ website using the patterns proven in `baseui--astro`. CSS-clean, Starwind-native, WP-GraphQL-ready, with frontmatter placeholder copy for client handoff.
>
> **Last Updated:** 260505
> **Status:** Complete ✅

---

## Execution Result

`npm run build` — **8 pages, zero errors, zero warnings.**

| Page | Route | Status |
|------|-------|--------|
| Home | `/` | ✅ Composer page, all sections |
| Starwind Demo | `/homepage` | ✅ Clean Starwind demo |
| About | `/about` | ✅ Starwind + frontmatter + theme vars |
| Academy | `/academy` | ✅ Coaches grid, programs, `<Button>` CTAs |
| Community | `/community` | ✅ Events list, `<Button>` CTAs |
| Contact | `/contact` | ✅ Full form: `<Input>` + `<Textarea>` + `<Label>` + `<Button>` |
| Shop | `/shop` | ✅ Product grid with `<Card>` + `<Button>` |
| 404 | `/404` | ✅ Simple 404 with `<Button>` |

---

## Context

`baseui--bressel` is the BRESSEL™ client website. It already has:
- Full Starwind component set (button, card, input, select, etc.)
- Section components that use Starwind (Hero, AcademyCards, Shop, etc.)
- Content JSON files (coaches, events, merch)
- Custom global.css with brand tokens
- Header + Footer with navigation
- VisualDev image swap tool
- Oswald + Inter fonts

What it needs from `baseui--astro`:
- Clean CSS architecture (single `@theme` block, no `:root` split)
- Full Starwind adoption on all pages (replace raw HTML buttons/forms)
- Frontmatter-based placeholder content for WP-GraphQL readiness
- Correct asset paths

---

## Key 💡 Improvements

| Improvement | Why |
|-------------|-----|
| **Single `@theme` block** | Tailwind v4 generates utilities from `@theme`. Variables in `:root` are invisible to Tailwind. |
| **Remove `.card` utility classes** | Starwind's `<Card>` components handle styling via CSS vars. Duplicate `.card` classes create confusion. |
| **`<Button>` everywhere** | No more raw `<a class="inline-flex bg-bressel-red...">` — Starwind handles all styling. |
| **`<Input>`/`<Textarea>`/`<Label>` in forms** | Raw HTML form elements miss Starwind's theming, focus states, and accessibility. |
| **Frontmatter content objects** | WP-GraphQL swap becomes one line: `const hero = data.data.page.acfHero`. |
| **Remove hand-rolled dark mode** | BRESSEL is always dark. No `.dark` class toggling needed. |
| **Symlinks are temporary** | Assets will serve from WordPress CMS. Symlinks are only for local dev. |

---

## Execution Phases

### Phase 1 — CSS Consolidation

| Task | File | What |
|------|------|------|
| Move `:root` vars into `@theme` | `src/styles/global.css` | All Starwind tokens (`--color-card`, `--color-popover`, etc.) move inside `@theme`. Tailwind generates `bg-card`, `text-card-foreground` etc. |
| Remove duplicate `<link>` | `src/layouts/Layout.astro` | `import "../styles/global.css"` is sufficient; the `<link>` in `<head>` is redundant at build time |
| Add `@tailwindcss/forms` | `astro.config.mjs` | Starwind form components need the forms plugin for proper styling |
| Fix `@` alias | `astro.config.mjs` | Add Vite `resolve.alias` so `@/` resolves to `src/` |

### Phase 2 — Upgrade Layout + Config

| Task | File | What |
|------|------|------|
| Add Vite alias | `astro.config.mjs` | `@ → src/` |
| Remove dark mode script | `src/layouts/Layout.astro` | Replace with simple inline theme setter for `data-theme="bressel"` |
| Remove duplicate CSS link | `src/layouts/Layout.astro` | Keep only Astro's built-in `import "../styles/global.css"` |

### Phase 3 — Convert Header + Footer

| Task | File | What |
|------|------|------|
| CTA button → `<Button>` | `src/components/Header.astro` | Replace raw `<a>` with Starwind `<Button variant="primary">` |
| Newsletter form → Starwind | `src/components/Footer.astro` | Replace `<input>` → `<Input>`, raw `<button>` → `<Button>` |

### Phase 4 — Convert Pages

| Page | Raw HTML to Replace | → Starwind Component |
|------|--------------------|---------------------|
| `index.astro` | None (composer only) | — |
| `homepage.astro` | None (already clean) | — |
| `about.astro` | Hero gradient classes | Inline → `style` refs |
| `academy.astro` | 4x CTA `<a>` buttons, stat strip | → `<Button>`, inline styles |
| `community.astro` | 2x CTA `<a>` buttons | → `<Button>` |
| `contact.astro` | ★ Full form: 4x `<input>`, `<textarea>`, `<select>`, `<label>`, CTA | → `<Input>`, `<Textarea>`, `<Label>`, `<Button>` |
| `shop.astro` | 4x "INQUIRE" `<a>` links per product | → `<Button variant="link">` |
| `404.astro` | 1x CTA `<a>` button | → `<Button>` |

### Phase 5 — Fix Content JSON Paths

| File | Old Path | New Path |
|------|----------|----------|
| `src/content/coaches.json` | `/assets/team/teams_photos--*.webp` | `/assets/teamphotos/teams_photos--*.webp` |
| `src/content/merch.json` | `/assets/20260402_*.webp` | `/assets/brandvisual--/20260402_*.webp` |

### Phase 6 — Assets Setup (Temporary Symlinks)

| Source | → Target |
|--------|---------|
| `~/bressel--images/edited/brandvisual--/` | `public/assets/brandvisual--/` |
| `~/bressel--images/edited/coach/` | `public/assets/coach/` |
| `~/bressel--images/edited/teamphotos/` | `public/assets/teamphotos/` |
| `~/bressel--images/edited/shop/` | `public/assets/shop/` |
| `~/bressel--images/edited/juniorpadelcircuit/` | `public/assets/juniorpadelcircuit/` |
| `~/bressel--images/edited/brandvisual--/noise--.png` | `public/assets/textures/noise--.png` |
| `~/twentytwentyfour-bressel/assets/background-video.mp4` | `public/assets/background-video.mp4` |

*Replace symlinks with WordPress media library URLs when CMS is connected.*

### Phase 7 — Frontmatter Content Objects

Each page gets a frontmatter block with placeholder copy + GraphQL ready comment:

```astro
---
// ── Default Content (WP-GraphQL ready) ──
// Replace: const page = data.data.page  →  swap `hero`, `stats`, etc. from WP response
const hero = {
  title: 'THE BRESSEL',
  highlight: 'STANDARD.',
  tagline: 'EST. 2026 / PLAY BOLDER',
  description: 'Where kinetic precision meets competitive excellence.',
};
---
```

### Phase 8 — Build Verification

| Check | Command |
|-------|---------|
| Build | `npm run build` |
| Dev server | `npm run dev` |
| All 8 pages | Browse `/`, `/about`, `/academy`, `/community`, `/contact`, `/shop`, `/404`, `/homepage` |
| Form renders | Starwind `<Input>` + `<Textarea>` + `<Label>` render correctly |
| Images load | No broken image icons |
| Theme consistency | Dark background, red accents throughout |

---

## Files Summary

### Modified (13)

| File | Phase |
|------|-------|
| `src/styles/global.css` | P1 — Consolidate `@theme` |
| `src/layouts/Layout.astro` | P2 — Clean layout |
| `astro.config.mjs` | P2 — Vite alias |
| `src/components/Header.astro` | P3 — `<Button>` CTA |
| `src/components/Footer.astro` | P3 — `<Input>` + `<Button>` |
| `src/pages/index.astro` | P7 — Frontmatter |
| `src/pages/about.astro` | P4 + P7 |
| `src/pages/academy.astro` | P4 + P7 |
| `src/pages/community.astro` | P4 + P7 |
| `src/pages/contact.astro` | P4 + P7 — full form rebuild |
| `src/pages/shop.astro` | P4 + P7 |
| `src/pages/404.astro` | P4 + P7 |
| `src/content/coaches.json` | P5 — Asset paths |
| `src/content/merch.json` | P5 — Asset paths |

### New (7 symlinks only)
- `public/assets/brandvisual--/`
- `public/assets/coach/`
- `public/assets/teamphotos/`
- `public/assets/shop/`
- `public/assets/juniorpadelcircuit/`
- `public/assets/textures/noise--.png`
- `public/assets/background-video.mp4`
