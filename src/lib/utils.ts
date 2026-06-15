// Shared utility functions - single source of truth.
// KISE: Import this instead of duplicating helpers across pages.

/** Strip HTML tags from a string, return trimmed plain text */
export function stripHtml(html: string): string {
  if (!html) return '';
  return html.replace(/<[^>]*>/g, '').trim();
}

/** Generate a meta description from HTML content */
export function metaDescFromHtml(html: string, maxLength = 160): string {
  return stripHtml(html).slice(0, maxLength);
}

/** Format an ISO date string to a human-readable format */
export function formatDate(dateStr: string, locale = 'en-GB', options?: Intl.DateTimeFormatOptions): string {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale, options);
}

/** Format date as "15 January 2026" (long) */
export function formatDateLong(dateStr: string): string {
  return formatDate(dateStr, 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

/** Format date as "15 Jan 2026" (short) */
export function formatDateShort(dateStr: string): string {
  return formatDate(dateStr, 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
