


This is the perfect workflow. Letting a smaller model scaffold and a "smarter" model refine and fix the architecture is exactly how to get production-ready code.

Before you hand the context over to Kimi (or whatever model you use for the final build), you need to give it a **"Pre-Flight Checklist."** 

LLMs—even the smart ones—tend to fall into a few specific traps when writing Astro components with complex vanilla JS. Give Kimi the following instructions/reminders alongside your v2 Spec and CSS Review to ensure it nails it on the first try.

### 1. The Astro Server/Client Boundary (Crucial)
**Tell Kimi:** *"Remember that Astro frontmatter (`---`) runs on the server. Do not try to read `localStorage` or `window` in the Astro component template. All state management and `localStorage` reads/writes must happen strictly inside the `<script is:inline>` block."*

### 2. The `<script>` Tag Configuration
**Tell Kimi:** *"You must use `<script is:inline define:vars={{ defaultLibrary: library }}>` for the logic. Wrap all the JavaScript in an IIFE (Immediately Invoked Function Expression) to prevent variable redeclaration errors during Vite's Hot Module Replacement (HMR). Do not use `type="module"` unless necessary, but ensure it executes after the DOM is ready."*

### 3. The Base64 Canvas Trick (Don't let it forget!)
**Tell Kimi:** *"For the Drag-and-Drop functionality, remember the critical fix from our v2 review: If a user drops a local file, do not save the `blob:http://...` URL to `localStorage` (it will break on refresh). You must draw the dropped image to a hidden `<canvas>`, export it as a Base64 data URL, and save the Base64 string to `localStorage`."*

### 4. Provide this exact skeleton for it to fill in
To stop the LLM from hallucinating weird component structures, feed it this exact skeleton and tell it: *"Fill in this skeleton based on the v2 Spec and the CSS Review document. Do not deviate from this structure."*

```astro
---
// src/components/visual-dev/VisualDev.astro
// ZERO IMPORTS. Drop-in utility.

const { library =[] } = Astro.props;
const isDev = import.meta.env.DEV;
---

{isDev && (
  <div id="visual-dev-wrapper">
    <!-- UI ELEMENTS HERE (Toggle Button, Panel, Modals) -->
    
  </div>

  <script is:inline define:vars={{ defaultLibrary: library }}>
    (() => {
      // 1. STATE MANAGEMENT (Read from localStorage safely here)
      // 2. DOM SCANNING LOGIC (Find [data-swap])
      // 3. UI EVENT LISTENERS (Toggle panel, Inspect mode)
      // 4. DRAG & DROP + BASE64 CONVERSION
      // 5. EXPORT LOGIC
    })();
  </script>

  <style>
    #visual-dev-wrapper {
      /* CSS Custom Properties (Variables) here */
      /* All scoped UI styles here. DO NOT use all: initial on children */
    }
  </style>

  <style is:global>
    /* Inspect mode cursor and drag highlight rules here */
  </style>
)}
```

### Final Advice for Your Prompt to Kimi:
When you write your prompt, phrase it like this:

> *"I am building VisualDev.astro, a single-file, zero-dependency dev tool for Astro. I have three documents for you:*
> *1. The v2 Specification (how it should work)*
> *2. The CSS Review (fixing bugs from a previous AI's attempt)*
> *3. The Skeleton Structure (how the file must be organized)*
> 
> *Write the complete, final `VisualDev.astro` file. Pay special attention to the CSS Review fixes, ensure all JS runs purely client-side within the IIFE, and make sure dropped images are converted to Base64 before saving to localStorage. Do not add any external imports."*

If you feed it this, it will output a pristine, production-ready tool that you can drop straight into your project and use immediately.