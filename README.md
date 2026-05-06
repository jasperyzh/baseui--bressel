# base-ui-starwind

> **Astro.js + Starwind UI — Standard Project Template**

---

## What This Is

A starter project and reference architecture for any project that uses **Astro.js + Tailwind CSS v4 + Starwind UI** as the default stack.

It provides pre-configured Astro components and a unified styling pattern using modern Tailwind v4 `@theme` directives.

Not a CSS bridge. Not a component library. Just the tokens, the config, and the pattern.

---

## The Pattern

```
1. Copy the Starwind Astro components you need into src/components/starwind/
2. Define all brand colors AND Starwind overrides inside a single @theme block in global.css
3. Import and use the Astro components in your templates
4. Done.
```

No `@apply` for colors. No `@layer components` for variants. No bridge.

---

## Quick Start

```bash
# 1. Create project from template
npm create astro@latest my-project -- --template base-ui-starwind
cd my-project

# 2. Install and run
npm install
npm run dev
```

Or manually:

```bash
# 1. Create project
npm create astro@latest my-project
cd my-project

# 2. Install Tailwind v4
npm install -D @tailwindcss/vite

# 3. Add @tailwindcss/vite to astro.config.mjs
# 4. Add Starwind components to src/components/starwind/
# 5. Add Starwind @theme tokens to src/styles/global.css
# 6. Use Starwind components in templates
```

---

## global.css

**Rule: One `@theme` block. Do not use standard `:root` for brand overrides.**

Tailwind v4 generates utility classes directly from `@theme`. Variables placed in `:root` may not propagate to Tailwind's utility system.

```css
@import "tailwindcss";

@theme {
  /* 1. Base Brand Colors */
  --color-brand-primary: #cca560;
  --color-brand-dark: #131313;

  /* 2. Starwind Token Overrides (mapped to brand) */
  --color-primary: var(--color-brand-primary);
  --color-primary-foreground: var(--color-brand-dark);

  /* 3. Starwind Default Structural Tokens */
  --color-background: #ffffff;
  --color-foreground: #0a0a0a;
  --color-secondary: #e3edef;
  --color-secondary-foreground: #131313;
  --color-muted: #eaeaea;
  --color-muted-foreground: #818181;
  --color-border: #eaeaea;
  --color-radius: 0.5rem;
}
```

---

## Usage Example

Use the pre-built Astro components to ensure consistency. Do not write raw HTML with long utility strings.

```astro
---
import Badge from "../components/starwind/badge/Badge.astro";
import Button from "../components/starwind/button/Button.astro";
---

<!-- ✅ Correct: Starwind component with props -->
<Badge variant="default">New</Badge>

<Button href="/contact" variant="primary" size="lg">
  BOOK SESSION
</Button>
```

---

## Starwind Components

Use `starwind.config.json` to manage which components to include. Generate them into `src/components/starwind/`:

```bash
npx starwind add button card badge pagination
```

This keeps your component set minimal — only what you actually need.

---

## Project Structure

```
my-project/
├── astro.config.mjs          ← Astro config (Tailwind v4 plugin)
├── starwind.config.json      ← Starwind component configuration
├── package.json
│
├── src/
│   ├── components/
│   │   └── starwind/         ← Starwind UI primitives (Button, Card, Badge, etc.)
│   │       ├── button/
│   │       ├── card/
│   │       └── badge/
│   │
│   ├── layouts/
│   │   └── Layout.astro      ← Base layout (imports global.css)
│   │
│   ├── styles/
│   │   └── global.css        ← Tailwind + single @theme block with brand tokens
│   │
│   └── pages/
│       └── index.astro       ← Routes
│
├── public/                     ← Static assets
└── .gitignore
```

---

## Starwind Config Reference

```json
{
  "$schema": "https://starwind.dev/config-schema.json",
  "tailwind": {
    "css": "src/styles/global.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "componentDir": "src/components/starwind",
  "utilsDir": "src/lib/utils",
  "components": ["button", "card", "badge", "pagination"]
}
```

---

## Relationship to base-ui

| base-ui | base-ui-starwind |
|---------|-----------------|
| CSS bridge experiment | Astro component usage |
| `@layer components` + CSS vars | Tailwind v4 `@theme` + Astro components |
| Dual consumption (Astro + static) | Single source = Astro + Starwind |
| ⛔ Discontinued | ✅ Active standard |

See `base-ui/POSTMORTEM.md` for lessons learned.
