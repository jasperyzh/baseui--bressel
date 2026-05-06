# 260428-memory_engram.md

> **Project:** `base-ui-starwind`
> **Stack:** Astro 6 + Tailwind v4 + Starwind UI
> **Date:** 2026-04-28
> **Purpose:** Context engram for session resumption without re-scanning files.

---

## 🧱 Project Structure
```
base-ui-starwind/
├── docs/
│   └── 260428-memory_engram.md  ← You are here
├── reference/                   ← Starwind UI source (46 components)
├── src/
│   ├── components/
│   │   ├── Header.astro         ← Sticky nav, mobile overlay, BRESSEL logo
│   │   ├── Footer.astro
│   │   ├── sections/
│   │   │   ├── Hero.astro       ← Full-screen video bg, gradient overlay, dual CTAs
│   │   │   ├── AcademyCards.astro
│   │   │   ├── Ticker.astro
│   │   │   ├── ProgramPillars.astro
│   │   │   ├── QuoteCarousel.astro
│   │   │   ├── Centers.astro
│   │   │   ├── Shop.astro
│   │   │   └── NewsletterCTA.astro
│   │   └── starwind/            ← UI primitives (badges, breadcrumbs, buttons, etc.)
│   ├── styles/
│   │   └── global.css           ← BRESSEL tokens, Tailwind v4, typography utilities
│   └── assets/                  ← logo, hero-bg, noise texture
├── package.json
└── astro.config.mjs
```

## 🎨 Design System (BRESSEL)
**Colors:**
- `bressel-red`: `#ff331f` (hover `#e62a1a`)
- `bressel-black`: `#090808` (soft `#18181b`)
- `bressel-white`: `#fbfbff`
- `bressel-yellow`: `#eeff2c` (dark `#c1de00`)
- `bressel-zinc-*`: Standard zinc scale for borders/text

**Typography:**
- Headers: `Oswald` (italic, uppercase, tight tracking)
- Body: `Inter` (sans-serif)
- Utility classes: `.heading-xl/lg/md/sm`, `.body-lg`, `.body`, `.caption`
- Container: `.container-custom` (max-w: 80rem, responsive padding)

**Global CSS (`global.css`):**
- Uses `@theme` block for tokens (Tailwind v4 native)
- Imports `tailwindcss`, `starwind.css`, `button.css`, `card.css`
- Dark theme base (`bg-bressel-black`)
- Noise overlay (`.noise-overlay::before` with 3% opacity PNG)
- Scrollbar styling (dark zinc thumb)

## 🧩 Component Details
### `Hero.astro`
- Full-screen video bg (`opacity-35 brightness-60`)
- Gradient overlay: `from-black/50 via-black/30 to-black/80`
- Tagline: `EST. 2026 / PLAY BOLDER` (flanked by red lines)
- Headline: `.heading-xl` with red accent text
- CTAs:
  - Primary: `bg-bressel-red border-bressel-red` → `hover:bg-bressel-red-hover`
  - Secondary: `border-white/30` → `hover:border-white hover:bg-white/5`
- Scroll indicator: Bounce animation + "SCROLL TO BEGIN" caption

### `Header.astro`
- Sticky header: `bg-bressel-black/90 backdrop-blur-md`
- Logo: `logo-bressel-white.png` (h-6/h-8)
- Desktop nav: `ACADEMY`, `COMMUNITY`, `PRO GEARS` (`.nav-link` class)
- Right side: `BOOK SESSION` CTA (red button) + mobile hamburger
- Mobile menu: Full-screen overlay (`bg-bressel-black/95`), slide-in animation
- Social icons: Instagram, YouTube, WhatsApp (hover → `bressel-red`)

## 🧠 Inference / VRAM Context (From Session)
- **Hardware:** 2x RTX 5060 Ti 16GB (32GB total VRAM)
- **Model:** Qwen3.6 27B Uncensored Heretic (`Q5_K_S`, ~21.3 GB)
- **Context:** 65k tokens (safe limit for KV cache `q4_0`)
- **KV Cache:** `K=q4_0 V=q4_0` (optimized for VRAM headroom)
- **Trade-off discussed:** Q5_K_M (+0.5 GB) → ~80k context. Q6_K (+3.9 GB) → ~32k context.
- **Decision:** Stick with Q5_K_S for now, 65k context is sufficient.

## 🛠️ Starwind UI Pattern
1. Copy `:root` + `@theme` inline → `global.css`
2. Override `:root` values for brand colors
3. Use Starwind utility strings directly in `.astro` templates
4. **No** `@apply` for colors. **No** `@layer components` for variants. **No** bridge.

## 📝 Session Notes
- User prefers direct utility usage over CSS abstraction layers.
- "Brainstorm mode" active: creative, exploratory, uncensored model variant.
- KV cache quantization explained: `q4_0` = cheap memory, `q8_0`/`f16` = better quality but heavier VRAM.
- Model "feel" discussed: quantization affects word-choice confidence (logits bunching), KV cache affects short-term memory fidelity.

---
*End of engram. Load this file to resume session without re-scanning project files.*