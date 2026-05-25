# Bressel AGENTS.md

> AI Agent instructions for working with this project.

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
- `scripts/check-ai-hallucinations.js` — Run to detect dead code
- `scripts/verify-system.sh` — Run to verify design system compliance

## Verification

```bash
# Verify design system compliance
bash scripts/verify-system.sh .

# Check for AI hallucinations
node scripts/check-ai-hallucinations.js
```

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

## Guardrails

| Check | Status | Description |
|-------|--------|-----------|
| Starwind barrel files | ⚠️ 40 found | Dead re-exports to delete |
| tailwind.config.js | ✅ Not present | v4 compliant |
| @layer base | ✅ 17/17 | Complete semantic coverage |
| Theme system | ✅ Single-brand | No multi-theme switching needed |

## Next Steps

- [x] Expand @layer base (17 elements)
- [x] Add guardrail script
- [ ] Delete Starwind barrel files (40)
- [ ] Add missing Starwind components (6)
- [ ] Clean up dead imports
