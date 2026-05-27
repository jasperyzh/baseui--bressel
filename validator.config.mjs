/**
 * BRESSEL™ Validator Config
 *
 * Per-project overrides for validator--baseui.mjs checks.
 * Prevents false positives on intentional brand-specific patterns.
 */
export default {
  checks: {
    'component-replacement': {
      // Bressel brand CTAs use brand tokens — intentional, not hallucinations
      allowPatterns: [
        'bg-bressel-red',
        'bg-bressel-blue',
        'hover:bg-bressel-red',
        'border-bressel-black',
      ],
    },
  },
};
