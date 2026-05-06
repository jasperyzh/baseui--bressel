# DEVELOPMENT_RULES.md — base-ui-starwind

> **Version:** 3.0
> **Date:** 260502
> **Purpose:** Style Starwind UI components via token overrides, not custom HTML/CSS from scratch.

---

## Core Principle

**Style Starwind's components, don't rewrite them.**

We use Starwind's pre-built Astro components (`src/components/starwind/`) and override their default styling through CSS custom properties in `global.css`. This keeps us DRY, consistent, and maintainable.

### Workflow
1. Pick a Starwind component (e.g., `Button.astro`, `Card.astro`)
2. Override its CSS variables in the single `@theme` block of `global.css`
3. Use the component in templates via `<Button variant="primary" size="lg">`
4. Never write raw HTML + inline classes for components that already exist in Starwind

---

## Tailwind v4 `@theme` Directive Rule

**All tokens — Starwind defaults AND brand overrides — live in a single `@theme` block.** Tailwind v4's engine generates utility classes directly from `@theme`. Variables placed in a standard `:root` block may not propagate to Tailwind's utility system.

### Do
```css
@theme {
  /* Brand source colors */
  --color-brand-accent: #cca560;
  --color-brand-dark: #131313;

  /* Starwind Token → Brand Mapping (redefine directly in same @theme) */
  --color-primary: var(--color-brand-accent);
  --color-background: #ffffff;
  --color-foreground: var(--color-brand-dark);
}
```

### Don't
```css
/* ❌ WRONG: Splitting between @theme and :root */
@theme { --color-primary: #blue; }
:root { --color-primary: #red; }  /* Tailwind may not see this */
```

**Result:** Starwind's `.btn-primary` renders in your brand color automatically. No extra CSS needed.

---

## Component-First vs Layout-First

**Two rules that often get confused:**

### Component-First (UI primitives)
If a Starwind component exists for it, use it. Never write raw HTML utilities that duplicate component functionality.

```astro
<!-- ✅ Correct: Starwind component handles styling -->
<Button variant="primary">Submit</Button>

<!-- ❌ Wrong: Raw HTML utilities duplicating Starwind Button -->
<a class="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium" href="/submit">
  Submit
</a>
```

### Layout-First (structure)
Tailwind utilities on wrapper elements for layout, spacing, and structure. This is correct and expected.

```astro
<!-- ✅ Correct: Layout utilities on wrapper divs -->
<div class="flex flex-col gap-4 max-w-4xl mx-auto">
  <Card><CardContent>Hello</CardContent></Card>
</div>

<section class="mb-16">
  <h2 class="text-2xl font-bold mb-4">Section Title</h2>
  <p class="text-muted-foreground">Description text.</p>
</section>

<!-- ✅ Correct: Layout on semantic elements for structure -->
<main class="max-w-4xl mx-auto px-4 py-8">
  <slot />
</main>
```

### Quick Check
| Pattern | Verdict | Why |
|---------|---------|-----|
| `<div class="flex gap-4">` | ✅ | Layout utility on wrapper |
| `<section class="mb-16">` | ✅ | Layout utility on wrapper |
| `<a class="bg-primary px-4 py-2">` | ❌ | Duplicates `<Button>` |
| `<div class="rounded-md border p-4">` | ❌ | Duplicates `<Card>` |

---

## File Structure

```
project/
├── starwind.config.json      ← Component configuration
├── src/
│   ├── components/
│   │   └── starwind/         ← Starwind UI primitives (Button, Card, Badge, etc.)
│   │       ├── button/
│   │       ├── card/
│   │       └── badge/
│   │
│   ├── layouts/
│   │   ├── Layout.astro      ← Base layout
│   │   └── Head.astro        ← SEO meta
│   │
│   └── styles/
│       └── global.css        ← Tailwind + single @theme block (MAIN ENTRY)
└── DEVELOPMENT_RULES.md       ← You are here
```

---

## Rules

| Do ✅ | Don't ❌ |
|-------|----------|
| Override CSS variables inside `@theme` | Split tokens between `@theme` and `:root` |
| Use `<Button variant="primary">` syntax | Copy-paste component markup and restyle from scratch |
| Add new brand tokens to `@theme` block | Hardcode hex values in Astro templates |
| Extend Starwind components via `<slot>` | Fork Starwind components into `src/components/` |
| Keep Starwind component files untouched | Edit Starwind component files directly |
| One `@theme` block with all tokens | Multiple `@theme` blocks or `:root` overrides |
| Tailwind utilities on wrapper `<div>` for layout | Tailwind utilities on semantic elements replacing Starwind components |

---

## When to Add New CSS

- **New utility class** (e.g., `.heading-xl`) → Add to `@layer components` in `global.css`
- **New brand color** → Add to `@theme` block, then map to Starwind token if needed
- **Component behavior change** → Adjust Starwind's CSS variables, not component markup
- **Page layout** → Use Tailwind utilities on wrapper `<div>` elements only

---

## Starwind Component Workflow

### Adding New Components

```bash
# Add components you need (keeps your set minimal)
npx starwind add accordion tabs dropdown

# Config is in starwind.config.json
# Components generate into src/components/starwind/
```

### Importing Components

```astro
---
import Button from "../starwind/button/Button.astro";
import Card from "../starwind/card/Card.astro";
import { Badge } from "../starwind/badge/Badge.astro";
---
```

---

**Last Updated:** 2026-05-02
