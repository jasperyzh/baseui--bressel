// src/lib/config.ts
// Shared site configuration — single source of truth for hardcoded values.
// KISE: One file, no env var parsing, no dependency injection.

/** WhatsApp business number (international format, no +) */
export const WHATSAPP_NUMBER = import.meta.env.PUBLIC_WHATSAPP_NUMBER || '60123456789';

/** Brand email for contact */
export const BRAND_EMAIL = 'hola@bresselsports.com';

/** Site URL (used for OG images, canonical URLs) */
export const SITE_URL = import.meta.env.PUBLIC_SITE_URL || 'https://baseui--bressel.pages.dev';

/** GraphQL endpoint */
export const WPGRAPHQL_ENDPOINT = import.meta.env.WPGRAPHQL_ENDPOINT || 'http://localhost:8080/graphql';

/** Helper: build WhatsApp URL with pre-filled message */
export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}
