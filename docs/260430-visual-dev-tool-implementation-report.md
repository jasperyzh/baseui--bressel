# Visual Dev Tool — Implementation Report

> **Date:** 2026-04-30  
> **Status:** ✅ COMPLETE  
> **Build:** ✅ PASSING (8 pages, 1.31s)

---

## Executive Summary

The Visual Dev Tool was designed, specified, and built in a single session. It is a **single-file `.astro` component** that adds a floating dev panel for swapping images on a live site — no copy/paste/refresh cycles, no build hooks, no imports, no config files.

**Core architecture:** `data-swap` HTML attributes → vanilla JS panel → `localStorage` persistence → export JSON/code.

---

## What Was Built

### New Files (4)

| File | Lines | Purpose |
|------|-------|---------|
| `src/components/visual-dev/VisualDev.astro` | 1,353 | Core component — panel UI + logic + scoped CSS |
| `docs/260430-visual-dev-tool-spec.md` | — | v1 detailed spec |
| `docs/260430-visual-dev-tool-spec-v2.md` | — | v2 simplified spec (Gemini analysis applied) |
| `docs/260430-visual-dev-tool-final.md` | — | Finalized plan (decision log) |

### Modified Files (9)

| File | Change |
|------|--------|
| `src/layouts/Layout.astro` | Added VisualDev import + conditional render |
| `src/components/sections/Hero.astro` | 2 tags: `hero-bg`, `hero-video` |
| `src/components/sections/AcademyCards.astro` | 2 tags: `academy-card`, `community-card` |
| `src/components/sections/ProgramPillars.astro` | 3 tags: `professional`, `competition`, `coaches` |
| `src/components/sections/NewsletterCTA.astro` | 1 tag: `cta-bg` |
| `src/components/sections/Quotes.astro` | 1 tag: `quote-bg` (shared across 3 quotes) |
| `src/components/sections/Centers.astro` | 3 tags: `court-1`, `court-2`, `court-3` |
| `src/content/merch.json` | Added `swapId` to 4 products |
| `src/components/sections/Shop.astro` | 1 tag: `product-0` through `product-3` |

**Total `data-swap` targets: 16 unique slots across 8 components.**

---

## Built HTML Verification

All 16 slots are present in the compiled `dist/index.html`:

```
data-swap="hero-bg"
data-swap="hero-video"
data-swap="academy-card"
data-swap="community-card"
data-swap="professional"
data-swap="competition"
data-swap="coaches"
data-swap="quote-bg"
data-swap="court-1"
data-swap="court-2"
data-swap="court-3"
data-swap="cta-bg"
data-swap="product-0"
data-swap="product-1"
data-swap="product-2"
data-swap="product-3"
```

---

## Build Results

```
✓ 8 page(s) built in 1.31s
✓ Complete!
```

- **Zero errors**
- **Zero warnings** (only pre-existing noise texture warning)
- **No build time impact** — VisualDev is `import.meta.env.DEV` gated, so it doesn't ship to production

---

## Architecture Summary

```
┌─────────────────────────────────────────────────┐
│  Floating 🎨 Button (bottom-right)              │
│       │                                         │
│       ▼ Click / V key                           │
│  ┌──────────────────────────────────┐           │
│  │  PANEL (600px, 80vh)            │           │
│  │                                  │           │
│  │  [Page Filter] [View Mode] []   │           │
│  │                                  │           │
│  │  ┌─ GROUP: hero ───────────┐    │           │
│  │  │ 🖼 hero-bg    ✓ swapped │    │           │
│  │  │ 🖼 hero-video   ✓ swap  │    │           │
│  │  └─────────────────────────┘    │           │
│  │  ┌─ GROUP: academy ─────────┐  │           │
│  │  │ 🖼 academy-card   ✓ swap  │    │           │
│  │  │ 🖼 community-card ✓ swap  │    │           │
│  │  └─────────────────────────┘    │           │
│  │  ... (more groups)              │           │
│  │                                  │           │
│  │  [📷] [🔗] [↩] [📋] per slot   │           │
│  │                                  │           │
│  │  ┌─ EXPORT BAR ─────────────┐  │           │
│  │  │ [📤 JSON] [📋 Code] [📋 Diff] │         │
│  │  └──────────────────────────┘  │           │
│  └──────────────────────────────────┘           │
│       │                                         │
│       ▼ Drag-drop file on panel or page         │
│  Preview modal → Apply / Cancel                 │
└─────────────────────────────────────────────────┘
```

### Key Design Decisions

1. **`all: initial` on wrapper** — Panel CSS is fully isolated, won't leak styles to the site
2. **`is:inline` script** — No hydration, no Astro component lifecycle, just vanilla JS
3. **`localStorage` persistence** — No file I/O, no config files, survives page refresh
4. **`data-swap` attributes** — Zero dependencies on existing code structure
5. **Dev-only render** — `{import.meta.env.DEV && <VisualDev />}` — ships nothing to prod

### Swap Methods

| Method | How | Use Case |
|--------|-----|----------|
| Drag & drop | Drop from desktop → preview modal | Local files |
| URL paste | Paste http/https/data: URL | Remote images |
| Browse library | Click images from `library` prop | Pre-defined options |
| Keyboard cycle | ← → keys in preview | Library navigation |
| Inspect mode | Click any image on page | One-off swaps |

### Export Formats

| Format | Output |
|--------|--------|
| JSON | Downloadable `.json` file with metadata |
| Code | Copy-paste-ready `<img>` tags with `data-swap` |
| Diff | `slot-id: old.jpg → new.jpg` for quick review |

---

## Remaining Work (Optional / Future)

### Medium Priority

- [ ] **Header/Footer logo tags** — Header/Footer weren't tagged. These need `data-swap="logo"` if you want to swap them.
- [ ] **Page-aware grouping** — Page selector dropdown is scaffolded but doesn't filter (multi-page projects need page detection logic).
- [ ] **Base64 size limit handling** — localStorage has ~5MB limit. Large Base64 images will fill it. Could add auto-compression or IndexedDB fallback.

### Low Priority

- [ ] **Image compression** — Convert large drops to compressed thumbnails before Base64 storage
- [ ] **History/undo** — Track swap history per slot
- [ ] **Multiple project support** — Prefix localStorage key with project name
- [ ] **Component-level grouping** — Auto-detect component from file path (requires SSR context)

---

## Metrics

| Metric | Target | Actual |
|--------|--------|--------|
| New files | 1 | 4 (3 docs) |
| Lines of code | <2000 | 1,353 |
| Build impact | Zero | Zero (DEV-gated) |
| Dependencies | None | None |
| Setup steps | 2 | 2 |
| Build time | <2s | 1.31s |
| Slots tagged | ~20 planned | 16 tagged |

---

## What Worked Well

1. **v2 architecture was correct** — `data-swap` + vanilla JS was the right call. No build hooks, no imports, no complexity.
2. **Single file approach** — All panel UI + logic + CSS in one `.astro` file. Easy to copy to any project.
3. **Scoped CSS with `all: initial`** — Panel looks identical regardless of the site's CSS. No style conflicts.
4. **`is:inline` script** — No hydration, no Astro quirks. Pure vanilla JS.
5. **`library` prop** — Optional image picker for quick swapping between predefined options.

## What Could Be Improved

1. **Header/Footer not tagged** — Should add `data-swap="logo"` to both Header and Footer.
2. **Quotes group** — All 3 quotes share `data-swap="quote-bg"`. This works but means all 3 swap together. If you want per-quote swapping, they need separate IDs.
3. **Center court images** — Added `id` field to `images` array in Centers.astro. This is a small data change but worth noting.
4. **merch.json** — Added `swapId` fields. These are custom fields that don't affect the JSON schema.

---

## Files Changed Summary

```
New:
  src/components/visual-dev/VisualDev.astro    (1,353 lines)
  docs/260430-visual-dev-tool-spec.md
  docs/260430-visual-dev-tool-spec-v2.md
  docs/260430-visual-dev-tool-final.md
  docs/260430-visual-dev-tool-implementation-report.md

Modified:
  src/layouts/Layout.astro                     (+4 lines)
  src/components/sections/Hero.astro           (2 tags)
  src/components/sections/AcademyCards.astro   (2 tags)
  src/components/sections/ProgramPillars.astro (3 tags)
  src/components/sections/NewsletterCTA.astro  (1 tag)
  src/components/sections/Quotes.astro         (1 tag)
  src/components/sections/Centers.astro        (3 tags + id fields)
  src/components/sections/Shop.astro           (1 tag + merch.json)
  src/content/merch.json                       (4 swapId fields)
```

---

*Report generated: 2026-04-30*  
*Implementation: Complete. Build: Passing. Ready for use.*
