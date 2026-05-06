# VisualDev.astro — Final Implementation Plan

> **Status:** Ready for rebuild  
> **Date:** 260430  
> **Scope:** Rewrite `src/components/visual-dev/VisualDev.astro` with all fixes merged from Kimi + Gemini reviews  
> **Constraint:** Single file, zero imports, zero config, dev-only

---

## 1. Architecture Principles

| Principle | How |
|-----------|-----|
| **Single file** | All HTML, JS, CSS in one `.astro` file — no imports |
| **Zero dependencies** | No Starwind, no Tailwind utilities, no Astro runtime |
| **Theme isolation** | Fixed dark palette, independent of site's CSS |
| **Client-side only** | All logic in `<script is:inline>`, no server execution |
| **Dev-only** | Wrapped in `{import.meta.env.DEV}` at Layout level |

**Key decision (both reviews agree):** Use scoped custom CSS, NOT Tailwind/Starwind. A dev tool must look consistent regardless of the site's theme. `bg-primary` inheriting from a light-themed site would break the panel.

---

## 2. HTML Structure Requirements

```astro
{isDev && (
  <div id="visual-dev-wrapper">
    <!-- 1. Floating toggle button -->
    <button id="vd-toggle" class="vd-toggle" ...>🎨</button>

    <!-- 2. Main panel -->
    <div id="vd-panel" class="vd-panel">
      <div class="vd-header">...search, controls...</div>
      <div id="vd-slots" class="vd-slots">...</div>
      <div class="vd-footer">...export buttons...</div>
    </div>

    <!-- 3. Preview modal overlay -->
    <div id="vd-preview" class="vd-overlay">
      <div class="vd-card">...</div>
    </div>

    <!-- 4. Library browser overlay -->
    <div id="vd-library" class="vd-overlay">
      <div class="vd-card">...</div>
    </div>
  </div>
)}
```

**Critical:** The `<div id="visual-dev-wrapper">` is NEW. The previous LLM's CSS targeted this ID but the element never existed. This wrapper is the isolation boundary.

---

## 3. Script Requirements

### 3.1 Tag Configuration

```astro
<script is:inline define:vars={{ defaultLibrary: library, defaultView: defaultView }}>
  (() => {
    // ... all logic here
  })();
</script>
```

| Requirement | Why |
|-------------|-----|
| `is:inline` | Prevents Astro from bundling/hashing the script. It must be raw inline JS. |
| `define:vars={{ ... }}` | Passes Astro props (`library`, `defaultView`) into the client-side script as global variables. Without this, `library` is `undefined` in the IIFE. |
| Arrow-function IIFE `(()=>{})()` | Prevents variable re-declaration on Vite HMR reload. |
| No `type="module"` | Not needed; IIFE scope is sufficient. |

**Props to pass via `define:vars`:**
- `defaultLibrary` → `library` prop (default `[]`)
- `defaultView` → `defaultView` prop (default `'component'`)

**Inside the IIFE, reference them as:**
```js
state.library = JSON.parse(JSON.stringify(defaultLibrary || []));
state.viewMode = defaultView || 'component';
```

### 3.2 State Object

```js
const state = {
  isOpen: false,
  isGhost: false,
  isInspect: false,
  selectedSlot: null,
  previewingSlot: null,
  previewIndex: 0,
  library: JSON.parse(JSON.stringify(defaultLibrary || [])),
  viewMode: defaultView || 'component',
  pageFilter: 'all',
  searchQuery: '',
  autoImgCounter: 0,
};
```

### 3.3 Core Functions (must exist)

| Function | Purpose |
|----------|---------|
| `loadSwaps()` | `localStorage.getItem('visual-dev-swaps')` → parse |
| `saveSwaps(swaps)` | stringify → `localStorage.setItem` (warn on quota exceeded) |
| `scanSlots()` | `querySelectorAll('[data-swap]')` → build slot metadata |
| `detectSlotType(el)` | `img` / `video` / `source` / `bg` |
| `getCurrentPath(el, type)` | Extract current src/poster/background-image URL |
| `fileToBase64(file)` | `FileReader.readAsDataURL()` → returns data URL string |
| `applySwap(slotId, newPath)` | Mutate DOM + save to localStorage |
| `resetSlot(slotId)` | Remove from localStorage + restore original |
| `renderSlots()` | Build innerHTML of `#vd-slots` based on state |
| `renderSlot(slot)` | HTML string for one slot card |
| `togglePanel()` / `openPanel()` / `closePanel()` | Show/hide `#vd-panel` |
| `toggleGhost()` | `.vd-ghost` class + opacity 0.5 + pointer-events none |
| `toggleInspect()` | `body.vd-inspect-mode` class + crosshair cursor |
| `showPreview(slotId, newPath)` | Before/after modal |
| `hidePreview()` | Close preview |
| `openLibrary(slotId)` / `closeLibrary()` | Browse `library` prop images |
| `renderLibrary()` | Build `vd-library-grid` innerHTML |
| `exportJSON()` | Download `.json` file |
| `exportCode()` / `exportDiff()` | Copy to clipboard |
| `flashMessage(text)` | Toast notification |
| `restoreSwaps()` | On init: apply all saved swaps from localStorage |

### 3.4 Event Listeners (attach all)

| Target | Event | Action |
|--------|-------|--------|
| `#vd-toggle` | click | `togglePanel` |
| `#vd-close-btn` | click | `closePanel` |
| `#vd-ghost-btn` | click | `toggleGhost` |
| `#vd-inspect-btn` | click | `toggleInspect` |
| `#vd-clear-btn` | click | Confirm → clear localStorage |
| `#vd-export-json` | click | `exportJSON` |
| `#vd-export-code` | click | `exportCode` |
| `#vd-export-diff` | click | `exportDiff` |
| `#vd-search` | input | Filter slots |
| `#vd-view-select` | change | Change grouping mode |
| `#vd-page-select` | change | Change page filter |
| `#vd-slots` | click | Route to browse/paste/reset/copy actions |
| `#vd-slots` | dragover/drop/dragleave | File drop on slot |
| `#vd-library-grid` | click | Select library image |
| `#vd-preview-close` | click | `hidePreview` |
| `#vd-preview-cancel` | click | `hidePreview` |
| `#vd-preview-apply` | click | Confirm swap + apply |
| `#vd-preview-prev/next` | click | Cycle library images in preview |
| `#vd-library-close` | click | `closeLibrary` |
| `document` | click (inspect mode) | Target `img` or `bg` → auto-tag |
| `document` | dragover/drop (global) | Drop on page → find nearest `[data-swap]` |
| `document` | keydown | `V`, `ESC`, `G`, `I`, `R`, `E`, `C`, `←`, `→` |

**Keyboard shortcut rules:**
- Ignore if target is `<input>` or `<textarea>`
- `V` → toggle panel
- `ESC` → close topmost overlay (preview → library → inspect → panel)
- `G` → toggle ghost
- `I` → toggle inspect
- `R` → reset current preview slot
- `Ctrl/Cmd + E` → export JSON
- `Ctrl/Cmd + C` → export code
- `←` / `→` → cycle library in preview mode only

### 3.5 Global Drag & Drop (Fix)

**Current bug:** Inline styles (`e.target.style.outline = '...'`) leak onto random elements and don't clean up properly.

**Fix:** Use CSS class toggling instead:

```js
document.addEventListener('dragover', (e) => {
  if (state.isOpen) return;
  e.preventDefault();
  document.body.classList.add('vd-drag-active');
});
document.addEventListener('dragleave', (e) => {
  // Only clear when leaving document, not child elements
  if (!e.relatedTarget || !document.contains(e.relatedTarget)) {
    document.body.classList.remove('vd-drag-active');
  }
});
document.addEventListener('drop', async (e) => {
  if (state.isOpen) return;
  e.preventDefault();
  document.body.classList.remove('vd-drag-active');
  // ... find closest [data-swap] and apply
});
```

---

## 4. CSS Requirements

### 4.1 Two Style Blocks

```astro
<style>
  /* SCOPED: Component styles compiled with data-astro-cid */
  /* Everything here is scoped to elements inside #visual-dev-wrapper */
</style>

<style is:global>
  /* GLOBAL: body.* rules that Astro can't scope */
  /* Inspect mode cursor, drag highlights */
</style>
```

**Why two blocks:** Astro's scoped styles append `[data-astro-cid-XXXX]` to every selector. Rules targeting `<body>` (like `body.vd-inspect-mode`) will be compiled to `body.vd-inspect-mode[data-astro-cid-...]`, which never matches because `<body>` is rendered by `Layout.astro`. These rules MUST be in a `<style is:global>` block.

### 4.2 CSS Custom Properties (Tokenize Everything)

```css
#visual-dev-wrapper {
  /* Layout */
  --vd-z-base: 99999;
  --vd-z-overlay: 100000;
  --vd-z-toast: 100001;

  /* Colors (fixed dark dev-tool palette) */
  --vd-bg-base: #0f172a;
  --vd-bg-panel: #1e293b;
  --vd-bg-input: #1e293b;
  --vd-bg-hover: #334155;
  --vd-bg-active: #475569;
  --vd-border-default: #334155;
  --vd-border-hover: #475569;
  --vd-border-focus: #fbbf24;
  --vd-text-primary: #e2e8f0;
  --vd-text-muted: #64748b;
  --vd-text-dim: #94a3b8;
  --vd-accent: #fbbf24;
  --vd-accent-contrast: #0f172a;
  --vd-success: #22c55e;
  --vd-danger: #ef4444;

  /* Apply to wrapper */
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: var(--vd-z-base);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px;
  color: var(--vd-text-primary);
  line-height: 1.5;
}

#visual-dev-wrapper * {
  box-sizing: border-box;
}
```

**Critical rules:**
- `all: initial` → ONLY on `#visual-dev-wrapper` itself (the root), never on `*`
- `box-sizing: border-box` → on `*`
- Children inherit font-family and color naturally from the wrapper
- Use `var(--vd-*)` everywhere instead of raw hex values

### 4.3 Structural Classes (consolidate duplicates)

| Base Class | Replaces |
|------------|----------|
| `.vd-surface` | Shared card chrome (panel, preview card, library card) |
| `.vd-overlay` | Shared overlay pattern (preview, library) |
| `.vd-btn` | All buttons (base style + modifiers) |
| `.vd-input` | Text inputs + selects (normalized appearance) |

**Remove:**
- `.vd-btn-primary` — defined in old CSS but never used in HTML
- `.vd-btn-export` — set `flex:1; text-align:center` directly in footer layout, not class

### 4.4 Form Element Normalization (NOT all: initial)

```css
.vd-input, .vd-select {
  appearance: none;
  -webkit-appearance: none;
  background: var(--vd-bg-input);
  border: 1px solid var(--vd-border-hover);
  border-radius: 6px;
  color: var(--vd-text-primary);
  font-size: 12px;
  padding: 4px 8px;
  outline: none;
}
.vd-input:focus, .vd-select:focus {
  border-color: var(--vd-border-focus);
}
```

This preserves native affordances (focus rings on elements that need them, proper cursor) while restyling.

### 4.5 Global Rules (`<style is:global>`)

```css
body.vd-inspect-mode {
  cursor: crosshair !important;
}
body.vd-inspect-mode img,
body.vd-inspect-mode [style*="background-image"] {
  cursor: crosshair !important;
}
body.vd-inspect-mode [data-swap] {
  outline: 3px dashed #fbbf24 !important;
  outline-offset: 2px;
}
body.vd-drag-active [data-swap] {
  outline: 3px dashed #ff007f !important;
  outline-offset: -3px;
}
```

**Why these specifically:**
- Avoid `body.vd-inspect-mode * { cursor: crosshair }` — it matches every element and causes layout jank
- Target only `img` and elements with inline background images, plus any already-tagged `[data-swap]` elements

### 4.6 Responsive Sizing (simplify)

Remove the `@media (max-width: 640px)` block. Use clamp/min instead:

```css
.vd-panel {
  width: min(600px, calc(100vw - 24px));
  max-height: 80vh;
}
```

This handles responsive width without a media query.

---

## 5. Bug Fix Checklist

| # | Bug | Source | Fix |
|---|-----|--------|-----|
| 1 | `#visual-dev-wrapper` missing from HTML | Kimi review | Add wrapper `<div>` around all elements |
| 2 | `body.*` CSS rules scoped away by Astro | Kimi + Gemini | Move to `<style is:global>` |
| 3 | `all: initial` on children breaks forms | Kimi review | Apply only to `#visual-dev-wrapper` root; use `appearance: none` for inputs |
| 4 | Empty `background: ;` declaration | Kimi review | Remove or set valid value |
| 5 | Global drag inline style leak | Kimi review | Use `body.vd-drag-active` class + CSS |
| 6 | `cursor: crosshair *` performance hit | Kimi review | Narrow to `img` + `[style*=background-image]` |
| 7 | `library` prop undefined in script | Gemini review | Add `define:vars={{ defaultLibrary: library }}` |
| 8 | `defaultView` prop not passed to script | Both | Add to `define:vars` |
| 9 | No IIFE wrapper on script | Gemini review | Wrap in `(()=>{})()` for HMR safety |
| 10 | Duplicated overlay CSS | Kimi review | Extract `.vd-overlay` base class |
| 11 | Hardcoded hex repeated ~50× | Kimi review | Use CSS custom properties |
| 12 | Unused `.vd-btn-primary` class | Kimi review | Remove from CSS |
| 13 | Redundant `import.meta.env.DEV` in select | Kimi review | Remove (component is already gated in Layout) |
| 14 | Media query for panel width | Kimi review | Replace with `min(600px, calc(100vw - 24px))` |

---

## 6. Implementation Skeleton

Copy this exact structure. Fill in the sections marked `<!-- ... -->`.

```astro
---
// src/components/visual-dev/VisualDev.astro
// Drop-in dev tool. ZERO IMPORTS.

const { library = [], pageGrouping = true, defaultView = 'component' } = Astro.props;
const isDev = import.meta.env.DEV;
---

{isDev && (
  <div id="visual-dev-wrapper">
    <!-- Toggle Button -->
    <button id="vd-toggle" class="vd-toggle" title="Visual Dev Tool (V)" aria-label="Toggle Visual Dev Tool">
      🎨
    </button>

    <!-- Panel -->
    <div id="vd-panel" class="vd-panel vd-surface">
      <div class="vd-header">
        <span class="vd-title">🎨 Visual Dev Tool</span>
        <div class="vd-header-actions">
          <select id="vd-page-select" class="vd-input vd-select">
            <option value="all">All Pages</option>
            <!-- page options here -->
          </select>
          <select id="vd-view-select" class="vd-input vd-select">
            <option value="component">By Component</option>
            <option value="page">By Page</option>
            <option value="flat">Flat List</option>
          </select>
          <input id="vd-search" type="text" class="vd-input vd-search" placeholder="Search slots..." />
          <button id="vd-inspect-btn" class="vd-btn vd-btn-sm" title="Inspect Mode (I)">🔎</button>
          <button id="vd-ghost-btn" class="vd-btn vd-btn-sm" title="Ghost Mode (G)">👻</button>
          <button id="vd-clear-btn" class="vd-btn vd-btn-sm" title="Clear All Swaps">🗑</button>
          <button id="vd-close-btn" class="vd-btn vd-btn-sm" title="Close (ESC)">✕</button>
        </div>
      </div>

      <div id="vd-slots" class="vd-slots"><!-- Populated by JS --></div>

      <div class="vd-footer">
        <button id="vd-export-json" class="vd-btn">📤 Export JSON</button>
        <button id="vd-export-code" class="vd-btn">📋 Copy Code</button>
        <button id="vd-export-diff" class="vd-btn">📋 Copy Diff</button>
      </div>
    </div>

    <!-- Preview Modal -->
    <div id="vd-preview" class="vd-overlay">
      <div class="vd-card">
        <div class="vd-card-header">
          <span id="vd-preview-title"></span>
          <button id="vd-preview-close" class="vd-btn vd-btn-sm">✕</button>
        </div>
        <div class="vd-card-body">
          <div class="vd-preview-compare">
            <div>
              <div class="vd-label">Before</div>
              <img id="vd-preview-before" />
            </div>
            <div>
              <div class="vd-label">After</div>
              <img id="vd-preview-after" />
            </div>
          </div>
          <div class="vd-preview-actions">
            <button id="vd-preview-prev" class="vd-btn vd-btn-sm">←</button>
            <button id="vd-preview-apply" class="vd-btn vd-btn-sm vd-btn-accent">✓ Apply</button>
            <button id="vd-preview-next" class="vd-btn vd-btn-sm">→</button>
            <button id="vd-preview-cancel" class="vd-btn vd-btn-sm">✗ Cancel</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Library Browser Modal -->
    <div id="vd-library" class="vd-overlay">
      <div class="vd-card">
        <div class="vd-card-header">
          <span>📷 Image Library</span>
          <button id="vd-library-close" class="vd-btn vd-btn-sm">✕</button>
        </div>
        <div id="vd-library-grid" class="vd-library-grid">
          <!-- Populated by JS -->
        </div>
      </div>
    </div>
  </div>
)}

<script is:inline define:vars={{ defaultLibrary: library, defaultView: defaultView }}>
(() => {
  'use strict';

  const STORAGE_KEY = 'visual-dev-swaps';
  const STORAGE_META = 'visual-dev-meta';

  // -- STATE --
  const state = {
    isOpen: false,
    isGhost: false,
    isInspect: false,
    selectedSlot: null,
    previewingSlot: null,
    previewIndex: 0,
    library: JSON.parse(JSON.stringify(defaultLibrary || [])),
    viewMode: defaultView || 'component',
    pageFilter: 'all',
    searchQuery: '',
    autoImgCounter: 0,
  };

  // -- DOM REFS --
  // const toggle = document.getElementById('vd-toggle');
  // ... all refs here ...

  // -- FUNCTIONS --
  // function loadSwaps() { ... }
  // function saveSwaps(swaps) { ... }
  // function scanSlots() { ... }
  // ... etc ...

  // -- EVENT LISTENERS --
  // attach all listeners here

  // -- INIT --
  restoreSwaps();
  renderSlots();
})();
</script>

<style>
  /* === SCOPED: Component styles === */
  #visual-dev-wrapper {
    /* Tokens */
    --vd-z-base: 99999;
    --vd-z-overlay: 100000;
    --vd-z-toast: 100001;
    --vd-bg-base: #0f172a;
    --vd-bg-panel: #1e293b;
    --vd-bg-input: #1e293b;
    --vd-bg-hover: #334155;
    --vd-bg-active: #475569;
    --vd-border-default: #334155;
    --vd-border-hover: #475569;
    --vd-border-focus: #fbbf24;
    --vd-text-primary: #e2e8f0;
    --vd-text-muted: #64748b;
    --vd-text-dim: #94a3b8;
    --vd-accent: #fbbf24;
    --vd-accent-contrast: #0f172a;
    --vd-success: #22c55e;
    --vd-danger: #ef4444;

    /* Layout */
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: var(--vd-z-base);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    color: var(--vd-text-primary);
    line-height: 1.5;
  }

  #visual-dev-wrapper * {
    box-sizing: border-box;
  }

  /* Toggle Button */
  .vd-toggle {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    border: 2px solid var(--vd-border-default);
    background: var(--vd-bg-panel);
    color: var(--vd-accent);
    font-size: 20px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  }
  .vd-toggle:hover {
    background: var(--vd-bg-hover);
    transform: scale(1.1);
  }

  /* Surface (shared card chrome) */
  .vd-surface {
    background: var(--vd-bg-panel);
    border: 1px solid var(--vd-border-default);
    border-radius: 12px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.5);
  }

  /* Panel */
  .vd-panel {
    position: absolute;
    bottom: 56px;
    right: 0;
    width: min(600px, calc(100vw - 24px));
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    opacity: 0;
    transform: translateY(10px) scale(0.95);
    pointer-events: none;
    transition: all 0.2s ease;
  }
  .vd-panel.vd-open {
    opacity: 1;
    transform: translateY(0) scale(1);
    pointer-events: auto;
  }
  .vd-panel.vd-ghost {
    opacity: 0.5;
    pointer-events: none;
    user-select: none;
  }

  /* Header */
  .vd-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 16px;
    background: var(--vd-bg-base);
    border-bottom: 1px solid var(--vd-border-default);
    flex-wrap: wrap;
  }
  .vd-title {
    font-weight: 600;
    color: var(--vd-accent);
    white-space: nowrap;
  }
  .vd-header-actions {
    display: flex;
    gap: 4px;
    flex: 1;
    justify-content: flex-end;
    flex-wrap: wrap;
  }

  /* Inputs */
  .vd-input {
    appearance: none;
    -webkit-appearance: none;
    background: var(--vd-bg-input);
    border: 1px solid var(--vd-border-hover);
    border-radius: 6px;
    color: var(--vd-text-primary);
    font-size: 12px;
    padding: 4px 8px;
    outline: none;
  }
  .vd-input:focus {
    border-color: var(--vd-border-focus);
  }
  .vd-select {
    composes: vd-input;
    cursor: pointer;
  }
  .vd-search {
    width: 140px;
  }

  /* Buttons */
  .vd-btn {
    padding: 4px 8px;
    border: 1px solid var(--vd-border-hover);
    border-radius: 6px;
    background: var(--vd-bg-panel);
    color: var(--vd-text-primary);
    font-size: 12px;
    cursor: pointer;
    transition: all 0.15s;
    white-space: nowrap;
  }
  .vd-btn:hover {
    background: var(--vd-bg-hover);
    border-color: var(--vd-border-hover);
  }
  .vd-btn:active {
    background: var(--vd-bg-active);
  }
  .vd-btn.vd-active {
    background: var(--vd-accent);
    color: var(--vd-accent-contrast);
    border-color: var(--vd-accent);
  }
  .vd-btn.vd-btn-sm {
    padding: 2px 6px;
    font-size: 11px;
  }
  .vd-btn.vd-btn-accent {
    background: var(--vd-accent);
    color: var(--vd-accent-contrast);
    border-color: var(--vd-accent);
  }

  /* Slots area */
  .vd-slots {
    flex: 1;
    overflow-y: auto;
    padding: 8px;
    max-height: calc(80vh - 140px);
  }
  .vd-slots::-webkit-scrollbar { width: 6px; }
  .vd-slots::-webkit-scrollbar-track { background: transparent; }
  .vd-slots::-webkit-scrollbar-thumb { background: var(--vd-border-hover); border-radius: 3px; }

  /* Empty state */
  .vd-empty {
    text-align: center;
    padding: 40px 20px;
    color: var(--vd-text-muted);
    font-size: 13px;
  }
  .vd-empty code {
    background: var(--vd-bg-hover);
    padding: 2px 6px;
    border-radius: 4px;
    color: var(--vd-accent);
    font-size: 12px;
  }

  /* Group */
  .vd-group {
    margin-bottom: 8px;
  }
  .vd-group-title {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--vd-text-muted);
    padding: 4px 8px;
    margin-bottom: 2px;
  }

  /* Slot */
  .vd-slot {
    border: 1px solid var(--vd-border-default);
    border-radius: 8px;
    margin-bottom: 4px;
    overflow: hidden;
    transition: all 0.15s;
  }
  .vd-slot:hover { border-color: var(--vd-border-hover); }
  .vd-slot.vd-slot-swapped {
    border-color: var(--vd-success);
    background: rgba(34, 197, 94, 0.05);
  }
  .vd-slot.vd-slot-dragover {
    border-color: var(--vd-accent);
    background: rgba(251, 191, 36, 0.1);
  }
  .vd-slot-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    cursor: pointer;
  }
  .vd-slot-thumb {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: 4px;
    flex-shrink: 0;
  }
  .vd-thumb-empty {
    width: 40px;
    height: 40px;
    background: var(--vd-bg-hover);
    border-radius: 4px;
    flex-shrink: 0;
  }
  .vd-slot-info {
    flex: 1;
    min-width: 0;
  }
  .vd-slot-id {
    font-size: 12px;
    font-weight: 600;
    color: var(--vd-text-primary);
    display: block;
  }
  .vd-slot-path {
    font-size: 11px;
    color: var(--vd-text-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    display: block;
  }
  .vd-badge {
    background: var(--vd-success);
    color: white;
    font-size: 10px;
    padding: 2px 6px;
    border-radius: 10px;
    font-weight: 700;
    flex-shrink: 0;
  }
  .vd-slot-actions {
    display: flex;
    gap: 2px;
    padding: 0 8px 8px;
  }

  /* Footer */
  .vd-footer {
    display: flex;
    gap: 4px;
    padding: 8px;
    border-top: 1px solid var(--vd-border-default);
    background: var(--vd-bg-base);
  }
  .vd-footer .vd-btn {
    flex: 1;
    text-align: center;
  }

  /* Overlay base (preview + library) */
  .vd-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--vd-z-overlay);
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.2s;
  }
  .vd-overlay.vd-open {
    opacity: 1;
    pointer-events: auto;
  }

  /* Card (shared by preview + library) */
  .vd-card {
    background: var(--vd-bg-panel);
    border: 1px solid var(--vd-border-hover);
    border-radius: 12px;
    width: 700px;
    max-width: 90vw;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }
  .vd-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--vd-border-default);
    font-weight: 600;
    color: var(--vd-accent);
  }
  .vd-card-body {
    padding: 16px;
    overflow-y: auto;
  }

  /* Preview specific */
  .vd-preview-compare {
    display: flex;
    gap: 12px;
    margin-bottom: 12px;
  }
  .vd-preview-compare > div {
    flex: 1;
    text-align: center;
  }
  .vd-label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: var(--vd-text-muted);
    margin-bottom: 8px;
  }
  .vd-preview-compare img {
    width: 100%;
    max-height: 300px;
    object-fit: contain;
    border-radius: 8px;
    border: 1px solid var(--vd-border-default);
    background: var(--vd-bg-base);
  }
  .vd-preview-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
  }

  /* Library grid */
  .vd-library-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 8px;
    padding: 12px;
    overflow-y: auto;
  }
  .vd-lib-item {
    cursor: pointer;
    border: 2px solid transparent;
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.15s;
  }
  .vd-lib-item:hover {
    border-color: var(--vd-accent);
    transform: scale(1.05);
  }
  .vd-lib-item img {
    width: 100%;
    height: 100px;
    object-fit: cover;
    display: block;
  }
  .vd-lib-name {
    display: block;
    font-size: 10px;
    color: var(--vd-text-dim);
    padding: 4px;
    text-align: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* Flash message */
  .vd-flash {
    position: fixed;
    bottom: 80px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: var(--vd-success);
    color: white;
    padding: 8px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 600;
    z-index: var(--vd-z-toast);
    opacity: 0;
    transition: all 0.3s ease;
    pointer-events: none;
  }
  .vd-flash.vd-flash-show {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
</style>

<style is:global>
  /* === GLOBAL: body manipulation rules === */
  body.vd-inspect-mode {
    cursor: crosshair !important;
  }
  body.vd-inspect-mode img,
  body.vd-inspect-mode [style*="background-image"] {
    cursor: crosshair !important;
  }
  body.vd-inspect-mode [data-swap] {
    outline: 3px dashed #fbbf24 !important;
    outline-offset: 2px;
  }
  body.vd-drag-active [data-swap] {
    outline: 3px dashed #ff007f !important;
    outline-offset: -3px;
  }
</style>
```

---

## 7. Success Criteria

| Check | How to verify |
|-------|-------------|
| Build passes | `npm run build` exits 0 |
| Tool renders in dev | `npm run dev`, press `V` — panel opens |
| Theme isolation | Panel looks identical regardless of site's theme changes |
| Drag-drop works | Drop an image onto a slot → preview modal → apply → survives refresh |
| Inspect mode works | Press `I`, click an untagged image → auto-tagged |
| Export works | Press `E` → JSON file downloads |
| Keyboard works | `ESC`, `G`, `←`/`→` all function |
| No console errors | Clean console in dev mode |
| Production clean | `dist/` does not contain VisualDev HTML or JS |

---

## 8. Handoff to Implementer

Implement this by:
1. Backing up the current `VisualDev.astro`
2. Writing the new file using the skeleton above
3. Filling in all JS functions matching the "Core Functions" table
4. Verifying each item in the Bug Fix Checklist
5. Running the Success Criteria checks

The complete spec, logic requirements, and CSS architecture are all defined above. The file should be ~600–800 lines (down from 1353) due to consolidated CSS.
