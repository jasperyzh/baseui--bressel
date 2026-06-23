// src/lib/config.ts
// Shared site configuration - single source of truth for hardcoded values.

/** WhatsApp business number (international format, no +) */
export const WHATSAPP_NUMBER = import.meta.env.PUBLIC_WHATSAPP_NUMBER || '+34669923724';

/** Brand email for contact */
export const BRAND_EMAIL = 'hola@bresselsports.com';

/** Site URL (used for OG images, canonical URLs) */
export const SITE_URL = import.meta.env.PUBLIC_SITE_URL || 'https://baseui--bressel.pages.dev';

/** Brand year (established) */
export const BRAND_YEAR = '2026';

/** Social media links - update when profiles are live */
export const SOCIAL = {
  instagram: 'https://www.instagram.com/bresselsports',
  // youtube: 'https://youtube.com/@bresselsports',
  whatsapp: `https://wa.me/${WHATSAPP_NUMBER}`,
};

/** GraphQL endpoint */
export const WPGRAPHQL_ENDPOINT = import.meta.env.WPGRAPHQL_ENDPOINT || 'https://cms.bresselsports.com/graphql';

/**
 * Public frontend URL — where the headless WP redirects all frontend traffic.
 * Staging now; change to https://bresselsports.com on launch approval.
 * Mirrored in basewp__bressel/theme/functions.php (template_redirect).
 */
export const FRONTEND_URL = 'https://staging.bresselsports.com/';

/** Helper: build WhatsApp URL with pre-filled message */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
