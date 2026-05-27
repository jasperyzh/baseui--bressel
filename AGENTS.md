# Bressel AGENTS.md

> **Inherits:** `~/Desktop/AGENTS.md`

## Design System

This project uses the **baseui design system** with a **single-brand, dark-only** configuration.

**Core Philosophy:** `CSS handles styling. Tailwind handles layout. Components handle interaction.`

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

### 4. Guardrails
- Validators live in `baseui--/scripts/` (canonical location)
- Run via `npm run verify` (full suite) or individual checks

## Verification

```bash
# Full suite (architecture + system + brand)
npm run verify

# Individual checks
npm run check:ai       # Architectural guardrails
npm run verify:system  # System compliance
npm run verify:brand   # Brand compliance
```

> Validators are in `baseui--/scripts/`. This project calls them via npm scripts.

## Starwind Components

| Component | Status |
|-----------|--------|
| button | ✅ Installed |
| card | ✅ Installed |
| badge | ✅ Installed |
| progress | ✅ Installed |
| theme-toggle | ✅ Installed |
| carousel | ✅ Installed |
| dialog | ✅ Installed |
| hover-card | ✅ Installed |
| input | ✅ Installed |
| select | ✅ Installed |
| tabs | ✅ Installed |
| textarea | ✅ Installed |
| tooltip | ✅ Installed |

## Guardrails (via `npm run verify`)

| Check | Script | Status |
|-------|--------|--------|
| Architecture | `validator--baseui.mjs` | ✅ Active |
| System | `verify-system.sh` | ✅ 90/100 |
| Brand | `verify-brand-compliance.js` | ✅ Passed |

> Validators live in `baseui--/scripts/`. This project calls them via npm scripts.

